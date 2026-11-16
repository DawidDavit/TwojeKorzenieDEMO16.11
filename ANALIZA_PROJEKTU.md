# Szczegółowa Analiza Projektu **TwojeKorzenie**

**Wersja projektu:** `1.1.0`  
**Typ aplikacji:** Single-Page Application (SPA) — Platforma genealogiczna premium (Landing Page + Prywatny Panel Klienta)  
**Stos technologiczny:** React `19.3.1`, Vite `8.3.7`, `@vitejs/plugin-react` `6.3.0`, `lucide-react` `1.73.0`, czysty CSS (zmienne CSS, brak frameworków CSS)  

---

## 1. Podsumowanie Wykonawcze

**TwojeKorzenie** to rozbudowana aplikacja webowa typu frontend-first zaprojektowana dla fikcyjnego/wzorcowego domu badań genealogicznych (**TwojeKorzenie Sp. z o.o.** z siedzibą w Krakowie). Projekt łączy w sobie:
1. **Stronę ofertową (Landing Page)** prezentującą 5 pakietów usług genealogicznych, 5-etapowy proces współpracy, zapowiedź Panelu Klienta oraz referencje zgodne z dyrektywą Omnibus.
2. **Prywatny Panel Klienta (`ClientPortal`)** pełniący rolę cyfrowego muzeum rodzinnego — z interaktywnym drzewem genealogicznym 2D, biograficznym storytellingiem przodków, mapą migracji, cyfrowym archiwum dokumentów z lupą paleograficzną, osią czasu, zarządzaniem zamówieniami/fakturami oraz panelem RODO i administracyjnym (RBAC).
3. **Warstwę bezpieczeństwa, kryptografii i zgodności prawnej (`securityService.js` + `LegalComplianceCenter.jsx`)**, implementującą na poziomie klienta zestaw 40 mechanizmów kontrolnych (19 z obszaru Security/OWASP + 20 z obszaru RODO/Omnibus/WCAG + 1 audyt całościowy).

Całość działa bez zewnętrznych zależności graficznych, czcionkowych czy analitycznych (zero trackerów, 100% autorskich komponentów SVG/CSS).

---

## 2. Struktura Katalogów i Plików

```text
twojekorzenie/
├── .env.example                          # Bezpieczny szablon zmiennych środowiskowych (bez sekretów)
├── .gitignore                            # Reguły ignorowania (w tym .env*, *.pem, *.key, *.db)
├── index.html                            # Punkt wejścia HTML z meta-tagami CSP, nosniff, referrer
├── package.json                          # Zależności (react, react-dom, lucide-react, vite)
├── vite.config.js                        # Konfiguracja Vite + własny plugin bezpieczeństwa HTTP i CORS
├── public/
│   ├── robots.txt                        # Blokada indeksowania /portal/, /admin/, /api/, *.json, *.env
│   └── .well-known/
│       └── security.txt                  # Kontakt bezpieczeństwa (RFC 9116)
└── src/
    ├── main.jsx                          # Montowanie aplikacji React w trybie StrictMode
    ├── index.css                         # System projektowy, zmienne kolorów WCAG AAA, style layoutu
    ├── App.jsx                           # Główny kontroler stanu, nawigacji, sesji i modali
    ├── data/
    │   └── genealogyData.js              # Baza danych demo/live, katalog usług, dokumenty, dane spółki
    ├── services/
    │   ├── apiService.js                 # Repozytorium danych (GenealogyRepository), logi audytu, RODO
    │   └── securityService.js            # Szyfrowanie, sanityzacja XSS/SQLi, RateLimiter, RBAC, audyt
    └── components/
        ├── Navbar.jsx                    # Pasek górny (tryb Demo/Live, skrót audytu, nawigacja, sesja)
        ├── LandingPage.jsx               # Strona główna, oferta 5 usług, proces 5 kroków, opinie Omnibus
        ├── ClientPortal.jsx              # 8-sekcyjny Panel Klienta (Dashboard, Drzewo, Historia, Archiwum...)
        ├── InteractiveFamilyTree.jsx     # Interaktywna mapa drzewa 2D (pan/zoom, SVG Bezier) + widok listy
        ├── AncestorStorytelling.jsx      # Profil biograficzny przodka, oś życia, mapa migracji, więzi
        ├── HeritageVisuals.jsx           # Generatory SVG: portrety, ilustracje usług, skany dokumentów
        ├── DocumentLightbox.jsx          # Modal powiększania skanów dokumentów z transkrypcją i skrótami
        ├── AuthOrderModal.jsx            # Modal logowania, rejestracji, resetu hasła i zakupu usługi
        ├── LegalComplianceCenter.jsx     # Centrum Prawne + interaktywne laboratorium testowe Audytu 40 Zadań
        ├── CookieConsentBanner.jsx       # Granularny baner zgód cookies (RODO/ePrivacy, bez dark patterns)
        └── Footer.jsx                    # Stopka z danymi KRS/NIP/REGON, IOD, 1-click Unsubscribe, Art. 17
```

