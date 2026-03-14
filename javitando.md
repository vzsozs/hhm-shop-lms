# Projekt Kódaudit és Javaslatok (javitando.md)

Íme az átfogó kódaudit eredménye, fókuszálva a `meinlSyncService.ts`, a `db/schema/shop.ts`, a query-k és a komponensek (`product-detail-client.tsx`) állapotára.

## 🚨 Kritikus (Bugok és Teljesítmény)

### 1. N+1 Query probléma a szinkronizációban (`meinlSyncService.ts`)
- **Probléma:** A `syncMeinlData` függvény egy hatalmas loopot (több ezer sor lehet) hajt végre a feldolgozott adatokon. A loopon belül a `db.transaction`-ben **minden ciklusban** lefut legalább 4-5 adatbázis lekérdezés (`productVariants`, `products`, `productMedia`, `productAttachments` ellenőrzés/frissítés). Ez drasztikusan lelassítja a szinkronizációt és túlterheli az adatbázist.
- **Megoldás:** Refaktorálni kell a sync folyamatot úgy, hogy a meglévő termékeket, variánsokat és médiákat egy lépésben (vagy batch-ekben) töltsük be a memóriába (Map/Set), majd Drizzle `onConflictDoUpdate` (upsert) vagy `db.insert(...).values(batch)` hívásokat használjunk.

### 2. Memória alapú szűrés és "Memory Leak" veszély (`queries.ts`)
- **Probléma:** A `getTranslationStatusProducts` metódus betölti az összes `ACTIVE` terméket az adatbázisból (összes JSONB mezővel), majd **memóriában JavaScript loopokkal** számolja ki minden iterációra (több száz/ezer termékre) a készültségi fokot, és utána paginál a `.slice(offset...)` segítségével. Ahogy nő a termékek száma, ez összeomlaszthatja a Next.js szervert (OOM hibák).
- **Megoldás:** A készültségi (readiness) logikát és a nyelvi ellenőrzéseket át kell vinni az SQL (Drizzle) szintre. A Drizzle képes natívan futtatni `sql` function-öket a jsonb értékeken. Maga a paginálás is SQL szinten (`LIMIT`, `OFFSET`) kell, hogy történjen.

### 3. Tranzakciókon kívüli, nem biztonságos lekérdezések (`meinlSyncService.ts`)
- **Probléma:** Az `ensureUniqueSlug` függvény a cikluson belül hívódik meg `db.execute`-ként, miközben minden termék mentése egy önálló `tx` (tranzakció) blokkban van. Történhet race-condition, ha párhuzamos sync/hook fut, mert a slug generátor független a tranzakciótól.
- **Megoldás:** Az `ensureUniqueSlug` függvénynek paraméterként kellene fogadnia a `tx` objektumot, és azt kellene használnia a lekérdezéshez.

## 💡 Javasolt (Refaktor / Clean code)

### 4. Drizzle Relational Queries kihasználatlansága (`queries.ts`)
- **Probléma:** A `getProductBySlug` és más lekérdezések manuális `Promise.all` tömbbel kérik le a `productVariants`, `productMedia`, és `productCategories` stb. adatokat. Ez 5-6 külön TCP utat (query-t) jelent a PostgreSQL felé, és manuális JS adatformázást igényel.
- **Megoldás:** A `schema/shop.ts`-ben definiálni kell a `relations()` metódusokat a táblákhoz (Drizzle Relational Queries). Ezt követően egyetlen `db.query.products.findFirst({ with: { variants: true, media: true, categories: true } })` hívással be lehet hozni letisztultan a teljes gráfot.

### 5. Monolitikus komponensek (`product-detail-client.tsx`)
- **Probléma:** A fájl 700+ soros. Felel a megjelenítésért, az állapotkezelésért, az audio playerért, a média galériáért, a formátumparszolásért (`renderValueWithLinks`, `getYouTubeEmbedUrl`) és minden fordítási megkötésért.
- **Megoldás:** A fájlt szét kell bontani lazán kapcsolt komponensekre: `ProductGallery`, `ProductDetails`, `AudioPlayer`, `ProductFamilyGrid`, és bevezetni egy `utils/media.ts` fájlt az URL parszoló segédfüggvényeknek.

### 6. Duplikált kód a Slug generálásnál
- **Probléma:** A `meinlSyncService.ts`-ben komment is említi: "Slug generáló (másolva az actions.ts-ből)".
- **Megoldás:** Ki kell emelni a `generateSlug` implementációt egy `src/lib/utils/slug.ts` vagy hasonló shared modulba.

### 7. Explicit JSONB típus meghatározások elvesztése (`shop.ts`)
- **Probléma:** A specifikációk és nevek `jsonb` típusként vannak lementve. TypeScript-ben ez egy sima objektumra lazul (vagy manuális `Record<string, string>` kasztingot igényel a UI-n).
- **Megoldás:** A Drizzle sémában érdemes használni a `jsonb("name").$type<{ hu: string; en: string; sk: string }>()` típusosságot, ahogy a `badges` mezőnél (36. sor) már részben megtörtént.

## 🚀 Modernizáció (Next.js 15 / React 19)

### 8. Hardcoded Fordítási Szótárak (i18n) a Komponensekben
- **Probléma:** A `product-detail-client.tsx` elején a 14-93. sorig kézzel bele van égetve a fordítás. Ez Next.js alkalmazásoknál nem fenntartható.
- **Megoldás:** Áttérni a `next-intl` csomagra, vagy egy kiszervezett `src/i18n/locales` szótár rendszerre. Ezzel drasztikusan csökken a kliensoldali bundle sűrűsége, mert ezek a fordítások a szerveren maradhatnak.

### 9. Natív React 19 eszközök használata (`use`, formok)
- **Probléma:** Bár eddig nem láttunk mély form kezelést a UI-n, a `ProductDetailClient` prop-ként kapja meg a szinkron kiértékelt Promise adatokat.
- **Megoldás:** A React 19+ egyre inkább afelé megy, hogy a Server Component adja át a Promise-t (nem a feloldott adatot), és a kliens a `use()` hook segítségével olvassa azt ki a `<Suspense>` határokon belül (ez javíthatja az elosztott streaming teljesítményt).

### 10. `DOMPurify` futtatása kliensoldalon feleslegesen
- **Probléma:** Bár `isomorphic-dompurify` van használatban, a leírás sanitizációja (171. sor: `DOMPurify.sanitize(localizedLongDescription)`) kliens komponensben történik, ami megnöveli a kliens bundle méretét.
- **Megoldás:** A sanitizációt a szerver komponensben (vag még jobb: adatbázisba mentés/szinkronizálás pillanatában, mint ahogy részben a `meinlSyncService` csinálja) érdemes elvégezni, majd kliensoldalon már csak a kész, tiszta HTML-t betölteni (vagy `next-mdx-remote`-hoz hasonló modern eszközzel parsze-olni, ha komplexebb tartalom jöhet be).

---

> **Mivel kezdjük a javítást?**
> A kritikus pontok (1-es, 2-es és 3-as) a leggyorsabban megtérülő befektetések az stabilitás terén. Ha jóváhagyod, ezekkel tudunk indulni aszerint, ahogy jelzed.
