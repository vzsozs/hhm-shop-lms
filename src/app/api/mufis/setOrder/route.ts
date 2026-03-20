import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema/shop';
import { eq } from 'drizzle-orm';
import { verifyMufisAuth } from '@/lib/mufis';

export async function POST(req: Request) {
  if (!verifyMufisAuth(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const formData = await req.formData();
    const dataStr = formData.get('data') as string;
    
    // Kötegelt (batch) feldolgozás
    if (dataStr) {
      const parsedData = JSON.parse(dataStr);
      const responses = [];
      
      for (const item of parsedData) {
        try {
          const updateData: any = {};
          if (item.status) updateData.status = item.status.toLowerCase();
          
          if (item.multiple_packages === 1) {
             updateData.packageNumber = JSON.stringify(item.package_number);
             updateData.trackingLink = JSON.stringify(item.tracking_link);
          } else {
             if (item.package_number) updateData.packageNumber = String(item.package_number);
             if (item.tracking_link) updateData.trackingLink = String(item.tracking_link);
          }

          if (Object.keys(updateData).length > 0 && item.order_number) {
            await db.update(orders)
              .set(updateData)
              .where(eq(orders.orderNumber, item.order_number));
              
            responses.push({ ok: 1, order_number: item.order_number });
          } else {
            responses.push({ ok: 0, error: 'Hiányzó order_number vagy data', order_number: item.order_number });
          }
        } catch (e: any) {
          responses.push({ ok: 0, error: e.message, order_number: item.order_number });
        }
      }
      return NextResponse.json({ orders: responses }, { status: 200 });
      
    } else {
       // Szimpla (single) feldolgozás
       const orderNumber = formData.get('order_number') as string;
       const status = formData.get('status') as string;
       const packageNumber = formData.get('package_number');
       const trackingLink = formData.get('tracking_link');
       const multiplePackages = formData.get('multiple_packages');
       
       if (!orderNumber) {
         return NextResponse.json({ ok: 0, error: 'Hiányzó order_number' }, { status: 200 });
       }
       
       const updateData: any = {};
       if (status) updateData.status = status.toLowerCase();
       
       if (String(multiplePackages) === "1") {
           updateData.packageNumber = String(packageNumber);
           updateData.trackingLink = String(trackingLink);
       } else {
           if (packageNumber) updateData.packageNumber = String(packageNumber);
           if (trackingLink) updateData.trackingLink = String(trackingLink);
       }
       
       if (Object.keys(updateData).length > 0) {
         await db.update(orders)
            .set(updateData)
            .where(eq(orders.orderNumber, orderNumber));
       }
          
       return NextResponse.json({ ok: 1 }, { status: 200 });
    }
  } catch (err: unknown) {
    console.error("MuFis setOrder Error:", err);
    return NextResponse.json({ ok: 0, error: 'Internal Server Error' }, { status: 200 });
  }
}
