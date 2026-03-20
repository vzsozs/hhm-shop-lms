import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productVariants } from '@/db/schema/shop';
import { eq, inArray, sql } from 'drizzle-orm';
import { verifyMufisAuth } from '@/lib/mufis';

export async function POST(req: Request) {
  if (!verifyMufisAuth(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const formData = await req.formData();
    const page = parseInt(formData.get('page') as string) || 1;
    const productId = formData.get('product_id') as string;
    const skusStr = formData.get('sku') as string;
    const activeStr = formData.get('active') as string;

    const limit = 50;
    const offset = (page - 1) * limit;

    const variantConditions = [];

    if (skusStr) {
       const skus = skusStr.split(',').map(s => s.trim());
       variantConditions.push(inArray(productVariants.sku, skus));
    }

    const qCond = variantConditions.length > 0 ? variantConditions[0] : undefined;

    const fetchedVariants = await db.query.productVariants.findMany({
       where: qCond,
       with: {
         product: true
       },
       limit,
       offset
    });

    const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
      .from(productVariants)
      .where(qCond);
      
    const totalCount = Number(totalCountQuery[0].count);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    let filteredVariants = fetchedVariants;
    if (activeStr) {
      const isActive = activeStr === '1' ? 'ACTIVE' : 'INACTIVE';
      filteredVariants = filteredVariants.filter(v => v.product.status === isActive);
    }
    if (productId) {
      filteredVariants = filteredVariants.filter(v => v.product.id === productId);
    }

    const formattedProducts = filteredVariants.map(variant => {
      const productNameObj = variant.product.name as Record<string, string>;
      const variantNameObj = variant.name as Record<string, string>;
      const productName = (productNameObj && productNameObj.hu) || 'Termék';
      const variantName = (variantNameObj && variantNameObj.hu) ? ` - ${variantNameObj.hu}` : '';

      return {
        product_id: variant.product.id,
        sku: variant.sku || variant.id,
        name: `${productName}${variantName}`,
        active: variant.product.status === "ACTIVE" ? 1 : 0,
        stock_quantity: variant.stock,
        barcode: ""
      };
    });

    return NextResponse.json({
      total_pages: totalPages,
      page: page,
      products: formattedProducts
    }, { status: 200 });

  } catch (err: unknown) {
    console.error("MuFis getProduct Error:", err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
