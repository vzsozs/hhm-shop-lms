import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";

// Enumok a jogosultságokhoz és címtípusokhoz
export const roleEnum = pgEnum("role", ["admin", "user"]);
export const addressTypeEnum = pgEnum("address_type", ["billing", "shipping"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: varchar("image", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }), // Lehet null, ha Google-el lép be
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// A NextAuth által használt accountok (pl. Google OAuth)
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  lang: varchar("lang", { length: 10 }).default("hu").notNull(),
  expertise: varchar("expertise", { length: 255 }),
  interests: text("interests"),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: addressTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  zip: varchar("zip", { length: 20 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  taxNumber: varchar("tax_number", { length: 50 }),
  companyName: varchar("company_name", { length: 255 }),
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