---

## 3. Architektura Techniczna i Przepływ Danych

### 3.1. Zarządzanie stanem (`src/App.jsx`)
Aplikacja nie używa zewnętrznego routera (np. React Router) ani globalnego store'a (Redux/Zustand). Cała nawigacja opiera się na stanie komponentu `App`:
- `activeArea`: `'landing'` | `'portal'` — przełącza między stroną ofertową a Panelem Klienta.
- `portalSection`: `'dashboard'` | `'tree'` | `'story'` | `'ancestors'` | `'archive'` | `'timeline'` | `'account'` | `'admin'`.
- `dataMode`: `'demo'` | `'live'` — przełącza źródło przodków między pełnym rodem demonstracyjnym (`DEMO_ANCESTORS`, 10 osób, 4 pokolenia) a okrojonym widokiem bieżącego zlecenia (`LIVE_CLIENT_ANCESTORS`, 4 osoby).
- **Ochrona Panelu Klienta:** Gdy `activeArea === 'portal'` i `!isAuthenticated`, `App.jsx` renderuje ekran blokady (`Wymagane zalogowanie do Prywatnego Archiwum`) z przekierowaniem do modala logowania.

### 3.2. Warstwa Danych i Repozytorium (`src/services/apiService.js`, `src/data/genealogyData.js`)
`GenealogyRepository` stanowi warstwę abstrakcji nad danymi statycznymi i pamięcią przeglądarki (`localStorage` opakowane w `SecureStorage`):
- **Katalog usług (`SERVICES_CATALOG`):** 5 zdefiniowanych usług z pełnym rozbiciem cenowym brutto/netto/VAT (23%):
  1. *Odkrywanie przodków* — `2 400 zł brutto`
  2. *Drzewo genealogiczne* — `3 200 zł brutto`
  3. *Historia rodzinna* — `4 500 zł brutto`
  4. *Archiwum rodzinne* — `1 900 zł brutto`
  5. *Pakiet kompleksowy (VIP)* — `8 900 zł brutto`
- **Operacje zapisu:**
  - `addAncestorClue()` — sprawdza `RateLimiter`, autoryzację `authorizeUserAction()`, sanityzuje pola, wykrywa osoby małoletnie (`birthYear > 2008` maskuje datę urodzenia jako *„Dane chronione (osoba małoletnia)”*) i dopisuje wpis do `twojekorzenie_custom_ancestors_v1`.
  - `createOrder()` — generuje nowe zamówienie (`ZAM/2026/11/...`) oraz fakturę (`FV/2026/11/...`), aktualizuje zgody RODO i zapisuje profil konta.
  - `exportUserDataGdpr()` — eksportuje pełną paczkę JSON danych konta i wskazówek rodzinnych (Art. 20 RODO).
  - `deleteUserAccountAndData()` — usuwa klucze z `SecureStorage`, czyści sesję i przywraca tryb demo (Art. 17 RODO).
  - `appendAuditLog()` — rejestruje ostatnie 30 zdarzeń bezpieczeństwa/RODO w `twojekorzenie_security_audit_log_v1`.

---

## 4. Analiza Modułów i Funkcjonalności UI

