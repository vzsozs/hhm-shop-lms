# 🎨 HangAkadémia Public Design Specification

**FONTOS:** Ez a specifikáció kizárólag a **Publikus Frontend** (`src/app/(public)/*`) részre vonatkozik. Az Admin felület (`src/app/admin/*`) meglévő design-tokenjeit, stílusait és elrendezését **TILOS módosítani**!

## 1. Szükséges Grafikai Eszközök (Assets)
Az alábbi fájlokat másold át a Webflow projektből a shop `public/images` mappájába, mert a kód ezekre fog hivatkozni:

| Fájlnév | Szerep |
| :--- | :--- |
| `PalAdri-logo-2023-Vegleges-vilagos.svg` | Fő logó (Header/Footer) |
| `menu-left.svg`, `menu-center.svg`, `menu-right.svg` | A fejléc háttér-textúrája |
| `menu-mobile.svg` | A fejléc háttér-textúrája mobilon |
| `icons-cart.svg`, `icons-login.svg` | Shop és Login ikonok |
| `arrow_mini.svg`, `arrow_mini-white.svg` | Dropdown nyilak |
| `ico-phone.svg`, `ico-mail.svg`, `ico-youtube.svg`, `ico-facebook.svg` | Kapcsolati és Social ikonok |
| `icon-doc.svg` | Footer dokumentum ikon |
| `PalAdri-logo-stroke.svg` | Szakasz-elválasztó szignó logó |

## 2. Színpaletta (Tailwind Config - `brand` prefix)
*   **Primary (Text/Dark):** `#221616` (`--black`)
*   **Secondary (Brown):** `#6d4545` (`--brown`)
*   **Accent (Sienna):** `#b45942` (`--sienna`)
*   **Highlight (Bronze Light):** `#d6c3af` (`--bronze-light`)
*   **Highlight (Bronze Dark):** `#897863` (`--bronze`)
*   **Background (Light):** `#f8f7f5` (`--lightbg`)
*   **Pure White:** `#ffffff` (`--white`)

## 3. Tipográfia (Next Font Setup)
*   **Címsorok (H1, H2, H3):** `Cormorant` (Serif).
*   **Kiemelt feliratok / Navigáció:** `Playfair Display`.
*   **Kenyérszöveg:** `Poppins` vagy `Montserrat`. Alapméret: `14px`.

## 4. Publikus Layout felépítése

### Header (Fejléc) - Pixel-perfect másolat
*   **Elrendezés:** Háromhasábos Grid: `1fr 300px 1fr`.
*   **Logó:** A középső részben, `190px` magassággal, `-10px` felső margóval (lefelé kilóg a sávból).
*   **Háttér:** Az említett `menu-*.svg` képek használata `backdrop-filter: blur(3px)` effekttel.
*   **Navigációs Gombok:** 20px-es kerekítés, vékony `rgba(255,255,255,0.2)` keret. Hoverre `white` keret.
*   **Interakciók:** A lenyíló menük (Dropdown) `backdrop-filter: blur(10px)` és `rgba(155, 136, 117, 0.32)` (áttetsző bronz) hátteret kapnak.

### Footer (Lábléc)
*   **Háttér:** `--bronze` (`#897863`).
*   **Struktúra:** Középen logó, alatta kör alakú social ikonok, legalul horizontális sáv a jogi linkeknek.

## 5. UI Komponensek
*   **Elsődleges Gomb (Gradient Button):** 
    *   `border-radius: 20em`
    *   `background: linear-gradient(90deg, #8a7964, #d8c5b1 43%, #d6c3af 54%, #897863)`
    *   Szöveg: Csupa nagybetű, `letter-spacing: 2px`.
*   **Termékkártyák:** 20px kerekítés, fehér-szürke átmenetes háttér, finom scale animáció (`scale-105`) hoverre.

---
