
import { ProductDetailItem } from "@/modules/shop/queries";
import { Language } from "@/modules/shared/lib/i18n-constants";

export interface ProductDetailSubComponentProps {
  product: ProductDetailItem;
  lang: Language;
  t: Record<string, string>;
}