### 4.1. System Projektowy i Dostępność (`src/index.css`)
Paleta kolorystyczna oparta na proporcji 60/30/10:
- **60% Ciepła kość słoniowa** (`--ivory-base: #F3EFE5`, `--ivory-light: #FAF8F2`)
- **30% Głęboka leśna zieleń** (`--forest-base: #244638`, `--forest-dark: #172F25`)
- **10% Antyczne złoto** (`--gold-base: #C29A55`, `--gold-dark: #6E501D`)
- **Typografia:** `Playfair Display` (nagłówki/szeryfy) + `Inter` (tekst interfejsu) z lokalnymi fallbackami systemowymi.
- **WCAG 2.1 AA/AAA:** Wzmocnione kontrasty (`--text-primary: #13241C`, `--text-muted: #3D4F46`), widoczny pierścień `:focus-visible` (`3px solid var(--gold-base)`), ukryty link `.skip-to-content`, obsługa klawisza `Escape` we wszystkich modalach oraz `role="img"` + `aria-label` na komponentach SVG.

### 4.2. Interaktywne Drzewo Genealogiczne (`src/components/InteractiveFamilyTree.jsx`)
- **Dwa tryby widoku:**
  - *Widok drzewa 2D:* Płótno `1460x880 px` z obsługą przesuwania (pointer drag) oraz przybliżania/oddalania (`55%–160%`). Połączenia rodzic-dziecko rysowane są krzywymi Beziera w SVG, a związki małżeńskie linią przerywaną ze złotym łącznikiem.
  - *Widok listy:* Karty pogrupowane chronologicznie po pokoleniach (IV → I).
- **Filtrowanie i wyszukiwanie:** Wyszukiwarka tekstowa (imię, nazwisko, nazwisko panieńskie, miejsce, profesja) oraz filtr pokoleń.
- **Dodawanie wskazówki:** Modal z walidacją anty-XSS, walidacją roku (`1400–2026`) oraz wymaganą zgodą RODO/ochrony małoletnich.

### 4.3. Storytelling Przodka (`src/components/AncestorStorytelling.jsx`)
- Pasek szybkiego przełączania między wszystkimi przodkami.
- Sekcja portretowa z herbem rodowym, latami życia, profesją i źródłem weryfikacji archiwalnej.
- Wieloakapitowa narracja biograficzna + pionowa oś wydarzeń życiowych.
- **Kartografia Historyczna:** Stylizowana mapa SVG z południkami, orientacyjnym biegiem rzek (Wisła, Dniestr) oraz wykreślonym szlakiem migracji (pinezki + linie przerywane).
- Nawigacja po relacjach (rodzice, małżonek, rodzeństwo, dzieci) oraz lista powiązanych dokumentów z otwarciem w `DocumentLightbox`.

### 4.4. Cyfrowe Archiwum i Lupa Dokumentów (`ClientPortal.jsx` + `DocumentLightbox.jsx`)
- Katalog dokumentów (`ARCHIVE_DOCUMENTS`) z filtrowaniem po kategoriach (*Akty metrykalne*, *Dokumenty urzędowe i wojskowe*, *Fotografie rodzinne*, *Listy i pamiętniki*, *Mapy i plany*) oraz wyszukiwarką.
- `DocumentLightbox` oferuje płynny zoom (`85%–200%`), skróty klawiszowe (`+`, `-`, `0`, `Escape`), pełną transkrypcję paleograficzną, sygnaturę archiwalną oraz przycisk przejścia bezpośrednio do profilu powiązanego przodka.

### 4.5. Generator Grafik Wektorowych (`src/components/HeritageVisuals.jsx`)
Aplikacja nie ładuje żadnych zewnętrznych obrazów rastrowych ani fontów z CDN:
- `AncestorPortrait` — dynamiczny portret sylwetkowy SVG z inicjałami, dobraną paletą i rozróżnieniem płci.
- `ServiceIllustration` — 5 dedykowanych ilustracji SVG dla pakietów usług (`compass-archives`, `royal-tree`, `chronicle-book`, `digital-vault`, `imperial-crest`).
- `ArchivalDocumentScan` — stylizowana imitacja starego papieru archiwalnego z liniowaniem, nagłówkiem epoki, fragmentem transkrypcji i pieczęcią lakową.

