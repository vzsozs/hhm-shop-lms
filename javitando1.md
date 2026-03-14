# Második Körös Kódaudit és Javaslatok (javitando1.md)

Az előző (`javitando.md`) audit mellett egy mélyebb, a kliensoldali és admin komponenseket érintő elemzést hajtottam végre. Főképp a `Header.tsx`, `product-card.tsx`, `product-table-client.tsx` és ezeket kiszolgáló oldalak lettek górcső alá véve.

Íme a további talált problémák és fejlesztési lehetőségek, fókuszálva a React 19, Next.js 15 és a tiszta architektúra (Clean Code) irányelvekre.

## 🚨 Kritikus és Performance (Bugok, Memória)

### 1. Kliensoldali keresés (Client-side Search) nagyméretű adathalmazon (`product-table-client.tsx`)
- **Probléma:** A termékek táblázatában a keresés (`searchTerm`) kizárólag a már letöltött `products` tömbön fut le egy `.filter(...)` és `.includes(...)` hívással minden gépelésnél. Ha a termékek száma megnő (pl. több ezer), ez komolyan blokkolhatja a UI (Main Thread) szálat, mivel ez egy unoptimized szinkron művelet.
- **Megoldás:** Át kell térni a Server-Side Filtering megoldásra. A keresőmező gépelésekor (debounced, kb 300ms) URL paraméterként (`?search=valami`) kell felküldeni a keresőszót, és a Drizzle SQL szinten kell szűrni. Ez a React 19-ben már beépített `useTransition` / `useRouter` patternekkel rendkívül gyors és reszponzív tud lenni (Streaming & Suspense fonalán).

### 2. A Next.js Image optimalizáció szándékos kikapcsolása (`Header.tsx`)
- **Probléma:** A fájl legelső sora: `/* eslint-disable @next/next/no-img-element */`. Több mint 10 helyen natív `<img src="...">` tag-et használ a kód a beépített `next/image` `<Image>` komponens helyett. Ez azt jelenti, hogy a logók és ikonok nem kapnak WebP optimalizációt, layout shift (CLS) védelmet és lazy loading funkciót a böngészőtől.
- **Megoldás:** Minden `<img />` cseréje `next/image`-re. Mivel ezek lokális assetek (`/assets/...`), a Next.js automatikusan kiszámolja a képméreteket és statikusan optimalizálja őket a build során.

### 3. Hiányzó Error Handling és Suspense Boundaries (`oktatasok/page.tsx`)
- **Probléma:** Az adatbázis lekérdezés (`db.select().from(trainings)`) közvetlenül a Server Component törzsében van. Ha itt Drizzle/Postgres hiba (timeout vagy connection error) történik, a Next.js a teljes oldalt eldobja egy 500-as hibával anélkül, hogy a layout (pl. Header/Footer) megmaradna és felhasználóbarát hibaüzenetet látna.
- **Megoldás:** Használni kell a Next.js 13+ beépített `loading.tsx` és `error.tsx` fájljait az adott route-okon, vagy be kell csomagolni a specifikus adatterhelő komponenseket egy `<Suspense>` blokkba.

## 💡 Javasolt (Refaktor / Clean Code)

### 4. `any` Típusok maradványai (`product-table-client.tsx`)
- **Probléma:** A TypeScript interfésszel ellentétben az admin táblázat több helyen az `any` típust használja (pl. `interface ProductListItem { name: any; categoryName?: any; }`). Emiatt a fordító nem tudja ellenőrizni a nyelvi struktúrákat, és inline `?.[lang]` trükközésekre van szükség. 
- **Megoldás:** Tisztázni kell a Drizzle Schema szerinti típusokat ezen a szinten is, pl. `Record<"en" | "hu" | "sk", string>`. Ugyanez igaz a `product-card.tsx`-re is, ahol manuális `.slice` és `as Array<Record...>` típuskonverziók (casting) zajlanak.

### 5. Túlzsúfolt (Monolitikus) Komponensek
- **Probléma:** A `Header.tsx` 250 soros, amiben benne van: nyelvváltás logikája, asztali menürendszer popover-jei (statekkel), mobilos "hamburger" menü és overlay. Ugyanez igaz az admin `page.tsx` fájlra, ahol manuális SQL aggrágáció (pl. `jsonb_agg(...)`) keveredik a UI rendereléssel.
- **Megoldás:**
  - `Header.tsx` felvágása: `DesktopNavigation`, `MobileSidebar`, `LanguageSwitcher`.
  - Drizzle Relational Queries lekérések kiszervezése külön data-access fájlokba (pl. `queries.ts`), a szerver komponens csak híja meg ezeket.

### 6. Datum Formázás a Render Ciklusban (`product-table-client.tsx`)
- **Probléma:** A táblázat a ciklusban hajtja végre formázást: `new Date(product.createdAt).toLocaleDateString(...)`. Egy admin oldalon 50-100 sor esetén ez apró teljesítményprobléma lehet, de leginkább nem "React-os" best practice.
- **Megoldás:** Az adatok transzformációját (DTO - Data Transfer Object) érdemes még az előtt elvégezni, mielőtt lepasszoljuk a props-okat a kliens komponensnek, így a Server végzi el ezt a számítási feladatot, a böngészőnek már csak a kész layout stringet kell renderelnie.

## 🚀 Modernizáció (React 19, i18n, Next.js)

### 7. Hardkódolt Fordítás Oszlopokon Átívelő Problémája
- **Probléma:** Akárcsak a Product Detail oldalon, a `product-card.tsx`-ben is egy `dict` objektum (`hu`, `en`, `sk` kulcsokkal) él közvetlenül a fájlban. Ez duplikálódik a backendben és a kliens appon keresztül.
- **Megoldás:** Vagy egy egységes dictionary-t biztosító API/Hook létrehozása, vagy áttérés a `next-intl` csomagra. A React 19 szerver komponensek (RSC) miatt a dictionary-k felolvasása történhet csak a szerveren (így nem utazik át a JSON a dróton a kliensig bundle-ként).

### 8. Hardcoded Background Képek a Számított Layoutban
- **Probléma:** A `Header.tsx` a `backgroundImage: "url('/assets/bg.webp')"` stílust inline CSS-ként adja át, emellett `height: '40vh'` beállítással rögzít arányokat. 
- **Megoldás:** Használjuk a Tailwind beépített testreszabási lehetőségeit (pl. `tailwind.config.ts` felbővítés bg image-el) vagy `bg-[url('/assets/bg.webp')]` szintaxist, hogy a böngésző jobban optimalizálhasson osztályszinten.

---

> **Összegezve az irányelveket:**
> Míg az **első riport (`javitando.md`)** inkább az adatbázis és háttér jobbok (Sync) robusztusságára koncentrált, addig a **második kör (`javitando1.md`)** a kliensoldali performanciát (Client Search, Típushibák, Image optimalizációk és Hardcoded nyelvek) fedi le.
>
> **Melyik részével folytassuk?** Pörögjünk neki a Sync szervíz N+1 problémájának, vagy inkább a UI (Header & Képek & Any típusok) tisztításába kezdjünk bele először?
