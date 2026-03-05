import { db } from "@/db";
import { translations } from "@/db/schema/i18n";
import { eq, and } from "drizzle-orm";

/**
 * Lekéri a megadott kulcshoz tartozó fordítást a megadott nyelven az adatbázisból.
 * @param key A fordítási kulcs (pl. 'admin.products.title')
 * @param lang A nyelv kódja (pl. 'hu', 'en')
 * @returns A lefordított szöveg vagy a kulcs, ha nem található.
 */
export async function getTranslation(key: string, lang: string = "hu") {
  try {
    const result = await db
      .select({ value: translations.translationValue })
      .from(translations)
      .where(
        and(
          eq(translations.translationKey, key),
          eq(translations.languageCode, lang)
        )
      )
      .limit(1);

    return result[0]?.value || key;
  } catch (error) {
    console.error(`Hiba a fordítás lekérésekor (${key}):`, error);
    return key;
  }
}

// Támogatott nyelvek listája
export const SUPPORTED_LANGUAGES = ["hu", "en", "sk"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
