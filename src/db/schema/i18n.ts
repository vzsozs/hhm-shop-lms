import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";

export const translations = pgTable("translations", {
  id: uuid("id").defaultRandom().primaryKey(),
  languageCode: varchar("language_code", { length: 10 }).notNull(), // pl. 'hu', 'en'
  translationKey: varchar("translation_key", { length: 255 }).notNull(), // pl. 'common.welcome'
  translationValue: text("translation_value").notNull(), // a nyelvi szöveg fordítása
});