---

## 5. Analiza Bezpieczeństwa (Security & OWASP)

Mechanizmy zostały skoncentrowane w `src/services/securityService.js`, `vite.config.js` oraz `index.html`:

| Obszar | Implementacja w projekcie | Lokalizacja |
| :--- | :--- | :--- |
| **Nagłówki HTTP & CSP** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `HSTS` (2 lata + preload), `Referrer-Policy`, `Permissions-Policy`, `COOP`/`CORP: same-origin`, restrykcyjne `CSP` (`default-src 'self'`, `frame-ancestors 'none'`) | `vite.config.js`, `index.html` |
| **Blokada wrażliwych plików** | Middleware Vite zwracający `403 Forbidden` dla `/.env*`, `/.git*`, `/package(-lock)?.json` oraz `*.bak`, `*.sql`, `*.sqlite`, `*.db`, `*.pem`, `*.key`, `*.log`, `*.dump` | `vite.config.js` (`twojeKorzenieSecurityPlugin`) |
| **CORS** | Jawna biała lista originów (`localhost:5173`, `127.0.0.1:5173`, `https://twojekorzenie.pl`) | `vite.config.js` |
| **Ochrona przed XSS i SQLi/NoSQLi** | Brak `dangerouslySetInnerHTML`, detekcja wzorców (`<script>`, `javascript:`, `on*=`, `UNION SELECT`, `DROP TABLE`, `$where`), funkcje `sanitizeText()`, `sanitizePayload()`, `escapeHtml()`, `sanitizeUrl()`, blokada Prototype Pollution (`__proto__`, `constructor`) | `src/services/securityService.js` |
| **Haszowanie haseł** | `PBKDF2` z `SHA-256`, `100 000` iteracji i `128-bit` losową solą przez `window.crypto.subtle` (z deterministycznym fallbackiem gdy brak WebCrypto). Jawne hasła są usuwane przed zapisem konta | `src/services/securityService.js` (`hashPassword`), `apiService.js` |
| **Sesja, CSRF i Brute-Force** | Sesje z `TTL = 30 min`, losowe `sessionId` (`Web Crypto API`), token `X-CSRF-Token` w `sessionStorage`, blokada konta na 5 minut po 5 nieudanych próbach logowania | `src/services/securityService.js` (`SessionManager`) |
| **Rate Limiting** | Algorytm Sliding Window dla akcji: `auth:login` (5/min), `auth:register` (4/min), `auth:reset` (3/5min), `orders:create` (4/min), `ancestors:add` (10/min), `account:update` (10/min) | `src/services/securityService.js` (`RateLimiter`) |
| **RBAC i Ochrona IDOR** | `checkRouteAccess()` blokuje sekcję `admin` dla roli innej niż `'admin'` (ekran `403 Forbidden`); `authorizeUserAction()` weryfikuje `session.userId === resourceOwnerId` | `src/services/securityService.js`, `ClientPortal.jsx` |
| **Integralność LocalStorage** | Koperta `__tkEnvelope` z 32-bitową sumą kontrolną FNV-1a — wykrywa ręczną manipulację rekordem w `localStorage` | `src/services/securityService.js` (`SecureStorage`) |
| **Higiena środowiska i buildu** | `sourcemap: false` w produkcji, `validateEnvConfig()` sprawdza brak zmiennych `SECRET`/`PASSWORD`/`TOKEN`/`API_KEY` w `import.meta.env`, maskowanie wykrytych sekretów (`sk_live_`, `AIza`, `ghp_`, itp.) | `vite.config.js`, `securityService.js`, `.env.example` |

---

## 6. Analiza Zgodności Prawnej (RODO, Omnibus, WCAG)

