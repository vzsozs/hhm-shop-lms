import { pgTable, uuid, varchar, timestamp, integer, decimal, jsonb, pgEnum, AnyPgColumn, index, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

// Enumok a terméktípusokhoz, mediákhoz és rendelés státuszokhoz
export const productTypeEnum = pgEnum("product_type", ["physical", "digital", "meinl"]);
export const productStatusEnum = pgEnum("product_status", ["ACTIVE", "INACTIVE"]);
export const mediaTypeEnum = pgEnum("media_type", ["IMAGE", "YOUTUBE", "AUDIO"]);

export const OrderStatus = {
  PENDING: "pending",
  PAID: "paid",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
} as const;
export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "processing", "shipped", "completed", "cancelled"]);

// Nevesített termékcsaládok táblája (pl. "Meinl Sonic Energy sorozat")
export const productGroups = pgTable("product_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: jsonb("name").$type<Record<string, string>>().notNull(), // { hu: string, en: string, sk: string }
  slug: jsonb("slug").$type<Record<string, string>>().notNull(), // { hu: string, en: string, sk: string }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productGroupsRelations = relations(productGroups, ({ many }) => ({
  products: many(products),
}));

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  // SEO-barát, egyedi URL azonosító (pl. "nagy-kezmuves-hangtal")
  slug: jsonb("slug").$type<Record<string, string>>().notNull(), // { hu: string, en: string, sk: string }
  name: jsonb("name").$type<Record<string, string>>().notNull(), // { hu: string, en: string, sk: string }
  brand: varchar("brand", { length: 255 }),
  description: jsonb("description").$type<Record<string, string>>(), // { hu: string, en: string, sk: string }
  shortDescription: jsonb("short_description").$type<Record<string, string>>(), // { hu: string, en: string, sk: string }
  longDescription: jsonb("long_description").$type<Record<string, string>>(), // { hu: string, en: string, sk: string }
  specifications: jsonb("specifications"), // Dinamikus JSONB specifikációk (kulcs-érték párok)
  type: productTypeEnum("type").default("physical").notNull(),
  status: productStatusEnum("status").default("ACTIVE").notNull(),
  priority: integer("priority").default(0).notNull(),
  layoutTemplate: varchar("layout_template", { length: 100 }).default("STANDARD").notNull(),
  // FK → product_groups: SET NULL ha a csoport törlődik
  groupId: uuid("group_id").references(() => productGroups.id, { onDelete: "set null" }),
  ignoreTranslationWarnings: boolean("ignore_translation_warnings").default(false).notNull(),
  badges: jsonb("badges").$type<{ icon: string }[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  groupIdIdx: index("products_group_id_idx").on(table.groupId),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  group: one(productGroups, {
    fields: [products.groupId],
    references: [productGroups.id],
  }),
  variants: many(productVariants),
  media: many(productMedia),
  attachments: many(productAttachments),
  recommendations: many(productRecommendations, { relationName: "recommendations" }),
  categories: many(productCategories),
}));

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  name: jsonb("name").$type<Record<string, string>>(), // Variáció neve (pl. { hu: "Közepes méret" })
  sku: varchar("sku", { length: 100 }).unique().notNull(), // MuFis-hoz kötelező!
  priceHuf: integer("price_huf").notNull(), // Főként forint alapú árazás
  priceEur: decimal("price_eur", { precision: 10, scale: 2 }).notNull(), // Kerekítések miatt decimal
  stock: integer("stock").default(0).notNull(),
  weight: decimal("weight", { precision: 10, scale: 2 }), // Logisztikához
  width: decimal("width", { precision: 10, scale: 2 }),
  height: decimal("height", { precision: 10, scale: 2 }),
  depth: decimal("depth", { precision: 10, scale: 2 }),
});

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const productRecommendations = pgTable("product_recommendations", {
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  recommendedProductId: uuid("recommended_product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
});

export const productRecommendationsRelations = relations(productRecommendations, ({ one }) => ({
  product: one(products, {
    fields: [productRecommendations.productId],
    references: [products.id],
    relationName: "recommendations",
  }),
  recommendedProduct: one(products, {
    fields: [productRecommendations.recommendedProductId],
    references: [products.id],
    relationName: "recommendedBy",
  }),
}));

export const productAttachments = pgTable("product_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const productAttachmentsRelations = relations(productAttachments, ({ one }) => ({
  product: one(products, {
    fields: [productAttachments.productId],
    references: [products.id],
  }),
}));

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

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
}));

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: varchar("order_number", { length: 100 }).unique().notNull(), // MuFis egyedi átadáshoz
  userId: uuid("user_id").references(() => users.id, { onDelete: 'set null' }), // Ha törlődik a user, a rendelés maradjon meg
  status: orderStatusEnum("status").default(OrderStatus.PENDING).notNull(),
  trackingCode: varchar("tracking_code", { length: 255 }),
  packageNumber: varchar("package_number", { length: 100 }), // Mufis csomagszám
  trackingLink: varchar("tracking_link", { length: 500 }), // Nyomkövető link
  stripeSessionId: varchar("stripe_session_id", { length: 255 }), // Régi Checkout session
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }), // Új Elements PaymentIntent
  customerEmail: varchar("customer_email", { length: 255 }), // Vendég vásárlás emailje
  customerName: varchar("customer_name", { length: 255 }), // Vendég neve
  customerPhone: varchar("customer_phone", { length: 50 }), // Telefonszám a futárnak
  shippingCountry: varchar("shipping_country", { length: 50 }),
  shippingZip: varchar("shipping_zip", { length: 20 }),
  shippingCity: varchar("shipping_city", { length: 150 }),
  shippingAddress: varchar("shipping_address", { length: 500 }), // Utca, hsz., ajtó
  currency: varchar("currency", { length: 3 }).default("HUF").notNull(), // Fizetési valuta: HUF vagy EUR
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(), // Ár floatként a cent/eur miatt
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  productVariant: one(productVariants, { fields: [orderItems.productVariantId], references: [productVariants.id] }),
}));

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
  name: jsonb("name").$type<Record<string, string>>().notNull(), // { hu: string, en: string, sk: string }
  description: jsonb("description").$type<Record<string, string>>(), // { hu: string, en: string, sk: string }
  slug: jsonb("slug").$type<Record<string, string>>().notNull(), // { hu: string, en: string, sk: string }
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parent_to_children",
  }),
  children: many(categories, { relationName: "parent_to_children" }),
  productCategories: many(productCategories),
}));

export const productCategories = pgTable("product_categories", {
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: 'cascade' }).notNull(),
});

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, {
    fields: [productCategories.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productCategories.categoryId],
    references: [categories.id],
  }),
}));

export const syncLogs = pgTable("sync_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  syncType: varchar("sync_type", { length: 50 }).notNull(), // e.g., 'meinl'
  processedCount: integer("processed_count").default(0).notNull(),
  updatedCount: integer("updated_count").default(0).notNull(),
  insertedCount: integer("inserted_count").default(0).notNull(),
  deactivatedCount: integer("deactivated_count").default(0).notNull(),
  successSkus: jsonb("success_skus"), // Array of SKUs
  errorSkus: jsonb("error_skus"), // Array of { sku, error }
  skippedSkus: jsonb("skipped_skus"), // Array of SKUs
  groupAssignedCount: integer("group_assigned_count").default(0).notNull(),
  groupSkippedSkus: jsonb("group_skipped_skus"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const badgeSettings = pgTable("badge_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  iconName: varchar("icon_name", { length: 255 }).unique().notNull(),
  tooltips: jsonb("tooltips").$type<Record<string, string>>().default({ hu: "", en: "", sk: "" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
