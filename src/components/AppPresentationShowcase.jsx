import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  FileText,
  GitBranch,
  MapPin,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AncestorPortrait } from './HeritageVisuals';

const SHOWCASE_TILES = [
  {
    id: 1,
    direction: 0,
    zIndex: 50,
    label: '01 · Galeria Rodu',
    title: 'Księga Rodu & Portrety Przodków',
    portalView: 'dashboard',
    cta: 'Otwórz Panel Klienta',
    summary:
      'Centralne miejsce Twojego rodu: odrestaurowane portrety archiwalne, oś pokoleń i szybki dostęp do zweryfikowanych akt.',
    highlights: [
      'Indywidualne karty przodków z metrykami',
      'Porządek pokoleń od współczesności w głąb XIX w.',
      'Stały podgląd postępów prac archiwisty'
    ],
    metrics: [
      { value: '11', label: 'przodków w drzewie' },
      { value: '5', label: 'udokumentowanych pokoleń' }
    ]
  },
  {
    id: 2,
    direction: -1, // lewo
    zIndex: 40,
    label: '02 · Storytelling',
    title: 'Biografia & Rozdziały Życia',
    portalView: 'story',
    cta: 'Czytaj Historię',
    summary:
      'Suche daty z ksiąg parafialnych zamieniamy w spójną opowieść o losach, zawodach i realiach epoki Twoich przodków.',
    highlights: [
      'Chronologiczne rozdziały od narodzin po schyłek życia',
      'Kontekst historyczny zaborów i II RP',
      'Cytaty i przypisy do oryginalnych ksiąg'
    ],
    metrics: [
      { value: '1857–1940', label: 'oś czasu rodu' },
      { value: '100%', label: 'faktów opartych na aktach' }
    ]
  },
  {
    id: 3,
    direction: 1, // prawo
    zIndex: 30,
    label: '03 · Drzewo 2D',
    title: 'Interaktywne Drzewo Rodowe',
    portalView: 'tree',
    cta: 'Zobacz Drzewo',
    summary:
      'Czytelna mapa powiązań rodzinnych: rodzice, małżonkowie, rodzeństwo i gałęzie boczne z możliwością zbliżania i filtrowania.',
    highlights: [
      'Nawigacja po gałęziach ojczystych i macierzystych',
      'Natychmiastowe przejście do biografii wybranej osoby',
      'Możliwość zgłaszania własnych wskazówek rodzinnych'
    ],
    metrics: [
      { value: '2D', label: 'interaktywna siatka linii' },
      { value: '3 kliknięcia', label: 'do dowolnego przodka' }
    ]
  },
  {
    id: 4,
    direction: -1, // lewo
    zIndex: 20,
    label: '04 · Archiwum',
    title: 'Skany Metrykalne & Akta USC',
    portalView: 'archive',
    cta: 'Przeglądaj Akta',
    summary:
      'Cyfrowe repozytorium oryginalnych skanów z archiwów państwowych i parafialnych wraz z pełną transkrypcją na język polski.',
    highlights: [
      'Tłumaczenia z łaciny, cyrylicy i pisma neogotyckiego',
      'Sygnatury zespołów i numeracja ksiąg metrykalnych',
      'Powiększanie skanów w trybie lupy archiwalnej'
    ],
    metrics: [
      { value: '8', label: 'zweryfikowanych aktów USC' },
      { value: '300 DPI', label: 'jakość skanów źródłowych' }
    ]
  },
  {
    id: 5,
    direction: 1, // prawo
    zIndex: 10,
    label: '05 · Kartografia & PDF',
    title: 'Mapa Migracji & Eksport Księgi',
    portalView: 'dashboard',
    cta: 'Eksploruj Mapę',
    summary:
      'Śledź wędrówki przodków na mapie satelitarnej bez zbędnych oznaczeń współczesnych i pobierz gotową księgę rodu w PDF.',
    highlights: [
      'Widok satelitarny z historycznymi nazwami miejscowości',
      'Tryb pełnoekranowy jednym kliknięciem',
      'Eksport gotowego opracowania do druku lub archiwum'
    ],
    metrics: [
      { value: 'PDF', label: 'gotowy do druku A4' },
      { value: 'GPS', label: 'szlak migracji na mapie' }
    ]
  }
];

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function AppPresentationShowcase({ onEnterPortal }) {
  const trackRef = useRef(null);
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const tileRefs = useRef([]);
  const progressTextRef = useRef(null);
  const progressBarRef = useRef(null);
  const selectedTileRef = useRef(null);

  const [selectedTile, setSelectedTile] = useState(null);
  const [isFullySpread, setIsFullySpread] = useState(false);

  // Bieżące interpolowane wartości każdego kafelka (płynne, przerywalne przejścia na GPU bez CSS transition)
  const currentStateRef = useRef(
    SHOWCASE_TILES.map(() => ({ x: 0, y: 0, scale: 1, rot: 0 }))
  );

  selectedTileRef.current = selectedTile;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rafId = null;
    let lastTime = performance.now();

    const computeTargets = () => {
      const track = trackRef.current;
      const frame = frameRef.current;
      if (!track || !frame) return { targets: null, isSettled: true };

      const trackRect = track.getBoundingClientRect();
      const frameHeight = frame.offsetHeight || 560;
      const vw = window.innerWidth || 1200;

      const stickyTop = 76;
      const scrollableDistance = Math.max(1, track.offsetHeight - frameHeight - stickyTop);
      const raw = (stickyTop - trackRect.top) / scrollableDistance;
      const progress = mediaQuery.matches ? 1 : easeOutCubic(clamp(raw, 0, 1));

      const spreadPct = Math.round(progress * 100);
      if (progressTextRef.current) {
        progressTextRef.current.textContent =
          selectedTileRef.current !== null
            ? `Wybrano moduł 0${selectedTileRef.current} · Kliknij miniaturę, aby przełączyć`
            : `Rozłożenie: ${spreadPct}%`;
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress.toFixed(3)})`;
      }

      // Jeśli użytkownik przewinie w górę poniżej 55%, wracamy płynnie do stosu
      if (progress < 0.55 && selectedTileRef.current !== null && !mediaQuery.matches) {
        selectedTileRef.current = null;
        setSelectedTile(null);
      }

      const spreadReady = progress >= 0.88;
      setIsFullySpread((prev) => (prev !== spreadReady ? spreadReady : prev));

      const containerW = frame.clientWidth || vw;
      const cardW = stageRef.current?.offsetWidth || clamp(containerW * 0.58, 210, 340);
      const isMobile = vw < 640;
      const activeId = selectedTileRef.current;

      // Tryb wybrany: wybrany kafelek na środku, pozostałe 4 proporcjonalnie w doku poniżej
      if (activeId !== null) {
        const others = SHOWCASE_TILES.filter((t) => t.id !== activeId);
        const dockSlots = [-1.65, -0.62, 0.62, 1.65];
        const dockScale = clamp(containerW / 1180, 0.24, 0.34);
        const dockSpacing = clamp((containerW - 36) * 0.115, 50, 134);
        const selectedY = isMobile ? -20 : -44;
        const dockY = clamp(cardW * 0.36, 48, 108);

        const targets = SHOWCASE_TILES.map((tile) => {
          if (tile.id === activeId) {
            return { x: 0, y: selectedY, scale: isMobile ? 0.92 : 0.96, rot: 0 };
          }
          const slotIdx = others.findIndex((o) => o.id === tile.id);
          const slot = dockSlots[slotIdx] ?? 0;
          return {
            x: slot * dockSpacing,
            y: dockY + Math.abs(slot) * 2.5,
            scale: dockScale,
            rot: slot * 2.1
          };
        });
        return { targets };
      }

      // Tryb rozkładania podczas scrolla (0 -> 1) skalowany proporcjonalnie do szerokości ekranu
      const maxSpreadX = Math.max(36, (containerW - cardW) / 2 - (isMobile ? 8 : 24));
      const innerSpreadX = maxSpreadX * 0.52;
      const outerSpreadX = maxSpreadX;
      const innerRot = isMobile ? 2.2 : 3.2;
      const outerRot = isMobile ? 4.0 : 5.6;

      const configs = {
        1: { x: 0, y: 0, rot: 0, scale: 1 - progress * 0.02 },
        2: { x: -innerSpreadX, y: isMobile ? 8 : 14, rot: -innerRot, scale: isMobile ? 0.93 : 0.95 },
        3: { x: innerSpreadX, y: isMobile ? 8 : 14, rot: innerRot, scale: isMobile ? 0.93 : 0.95 },
        4: { x: -outerSpreadX, y: isMobile ? 16 : 28, rot: -outerRot, scale: isMobile ? 0.85 : 0.89 },
        5: { x: outerSpreadX, y: isMobile ? 16 : 28, rot: outerRot, scale: isMobile ? 0.85 : 0.89 }
      };

      const stackStep = isMobile ? 16 : 26;
      const stackedOffsets = {
        1: { y: 0, scale: 1 },
        2: { y: -stackStep, scale: 0.96 },
        3: { y: -stackStep * 2, scale: 0.92 },
        4: { y: -stackStep * 3, scale: 0.88 },
        5: { y: -stackStep * 4, scale: 0.84 }
      };

      const targets = SHOWCASE_TILES.map((tile) => {
        const target = configs[tile.id];
        const stack = stackedOffsets[tile.id];
        return {
          x: target.x * progress,
          y: stack.y * (1 - progress) + target.y * progress,
          scale: stack.scale + (target.scale - stack.scale) * progress,
          rot: target.rot * progress
        };
      });

      return { targets };
    };

    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const { targets } = computeTargets();
      if (!targets) {
        rafId = null;
        return;
      }

      // Przy trybie wyboru używamy płynnego tłumienia (~190ms do celu), przy reduced-motion natychmiast
      const alpha = mediaQuery.matches ? 1 : 1 - Math.exp(-15 * dt);
      let needsMoreFrames = false;

      SHOWCASE_TILES.forEach((tile, idx) => {
        const el = tileRefs.current[idx];
        const cur = currentStateRef.current[idx];
        const tgt = targets[idx];
        if (!el || !cur || !tgt) return;

        cur.x += (tgt.x - cur.x) * alpha;
        cur.y += (tgt.y - cur.y) * alpha;
        cur.scale += (tgt.scale - cur.scale) * alpha;
        cur.rot += (tgt.rot - cur.rot) * alpha;

        if (
          Math.abs(tgt.x - cur.x) > 0.25 ||
          Math.abs(tgt.y - cur.y) > 0.25 ||
          Math.abs(tgt.scale - cur.scale) > 0.002 ||
          Math.abs(tgt.rot - cur.rot) > 0.05
        ) {
          needsMoreFrames = true;
        } else {
          cur.x = tgt.x;
          cur.y = tgt.y;
          cur.scale = tgt.scale;
          cur.rot = tgt.rot;
        }

        el.style.transform = `translate3d(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px, 0) scale(${cur.scale.toFixed(3)}) rotate(${cur.rot.toFixed(2)}deg)`;
      });

      if (needsMoreFrames) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    const startAnimationLoop = () => {
      if (rafId !== null) return;
      lastTime = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    // Udostępniamy funkcję wyzwalającą przeliczenie przy zmianie wybranego kafelka
    frameRef.current.__triggerAnim = startAnimationLoop;

    startAnimationLoop();
    window.addEventListener('scroll', startAnimationLoop, { passive: true });
    window.addEventListener('resize', startAnimationLoop, { passive: true });

    const onMotionChange = () => startAnimationLoop();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onMotionChange);
    }

    return () => {
      window.removeEventListener('scroll', startAnimationLoop);
      window.removeEventListener('resize', startAnimationLoop);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', onMotionChange);
      }
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Reakcja na zmianę selectedTile — uruchamia płynną interpolację
  useEffect(() => {
    if (frameRef.current && frameRef.current.__triggerAnim) {
      frameRef.current.__triggerAnim();
    }
  }, [selectedTile]);

  const handleSelectTile = (tileId) => {
    setSelectedTile((prev) => (prev === tileId ? null : tileId));
  };

  const handleOpenPortal = (view) => {
    if (onEnterPortal) {
      onEnterPortal(view);
    }
  };

  const getTileZIndex = (tile) => {
    if (selectedTile === tile.id) return 70;
    if (selectedTile !== null) return 30 - tile.id;
    return tile.zIndex;
  };

  const activeTileData = SHOWCASE_TILES.find((t) => t.id === selectedTile) || null;

  return (
    <section
      id="prezentacja-aplikacji"
      aria-labelledby="prezentacja-heading"
      className="presentation-section"
    >
      <div className="container-premium">
        {/* Sticky tor scrolla: nagłówek + 5 kafelków mieszczą się razem w widoku podczas rozsuwania */}
        <div ref={trackRef} className="presentation-scroll-track">
          <div ref={frameRef} className="presentation-sticky-frame">
            <div className="presentation-backdrop" aria-hidden="true">
              <div className="presentation-backdrop-ring presentation-backdrop-ring--outer" />
              <div className="presentation-backdrop-ring presentation-backdrop-ring--inner" />
              <div className="presentation-backdrop-axis">
                <span>1850</span>
                <span>1900</span>
                <span>1950</span>
                <span>2026</span>
              </div>
            </div>

            <div className="presentation-header">
              <div className="badge badge-gold">
                <Sparkles size={13} /> Prezentacja Aplikacji TwojeKorzenie
              </div>
              <h2 id="prezentacja-heading" className="presentation-title">
                Zobacz, jak ożywa{' '}
                <span className="presentation-title-accent">historia Twojego rodu</span>
              </h2>
              <p className="presentation-subtitle">
                Przewijaj w dół, aby rozłożyć moduły aplikacji, a następnie kliknij dowolny kafelek,
                aby przybliżyć go na środek.
              </p>
            </div>

            <div className={`presentation-stage-wrap ${selectedTile !== null ? 'has-selection' : ''}`}>
              {/* Boczne panele kontekstowe (widoczne na desktopie po wybraniu modułu) */}
              <aside
                className={`presentation-flank presentation-flank--left ${activeTileData ? 'is-visible' : ''}`}
                aria-hidden={!activeTileData}
              >
                {activeTileData && (
                  <>
                    <div className="presentation-flank-kicker">{activeTileData.label}</div>
                    <h3 className="presentation-flank-title">{activeTileData.title}</h3>
                    <p className="presentation-flank-desc">{activeTileData.summary}</p>
                    <ul className="presentation-flank-list">
                      {activeTileData.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </aside>

              <aside
                className={`presentation-flank presentation-flank--right ${activeTileData ? 'is-visible' : ''}`}
                aria-hidden={!activeTileData}
              >
                {activeTileData && (
                  <>
                    <div className="presentation-flank-kicker">Zawartość modułu</div>
                    <div className="presentation-flank-metrics">
                      {activeTileData.metrics.map((m) => (
                        <div key={m.label} className="presentation-flank-metric">
                          <strong>{m.value}</strong>
                          <span>{m.label}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-gold presentation-flank-cta"
                      onClick={() => handleOpenPortal(activeTileData.portalView)}
                      tabIndex={activeTileData ? 0 : -1}
                    >
                      {activeTileData.cta} <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      className="presentation-flank-reset"
                      onClick={() => setSelectedTile(null)}
                      tabIndex={activeTileData ? 0 : -1}
                    >
                      Pokaż wszystkie 5 modułów
                    </button>
                  </>
                )}
              </aside>

              <div
                ref={stageRef}
                className="presentation-stage"
                role="region"
                aria-label="Interaktywna prezentacja modułów aplikacji"
              >
                {/* Kafelek 5 (prawo, najgłębiej) */}
                <article
                  ref={(el) => { tileRefs.current[4] = el; }}
                  className={`showcase-tile showcase-tile--dark ${selectedTile === 5 ? 'is-selected' : ''} ${selectedTile !== null && selectedTile !== 5 ? 'is-docked' : ''}`}
                  style={{ zIndex: getTileZIndex(SHOWCASE_TILES[4]) }}
                  onClick={() => handleSelectTile(5)}
                >
                  <div className="showcase-tile-top">
                    <span className="showcase-pill">05 · Kartografia &amp; PDF</span>
                    <MapPin size={15} className="showcase-icon-gold" />
                  </div>
                  <h3 className="showcase-tile-heading">Szlak Przodków &amp; Eksport Księgi</h3>
                  <div className="showcase-map-preview">
                    <svg viewBox="0 0 220 120" className="showcase-map-svg" aria-hidden="true">
                      <path
                        d="M25 88 Q 75 28, 120 56 T 195 34"
                        fill="none"
                        stroke="#C29A55"
                        strokeWidth="2.2"
                        strokeDasharray="4 3"
                      />
                      <circle cx="25" cy="88" r="5" fill="#E5C98F" />
                      <circle cx="120" cy="56" r="5.5" fill="#C29A55" />
                      <circle cx="195" cy="34" r="6" fill="#FAF6EC" stroke="#C29A55" strokeWidth="2" />
                    </svg>
                    <div className="showcase-map-labels">
                      <span>Chwalborzyce 1821</span>
                      <span>Ozorków 1886</span>
                      <span>Łódź 1928</span>
                    </div>
                  </div>
                  <div className="showcase-pdf-bar">
                    <FileText size={14} />
                    <span>rod-dobrzanskich-archiwum.pdf</span>
                    <span className="showcase-pdf-size">42 str.</span>
                  </div>
                  <button
                    type="button"
                    className="showcase-tile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPortal('dashboard');
                    }}
                  >
                    Otwórz Mapę <ArrowRight size={13} />
                  </button>
                </article>

                {/* Kafelek 4 (lewo, głęboko) */}
                <article
                  ref={(el) => { tileRefs.current[3] = el; }}
                  className={`showcase-tile showcase-tile--parchment ${selectedTile === 4 ? 'is-selected' : ''} ${selectedTile !== null && selectedTile !== 4 ? 'is-docked' : ''}`}
                  style={{ zIndex: getTileZIndex(SHOWCASE_TILES[3]) }}
                  onClick={() => handleSelectTile(4)}
                >
                  <div className="showcase-tile-top">
                    <span className="showcase-pill showcase-pill--forest">04 · Archiwum</span>
                    <ShieldCheck size={15} className="showcase-icon-forest" />
                  </div>
                  <h3 className="showcase-tile-heading showcase-tile-heading--dark">
                    Zweryfikowane Akta Metrykalne
                  </h3>
                  <div className="showcase-doc-card">
                    <div className="showcase-doc-stamp">PARAFIA ŁÓDŹ NMP · AKT 243/1928</div>
                    <p className="showcase-doc-quote">
                      „Działo się w mieście Łodzi dnia 27 maja 1928 roku… Stanisław Dobrzański,
                      robotnik fabryczny, oraz Stefania Kopalska…”
                    </p>
                    <div className="showcase-doc-meta">
                      <span>✓ Transkrypcja PL</span>
                      <span>✓ Skan 600 DPI</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="showcase-tile-btn showcase-tile-btn--dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPortal('archive');
                    }}
                  >
                    Zobacz Archiwum <ArrowRight size={13} />
                  </button>
                </article>

                {/* Kafelek 3 (prawo, blisko) */}
                <article
                  ref={(el) => { tileRefs.current[2] = el; }}
                  className={`showcase-tile showcase-tile--forest ${selectedTile === 3 ? 'is-selected' : ''} ${selectedTile !== null && selectedTile !== 3 ? 'is-docked' : ''}`}
                  style={{ zIndex: getTileZIndex(SHOWCASE_TILES[2]) }}
                  onClick={() => handleSelectTile(3)}
                >
                  <div className="showcase-tile-top">
                    <span className="showcase-pill">03 · Drzewo 2D</span>
                    <GitBranch size={15} className="showcase-icon-gold" />
                  </div>
                  <h3 className="showcase-tile-heading">Interaktywne Drzewo Rodowe</h3>
                  <div className="showcase-tree-mini">
                    <div className="showcase-tree-row">
                      <div className="showcase-tree-node">Maciej (1821)</div>
                      <div className="showcase-tree-node">Małgorzata (1829)</div>
                    </div>
                    <div className="showcase-tree-connector" />
                    <div className="showcase-tree-row">
                      <div className="showcase-tree-node is-gold">Ludwik Dobrzański (1857)</div>
                    </div>
                    <div className="showcase-tree-connector" />
                    <div className="showcase-tree-row">
                      <div className="showcase-tree-node">Stanisław (1905)</div>
                      <div className="showcase-tree-node">Stefania (1903)</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="showcase-tile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPortal('tree');
                    }}
                  >
                    Otwórz Drzewo <ArrowRight size={13} />
                  </button>
                </article>

                {/* Kafelek 2 (lewo, blisko) */}
                <article
                  ref={(el) => { tileRefs.current[1] = el; }}
                  className={`showcase-tile showcase-tile--sepia ${selectedTile === 2 ? 'is-selected' : ''} ${selectedTile !== null && selectedTile !== 2 ? 'is-docked' : ''}`}
                  style={{ zIndex: getTileZIndex(SHOWCASE_TILES[1]) }}
                  onClick={() => handleSelectTile(2)}
                >
                  <div className="showcase-tile-top">
                    <span className="showcase-pill">02 · Storytelling</span>
                    <BookOpen size={15} className="showcase-icon-gold" />
                  </div>
                  <h3 className="showcase-tile-heading">Opowieść o Przodkach</h3>
                  <div className="showcase-story-header">
                    <img
                      src={`${import.meta.env.BASE_URL}presentation/portrait-woman-1910.jpg`}
                      alt="Archiwalny portret prababci z początku XX wieku"
                      className="showcase-story-avatar"
                    />
                    <div>
                      <div className="showcase-story-name">Stefania Kopalska</div>
                      <div className="showcase-story-dates">★ 7 sierpnia 1903 · Łódź Bałuty</div>
                    </div>
                  </div>
                  <div className="showcase-story-chapters">
                    <div className="showcase-chapter">
                      <span>Rozdział I · 1903</span>
                      <p>Dzieciństwo na Bałutach i rodzina Antoniego Kopalskiego.</p>
                    </div>
                    <div className="showcase-chapter">
                      <span>Rozdział II · 1928</span>
                      <p>Ślub ze Stanisławem w parafii NMP z zachowanym podpisem.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="showcase-tile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPortal('story');
                    }}
                  >
                    Czytaj Historię <ArrowRight size={13} />
                  </button>
                </article>

                {/* Kafelek 1 (środek, front) */}
                <article
                  ref={(el) => { tileRefs.current[0] = el; }}
                  className={`showcase-tile showcase-tile--hero ${selectedTile === 1 ? 'is-selected' : ''} ${selectedTile !== null && selectedTile !== 1 ? 'is-docked' : ''}`}
                  style={{ zIndex: getTileZIndex(SHOWCASE_TILES[0]) }}
                  onClick={() => handleSelectTile(1)}
                >
                  <div className="showcase-tile-top">
                    <span className="showcase-pill showcase-pill--gold">
                      01 · Panel Klienta
                    </span>
                    <span className="showcase-live-badge">100% Zweryfikowane</span>
                  </div>

                  <div className="showcase-hero-banner">
                    <div className="showcase-hero-kicker">Rodzina Dobrzańskich · 5 pokoleń</div>
                    <h3 className="showcase-hero-title">Twoje Cyfrowe Dziedzictwo</h3>
                  </div>

                  <div className="showcase-portrait-grid">
                    <div className="showcase-portrait-card">
                      <img
                        src={`${import.meta.env.BASE_URL}presentation/portrait-man-1905.jpg`}
                        alt="Archiwalny portret Stanisława Dobrzańskiego z 1905 roku"
                        className="showcase-portrait-img"
                      />
                      <div className="showcase-portrait-caption">
                        <strong>Stanisław Dobrzański</strong>
                        <span>★ 1905 · Ozorków</span>
                      </div>
                    </div>

                    <div className="showcase-portrait-card">
                      <img
                        src={`${import.meta.env.BASE_URL}presentation/portrait-woman-1910.jpg`}
                        alt="Archiwalny portret Stefanii Kopalskiej z 1903 roku"
                        className="showcase-portrait-img"
                      />
                      <div className="showcase-portrait-caption">
                        <strong>Stefania Kopalska</strong>
                        <span>★ 1903 · Łódź</span>
                      </div>
                    </div>

                    <div className="showcase-portrait-card showcase-portrait-card--svg">
                      <div className="showcase-svg-wrap">
                        <AncestorPortrait
                          ancestor={{
                            id: 'ludwik-preview',
                            firstName: 'Ludwik',
                            lastName: 'Dobrzański',
                            birthYear: 1857,
                            portraitTone: '#244638'
                          }}
                          size={48}
                        />
                      </div>
                      <div className="showcase-portrait-caption">
                        <strong>Ludwik Dobrzański</strong>
                        <span>1857–1940 · Szewc</span>
                      </div>
                    </div>
                  </div>

                  <div className="showcase-hero-footer">
                    <div className="showcase-stats">
                      <span>11 Przodków</span>
                      <span>•</span>
                      <span>8 Aktów USC</span>
                      <span>•</span>
                      <span>5 Pokoleń</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-gold showcase-hero-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPortal('dashboard');
                      }}
                    >
                      Wejdź do Panelu <ArrowRight size={13} />
                    </button>
                  </div>
                </article>
              </div>
            </div>

            {/* Pasek nawigacji modułów + wskaźnik rozłożenia + podsumowanie archiwalne */}
            <div className={`presentation-controls ${selectedTile !== null ? 'has-selection' : ''}`}>
              <div className="presentation-tabs" role="tablist" aria-label="Wybierz moduł prezentacji">
                {SHOWCASE_TILES.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedTile === tile.id}
                    className={`presentation-tab ${selectedTile === tile.id ? 'is-active' : ''}`}
                    onClick={() => handleSelectTile(tile.id)}
                  >
                    {tile.label}
                  </button>
                ))}
                {selectedTile !== null && isFullySpread && (
                  <button
                    type="button"
                    className="presentation-tab presentation-tab--reset"
                    onClick={() => setSelectedTile(null)}
                  >
                    Rozłóż wszystkie
                  </button>
                )}
              </div>

              <div className="presentation-meta-row">
                <div className="presentation-progress-wrap" aria-hidden="true">
                  <div className="presentation-progress-track">
                    <div ref={progressBarRef} className="presentation-progress-fill" />
                  </div>
                  <span ref={progressTextRef} className="presentation-scroll-hint">
                    Rozłożenie: 0%
                  </span>
                </div>

                <div className="presentation-pillars">
                  <span>5 modułów w pakiecie</span>
                  <span aria-hidden="true">·</span>
                  <span>100% źródeł z archiwów</span>
                  <span aria-hidden="true">·</span>
                  <span>Telefon i komputer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
