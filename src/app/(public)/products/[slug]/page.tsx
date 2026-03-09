import { notFound } from "next/navigation";
import { getProductBySlug } from "@/modules/shop/queries";
import { ProductDetailClient } from "@/modules/shop/components/product-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Termék nem található" };
  const title = product.name["hu"] || "Termék";
  const description = product.shortDescription?.["hu"] || "";
  return { title, description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
