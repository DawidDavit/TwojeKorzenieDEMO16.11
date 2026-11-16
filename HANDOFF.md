# TwojeKorzenie — Kontekst Projektu (HANDOFF)

Ten plik zawiera skondensowane podsumowanie architektury, wdrożonych funkcji, konwencji oraz konfiguracji wdrożenia, aby można było kontynuować pracę na dowolnym urządzeniu.

---

## 1. Stos technologiczny i repozytorium
- **Framework**: React 19 + Vite 8 (`package.json`)
- **Backend / Baza / Auth**: Supabase (`@supabase/supabase-js`)
- **Ikony**: `lucide-react`
- **Testy E2E**: `@e2e-dev/web` (`npx e2e run`, konfiguracja w `e2e.config.ts`, testy w `tests/example.e2e.ts`)
- **Repozytorium GitHub**: `https://github.com/DawidDavit/TwojeKorzenieDEMO16.11.git`
- **Hosting**: GitHub Pages (`.github/workflows/deploy.yml`, docelowy adres: `https://dawiddavit.github.io/TwojeKorzenieDEMO16.11/`)

---

## 2. Kluczowe komponenty i ostatnie zmiany
- **`src/components/HeritageLoader.jsx` + `src/index.css`**:
  - Animacja ładowania z przezroczystym logo drzewa (`logo-tree.png`, korona + korzenie) przy użyciu `import.meta.env.BASE_URL`.
  - Spowolnione wejście (`1050ms var(--ease-out)` dla korony i korzeni) oraz minimalny czas widoczności `minDisplayMs = 1150ms` (wyłączany przy `prefers-reduced-motion: reduce`).
- **`src/components/Navbar.jsx`**:
  - Usunięto górny ciemnozielony pasek informacyjny ponad głównym paskiem nawigacji; logo używa `import.meta.env.BASE_URL`.
- **`src/components/AppPresentationShowcase.jsx` + `src/index.css`**:
  - Sekcja **Prezentacja Aplikacji TwojeKorzenie** z 5 warstwowymi kafelkami w proporcjach **A4 pionowo (`aspect-ratio: 210 / 297`)**.
  - Tor `position: sticky` (`.presentation-scroll-track` + `.presentation-sticky-frame` z nagłówkiem wewnątrz ramki sticky).
  - Na `0%` scrolla wszystkie 5 kart leżą na środku jedna za drugą z widocznymi górnymi krawędziami tylnych kart (`0, -32, -64, -96, -128px`).
  - Podczas scrolla w dół karty `02` i `04` rozsuwają się w lewo, a `03` i `05` w prawo (pętla `requestAnimationFrame`, wyłącznie GPU `translate3d`/`scale`/`rotate`).
  - Kliknięcie wybranej karty powiększa ją centralnie u góry (`scale: 0.98`, `y: -64px`), a pozostałe 4 karty płynnie zmniejszają się (`scale: 0.30`) i przechodzą do doku poniżej.
  - Wykorzystuje 2 wygenerowane portrety archiwalne w `public/presentation/portrait-man-1905.jpg` i `public/presentation/portrait-woman-1910.jpg`.
- **`src/components/LandingPage.jsx` — sekcja `#oferta-uslug`**:
  - Siatka **2×2** dla 4 usług podstawowych + pełnoszerokościowa ciemnozielona karta **Flagship VIP** (`pakiet-kompleksowy`).
  - Jednorazowy `IntersectionObserver` z kaskadowym wejściem (`60ms` stagger, `260ms var(--ease-out)`), hover liftem i mikrointerakcjami bramkowanymi pod `@media (hover: hover) and (pointer: fine)`.
- **`src/components/GoogleMapsComponents.jsx`**:
  - **Z kluczem `VITE_GOOGLE_MAPS_API_KEY`**: natywny Google Maps JS API (`mapTypeId: 'hybrid'`), ze stylami ukrywającymi `poi`, `transit`, `water` (etykiety wyłączone, geometria wyciszona), `road.highway` i ikony dróg — pozostają nazwy miast, miejscowości i ulic.
  - **Bez klucza API (fallback `SatelliteCityMap`)**: interaktywna mapa satelitarna Esri (`World_Imagery`) + warstwa etykiet `Reference/World_Boundaries_and_Places` (same nazwy państw/miast/miejscowości, bez POI, lokali komercyjnych, rzek i tarcz dróg), przeciąganie, przyciski `+`/`−`/`Reset` oraz zoom **`Ctrl + scroll`** w stronę kursora.

---

## 3. Zainstalowane skille i zasady animacji
W katalogu `.agents/skills/` znajdują się:
- `animate` (`/animate`)
- `review-animations` (`/review-animations`)
- `ask-emil` (`/ask-emil`)
- `frontend-design` (`/frontend-design`)
- `e2e` (`/e2e`)

**Zasady obowiązujące przy edycji UI i ruchu:**
- Używać wyłącznie właściwości GPU (`transform`, `opacity`), bez `transition: all` i bez `scale(0)`.
- Nie sterować transformacjami dzieci przez zmianę zmiennych CSS na rodzicu podczas scrolla/animacji.
- Bramkować efekty `:hover` przez `@media (hover: hover) and (pointer: fine)`.
- Zawsze wspierać `@media (prefers-reduced-motion: reduce)`.
- Zachować dyrektywy CSP w `index.html` (`server.arcgisonline.com`, `nominatim.openstreetmap.org`, `*.googleapis.com`, `*.supabase.co`).

---

## 4. Uruchomienie na nowym urządzeniu i sekrety
1. Sklonuj repozytorium i zainstaluj zależności:
   ```cmd
   git clone https://github.com/DawidDavit/TwojeKorzenieDEMO16.11.git
   cd TwojeKorzenieDEMO16.11
   npm install
   ```
2. Utwórz plik `.env` w katalogu głównym (nigdy nie commituj `.env` do Gita):
   ```env
   VITE_SUPABASE_URL=https://TWOJ_PROJEKT.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_... (klucz Publishable / anon, NIE sb_secret)
   # Opcjonalnie:
   VITE_GOOGLE_MAPS_API_KEY=AIza...
   ```
3. Na GitHubie:
   - Repozytorium musi być **Public** dla darmowego GitHub Pages (**Settings → Pages → Source: GitHub Actions**).
   - Sekrety w **Settings → Secrets and variables → Actions**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (klucz `Publishable`/`anon`), opcjonalnie `VITE_GOOGLE_MAPS_API_KEY`.
   - W **Supabase → Authentication → URL Configuration** dodać `https://dawiddavit.github.io/TwojeKorzenieDEMO16.11/` do **Site URL** i **Redirect URLs**.
4. Weryfikacja lokalna:
   - `npm run dev` — serwer deweloperski
   - `npm run build` — build produkcyjny
   - `npx e2e run` — testy end-to-end