1. **Centrum Prawa i Audyt 40 Zadań (`LegalComplianceCenter.jsx`):**
   - Zawiera pełne teksty: Polityki Prywatności (Art. 13/14 RODO), Regulaminu Świadczenia Usług, Polityki Zwrotów (14 dni na odstąpienie), Polityki Cookies oraz wykazu licencji grafik i audytu SDK.
   - Zakładka **Audyt 40 Zadań** prezentuje dynamiczny raport `runFullSecurityAudit()` oraz **interaktywne laboratorium na żywo**, w którym można przetestować sanityzację XSS/SQLi, haszowanie PBKDF2-SHA256, przełączanie roli RBAC (`client` ↔ `admin`) i podgląd liczników `RateLimiter`.
2. **Baner Cookies bez Dark Patterns (`CookieConsentBanner.jsx`):**
   - Równoważne wizualnie przyciski (*„Odrzuć opcjonalne”* i *„Akceptuj wszystkie”*), opcjonalne zgody domyślnie odznaczone, możliwość rekonfiguracji z poziomu stopki.
3. **Prawa osoby, której dane dotyczą:**
   - **Art. 20 RODO** — pobranie pliku JSON z pełnymi danymi konta i wskazówkami rodzinnymi (`exportUserDataGdpr`).
   - **Art. 17 RODO** — trwałe usunięcie konta i wyczyszczenie pamięci lokalnej z potwierdzeniem w modalu (`deleteUserAccountAndData`).
   - **Art. 8 RODO** — weryfikacja wieku (18+ / 16+ za zgodą opiekuna) oraz automatyczne maskowanie danych osób urodzonych po 2008 r.
   - **1-click Unsubscribe** — natychmiastowe wypisanie z komunikacji marketingowej dostępne zarówno w stopce (`Footer.jsx`), jak i w ustawieniach konta.
4. **Transparentność cenowa i Dyrektywa Omnibus:**
   - Każda usługa podaje cenę brutto, netto, kwotę VAT 23% oraz informację o braku opłat abonamentowych.
   - Opinie klientów (`VERIFIED_CLIENT_REVIEWS`) są jawnie powiązane z numerami zamówień, faktur i protokołów odbioru.

---

## 7. Ograniczenia Architektoniczne i Wnioski do Wdrożenia Produkcyjnego

Ponieważ obecna wersja jest aplikacją **czysto frontendową** (`API_CONFIG.useMockBackend: true`), przed wdrożeniem na produkcję należy uwzględnić następujące kwestie:

1. **Przeniesienie kontroli bezpieczeństwa na backend:**
   - Obecne mechanizmy `RateLimiter`, `FAILED_LOGIN_ATTEMPTS` (przechowywane w pamięci `Map` w przeglądarce), sprawdzanie RBAC (`checkRouteAccess`) oraz sumy kontrolne FNV-1a w `SecureStorage` działają po stronie klienta — chronią warstwę UI i stanowią wzorzec architektoniczny, ale w środowisku produkcyjnym muszą być egzekwowane przez serwer API i bazę danych.
2. **Domyślna sesja demonstracyjna:**
   - `SessionManager.getCurrentSession()` w przypadku braku zapisanej sesji automatycznie tworzy aktywną sesję demonstracyjną (`janusz.korzeniowski@twojekorzenie.pl`, rola `'client'`), aby użytkownik mógł od razu przetestować Panel Klienta. W prawdziwym systemie domyślny stan powinien być niezalogowany.
3. **Konfiguracja serwera WWW w produkcji:**
   - Reguły z `vite.config.js` (`twojeKorzenieSecurityPlugin`) działają wyłącznie w trybie `vite dev` i `vite preview`. Przy hostowaniu statycznego folderu `dist/` (np. na Nginx, Apache, Cloudflare Pages lub Vercel) identyczne nagłówki bezpieczeństwa HTTP oraz blokady plików wrażliwych należy przenieść do konfiguracji serwera docelowego.
4. **Konfiguracja `CSP`:**
   - Meta tag CSP w `index.html` zawiera `'unsafe-inline'` w `script-src` i `style-src` (ze względu na style inline w JSX i dev server). Docelowo warto zastąpić style inline klasami CSS/CSS Modules oraz użyć nonce'ów po stronie serwera.
