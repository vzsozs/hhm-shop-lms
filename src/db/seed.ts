import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "dotenv";

// Betöltjük a környezeti változókat a .env fájlból
config({ path: ".env" });
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log("Adatbázis inicializálása...");

  // 1. Töröljük a meglévő termékeket és kategóriákat (a kaszkád törlések elvégzik a relációk törlését)
  console.log("Korábbi termékek és kategóriák törlése...");
  await db.delete(schema.products);
  await db.delete(schema.categories);

  // 2. Kategóriák létrehozása
  console.log("Kategóriák létrehozása...");
  const newCategories = await db.insert(schema.categories).values([
    {
      slug: { hu: "oktatas", en: "education", sk: "vzdelavanie" },
      name: { hu: "Oktatás", en: "Education", sk: "Vzdelávanie" }
    },
    {
      slug: { hu: "hardver", en: "hardware", sk: "hardver" },
      name: { hu: "Hardverek és Eszközök", en: "Hardware & Tools", sk: "Hardvér a Nástroje" }
    },
    {
      slug: { hu: "csomagok", en: "bundles", sk: "balicky" },
      name: { hu: "Csomagajánlatok", en: "Bundles", sk: "Balíčky" }
    }
  ]).returning();

  const [oktatasCat, hardverCat, csomagCat] = newCategories;

  // 3. Termékek létrehozása
  console.log("Termékek létrehozása...");
  const newProducts = await db.insert(schema.products).values([
    {
      slug: { hu: "hhm-kurzus", en: "hhm-course", sk: "hhm-kurz" },
      name: { hu: "Prémium HHM Kurzus", en: "Premium HHM Course", sk: "Prémiový HHM Kurz" },
      description: {
        hu: "A legátfogóbb zenei produceri és hangkeverési kurzus Magyarországon.",
        en: "The most comprehensive music production and mixing course.",
        sk: "Najkomplexnejší kurz hudobnej produkcie a mixovania."
      },
      shortDescription: {
        hu: "Mesterkurzus kezdőknek és haladóknak.",
        en: "Masterclass for beginners and advanced.",
        sk: "Majstrovská trieda."
      },
      longDescription: { hu: "<p>Hosszú HTML leírás ide</p>", en: "", sk: "" },
      specifications: [
        { key_hu: "Nyelv", value_hu: "Magyar", key_en: "Language", value_en: "Hungarian" },
        { key_hu: "Időtartam", value_hu: "12 Óra", key_en: "Duration", value_en: "12 Hours" }
      ],
      type: "digital",
      status: "ACTIVE",
      priority: 10,
      layoutTemplate: "STANDARD"
    },
    {
      slug: { hu: "halado-hangkeveres", en: "advanced-mixing", sk: "pokrocile-mixovanie" },
      name: { hu: "Haladó Hangkeverés Mesterfokon", en: "Advanced Audio Mixing", sk: "Pokročilé mixovanie zvuku" },
      description: { hu: "Profi stúdió technikák EQ-hoz és kompresszorokhoz.", en: "", sk: "" },
      shortDescription: { hu: "Lépj a következő szintre", en: "", sk: "" },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [],
      type: "digital",
      status: "ACTIVE",
      priority: 5,
      layoutTemplate: "VIDEO_CENTERED"
    },
    {
      slug: { hu: "kezdo-hangmester-csomag", en: "beginner-audio-bundle", sk: "balicek-pre-zaciatocnikov" },
      name: { hu: "Kezdő Hangmesteri Csomag", en: "Beginner Audio Engineer Bundle", sk: "Balíček pre začiatočníkov" },
      description: { hu: "Induló fizikai eszközcsomag", en: "", sk: "" },
      shortDescription: { hu: "Minden ami kell.", en: "", sk: "" },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [],
      type: "physical",
      status: "ACTIVE",
      priority: 1,
      layoutTemplate: "STANDARD"
    },
    {
      slug: { hu: "hhm-studio-fejhalkgato", en: "hhm-studio-headphones", sk: "hhm-studiove-sluchadla" },
      name: { hu: "HHM Stúdió Fejhallgató PRO", en: "HHM Studio Headphones PRO", sk: "HHM Štúdiové Slúchadlá" },
      description: { hu: "Referencia hangzás a tökéletes mixhez", en: "", sk: "" },
      shortDescription: { hu: "Limitált kiadás", en: "", sk: "" },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Szín", value_hu: "Fekete / Narancs" }
      ],
      type: "physical",
      status: "ACTIVE",
      priority: 2,
      layoutTemplate: "STANDARD"
    },
    {
      slug: { hu: "meditacio-hangterapia", en: "meditation-sound-therapy", sk: "zvukova-terapia" },
      name: { hu: "Hangterápia és Meditáció 432Hz", en: "Sound Therapy & Meditation", sk: "Zvuková Terapia" },
      description: { hu: "Számonként lebontott 432Hz-es audio anyagok.", en: "", sk: "" },
      shortDescription: { hu: "Relaxálj és alkoss.", en: "", sk: "" },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [],
      type: "digital",
      status: "INACTIVE", // Piszkozatként
      priority: 0,
      layoutTemplate: "AUDIO_DOC"
    }
  ]).returning();

  // 4. Variánsok létrehozása a termékekhez
  console.log("Termék variánsok létrehozása...");
  await db.insert(schema.productVariants).values([
    // Termék 1 (Digitális - Kurzus)
    {
      productId: newProducts[0].id,
      name: { hu: "Alap Csomag", en: "Basic Tier" },
      sku: "HHM-001-BASIC",
      priceHuf: 89900,
      priceEur: "230.00",
      stock: 999
    },
    {
      productId: newProducts[0].id,
      name: { hu: "VIP Mentor Csomag", en: "VIP Mentoring" },
      sku: "HHM-001-VIP",
      priceHuf: 149900,
      priceEur: "380.00",
      stock: 20
    },
    // Termék 2 (Digitális)
    {
      productId: newProducts[1].id,
      name: { hu: "Digitális Hozzáférés" },
      sku: "HHM-002-DIG",
      priceHuf: 45000,
      priceEur: "115.00",
      stock: 999
    },
    // Termék 3 (Fizikai Készlet)
    {
      productId: newProducts[2].id,
      name: { hu: "Alap szett" },
      sku: "HHM-003-SET1",
      priceHuf: 250000,
      priceEur: "640.00",
      stock: 5,
      weight: "4500.00",
      width: "50.00",
      height: "40.00",
      depth: "30.00"
    },
    // Termék 4 (Fizikai)
    {
      productId: newProducts[3].id,
      name: { hu: "Sztenderd méret" },
      sku: "HHM-004-HP",
      priceHuf: 65000,
      priceEur: "165.00",
      stock: 12,
      weight: "800.00"
    },
    // Termék 5 (Piszkozat Digitális)
    {
      productId: newProducts[4].id,
      name: { hu: "Digitális Letöltés" },
      sku: "HHM-005-MED",
      priceHuf: 15000,
      priceEur: "38.00",
      stock: 999
    }
  ]);

  // 5. Kategóriák hozzárendelése a termékekhez
  console.log("Kategóriák hozzárendelése...");
  await db.insert(schema.productCategories).values([
    { productId: newProducts[0].id, categoryId: oktatasCat.id },
    { productId: newProducts[1].id, categoryId: oktatasCat.id },
    { productId: newProducts[2].id, categoryId: csomagCat.id },
    { productId: newProducts[2].id, categoryId: hardverCat.id }, // Két kategória
    { productId: newProducts[3].id, categoryId: hardverCat.id },
  ]);

  console.log("=====================================");
  console.log("Kész. Az adatbázis sikeresen feltöltve 5 termékkel és 3 kategóriával!");
  console.log("=====================================");
  
  process.exit(0);
}

seed().catch((err) => {
  console.error("Hiba a feltöltés során:", err);
  process.exit(1);
});
