import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enumok a jogosultságokhoz és címtípusokhoz
export const roleEnum = pgEnum("role", ["admin", "user"]);
export const addressTypeEnum = pgEnum("address_type", ["billing", "shipping"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  lang: varchar("lang", { length: 10 }).default("hu").notNull(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: addressTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  zip: varchar("zip", { length: 20 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  taxNumber: varchar("tax_number", { length: 50 }),
});

export const userAccess = pgTable("user_access", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  category: varchar("category", { length: 100 }).notNull(), // pl. kurzus kategória
  level: varchar("level", { length: 50 }), // szint
  expiresAt: timestamp("expires_at"), // 60 napos hozzáféréshez
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
