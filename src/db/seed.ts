import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("X DATABASE_URL nincs beállítva!");

const client = postgres(connectionString);
const db = drizzle(client, { schema });

function s(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function log(step: number, total: number, msg: string) {
  console.log(`\n[${step}/${total}] ${msg}`);
}

const TOTAL = 8;

async function seed() {
  console.log("\n+==================================+");
  console.log("|   HHM-SHOP-LMS  Seed Script      |");
  console.log("+==================================+");

  // -- 1. Admin upsert -----------------------------------------
  log(1, TOTAL, "Admin felhasználó...");
  const [admin] = await db.insert(schema.users).values({
    name: "Admin", email: "vzsozs@gmail.com",
    role: "admin", emailVerified: new Date(),
  }).onConflictDoUpdate({
    target: schema.users.email,
    set: { role: "admin", name: "Admin", emailVerified: new Date() },
  }).returning();
  console.log(`   OK ${admin.email} (${admin.role})`);

  // -- 2. Törlés (FK-sorrendben) --------------------------------
  log(2, TOTAL, "Korábbi adatok törlése...");
  await db.delete(schema.productCategories);
  await db.delete(schema.productRecommendations);
  await db.delete(schema.productAttachments);
  await db.delete(schema.productMedia);
  await db.delete(schema.productVariants);
  await db.delete(schema.products);
  await db.delete(schema.productGroups);
  await db.delete(schema.categories);
  console.log("   OK Kész");

  // -- 3. Kategóriák --------------------------------------------
  log(3, TOTAL, "Kategóriák...");
  const cats = await db.insert(schema.categories).values([
    {
      name: { hu: "Terápiás Hangtálak", en: "Therapy Singing Bowls", sk: "Terapeutické spievajúce misy" },
      slug: { hu: "terapias-hangtalk", en: "therapy-singing-bowls", sk: "terapeuticke-misy" },
      description: { hu: "Kézzel kalapált hangtálak hangterápiához és meditációhoz.", en: "Hand-hammered singing bowls for sound therapy and meditation.", sk: "Ručne kované misy pre zvukovú terapiu." },
    },
    {
      name: { hu: "Hangvillák", en: "Tuning Forks", sk: "Ladičky" },
      slug: { hu: "hangvillak", en: "tuning-forks", sk: "ladicky" },
      description: { hu: "Bolygófrekvenciákra hangolt hangvillák hangterápiához.", en: "Planetary tuned tuning forks for sound therapy.", sk: "Ladičky naladené na planetárne frekvencie." },
    },
    {
      name: { hu: "Kiegészítők", en: "Accessories", sk: "Príslušenstvo" },
      slug: { hu: "kiegeszitok", en: "accessories", sk: "prislusenstvo" },
      description: { hu: "Verők, tasakok, tartozékok hangtálakhoz és hangvillákhoz.", en: "Mallets, bags, and accessories for singing bowls and tuning forks.", sk: "Paličky, tašky a príslušenstvo." },
    },
    {
      name: { hu: "Tanfolyamok", en: "Courses", sk: "Kurzy" },
      slug: { hu: "tanfolyamok", en: "courses", sk: "kurzy" },
      description: { hu: "Himalájai hangtálmasszázs képzések kezdőktől haladókig.", en: "Himalayan singing bowl massage courses for all levels.", sk: "Kurzy himalájskej masáže spievajúcimi misami." },
    },
  ]).returning();

  const [hangtalkCat, hangvillakCat, kiegCat, tanfolyamCat] = cats;
  console.log(`   OK 4 kategória: Hangtálak | Hangvillák | Kiegészítők | Tanfolyamok`);

  // -- 4. Termékcsaládok ----------------------------------------
  log(4, TOTAL, "Termékcsaládok (Named Groups)...");
  const groups = await db.insert(schema.productGroups).values([
    {
      name: { hu: "Meinl Universal Series Hangtálak", en: "Meinl Universal Series Singing Bowls", sk: "Meinl Universal Series Spievajúce Misy" },
      slug: { hu: s("Meinl Universal Series Hangtalk"), en: s("Meinl Universal Series Singing Bowls"), sk: s("Meinl Universal Series Misy") },
    },
    {
      name: { hu: "Meinl Planetary Hangvillák", en: "Meinl Planetary Tuning Forks", sk: "Meinl Planetárne Ladičky" },
      slug: { hu: s("Meinl Planetary Hangvillak"), en: s("Meinl Planetary Tuning Forks"), sk: s("Meinl Planetarne Ladicky") },
    },
    {
      name: { hu: "Himalájai Hangtálmasszázs(R) Képzések", en: "Himalayan Singing Bowl Massage(R) Courses", sk: "Himalájska Masáž Spievajúcimi Misami(R) Kurzy" },
      slug: { hu: s("Himalájai Hangtálmasszázs Kepzesek"), en: s("Himalayan Singing Bowl Massage Courses"), sk: s("Himalajska Masaz Kurzy") },
    },
  ]).returning();

  const [universalGroup, tuningForkGroup, massageCourseGroup] = groups;
  console.log(`   OK 3 termékcsalád létrehozva`);

  // -- 5. Termékek -----------------------------------------------
  log(5, TOTAL, "Termékek...");

  const universalDesc = {
    en: "The Meinl Sonic Energy Universal Series Singing Bowls are quality-sounding instruments at great value. Intended for yoga and meditation, they can be used individually or as a set. When softly tapped, they release a fascinating, multi-layered sound with rich overtones that resonate deeply.",
    hu: "A Meinl Sonic Energy Universal Series hangtálak kiváló minőségű, mégis elérhető árú hangszerek. Jógához és meditációhoz tervezett hangtálak, amelyeket egyenként vagy szettben is lehet használni. Gyengéd ütésre lenyűgöző, többrétegű hangot adnak ki, amelynek gazdag felhangjai mélyen rezonálnak.",
    sk: "Misy Meinl Sonic Energy Universal Series sú kvalitné nástroje za skvelú cenu. Určené pre jogu a meditáciu, možno ich použiť jednotlivo alebo ako sadu.",
  };

  const tfDesc = {
    en: "The Meinl Sonic Energy Planetary Tuned Tuning Forks are made in Germany, each tuned to the frequency of a celestial body. Designed for sound healing, meditation and yoga. Made with high-quality nickel-plated steel with an ergonomic cork grip.",
    hu: "A Meinl Sonic Energy bolygófrekvenciákra hangolt hangvillák Németországban készülnek. Mindegyik egy égitestnek megfelelő frekvenciára van hangolva. Hanggyógyászathoz, meditációhoz és jógához tervezték. Kiváló minőségű nikkelbevonatos acélból készültek, ergonomikus parafafogóval.",
    sk: "Ladičky Meinl Sonic Energy Planetary sú vyrobené v Nemecku, každá naladená na frekvenciu nebeského telesa. Určené pre zvukovú terapiu a meditáciu.",
  };

  const prods = await db.insert(schema.products).values([
    // - Universal Series: 500g -
    {
      slug: { hu: s("meinl-sonic-energy-hangtal-500g"), en: "meinl-sonic-energy-singing-bowl-500g", sk: "meinl-sonic-energy-misa-500g" },
      name: { hu: "Meinl Sonic Energy Universal Hangtál 500g", en: "Meinl Sonic Energy Universal Singing Bowl 500g", sk: "Meinl Sonic Energy Universal Spievajúca Misa 500g" },
      brand: "Meinl Sonic Energy",
      description: universalDesc,
      shortDescription: { hu: "Kézzel kalapált, 500g-os Universal hangtál - jógához és meditációhoz. Tartalmaz tokot és filckarikát.", en: "Hand-hammered 500g Universal singing bowl for yoga & meditation. Includes cover and felt ring.", sk: "Ručne kovaná 500g misa pre jogu a meditáciu. Obsahuje obal a filcový krúžok." },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Cikkszám", value_hu: "SB-U-500", key_en: "SKU", value_en: "SB-U-500" },
        { key_hu: "Súly", value_hu: "520 g", key_en: "Weight", value_en: "520 g" },
        { key_hu: "Meret", value_hu: "13 cm", key_en: "Size", value_en: "13 cm / 5.1 inch" },
        { key_hu: "Anyag", value_hu: "Speciális bronzötvözet", key_en: "Material", value_en: "Special Bronze Alloy" },
        { key_hu: "Gyártás", value_hu: "India", key_en: "Made in", value_en: "India" },
        { key_hu: "Tartalmaz", value_hu: "Tok, filckarika", key_en: "Includes", value_en: "Cover, felt ring" },
      ],
      type: "physical", status: "ACTIVE", priority: 10, layoutTemplate: "STANDARD",
      groupId: universalGroup.id,
    },
    // - Universal Series: 750g -
    {
      slug: { hu: s("meinl-sonic-energy-hangtal-750g"), en: "meinl-sonic-energy-singing-bowl-750g", sk: "meinl-sonic-energy-misa-750g" },
      name: { hu: "Meinl Sonic Energy Universal Hangtál 750g", en: "Meinl Sonic Energy Universal Singing Bowl 750g", sk: "Meinl Sonic Energy Universal Spievajúca Misa 750g" },
      brand: "Meinl Sonic Energy",
      description: universalDesc,
      shortDescription: { hu: "Kézzel kalapált, 750g-os Universal hangtál - mélyebb hang, erőteljesebb rezonancia.", en: "Hand-hammered 750g Universal singing bowl - deeper tone, stronger resonance.", sk: "Ručne kovaná 750g misa - hlbší tón, silnejšia rezonancia." },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Cikkszám", value_hu: "SB-U-750", key_en: "SKU", value_en: "SB-U-750" },
        { key_hu: "Súly", value_hu: "750 g", key_en: "Weight", value_en: "750 g" },
        { key_hu: "Anyag", value_hu: "Speciális bronzötvözet", key_en: "Material", value_en: "Special Bronze Alloy" },
        { key_hu: "Gyártás", value_hu: "India", key_en: "Made in", value_en: "India" },
        { key_hu: "Tartalmaz", value_hu: "Tok, filckarika", key_en: "Includes", value_en: "Cover, felt ring" },
      ],
      type: "physical", status: "ACTIVE", priority: 9, layoutTemplate: "STANDARD",
      groupId: universalGroup.id,
    },
    // - Universal Series: 1700g -
    {
      slug: { hu: s("meinl-sonic-energy-hangtal-1700g"), en: "meinl-sonic-energy-singing-bowl-1700g", sk: "meinl-sonic-energy-misa-1700g" },
      name: { hu: "Meinl Sonic Energy Universal Hangtál 1700g", en: "Meinl Sonic Energy Universal Singing Bowl 1700g", sk: "Meinl Sonic Energy Universal Spievajúca Misa 1700g" },
      brand: "Meinl Sonic Energy",
      description: universalDesc,
      shortDescription: { hu: "Nagy méretű, 1700g-os Universal hangtál - hangfürdőkhöz és csoportos kezelésekhez ideális.", en: "Large 1700g Universal singing bowl - ideal for sound baths and group sessions.", sk: "Veľká 1700g misa - ideálna pre zvukové kúpele a skupinové sedenia." },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Cikkszám", value_hu: "SB-U-1700", key_en: "SKU", value_en: "SB-U-1700" },
        { key_hu: "Súly", value_hu: "1700 g", key_en: "Weight", value_en: "1700 g" },
        { key_hu: "Anyag", value_hu: "Speciális bronzötvözet", key_en: "Material", value_en: "Special Bronze Alloy" },
        { key_hu: "Gyártás", value_hu: "India", key_en: "Made in", value_en: "India" },
        { key_hu: "Tartalmaz", value_hu: "Tok, filckarika", key_en: "Includes", value_en: "Cover, felt ring" },
      ],
      type: "physical", status: "ACTIVE", priority: 8, layoutTemplate: "STANDARD",
      groupId: universalGroup.id,
    },
    // - Chakra Set (önálló) -
    {
      slug: { hu: s("meinl-sonic-energy-csakra-hangtál-szett"), en: "meinl-sonic-energy-chakra-singing-bowl-set", sk: "meinl-sonic-energy-cakra-spievajuce-misy-sada" },
      name: { hu: "Meinl Sonic Energy Csakra Hangtál Szett (7 db)", en: "Meinl Sonic Energy Chakra Singing Bowl Set (7 pcs)", sk: "Meinl Sonic Energy Čakra Spievajúce Misy Sada (7 ks)" },
      brand: "Meinl Sonic Energy",
      description: { hu: "A Meinl Sonic Energy Csakra Szett 7 különböző hangtálat tartalmaz - minden csakrához egyet. A szettben lévő tálakat tapasztalt szakértői csapat választja ki a Sonic Energy székhelyén az optimális csakra-harmonizáláshoz. Tartalmaz: 250g (koronacsakra), 700g (szemöldökcsakra), 1000g (torokcsakra), 1400g (szívcsakra), 1500g (napfonatos csakra), 1800g (szakrális csakra), 2200g (gyökércsakra).", en: "The Meinl Sonic Energy Chakra Set offers seven different singing bowls for every chakra. The selection is exclusively done by experienced staff at the Sonic Energy headquarters. Includes: 250g (crown), 700g (brow), 1000g (throat), 1400g (heart), 1500g (solar plexus), 1800g (sacral), 2200g (root).", sk: "Sada Meinl Sonic Energy Chakra obsahuje sedem rôznych mis pre každú čakru." },
      shortDescription: { hu: "7 hangtálas csakra szett az összes energiaközponthoz - tokkal és filckarikával.", en: "7-piece chakra singing bowl set for all energy centers - includes covers and felt rings.", sk: "7-dielna sada mis pre všetky čakry - s obalmi a filcovými krúžkami." },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Cikkszám", value_hu: "SB-SET-CHA", key_en: "SKU", value_en: "SB-SET-CHA" },
        { key_hu: "Összesúly", value_hu: "9117 g", key_en: "Total Weight", value_en: "9117 g" },
        { key_hu: "Db szám", value_hu: "7 hangtál", key_en: "Pieces", value_en: "7 singing bowls" },
        { key_hu: "Anyag", value_hu: "Speciális bronzötvözet", key_en: "Material", value_en: "Special Bronze Alloy" },
        { key_hu: "Tartalmaz", value_hu: "7× tok, 7× filckarika + verők", key_en: "Includes", value_en: "7× covers, 7× felt rings + mallets" },
        { key_hu: "Gyártás", value_hu: "India", key_en: "Made in", value_en: "India" },
      ],
      type: "physical", status: "ACTIVE", priority: 7, layoutTemplate: "STANDARD",
      groupId: null,
    },
    // - Mallet (kiegészítő) -
    {
      slug: { hu: s("meinl-sonic-energy-hangtálvero-nagy-filc"), en: "meinl-sonic-energy-singing-bowl-mallet-large-felt", sk: "meinl-sonic-energy-palicka-velka-filc" },
      name: { hu: "Meinl Sonic Energy Hangtálverő - Nagy, Filchegy (SB-M-LT-L)", en: "Meinl Sonic Energy Singing Bowl Mallet - Large, Felt Tip (SB-M-LT-L)", sk: "Meinl Sonic Energy Palička - Veľká, Filcová špička (SB-M-LT-L)" },
      brand: "Meinl Sonic Energy",
      description: { hu: "Nagy méretű hangtálverő nagy filcvégekkel, nagy és nagyon nagy hangtálak megszólaltatásához. Gőzölt bükkfából és filcből készül.", en: "Large singing bowl mallet with large felt tip, designed for large and extra-large singing bowls. Made from steamed beech wood and felt.", sk: "Veľká palička s veľkou filcovou špičkou pre veľké a extra veľké misy. Vyrobená z parovaného bukového dreva a filca." },
      shortDescription: { hu: "Nagy filchegyű verő nagy hangtálakhoz - bükkfa+filc.", en: "Large felt-tip mallet for large singing bowls - beech wood + felt.", sk: "Veľká filcová palička pre veľké misy - bukové drevo + filc." },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Cikkszám", value_hu: "SB-M-LT-L", key_en: "SKU", value_en: "SB-M-LT-L" },
        { key_hu: "Anyag", value_hu: "Gőzölt bükkfa, filc", key_en: "Material", value_en: "Steamed beech wood, felt" },
        { key_hu: "Méret", value_hu: "Nagy", key_en: "Size", value_en: "Large" },
      ],
      type: "physical", status: "ACTIVE", priority: 5, layoutTemplate: "STANDARD",
      groupId: null,
    },
    // - Crystal Bowl Sleeve -
    {
      slug: { hu: s("meinl-sonic-energy-kristaly-hangtál-tasak-14-barna"), en: "meinl-sonic-energy-crystal-singing-bowl-sleeve-14-brown", sk: "meinl-sonic-energy-obal-kristalova-misa-14-hneda" },
      name: { hu: "Meinl Sonic Energy 14\" Kristályhangtál Tasak - Barna (CSBS14BR)", en: "Meinl Sonic Energy 14\" Crystal Singing Bowl Sleeve - Brown (CSBS14BR)", sk: "Meinl Sonic Energy 14\" Obal na Krištáľovú Misu - Hnedá (CSBS14BR)" },
      brand: "Meinl Sonic Energy",
      description: { hu: "14 hüvelykes kristályhangtálakhoz tervezett védőtasak barna színben. Védi a tálat szállítás és tárolás közben.", en: "Protective sleeve designed for 14-inch crystal singing bowls in brown color. Protects the bowl during transport and storage.", sk: "Ochranný obal pre 14-palcové krištáľové misy v hnedej farbe." },
      shortDescription: { hu: "14\" kristályhangtál védőtasak - barna.", en: "14\" crystal singing bowl protective sleeve - brown.", sk: "14\" ochranný obal pre krištáľovú misu - hnedá." },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Cikkszám", value_hu: "CSBS14BR", key_en: "SKU", value_en: "CSBS14BR" },
        { key_hu: "Méret", value_hu: "14\"", key_en: "Size", value_en: "14\"" },
        { key_hu: "Szín", value_hu: "Barna", key_en: "Color", value_en: "Brown" },
      ],
      type: "physical", status: "ACTIVE", priority: 4, layoutTemplate: "STANDARD",
      groupId: null,
    },
    // - TF Lilith 123.02 Hz -
    {
      slug: { hu: s("meinl-sonic-energy-terapias-hangvilla-lilith-12302-hz"), en: "meinl-sonic-energy-tuning-fork-lilith-123-02-hz", sk: "meinl-sonic-energy-ladicka-lilith-123-02-hz" },
      name: { hu: "Meinl Sonic Energy Hangvilla - Lilith 123,02 Hz (TF-M-L)", en: "Meinl Sonic Energy Tuning Fork - Lilith 123.02 Hz (TF-M-L)", sk: "Meinl Sonic Energy Ladička - Lilith 123,02 Hz (TF-M-L)" },
      brand: "Meinl Sonic Energy",
      description: { hu: "A Lilith a Hold pályájának kiszámított pontja (a Föld melletti második fókuszpont). 123,02 Hz energetizál és nyugalmat ad. A női erőt képviseli - fizikai és érzelmi tisztításhoz jó.\n\nCsakrák: Gyökér, szakrális és napfonatos csakra.\n\n" + tfDesc.hu, en: "Lilith is a calculated point on the orbit of the moon, representing the second focal point of the moon's orbit beside the Earth. 123.02 Hz energizes and gives tranquility. Represents female power - good for physical and emotional cleansing.\n\nChakras: Root, sacral and solar plexus chakra.\n\n" + tfDesc.en, sk: "Lilith je vypočítaný bod obežnej dráhy Mesiaca. 123,02 Hz energizuje a dáva pokoj. Predstavuje ženskú silu - vhodná na fyzické a emocionálne čistenie.\n\n" + tfDesc.sk },
      shortDescription: { hu: "Lilith 123,02 Hz - gyökér, szakrális és napfonatos csakra. Németországban készült, parafafogó, pamuttasak.", en: "Lilith 123.02 Hz - root, sacral and solar plexus chakra. Made in Germany, cork handle, cotton bag.", sk: "Lilith 123,02 Hz - koreňová, sakrálna a solárna čakra. Vyrobená v Nemecku." },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Cikkszám", value_hu: "TF-M-L", key_en: "SKU", value_en: "TF-M-L" },
        { key_hu: "Frekvencia", value_hu: "123,02 Hz", key_en: "Frequency", value_en: "123.02 Hz" },
        { key_hu: "Súly", value_hu: "87 g", key_en: "Weight", value_en: "87 g" },
        { key_hu: "Meret", value_hu: "21,1 cm", key_en: "Size", value_en: "21.1 cm / 8.3 inch" },
        { key_hu: "Anyag", value_hu: "Nikkelbevonatos acél", key_en: "Material", value_en: "High Quality Nickel Plated Steel" },
        { key_hu: "Fogó", value_hu: "Parafa", key_en: "Handle", value_en: "Cork" },
        { key_hu: "Csakra", value_hu: "Gyökér, Szakrális, Napfonatos", key_en: "Chakra", value_en: "Root, Sacral, Solar Plexus" },
        { key_hu: "Gyártás", value_hu: "Németország", key_en: "Made in", value_en: "Germany" },
        { key_hu: "Tartalmaz", value_hu: "Pamuttasak", key_en: "Includes", value_en: "Cotton bag" },
      ],
      type: "physical", status: "ACTIVE", priority: 6, layoutTemplate: "STANDARD",
      groupId: tuningForkGroup.id,
    },
    // - TF Moon Knot 234.16 Hz -
    {
      slug: { hu: s("meinl-sonic-energy-hangvilla-hold-csomo-23416-hz"), en: "meinl-sonic-energy-tuning-fork-moon-knot-234-16-hz", sk: "meinl-sonic-energy-ladicka-mesiac-234-16-hz" },
      name: { hu: "Meinl Sonic Energy Hangvilla - Hold Csomó 234,16 Hz / A#3 (TF-M-K)", en: "Meinl Sonic Energy Tuning Fork - Moon Knot 234.16 Hz / A#3 (TF-M-K)", sk: "Meinl Sonic Energy Ladička - Moon Knot 234,16 Hz / A#3 (TF-M-K)" },
      brand: "Meinl Sonic Energy",
      description: { hu: "A Hold Csomó (Moon Knot / Fekete Hold) 234,16 Hz frekvenciájú hangvilla. Hans Cousto számítása szerint (Kozmikus Oktáv) a Hold pályájának csomópontjára van hangolva. " + tfDesc.hu, en: "The Moon Knot tuning fork at 234.16 Hz / A#3. Tuned to the node of the Moon's orbit according to Hans Cousto's calculation (The Cosmic Octave). " + tfDesc.en, sk: "Ladička Moon Knot 234,16 Hz / A#3. Naladená na uzol obežnej dráhy Mesiaca. " + tfDesc.sk },
      shortDescription: { hu: "Hold Csomó 234,16 Hz / A#3 - Németországban készült, parafafogó.", en: "Moon Knot 234.16 Hz / A#3 - made in Germany, cork handle.", sk: "Moon Knot 234,16 Hz / A#3 - vyrobená v Nemecku." },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Cikkszám", value_hu: "TF-M-K", key_en: "SKU", value_en: "TF-M-K" },
        { key_hu: "Frekvencia", value_hu: "234,16 Hz / A#3", key_en: "Frequency", value_en: "234.16 Hz / A#3" },
        { key_hu: "Anyag", value_hu: "Nikkelbevonatos acél", key_en: "Material", value_en: "High Quality Nickel Plated Steel" },
        { key_hu: "Gyártás", value_hu: "Németország", key_en: "Made in", value_en: "Germany" },
        { key_hu: "Tartalmaz", value_hu: "Pamuttasak", key_en: "Includes", value_en: "Cotton bag" },
      ],
      type: "physical", status: "ACTIVE", priority: 5, layoutTemplate: "STANDARD",
      groupId: tuningForkGroup.id,
    },
    // - TF Culmination Cycle 187.61 Hz -
    {
      slug: { hu: s("meinl-sonic-energy-hangvilla-csucspont-ciklus-18761-hz"), en: "meinl-sonic-energy-tuning-fork-culmination-cycle-187-61-hz", sk: "meinl-sonic-energy-ladicka-kulminacia-187-61-hz" },
      name: { hu: "Meinl Sonic Energy Hangvilla - Csúcspont Ciklus 187,61 Hz / F#3 (TF-M-CU)", en: "Meinl Sonic Energy Tuning Fork - Culmination Cycle 187.61 Hz / F#3 (TF-M-CU)", sk: "Meinl Sonic Energy Ladička - Culmination Cycle 187,61 Hz / F#3 (TF-M-CU)" },
      brand: "Meinl Sonic Energy",
      description: { hu: "A Csúcspont Ciklus (Culmination Cycle) 187,61 Hz / F#3 hangvilla. " + tfDesc.hu, en: "The Culmination Cycle 187.61 Hz / F#3 tuning fork. " + tfDesc.en, sk: "Ladička Culmination Cycle 187,61 Hz / F#3. " + tfDesc.sk },
      shortDescription: { hu: "Culmination Cycle 187,61 Hz / F#3 - Németországban készült, parafafogó.", en: "Culmination Cycle 187.61 Hz / F#3 - made in Germany, cork handle.", sk: "Culmination Cycle 187,61 Hz / F#3 - vyrobená v Nemecku." },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Cikkszám", value_hu: "TF-M-CU", key_en: "SKU", value_en: "TF-M-CU" },
        { key_hu: "Frekvencia", value_hu: "187,61 Hz / F#3", key_en: "Frequency", value_en: "187.61 Hz / F#3" },
        { key_hu: "Anyag", value_hu: "Nikkelbevonatos acél", key_en: "Material", value_en: "High Quality Nickel Plated Steel" },
        { key_hu: "Gyártás", value_hu: "Németország", key_en: "Made in", value_en: "Germany" },
        { key_hu: "Tartalmaz", value_hu: "Pamuttasak", key_en: "Includes", value_en: "Cotton bag" },
      ],
      type: "physical", status: "ACTIVE", priority: 4, layoutTemplate: "STANDARD",
      groupId: tuningForkGroup.id,
    },
    // - TF Set 16 (önálló) -
    {
      slug: { hu: s("meinl-sonic-energy-16-darabos-hangvilla-szett-allvannyal"), en: "meinl-sonic-energy-16-piece-tuning-fork-set-with-holder", sk: "meinl-sonic-energy-16-dielna-sada-ladicicek-so-stojanom" },
      name: { hu: "Meinl Sonic Energy 16 db-os Hangvilla Szett Állvánnyal (TF-SET-16)", en: "Meinl Sonic Energy 16-piece Tuning Fork Set incl. Holder (TF-SET-16)", sk: "Meinl Sonic Energy 16-dielna Sada Ladičiek so Stojanom (TF-SET-16)" },
      brand: "Meinl Sonic Energy",
      description: { hu: "16 db Meinl Sonic Energy bolygófrekvenciás hangvilla egy szettben, bükkfa állvánnyal. A villák Hans Cousto számítása szerint (Kozmikus Oktáv) minden egyes égitest frekvenciájára vannak pontosan behangolva a terápiás hatás érdekében. Ergonomikus parafafogó, nikkelbevonatos acél, Németországban készül.", en: "This set includes 16 Meinl Sonic Energy Planetary Tuned Tuning Forks and a fitting wooden holder. Each tuning fork is tuned exactly to the frequency of the respective celestial body (Hans Cousto's Cosmic Octave) to achieve a therapeutic effect. Ergonomic cork handles, nickel-plated steel, made in Germany.", sk: "Sada 16 planetárnych ladičiek Meinl Sonic Energy s dreveným stojanom. Každá je naladená na frekvenciu príslušného nebeského telesa." },
      shortDescription: { hu: "16 db bolygóhangvilla bükkfa állvánnyal - teljes terápiás szett, Németországból.", en: "16 planetary tuning forks with beech wood holder - complete therapy set, made in Germany.", sk: "16 planetárnych ladičiek s bukovým stojanom - kompletná terapeutická sada z Nemecka." },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Cikkszám", value_hu: "TF-SET-16", key_en: "SKU", value_en: "TF-SET-16" },
        { key_hu: "Db szám", value_hu: "16 hangvilla", key_en: "Pieces", value_en: "16 tuning forks" },
        { key_hu: "Anyag", value_hu: "Nikkelbevonatos acél, bükkfa", key_en: "Material", value_en: "Nickel Plated Steel, Beech Wood" },
        { key_hu: "Tartalmaz", value_hu: "Bükkfa állvány", key_en: "Includes", value_en: "Wooden holder" },
        { key_hu: "Gyártás", value_hu: "Németország", key_en: "Made in", value_en: "Germany" },
      ],
      type: "physical", status: "ACTIVE", priority: 8, layoutTemplate: "STANDARD",
      groupId: null,
    },
    // - Képzés: Kezdő -
    {
      slug: { hu: s("Himalájai Hangtálmasszázs kezdo kepzes"), en: "himalayan-singing-bowl-massage-beginner-course", sk: "himalajska-masaz-misami-zaciatocnicky-kurz" },
      name: { hu: "Himalájai Hangtálmasszázs(R) - Kezdő Elmélet és Gyakorlat", en: "Himalayan Singing Bowl Massage(R) - Beginner Theory & Practice", sk: "Himalájska Masáž Spievajúcimi Misami(R) - Začiatočnícka Teória a Prax" },
      brand: "Hangakadémia",
      description: {
        hu: "Képzés időtartama: 3 nap - péntek, szombat, vasárnap 09:00-16:00 h-ig.\nKépzés helye: Hangakadémia(R) 1188 Budapest, Nemes u. 88.\nElőképzettségre nincs szükség.\n\nA képzés tartalmazza:\n- Elméleti és gyakorlati ismeretek\n- Eszközhasználat - egy Meinl Sonic Energy 250g hangtál + ütő a résztvevőé lesz\n- Oktatási segédanyagok, írásos jegyzet\n- Kiváló vizsga után tanúsítvány\n- Konzultáció lehetőség vagy gyakorlónap\n- Részvétel utáni mentorálás\n- Kedvezményes eszközvásárlási lehetőség\n\nA képzés tematikája:\n- Hangtan, akusztikai alapfogalmak\n- Hanggyógyászati terminológia, frekvenciagyógyászat\n- Hangterápia tudományos és biológiai háttere\n- Himalájai hangtálak eredete, történelme, készítésük, tárolásuk, tisztításuk\n- Hangtálas eszközök ismertetése\n- Hangtálak helyes tartása és megszólaltatása, különböző ütők és dörzsfa\n- Különböző ütési és dörzsölési technikák\n- Sound Scan (hangszkennelés), Vízes kezelés\n- Egyéni, csoportos kezelések 1-7 tálig",
        en: "Duration: 3 days - Friday, Saturday, Sunday 09:00-16:00.\nVenue: Hangakadémia(R) 1188 Budapest, Nemes u. 88.\nNo prior training required.\n\nIncludes: theory & practice, Meinl Sonic Energy 250g bowl + mallet (yours to keep), study materials, certificate upon passing, consultation/practice day, post-course mentoring, discounted equipment.\n\nTopics: acoustics, sound healing terminology, frequency medicine, scientific background of sound therapy, history of Himalayan singing bowls, instrument handling, striking and rubbing techniques, Sound Scan, Water treatment, individual and group sessions with 1-7 bowls.",
        sk: "Trvanie: 3 dni - piatok, sobota, nedeľa 09:00-16:00.\nMiesto: Hangakadémia(R) 1188 Budapešť, Nemes u. 88.\nNie je potrebná predchádzajúca príprava.",
      },
      shortDescription: {
        hu: "3 napos Himalájai Hangtálmasszázs(R) kezdő képzés Budapesten. Tartalmaz: 250g Meinl Sonic Energy hangtál + ütő, tanúsítvány, mentorálás.",
        en: "3-day Himalayan Singing Bowl Massage(R) beginner course in Budapest. Includes: 250g Meinl Sonic Energy bowl + mallet, certificate, mentoring.",
        sk: "3-dňový začiatočnícky kurz Himalájska Masáž Spievajúcimi Misami(R) v Budapešti.",
      },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Időtartam", value_hu: "3 nap (P-Sz-V 09:00-16:00)", key_en: "Duration", value_en: "3 days (Fri-Sun 09:00-16:00)" },
        { key_hu: "Helyszín", value_hu: "Hangakadémia(R), 1188 Budapest, Nemes u. 88.", key_en: "Venue", value_en: "Hangakadémia(R), 1188 Budapest, Nemes u. 88." },
        { key_hu: "Szint", value_hu: "Kezdő", key_en: "Level", value_en: "Beginner" },
        { key_hu: "Előképzettség", value_hu: "Nem szükséges", key_en: "Prerequisites", value_en: "None required" },
        { key_hu: "Tartalmaz", value_hu: "250g MSE hangtál + ütő, tanúsítvány", key_en: "Includes", value_en: "250g MSE bowl + mallet, certificate" },
      ],
      type: "physical", status: "ACTIVE", priority: 10, layoutTemplate: "STANDARD",
      groupId: massageCourseGroup.id,
    },
    // - Képzés: Középhaladó -
    {
      slug: { hu: s("Himalájai Hangtálmasszázs kozephalado kepzes"), en: "himalayan-singing-bowl-massage-intermediate-course", sk: "himalajska-masaz-misami-pokrocily-kurz" },
      name: { hu: "Himalájai Hangtálmasszázs(R) - Középhaladó Elmélet és Gyakorlat", en: "Himalayan Singing Bowl Massage(R) - Intermediate Theory & Practice", sk: "Himalájska Masáž Spievajúcimi Misami(R) - Stredne Pokročilá Teória a Prax" },
      brand: "Hangakadémia",
      description: {
        hu: "Képzés időtartama: 3 nap - péntek, szombat, vasárnap 09:00-16:00 h-ig.\nKépzés helye: Hangakadémia(R) 1188 Budapest, Nemes u. 88.\nFeltétel: Himalájai Hangtálmasszázs(R) Kezdő képzés elvégzése.\n\nA képzés tartalmazza:\n- Elméleti és gyakorlati ismeretek\n- Eszközhasználat - egy Meinl Sonic Energy 250g hangtál + dörzsfa a résztvevőé lesz\n- Oktatási segédanyagok, írásos jegyzet\n- Kiváló vizsga után tanúsítvány\n- Konzultáció lehetőség, részvétel utáni mentorálás, kedvezményes eszközvásárlás\n\nA képzés tematikája:\n- Integrált hanggyógyítás, autonóm idegrendszer, nervus vagus\n- Stresszkezelés, érzelmek és hangok kapcsolata\n- Szakrális geometriák a hangterápiában\n- Szívkoherencia és a hangok világa\n- Élő vércseppanalízis\n- Duplex és triplex tálak helyes használata\n- Himalájai testharmonizálás szimbolika alapján (1-13 db hangtállal)\n- 'CSÚSZTATÁSOS TECHNIKA'(R)\n- Gyermek, kismama és párkapcsolati harmonizálás\n- Hangfürdő-vezető hangszerek, meditációs hangfürdők",
        en: "Duration: 3 days - Friday, Saturday, Sunday 09:00-16:00.\nVenue: Hangakadémia(R) 1188 Budapest, Nemes u. 88.\nPrerequisite: Beginner Himalayan Singing Bowl Massage(R) course.\n\nIncludes: theory & practice, 250g MSE bowl + rubbing stick (yours to keep), certificate, mentoring.\n\nTopics: integrative sound healing, autonomic nervous system and vagus nerve, stress management, sacred geometry, heart coherence, live blood drop analysis, duplex and triplex bowls, full body harmonization with 1-13 bowls, Sliding Technique(R), child/mother/couple harmonization, sound bath leadership.",
        sk: "Trvanie: 3 dni - piatok, sobota, nedeľa 09:00-16:00.\nPodmienka: absolvovanie začiatočníckeho kurzu.\nMiesto: Hangakadémia(R) 1188 Budapešť, Nemes u. 88.",
      },
      shortDescription: {
        hu: "3 napos középhaladó Himalájai Hangtálmasszázs(R) képzés. Feltétel: kezdő szint. Tartalmaz 250g MSE hangtál + dörzsfa, tanúsítvány.",
        en: "3-day intermediate Himalayan Singing Bowl Massage(R) course. Prerequisite: beginner level. Includes 250g MSE bowl + rubbing stick, certificate.",
        sk: "3-dňový stredne pokročilý kurz. Podmienka: začiatočnícka úroveň. Obsahuje misu a trecie drevo.",
      },
      longDescription: { hu: "", en: "", sk: "" },
      specifications: [
        { key_hu: "Időtartam", value_hu: "3 nap (P-Sz-V 09:00-16:00)", key_en: "Duration", value_en: "3 days (Fri-Sun 09:00-16:00)" },
        { key_hu: "Helyszín", value_hu: "Hangakadémia(R), 1188 Budapest, Nemes u. 88.", key_en: "Venue", value_en: "Hangakadémia(R), 1188 Budapest, Nemes u. 88." },
        { key_hu: "Szint", value_hu: "Középhaladó", key_en: "Level", value_en: "Intermediate" },
        { key_hu: "Előképzettség", value_hu: "Kezdő képzés szükséges", key_en: "Prerequisites", value_en: "Beginner course required" },
        { key_hu: "Tartalmaz", value_hu: "250g MSE hangtál + dörzsfa, tanúsítvány", key_en: "Includes", value_en: "250g MSE bowl + rubbing stick, certificate" },
      ],
      type: "physical", status: "ACTIVE", priority: 9, layoutTemplate: "STANDARD",
      groupId: massageCourseGroup.id,
    },
  ]).returning();

  console.log(`   OK ${prods.length} termék létrehozva`);
  prods.forEach(p => console.log(`      - ${(p.name as Record<string, string>).hu}`));

  // -- 6. Variánsok ---------------------------------------------
  log(6, TOTAL, "Termékváltozatok...");
  const [p500, p750, p1700, pCha, pMallet, pSleeve, pTfL, pTfK, pTfCu, pTfSet, pKepzKezdo, pKepzKozep] = prods;

  await db.insert(schema.productVariants).values([
    { productId: p500.id,    sku: "SB-U-500",    name: { hu: "500g (13 cm)", en: "500g (13 cm)" }, priceHuf: 18_900, priceEur: "47.00", stock: 12, weight: "520.00", width: "13.00", height: "7.00", depth: "13.00" },
    { productId: p750.id,    sku: "SB-U-750",    name: { hu: "750g", en: "750g" },                 priceHuf: 24_900, priceEur: "62.00", stock: 8, weight: "750.00" },
    { productId: p1700.id,   sku: "SB-U-1700",   name: { hu: "1700g", en: "1700g" },               priceHuf: 49_900, priceEur: "124.00", stock: 5, weight: "1700.00" },
    { productId: pCha.id,    sku: "SB-SET-CHA",  name: { hu: "7 db-os Csakra Szett", en: "7-piece Chakra Set" }, priceHuf: 189_900, priceEur: "474.00", stock: 3, weight: "9117.00" },
    { productId: pMallet.id, sku: "SB-M-LT-L",   name: { hu: "Nagy filchegyű verő", en: "Large Felt Tip Mallet" }, priceHuf: 5_900, priceEur: "15.00", stock: 25, weight: "120.00" },
    { productId: pSleeve.id, sku: "CSBS14BR",    name: { hu: "14\" Barna tasak", en: "14\" Brown Sleeve" },      priceHuf: 8_900, priceEur: "22.00", stock: 20, weight: "200.00" },
    { productId: pTfL.id,    sku: "TF-M-L",      name: { hu: "Lilith 123,02 Hz", en: "Lilith 123.02 Hz" },       priceHuf: 14_900, priceEur: "37.00", stock: 15, weight: "87.00", width: "3.00", height: "21.00", depth: "3.00" },
    { productId: pTfK.id,    sku: "TF-M-K",      name: { hu: "Hold Csomó 234,16 Hz", en: "Moon Knot 234.16 Hz" }, priceHuf: 14_900, priceEur: "37.00", stock: 15, weight: "87.00" },
    { productId: pTfCu.id,   sku: "TF-M-CU",     name: { hu: "Csúcspont Ciklus 187,61 Hz", en: "Culmination 187.61 Hz" }, priceHuf: 14_900, priceEur: "37.00", stock: 15, weight: "87.00" },
    { productId: pTfSet.id,  sku: "TF-SET-16",   name: { hu: "16 db-os szett állvánnyal", en: "16-piece set with holder" }, priceHuf: 99_900, priceEur: "249.00", stock: 4, weight: "1500.00" },
    { productId: pKepzKezdo.id, sku: "HHM-COURSE-BEGINNER", name: { hu: "Kezdő Képzés - Jelentkezési díj", en: "Beginner Course - Registration Fee" }, priceHuf: 180_000, priceEur: "449.00", stock: 12 },
    { productId: pKepzKozep.id, sku: "HHM-COURSE-INTERMEDIATE", name: { hu: "Középhaladó Képzés - Jelentkezési díj", en: "Intermediate Course - Registration Fee" }, priceHuf: 195_000, priceEur: "489.00", stock: 10 },
  ]);
  console.log("   OK 12 variáns létrehozva");

  // -- 7. Kategória-hozzárendelések -----------------------------
  log(7, TOTAL, "Kategória-hozzárendelések...");
  await db.insert(schema.productCategories).values([
    { productId: p500.id,    categoryId: hangtalkCat.id },
    { productId: p750.id,    categoryId: hangtalkCat.id },
    { productId: p1700.id,   categoryId: hangtalkCat.id },
    { productId: pCha.id,    categoryId: hangtalkCat.id },
    { productId: pMallet.id, categoryId: kiegCat.id },
    { productId: pSleeve.id, categoryId: kiegCat.id },
    { productId: pTfL.id,    categoryId: hangvillakCat.id },
    { productId: pTfK.id,    categoryId: hangvillakCat.id },
    { productId: pTfCu.id,   categoryId: hangvillakCat.id },
    { productId: pTfSet.id,  categoryId: hangvillakCat.id },
    { productId: pKepzKezdo.id, categoryId: tanfolyamCat.id },
    { productId: pKepzKozep.id, categoryId: tanfolyamCat.id },
  ]);
  console.log("   OK Kész");

  // -- 8. Ajánlások ---------------------------------------------
  log(8, TOTAL, "Ajánlások...");
  await db.insert(schema.productRecommendations).values([
    { productId: pCha.id,   recommendedProductId: pMallet.id },
    { productId: pTfL.id,   recommendedProductId: pTfSet.id },
    { productId: pTfK.id,   recommendedProductId: pTfSet.id },
    { productId: pTfCu.id,  recommendedProductId: pTfSet.id },
    { productId: pKepzKezdo.id, recommendedProductId: p500.id },
    { productId: pKepzKozep.id, recommendedProductId: pKepzKezdo.id },
  ]);
  console.log("   OK Kész");

  // -- ÖSSZEFOGLALÓ ---------------------------------------------
  console.log("\n+======================================+");
  console.log("|           SEED KÉSZ OK               |");
  console.log("+======================================+");
  console.log(`|   Admin: vzsozs@gmail.com          |`);
  console.log(`|   Kategóriák: 4                    |`);
  console.log(`|  ️  Termékcsoportok: 3               |`);
  console.log(`|   Termékek: 12                     |`);
  console.log(`|     Hangtálak: 3 (Universal Series)  |`);
  console.log(`|     Hangtál szett: 1 (Csakra)        |`);
  console.log(`|     Kiegészítők: 2                   |`);
  console.log(`|     Hangvillák: 3 (Planetary)        |`);
  console.log(`|     Hangvilla szett: 1 (16 db)       |`);
  console.log(`|     Képzések: 2 (Kezdő + Közép.)     |`);
  console.log("+======================================+\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("\nX Seed hiba:", err?.message || err);
  process.exit(1);
});
