import { pgTable, uuid, varchar, timestamp, integer, decimal, jsonb, pgEnum, AnyPgColumn, index } from "drizzle-orm/pg-core";
import { users } from "./auth";

// Enumok a terméktípusokhoz, mediákhoz és rendelés státuszokhoz
export const productTypeEnum = pgEnum("product_type", ["physical", "digital"]);
export const productStatusEnum = pgEnum("product_status", ["ACTIVE", "INACTIVE"]);
export const mediaTypeEnum = pgEnum("media_type", ["IMAGE", "YOUTUBE", "AUDIO"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "completed", "cancelled"]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  // SEO-barát, egyedi URL azonosító (pl. "nagy-kezmuves-hangtal")
  slug: jsonb("slug").notNull(), // { hu: string, en: string, sk: string }
  name: jsonb("name").notNull(), // { hu: string, en: string, sk: string }
  brand: varchar("brand", { length: 255 }),
  description: jsonb("description"), // { hu: string, en: string, sk: string }
  shortDescription: jsonb("short_description"), // { hu: string, en: string, sk: string }
  longDescription: jsonb("long_description"), // { hu: string, en: string, sk: string }
  specifications: jsonb("specifications"), // Dinamikus JSONB specifikációk (kulcs-érték párok)
  type: productTypeEnum("type").default("physical").notNull(),
  status: productStatusEnum("status").default("ACTIVE").notNull(),
  priority: integer("priority").default(0).notNull(),
  layoutTemplate: varchar("layout_template", { length: 100 }).default("STANDARD").notNull(),
  groupId: uuid("group_id"), // Termékcsalád összekapcsolásához
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  groupIdIdx: index("products_group_id_idx").on(table.groupId)
}));

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  name: jsonb("name"), // Variáció neve (pl. { hu: "Közepes méret" })
  sku: varchar("sku", { length: 100 }).unique().notNull(), // MuFis-hoz kötelező!
  priceHuf: integer("price_huf").notNull(), // Főként forint alapú árazás
  priceEur: decimal("price_eur", { precision: 10, scale: 2 }).notNull(), // Kerekítések miatt decimal
  stock: integer("stock").default(0).notNull(),
  weight: decimal("weight", { precision: 10, scale: 2 }), // Logisztikához
  width: decimal("width", { precision: 10, scale: 2 }),
  height: decimal("height", { precision: 10, scale: 2 }),
  depth: decimal("depth", { precision: 10, scale: 2 }),
});

export const productRecommendations = pgTable("product_recommendations", {
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  recommendedProductId: uuid("recommended_product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
});

export const productAttachments = pgTable("product_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const productMedia = pgTable("product_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  type: mediaTypeEnum("type").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Compound index az ORDER BY product_id, order lekérdezések gyorsításához
  productIdOrderIdx: index("product_media_product_id_order_idx").on(table.productId, table.order),
}));

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: varchar("order_number", { length: 100 }).unique().notNull(), // MuFis egyedi átadáshoz
  userId: uuid("user_id").references(() => users.id, { onDelete: 'set null' }), // Ha törlődik a user, a rendelés maradjon meg
  status: orderStatusEnum("status").default("pending").notNull(),
  trackingCode: varchar("tracking_code", { length: 255 }),
  totalPrice: integer("total_price").notNull(), // Huf-ban tárolva
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
});

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  discountAmount: integer("discount_amount"), // Fix összeg
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }), // Százalék
  validUntil: timestamp("valid_until"),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, { onDelete: 'set null' }),
  name: jsonb("name").notNull(), // { hu: string, en: string, sk: string }
  description: jsonb("description"), // { hu: string, en: string, sk: string }
  slug: jsonb("slug").notNull(), // { hu: string, en: string, sk: string }
});

export const productCategories = pgTable("product_categories", {
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: 'cascade' }).notNull(),
});
