import { notFound } from "next/navigation";
import { getProductBySlug } from "@/modules/shop/queries";
import { ProductDetailClient } from "@/modules/shop/components/product-detail-client";
import { cookies } from "next/headers";
import { Language } from "@/modules/shared/lib/i18n-constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("app_lang")?.value as Language) || "hu";
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Termék nem található" };
  const title = product.name[lang] || product.name["hu"] || "Termék";
  const description = product.shortDescription?.[lang] || product.shortDescription?.["hu"] || "";
  return { title, description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("app_lang")?.value as Language) || "hu";
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} lang={lang} />;
}
