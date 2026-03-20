import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productVariants } from '@/db/schema/shop';
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
          if (item.sku && item.stock_quantity !== undefined) {
            await db.update(productVariants)
              .set({ stock: parseInt(item.stock_quantity) })
              .where(eq(productVariants.sku, String(item.sku)));
              
            responses.push({ ok: 1, sku: item.sku });
          } else {
            responses.push({ ok: 0, error: 'Hiányzó sku vagy stock_quantity', sku: item.sku });
          }
        } catch (e: any) {
          responses.push({ ok: 0, error: e.message, sku: item.sku });
        }
      }
      return NextResponse.json({ products: responses }, { status: 200 });
      
    } else {
       // Szimpla (single) feldolgozás
       const sku = formData.get('sku') as string;
       const stockQuantity = formData.get('stock_quantity') as string;
       
       if (!sku || stockQuantity === undefined) {
         return NextResponse.json({ ok: 0, error: 'Hiányzó sku vagy stock_quantity' }, { status: 200 });
       }
       
       await db.update(productVariants)
          .set({ stock: parseInt(stockQuantity) })
          .where(eq(productVariants.sku, sku));
          
       return NextResponse.json({ ok: 1 }, { status: 200 });
    }
  } catch (err: unknown) {
    console.error("MuFis setProduct Error:", err);
    return NextResponse.json({ ok: 0, error: 'Internal Server Error' }, { status: 200 });
  }
}
