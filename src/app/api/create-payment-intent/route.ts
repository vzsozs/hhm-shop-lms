import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema/shop';
import { eq } from 'drizzle-orm';
import { CartItem } from '@/context/cart-store';

const ZERO_DECIMAL_CURRENCIES = ['huf'];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, language } = body;

    if (!items || items.length === 0) {
      return new NextResponse("Nincsenek termékek a kosárban", { status: 400 });
    }

    const isEuros = language === "en" || language === "sk";
    const currency = isEuros ? 'eur' : 'huf';

    // Számoljuk ki a total_price-t az adatbázis számára (valós ár, nem Stripe cent)
    const totalPrice = items.reduce((total: number, item: CartItem) => {
      const price = isEuros ? item.priceEur : item.priceHuf;
      return total + (price * item.quantity);
    }, 0);

    const amountForStripe = ZERO_DECIMAL_CURRENCIES.includes(currency) ? Math.round(totalPrice) : Math.round(totalPrice * 100);

    // Egyedi rendelés azonosító
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Létrehozzuk a rendelést "pending" státusszal az adatbázisban
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      status: "pending",
      currency: currency.toUpperCase(),
      totalPrice: totalPrice.toString(),
    }).returning({ id: orders.id });

    // Mentsük el az order_items-be a tételeket
    await db.insert(orderItems).values(
      items.map((item: CartItem) => ({
        orderId: newOrder.id,
        productVariantId: item.variantId,
        quantity: item.quantity,
        unitPrice: (isEuros ? item.priceEur : item.priceHuf).toString(),
      }))
    );

    // Létrehozzuk a Stripe PaymentIntent-et (Saját Checkout formhoz)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountForStripe,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: newOrder.id,
      },
    });

    // Frissítjük a rendelést a PaymentIntent ID-val
    await db.update(orders)
      .set({ stripePaymentIntentId: paymentIntent.id })
      .where(eq(orders.id, newOrder.id));
    
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      orderId: newOrder.id 
    });
  } catch (error: unknown) {
    console.error("Stripe Create Payment Intent Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Belső szerverhiba";
    return new NextResponse(errorMessage, { status: 500 });
  }
}
