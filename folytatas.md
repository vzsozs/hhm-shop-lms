# HHM Shop LMS - Kódaudit Folytatás Iránymutató

Szia Antigravity! 

Ezt a fájlt azért kapod, hogy azonnal fel tudd venni a fonalat az előző kódaudit sessionünk után. Kérlek olvasd el az alábbi kontextust és a hátralévő feladatokat, majd vedd fel a munkát a legfontosabb pontoknál!

## 📌 Mi történt eddig az előző beszélgetésben?
- Lefutott egy átfogó kódaudit a projekten, fókuszálva a technikai adósságra, teljesítményre és a Next.js 15+ / React 19 modernizációs lehetőségekre.
- A talált hibákat és fejlesztési javaslatokat a projekt gyökerében lévő `javitando.md` és `javitando1.md` fájlok tartalmazzák. **Kérlek, feltétlenül nézz bele ebbe a két fájlba (view_file), hogy tudd, mi volt az eredeti lelet!**
- **Sikeresen javítva lett:** A `meinlSyncService.ts`-ben lévő kritikus N+1 performancia hiba. Lecseréltük a ciklusban futtatott, ezer számú adatbázis lekérdezést optimalizált, memóriában előtöltött chunkolt bulk `insert`/`update` műveletekre. Ugyanitt az összes TypeScript `any` típusú típushiba is kipucolásra került, a Drizzle `$inferInsert` típusaival biztosítva a kódot. Az `npm run build` jelenleg teljesen tiszta.

## 🚀 A legfontosabb megmaradt feladatok a projektből (Melyikkel kezdjünk?)

### Kritikus Backend & Adatbázis feladatok (`javitando.md` alapján):
1. **Memória leak veszély a `queries.ts`-ben:** A `getTranslationStatusProducts` metódus az összes `ACTIVE` terméket lekéri a memóriába masszív JSONB adatokkal, és JavaScript-ben szűr és paginál. Ezt át kell tenni SQL Drizzle szintre (`LIMIT`, `OFFSET`, natív JSONB lekérdezések).
2. **`ensureUniqueSlug` race condition:** A slug generátor tranzakción kívül kezeli a DB kéréseket, ezért párhuzamos műveleteknél hibázhat. Be kell kötni az átadott tranzakcióba (`tx`), a duplikált kódját pedig ki kell vonni egy globális `src/lib/utils/slug.ts` helperbe.
3. **Drizzle Relational Queries hiánya:** Számos adatlekérő metódus (pl. `getProductBySlug`) manuális `Promise.all`-t használ külön SQL utazásokkal a kapcsolódó táblákért. Érdemes berakni a Drizzle `relations()` definícióit a séma fájlba.

### Kritikus Frontend & Teljesítmény feladatok (`javitando1.md` alapján):
4. **Kliensoldali Keresés (`product-table-client.tsx`):** Nagyméretű terméklista esetén a `.filter()` és `.includes()` megakaszthatja a UI-t Main Thread-szinten. Át kell építeni Server-Side Filteringre (URL query paramok).
5. **Next.js `<Image>` optimalizáció teljes hiánya:** Bár több helyen lokális `.webp` van, sima `<img>` taget használ a kód (vagy szándékosan letiltott eslint szabályokkal dolgozik, mint a `Header.tsx`-ben). Képek cseréje `next/image`-re CLS / Lazy loading miatt.
6. **Monolitikus komponensek felvágása:** A `product-detail-client.tsx` (700+ sor) a renderelés mellett minden adattranszformációt (link parser, média player stb) is megcsinál. Ezt és a `Header.tsx`-et (250+ sor) szét kell darabolni tiszta (Clean Code) UI blokkokra.
7. **Hardkódolt fordítások, i18n:** Az inline `{ hu: "...", en: "..." }` kódok a kliensoldali fájlokban (pl. `product-card.tsx`, `Header.tsx`) felduzzasztják a JS bundle-t. Ezeket szerver komponensbe, vagy dedikált nemzetköziesítő (pl. next-intl) keretbe kéne mozgatni.

## ⚙️ Utasítás az Asszisztensnek (Antigravity):
Ha megkaptad ezt a felvezetőt, kérlek **erősítsd meg, hogy érted az eddigi kontextust**, és oszd meg a felhasználóval, hogy szerinted **melyik 1-2 feladatot érdemes megfogni elsőként a listából**, hogy elkezdhesd generálni a saját `task.md` fájlodat!
