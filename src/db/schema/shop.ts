import { pgTable, uuid, varchar, timestamp, text, integer, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./auth";

// Enumok a terméktípusokhoz, mediákhoz és rendelés státuszokhoz
export const productTypeEnum = pgEnum("product_type", ["physical", "digital"]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "sound"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "completed", "cancelled"]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  description: text("description"),
  specs: jsonb("specs"), // Rugalmas specifikációk JSON-ben
  type: productTypeEnum("type").default("physical").notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  sku: varchar("sku", { length: 100 }).unique().notNull(), // MuFis-hoz kötelező!
  priceHuf: integer("price_huf"), // Főként forint alapú árazás
  priceEur: decimal("price_eur", { precision: 10, scale: 2 }), // Kerekítések miatt decimal
  stock: integer("stock").default(0).notNull(),
  weight: decimal("weight", { precision: 10, scale: 2 }), // Logisztikához
  width: decimal("width", { precision: 10, scale: 2 }),
  height: decimal("height", { precision: 10, scale: 2 }),
  depth: decimal("depth", { precision: 10, scale: 2 }),
});

export const productMedia = pgTable("product_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  type: mediaTypeEnum("type").notNull(),
});

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
