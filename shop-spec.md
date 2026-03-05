# HHM-Shop-LMS Projekt Specifikáció (Modular Webshop & LMS)

## AI Ágens Kommunikációs Szabályok (Kritikus!)
- **Nyelv:** Minden kommunikációt (Chat, Walkthrough, Task leírások) MAGYAR nyelven kell végezni.
- **Kód megjegyzések:** A forráskódban a magyarázó megjegyzések (comments) MAGYARUL íródjanak.
- **Munkafolyamat:** Mielőtt bármilyen kódot írnál, vázold fel a tervet lépésről lépésre, röviden!
- **Sablonok:** A következő dokumentumokat kötelező MAGYARUL generálni:
  - Walkthrough (Bejárás)
  - Task (Feladatleírás)
  - Artifact Templates (Eredménytermék sablonok)
  - Proposed Changes (Javasolt módosítások)
  - Implementation Plan (Megvalósítási terv)

---

## Technikai Stack & Architektúra
- **Keretrendszer:** Next.js 14+ (App Router) - TypeScript alapokon.
- **Stílus:** Tailwind CSS + Shadcn UI.
- **Adatbázis & ORM:** PostgreSQL + Drizzle ORM.
- **Auth:** Auth.js (NextAuth).
- **Fizetés:** Stripe integráció.
- **Videó:** Bunny.net Stream (HLS védelem, domain-szűrés).
- **Logisztika:** MuFis API (Push/Pull szinkron: getOrder, setOrder, getProduct, setProduct).

### Moduláris Felépítés (Újrafelhasználhatóság):
A projektet úgy kell strukturálni, hogy a modulok később más projektekbe is átemelhetőek legyenek:
- `src/modules/shop`: Terméklogika, kosár, MuFis integráció.
- `src/modules/lms`: Kurzuskezelés, lejátszó, vizsga logika.
- `src/modules/shared`: Közös UI komponensek, i18n logika.
- `src/db/schema`: Adatbázis sémák elkülönítve.

---

## 📊 Adatmodell (Séma Tervezet)

### User & Auth (`auth.ts`)
- `users`: id, email, password_hash, role (admin/user).
- `profiles`: user_id, name, phone, lang.
- `addresses`: billing/shipping adatok (név, irányítószám, város, utca, adószám).
- `user_access`: user_id, kategória, szint, lejárati dátum (60 napos limit kezelése).

### Webshop (`shop.ts`)
- `products`: Alapadatok, márka, leírások, specs (JSON).
- `product_variants`: SKU (MuFis-hoz), ár (HUF/EUR), készlet, súly, méretek (dimenziók).
- `product_media`: Képek, videók, hangminták (Sound).
- `orders`: Rendelési fejléc, státusz, követési kód (tracking).
- `order_items`: Rendelt tételek, mennyiség, ár.
- `coupons`: Kód, kedvezmény, érvényesség.

### LMS (`lms.ts`)
- `courses`: Kategória, szint, leírás.
- `chapters`: Fejezetek sorrendje.
- `lessons`: Leckék, Bunny.net video_id, tartalom.
- `user_progress`: Teljesített leckék követése.
- `exams`: Vizsgakérdések (JSON), elvárt pontszám.

---

## 🚀 Fejlesztési Ütemterv

### 1. Fázis: Alapok és Webshop (Prioritás)
1. **Drizzle Séma generálás:** A fenti specifikáció alapján az összes tábla létrehozása.
2. **Auth Modul:** Regisztráció és Login (Admin/User szintek).
3. **Termék Kezelés:** Admin felület termékfeltöltéshez (variánsok, súlyok, képek).
4. **MuFis API Végpontok:** getOrder, setOrder, getProduct, setProduct (a PDF specifikáció alapján).
5. **Vásárlási folyamat:** termékoldal, kosár, Stripe checkout.

### 2. Fázis: LMS (Zárt Oktatás)
1. **Tanulói Felület:** Kurzus listázás, fejezetek navigációja.
2. **Biztonságos Lejátszó:** Bunny.net beágyazás domain védelemmel.
3. **60 napos logika:** Hozzáférés automatikus tiltása a határidő lejárta után.
4. **Vizsga & Kupon:** Sikeres vizsga után automatikus kupon generálás és e-mail küldés.

---

## 🛠️ Logisztikai Megjegyzés (MuFis)
- A rendszernek csak a fizikai termékeket szabad átadnia a MuFis-nak.
- A digitális (LMS) termékek vásárlása azonnali hozzáférést aktivál az `user_access` táblában, de nem küld adatot a logisztikának.
- Minden fizikai terméknél kötelező az SKU, súly és méret megadása a pontos szállítási kalkulációhoz.