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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const requestHeaders = new Headers(req.headers);
    const origin = requestHeaders.get('origin') || appUrl;

    // 1. Átváltás Stripe line_items formátumba
    const line_items = items.map((item: CartItem) => {
      const price = isEuros ? item.priceEur : item.priceHuf;
      const unitAmount = ZERO_DECIMAL_CURRENCIES.includes(currency) ? Math.round(price) : Math.round(price * 100);

      let finalImageUrl = item.imageUrl;
      if (finalImageUrl && !finalImageUrl.startsWith('http')) {
        finalImageUrl = `${origin}${finalImageUrl.startsWith('/') ? '' : '/'}${finalImageUrl}`;
      }

      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name[language] || item.name['hu'],
            description: item.variantName ? (item.variantName[language] || item.variantName['hu']) : undefined,
            images: finalImageUrl ? [finalImageUrl] : [],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    // 2. Számoljuk ki a total_price-t az adatbázis számára (valós ár, nem Stripe cent)
    const totalPrice = items.reduce((total: number, item: CartItem) => {
      const price = isEuros ? item.priceEur : item.priceHuf;
      return total + (price * item.quantity);
    }, 0);

    // 3. Egyedi rendelés azonosító
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Létrehozzuk a rendelést "pending" státusszal az adatbázisban
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      status: "pending",
      currency: currency.toUpperCase(),
      totalPrice: totalPrice.toString(), // Decimal type miatt stringként is biztonságos
    }).returning({ id: orders.id });

    // 5. Mentsük el az order_items-be a tételeket
    await db.insert(orderItems).values(
      items.map((item: CartItem) => ({
        orderId: newOrder.id,
        productVariantId: item.variantId,
        quantity: item.quantity,
        unitPrice: (isEuros ? item.priceEur : item.priceHuf).toString(),
      }))
    );

    // 6. Létrehozzuk a Stripe Checkout Session-t
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: newOrder.id, // Összekötjük a sessiont az adatbázis rekorddal
      },
    });

    // 7. Frissítjük a rendelést a stripeSessionId-val
    await db.update(orders)
      .set({ stripeSessionId: session.id })
      .where(eq(orders.id, newOrder.id));

    // We can't use object syntax in raw Drizzle update.where() without eq() usually, 
    // Wait, Drizzle requires `eq(orders.id, newOrder.id)`. Let's import eq.
    
    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe Checkout Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Belső szerverhiba";
    return new NextResponse(errorMessage, { status: 500 });
  }
}
