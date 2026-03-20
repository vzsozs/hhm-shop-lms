import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/shop';
import { eq, inArray, gte, and, sql, desc } from 'drizzle-orm';
import { verifyMufisAuth } from '@/lib/mufis';

export async function POST(req: Request) {
  if (!verifyMufisAuth(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const formData = await req.formData();
    const page = parseInt(formData.get('page') as string) || 1;
    const orderNumber = formData.get('order_number') as string;
    const orderId = formData.get('order_id') as string;
    const updatedAtMin = formData.get('updated_at_min') as string;
    const statusStr = formData.get('status') as string;
    const dateFrom = formData.get('date_from') as string;
    const dateTo = formData.get('date_to') as string;

    const limit = 50;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (orderNumber) conditions.push(eq(orders.orderNumber, orderNumber));
    if (orderId) conditions.push(eq(orders.id, orderId));
    if (statusStr) {
      const statuses = statusStr.split(',').map(s => s.trim().toLowerCase());
      conditions.push(inArray(orders.status, statuses as any));
    }
    if (updatedAtMin) {
      conditions.push(gte(orders.updatedAt, new Date(updatedAtMin)));
    }
    if (dateFrom) {
      conditions.push(gte(orders.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      conditions.push(sql`${orders.createdAt} <= ${toDate}`);
    }

    const queryConditions = conditions.length > 0 ? and(...conditions) : undefined;

    // Total count query for pagination details
    const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(queryConditions);
    const totalCount = Number(totalCountQuery[0].count);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    // Fetch orders dynamically with relations
    const fetchedOrders = await db.query.orders.findMany({
      where: queryConditions,
      limit,
      offset,
      orderBy: [desc(orders.createdAt)],
      with: {
        orderItems: {
          with: {
            productVariant: {
              with: {
                product: true
              }
            }
          }
        }
      }
    });

    const formattedOrders = fetchedOrders.map(order => {
      return {
        order_id: order.id,
        order_number: order.orderNumber,
        order_date: order.createdAt.toISOString().split('T')[0],
        status: order.status,
        date_mod: order.updatedAt.toISOString().replace('T', ' ').substring(0, 19),
        
        billing_name: order.customerName || "Ismeretlen",
        billing_city: "Budapest", // TODO: Később dinamikus adatok
        billing_streetnum: "Ismeretlen út 1.",
        billing_zip: "1000",
        billing_country: "HU",
        
        email: order.customerEmail || "",
        phone: "",
        
        lang: "hu",
        currency: order.currency,
        total_price: Number(order.totalPrice),
        payment_type: "CARD",
        shipping_type: "Házhozszállítás", // TODO: Később dinamikus adatok
        
        order_items: order.orderItems.map(item => {
          const productNameObj = item.productVariant.product.name as Record<string, string>;
          const variantNameObj = item.productVariant.name as Record<string, string>;
          const productName = (productNameObj && productNameObj.hu) || 'Termék';
          const variantName = (variantNameObj && variantNameObj.hu) ? ` - ${variantNameObj.hu}` : '';

          return {
            sku: item.productVariant.sku || item.productVariant.id,
            name: `${productName}${variantName}`,
            quantity: item.quantity,
            unit_price: Number(item.unitPrice),
            price_type: "with_vat",
            vat_rate: 27
          };
        })
      };
    });

    return NextResponse.json({
      total_pages: totalPages,
      page: page,
      orders: formattedOrders
    }, { status: 200 });

  } catch (err: unknown) {
    console.error("MuFis getOrder Error:", err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
