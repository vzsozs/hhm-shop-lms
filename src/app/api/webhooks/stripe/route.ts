import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { orders, OrderStatus } from '@/db/schema/shop';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new NextResponse('Hiányzó stripe-signature fejléc', { status: 400 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba';
      console.error(`Webhook signature verifikációs hiba: ${errorMessage}`);
      return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    // Kezeljük az eseményeket
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;

      if (orderId) {
        // Frissítjük a rendelést fizetettre
        await db.update(orders)
          .set({ 
            status: OrderStatus.PAID,
            customerEmail: customerEmail || null,
            customerName: customerName || null
          })
          .where(eq(orders.id, orderId));
        
        console.log(`Rendelés sikeresen fizetve: ${orderId}`);
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;
      
      if (orderId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = { status: OrderStatus.PAID };
        
        if (paymentIntent.shipping?.address) {
          const addr = paymentIntent.shipping.address;
          updateData.shippingCity = addr.city || null;
          updateData.shippingCountry = addr.country || null;
          updateData.shippingZip = addr.postal_code || null;
          updateData.shippingAddress = [addr.line1, addr.line2].filter(Boolean).join(', ') || null;
          updateData.customerPhone = paymentIntent.shipping.phone || null;
          
          if (paymentIntent.shipping.name) {
             updateData.customerName = paymentIntent.shipping.name;
          }
        }

        if (paymentIntent.receipt_email) {
           updateData.customerEmail = paymentIntent.receipt_email;
        }

        await db.update(orders)
          .set(updateData)
          .where(eq(orders.id, orderId));
          
        console.log(`PaymentIntent webhook sikeres: Order ${orderId} státusza paid lett.`);
      }
    }

    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: unknown) {
    console.error('Webhook feldolgozási hiba:', error);
    return new NextResponse('Belső szerverhiba', { status: 500 });
  }
}
