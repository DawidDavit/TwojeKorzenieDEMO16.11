import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  List,
  GitBranch,
  MapPin,
  Calendar,
  BookOpen,
  CheckCircle2,
  UserPlus,
  Search,
  AlertTriangle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { AncestorPortrait } from './HeritageVisuals';
import { PlaceAutocompleteInput } from './GoogleMapsComponents';
import { sanitizeText, detectSecurityThreat, validateFormFields } from '../services/securityService';

// Układ współrzędnych dla interaktywnej mapy drzewa (w pikselach na płótnie 1400x880)
const NODE_POSITIONS_DEMO = {
  'anc-8': { x: 400, y: 55 },   // Pradziadek Ignacy (Pokolenie IV)
  'anc-4': { x: 230, y: 270 },  // Dziadek Tadeusz (Pokolenie III)
  'anc-5': { x: 540, y: 270 },  // Babcia Zofia (Pokolenie III)
  'anc-6': { x: 860, y: 270 },  // Dziadek Stanisław (Pokolenie III)
  'anc-7': { x: 1150, y: 270 }, // Babcia Helena (Pokolenie III)
  'anc-2': { x: 385, y: 495 },  // Ojciec Adam (Pokolenie II)
  'anc-3': { x: 1005, y: 495 }, // Matka Maria (Pokolenie II)
  'anc-9': { x: 355, y: 715 },  // Siostra Klara (Pokolenie I)
  'anc-1': { x: 695, y: 715 },  // Proband Janusz (Pokolenie I)
  'anc-10': { x: 1035, y: 715 } // Małżonka Julia (Pokolenie I)
};

const NODE_POSITIONS_LIVE = {
  'live-4': { x: 385, y: 70 },
  'live-2': { x: 385, y: 340 },
  'live-3': { x: 885, y: 340 },
  'live-1': { x: 635, y: 610 }
};

export default function InteractiveFamilyTree({
  ancestors,
  selectedAncestor,
  onSelectAncestor,
  onOpenStorytelling,
  onAddAncestorClue,
  isFullPane = false,
  onToggleFullPane
}) {
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'list'
  const [zoom, setZoom] = useState(0.92);
  const [pan, setPan] = useState({ x: 20, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [generationFilter, setGenerationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [clueConsent, setClueConsent] = useState(false);
  const [clueError, setClueError] = useState(null);
  const [newClue, setNewClue] = useState({
    firstName: '',
    lastName: '',
    birthYear: '',
    birthPlace: '',
    generation: '4',
    role: 'Pradziadek / Prababcia',
    notes: ''
  });

  const viewportRef = useRef(null);

  useEffect(() => {
    if (!showAddModal) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowAddModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  const handleZoomIn = () => setZoom((z) => Math.min(1.6, +(z + 0.14).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.55, +(z - 0.14).toFixed(2)));
  const handleResetView = () => {
    setZoom(0.92);
    setPan({ x: 20, y: 10 });
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('.ancestor-node-card')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const filteredAncestors = ancestors.filter((a) => {
    const matchesGen = generationFilter === 'all' || String(a.generation) === String(generationFilter);
    const matchesQuery =
      !searchQuery.trim() ||
      `${a.firstName} ${a.lastName} ${a.maidenName || ''} ${a.birthPlace} ${a.profession}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesGen && matchesQuery;
  });

  // Wyznaczenie pozycji węzłów na mapie (obsługa zarówno ID demo, jak i dynamicznych UUID z Supabase, do 6 pokoleń)
  const maxGenInView = Math.max(4, ...filteredAncestors.map((a) => Number(a.generation) || 1));

  const getNodePosition = (person, index) => {
    if (NODE_POSITIONS_DEMO[person.id]) return NODE_POSITIONS_DEMO[person.id];
    if (NODE_POSITIONS_LIVE[person.id]) return NODE_POSITIONS_LIVE[person.id];

    const gen = Number(person.generation) || 1;
    const rowFromTop = maxGenInView - gen;
    const y = 55 + rowFromTop * 215;

    const sameGenList = filteredAncestors.filter((a) => (Number(a.generation) || 1) === gen);
    const slotIdx = Math.max(0, sameGenList.findIndex((a) => a.id === person.id));
    const count = Math.max(1, sameGenList.length);
    const totalWidth = count * 285;
    const startX = Math.max(60, (1400 - totalWidth) / 2);

    return {
      x: startX + slotIdx * 290,
      y
    };
  };

  const handleCreateClue = async (e) => {
    e.preventDefault();
    setClueError(null);

    if (
      detectSecurityThreat(newClue.firstName) ||
      detectSecurityThreat(newClue.lastName) ||
      detectSecurityThreat(newClue.birthPlace) ||
      detectSecurityThreat(newClue.notes)
    ) {
      setClueError('Zablokowano niedozwolone znaczniki skryptowe (Ochrona anty-XSS).');
      return;
    }

    const validation = validateFormFields({
      firstName: newClue.firstName,
      lastName: newClue.lastName,
      birthYear: newClue.birthYear
    });
    if (!validation.isValid) {
      setClueError(validation.errors.join(' '));
      return;
    }

    if (!clueConsent) {
      setClueError('Potwierdź zgodność przekazanych danych rodzinnych z zasadami RODO i ochrony małoletnich.');
      return;
    }

    try {
      await onAddAncestorClue({
        firstName: sanitizeText(newClue.firstName, 60),
        lastName: sanitizeText(newClue.lastName, 60),
        birthYear: sanitizeText(newClue.birthYear, 10),
        birthPlace: sanitizeText(newClue.birthPlace, 80),
        generation: newClue.generation,
        role: sanitizeText(newClue.role, 60),
        notes: sanitizeText(newClue.notes, 400)
      });
      setNewClue({
        firstName: '',
        lastName: '',
        birthYear: '',
        birthPlace: '',
        generation: '4',
        role: 'Pradziadek / Prababcia',
        notes: ''
      });
      setClueConsent(false);
      setShowAddModal(false);
    } catch (err) {
      setClueError(err.message || 'Nie udało się zapisać wskazówki.');
    }
  };

  useEffect(() => {
    if (!isFullPane || showAddModal || !onToggleFullPane) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onToggleFullPane();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullPane, showAddModal, onToggleFullPane]);

  // Płynne przewijanie (scroll/trackpad) oraz zoom (Ctrl+scroll) w trybie pełnego widoku
  useEffect(() => {
    if (!isFullPane || viewMode !== 'tree') return undefined;
    const el = viewportRef.current;
    if (!el) return undefined;

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        setZoom((z) => Math.min(1.6, Math.max(0.55, +(z + delta).toFixed(2))));
      } else {
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isFullPane, viewMode]);

  return (
    <div
      className="animate-fade-in"
      style={
        isFullPane
          ? {
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }
          : undefined
      }
    >
      {/* Pasek narzędziowy Interaktywnego Drzewa Genealogicznego (widoczny poza pełnym widokiem) */}
      {!isFullPane && (
        <div
          className="heritage-card"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="gold-badge">
              <GitBranch size={13} /> Interaktywna Mapa Rodu
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              • {filteredAncestors.length} członków rodziny w widoku
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', color: 'var(--forest-base)', marginTop: '0.3rem' }}>
            Drzewo Genealogiczne Rodziny
          </h2>
        </div>

        {/* Kontrolki przełączania widoku Drzewo / Lista oraz filtry */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem' }}>
          {/* Wyszukiwarka przodków */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="#5F7168"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj przodka lub miasta..."
              aria-label="Szukaj przodka lub miasta"
              style={{
                padding: '0.55rem 0.9rem 0.55rem 2.3rem',
                borderRadius: '999px',
                border: '1px solid var(--ivory-border)',
                backgroundColor: 'var(--ivory-base)',
                fontSize: '0.88rem',
                width: '215px'
              }}
            />
          </div>

          {/* Filtr pokoleń */}
          <select
            value={generationFilter}
            onChange={(e) => setGenerationFilter(e.target.value)}
            aria-label="Filtruj według pokolenia"
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '999px',
              border: '1px solid var(--ivory-border)',
              backgroundColor: 'var(--ivory-base)',
              color: 'var(--forest-base)',
              fontWeight: 500,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">Wszystkie pokolenia (I–VI)</option>
            <option value="6">Pokolenie VI – Praprapradziadkowie</option>
            <option value="5">Pokolenie V – Prapradziadkowie</option>
            <option value="4">Pokolenie IV – Pradziadkowie</option>
            <option value="3">Pokolenie III – Dziadkowie</option>
            <option value="2">Pokolenie II – Rodzice</option>
            <option value="1">Pokolenie I – Współczesne</option>
          </select>

          {/* Przełącznik Widok Drzewa / Widok Listy (Wymaganie 5) */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--ivory-muted)',
              padding: '0.25rem',
              borderRadius: '999px',
              border: '1px solid var(--ivory-border)'
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.95rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewMode === 'tree' ? 'var(--forest-base)' : 'transparent',
                color: viewMode === 'tree' ? 'var(--ivory-base)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}
            >
              <GitBranch size={15} />
              Widok drzewa
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.95rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewMode === 'list' ? 'var(--forest-base)' : 'transparent',
                color: viewMode === 'list' ? 'var(--ivory-base)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}
            >
              <List size={15} />
              Widok listy
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-gold"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.86rem' }}
          >
            <UserPlus size={16} />
            <span>Dodaj wskazówkę o przodku</span>
          </button>

          {onToggleFullPane && (
            <button
              type="button"
              onClick={onToggleFullPane}
              aria-pressed={isFullPane}
              title="Rozwiń drzewo na całą prawą sekcję"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '999px',
                border: '1px solid var(--forest-base)',
                backgroundColor: 'var(--ivory-base)',
                color: 'var(--forest-base)',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease'
              }}
            >
              <Maximize2 size={15} />
              <span>Pełny widok</span>
            </button>
          )}
        </div>
      </div>
      )}

      {/* WIDOK 1: INTERAKTYWNA MAPA DRZEWA GENEALOGICZNEGO 2D */}
      {viewMode === 'tree' ? (
        <div
          style={
            isFullPane
              ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }
              : { display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }
          }
        >
          <div
            ref={viewportRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="tree-viewport heritage-card"
            style={
              isFullPane
                ? {
                    flex: 1,
                    minHeight: 0,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 0,
                    border: 'none',
                    boxShadow: 'none',
                    touchAction: 'none'
                  }
                : {
                    height: '650px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '2px solid var(--gold-base)'
                  }
            }
          >
            {/* Pływające kontrolki przybliżania/oddalania i nawigacji */}
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                zIndex: 20,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(243, 239, 229, 0.94)',
                backdropFilter: 'blur(8px)',
                padding: '0.5rem 0.85rem',
                borderRadius: '999px',
                border: '1px solid var(--ivory-border)',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <button
                type="button"
                onClick={handleZoomOut}
                title="Oddal widok drzewa"
                aria-label="Oddal widok drzewa"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: '1px solid var(--ivory-border)',
                  backgroundColor: 'var(--ivory-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ZoomOut size={17} color="#244638" />
              </button>
              <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--forest-base)', minWidth: '48px', textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Przybliż widok drzewa"
                aria-label="Przybliż widok drzewa"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: '1px solid var(--ivory-border)',
                  backgroundColor: 'var(--ivory-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ZoomIn size={17} color="#244638" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                title="Wyśrodkuj drzewo"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  border: '1px solid var(--ivory-border)',
                  backgroundColor: 'var(--ivory-light)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--forest-base)',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} /> Resetuj widok
              </button>
              {!isFullPane && (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.35rem' }}>
                  <Move size={13} /> Przeciągnij myszą lub dotykiem, kliknij kartę aby otworzyć profil
                </span>
              )}
            </div>

            {/* Pływający przycisk powrotu z pełnego widoku */}
            {isFullPane && onToggleFullPane && (
              <button
                type="button"
                onClick={onToggleFullPane}
                aria-pressed={isFullPane}
                title="Wróć do widoku standardowego (Esc)"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1.25rem',
                  zIndex: 20,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '999px',
                  border: '1.5px solid var(--gold-base)',
                  backgroundColor: 'var(--forest-base)',
                  color: '#F3EFE5',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(23, 47, 37, 0.22)',
                  transition: 'transform 160ms ease, background-color 180ms ease'
                }}
              >
                <Minimize2 size={15} color="#E5C98F" />
                <span>Zwiń widok</span>
              </button>
            )}

            {/* Róża wiatrów / Znak wodny kartografii rodu (ukryty w pełnym widoku) */}
            {!isFullPane && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1.25rem',
                  zIndex: 15,
                  backgroundColor: 'rgba(23, 47, 37, 0.9)',
                  color: '#F3EFE5',
                  padding: '0.55rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid #C29A55',
                  fontSize: '0.76rem'
                }}
              >
                <strong style={{ color: '#E5C98F' }}>Legenda Mapy:</strong> Złota ramka = Wybrana osoba • Zielona pieczęć = Zweryfikowano w Archiwum
              </div>
            )}

            {/* Przesuwalna i skalowalna warstwa płótna */}
            <div
              style={{
                width: '1460px',
                height: `${Math.max(880, maxGenInView * 225)}px`,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                position: 'relative'
              }}
            >
              {/* Etykiety poziomów pokoleń w tle */}
              {Array.from({ length: maxGenInView }, (_, idx) => maxGenInView - idx).map((genNum, rowIdx) => {
                const labels = {
                  6: 'POKOLENIE VI — PRAPRADZIADKOWIE (XVIII/XIX w.)',
                  5: 'POKOLENIE V — 3x PRADZIADKOWIE (XIX w.)',
                  4: 'POKOLENIE IV — 2x PRADZIADKOWIE',
                  3: 'POKOLENIE III — PRADZIADKOWIE',
                  2: 'POKOLENIE II — DZIADKOWIE / RODZICE',
                  1: 'POKOLENIE I — WSPÓŁCZESNE DZIEDZICTWO'
                };
                return (
                  <div
                    key={genNum}
                    style={{
                      position: 'absolute',
                      left: '24px',
                      right: '24px',
                      top: `${20 + rowIdx * 215}px`,
                      borderTop: '1px dashed rgba(36, 70, 56, 0.22)',
                      paddingTop: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: '#5F7168',
                      pointerEvents: 'none'
                    }}
                  >
                    {labels[genNum] || `POKOLENIE ${genNum}`}
                  </div>
                );
              })}

              {/* Eleganckie linie łączące przodków (SVG Bezier) */}
              <svg
                width="1460"
                height={Math.max(880, maxGenInView * 225)}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                {filteredAncestors.map((person, idx) => {
                  const childPos = getNodePosition(person, idx);
                  const childCenterX = childPos.x + 125;
                  const childTopY = childPos.y;

                  // Linie do rodziców
                  const parentLines = (person.parentIds || []).map((pid) => {
                    const parentObj = filteredAncestors.find((p) => p.id === pid);
                    if (!parentObj) return null;
                    const pPos = getNodePosition(parentObj, 0);
                    const parentCenterX = pPos.x + 125;
                    const parentBottomY = pPos.y + 132;
                    const midY = (parentBottomY + childTopY) / 2;

                    return (
                      <g key={`${person.id}-${pid}`}>
                        <path
                          d={`M ${parentCenterX} ${parentBottomY} C ${parentCenterX} ${midY}, ${childCenterX} ${midY}, ${childCenterX} ${childTopY}`}
                          fill="none"
                          stroke={selectedAncestor?.id === person.id || selectedAncestor?.id === pid ? '#C29A55' : '#244638'}
                          strokeWidth={selectedAncestor?.id === person.id || selectedAncestor?.id === pid ? '3' : '2.4'}
                          strokeOpacity={selectedAncestor?.id === person.id || selectedAncestor?.id === pid ? '0.92' : '0.62'}
                          className="tree-branch-path"
                        />
                        <circle cx={parentCenterX} cy={parentBottomY} r="4.5" fill="#C29A55" />
                        <circle cx={childCenterX} cy={childTopY} r="4.5" fill="#244638" />
                      </g>
                    );
                  });

                  // Linia małżeńska
                  let spouseLine = null;
                  if (person.spouseId) {
                    const spouseObj = filteredAncestors.find((p) => p.id === person.spouseId);
                    if (spouseObj && person.id < spouseObj.id) {
                      const sPos = getNodePosition(spouseObj, 0);
                      const yLine = childPos.y + 66;
                      spouseLine = (
                        <g key={`spouse-${person.id}-${spouseObj.id}`}>
                          <line
                            x1={childPos.x + 250}
                            y1={yLine}
                            x2={sPos.x}
                            y2={yLine}
                            stroke="#C29A55"
                            strokeWidth="2.5"
                            strokeDasharray="5 4"
                          />
                          <circle cx={(childPos.x + 250 + sPos.x) / 2} cy={yLine} r="8" fill="#FAF6EC" stroke="#C29A55" strokeWidth="2" />
                        </g>
                      );
                    }
                  }

                  return (
                    <React.Fragment key={`edges-${person.id}`}>
                      {parentLines}
                      {spouseLine}
                    </React.Fragment>
                  );
                })}
              </svg>

              {/* Karty członków rodziny na płótnie */}
              {filteredAncestors.map((person, idx) => {
                const pos = getNodePosition(person, idx);
                const isSelected = selectedAncestor?.id === person.id;

                return (
                  <div
                    key={person.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Wybierz przodka: ${person.firstName} ${person.lastName} (${person.birthYear})`}
                    className="ancestor-node-card"
                    onClick={() => onSelectAncestor(person)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectAncestor(person);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      width: '255px',
                      backgroundColor: isSelected ? '#172F25' : '#FAF8F2',
                      color: isSelected ? '#F3EFE5' : '#172A22',
                      borderRadius: '18px',
                      padding: '0.85rem 0.95rem',
                      border: isSelected ? '2.5px solid #C29A55' : '1.5px solid #CFC3A9',
                      boxShadow: isSelected
                        ? '0 14px 32px rgba(23, 47, 37, 0.32)'
                        : '0 8px 20px rgba(23, 47, 37, 0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <AncestorPortrait ancestor={person} size={54} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: isSelected ? '#E5C98F' : '#9E7836'
                          }}
                        >
                          {person.role}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.02rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {person.firstName} {person.lastName}
                        </div>
                        {person.maidenName && (
                          <div style={{ fontSize: '0.73rem', opacity: 0.85 }}>
                            z d. {person.maidenName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: '0.65rem',
                        paddingTop: '0.55rem',
                        borderTop: isSelected
                          ? '1px solid rgba(194, 154, 85, 0.3)'
                          : '1px solid var(--ivory-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem'
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.28rem' }}>
                        <Calendar size={12} color="#C29A55" />
                        {person.birthYear}–{person.deathYear || 'obecnie'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                        <MapPin size={12} color="#C29A55" />
                        {person.birthPlace}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dolny pasek szczegółów wybranego z drzewa przodka (widoczny poza pełnym widokiem) */}
          {!isFullPane && selectedAncestor && (
            <div
              className="heritage-card animate-fade-in"
              style={{
                padding: '1.4rem 1.75rem',
                border: '2px solid var(--gold-base)',
                background: 'linear-gradient(135deg, #FAF8F2 0%, #F1EBDD 100%)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', maxWidth: '760px' }}>
                <AncestorPortrait ancestor={selectedAncestor} size={74} />
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="gold-badge">{selectedAncestor.generationLabel}</span>
                    {selectedAncestor.isVerified && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#244638', fontWeight: 600 }}>
                        <CheckCircle2 size={15} /> Zweryfikowano w archiwum
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.45rem', color: 'var(--forest-base)' }}>
                    {selectedAncestor.firstName} {selectedAncestor.lastName}{' '}
                    {selectedAncestor.maidenName ? `(z domu ${selectedAncestor.maidenName})` : ''}
                  </h3>
                  <div style={{ fontSize: '0.88rem', color: '#9E7836', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Ur. {selectedAncestor.birthDate} ({selectedAncestor.birthPlace}) •{' '}
                    {selectedAncestor.deathYear ? `Zm. ${selectedAncestor.deathDate}` : 'Żyje'} • {selectedAncestor.profession}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {selectedAncestor.shortBio}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => onOpenStorytelling(selectedAncestor)}
                  className="btn-primary"
                >
                  <BookOpen size={18} />
                  <span>Otwórz pełny profil i historię życia</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* WIDOK 2: WIDOK LISTY POKOLEŃ */
        <div
          style={
            isFullPane
              ? { display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, overflowY: 'auto', padding: '1.25rem' }
              : { display: 'flex', flexDirection: 'column', gap: '1.5rem' }
          }
        >
          {[6, 5, 4, 3, 2, 1].map((genNumber) => {
            const group = filteredAncestors.filter((a) => a.generation === genNumber);
            if (group.length === 0) return null;

            const genTitles = {
              6: 'Pokolenie VI — Praprapradziadkowie',
              5: 'Pokolenie V — 3x Pradziadkowie (Korzenie XIX-wieczne)',
              4: 'Pokolenie IV — 2x Pradziadkowie',
              3: 'Pokolenie III — Pradziadkowie',
              2: 'Pokolenie II — Dziadkowie / Rodzice',
              1: 'Pokolenie I — Współcześni członkowie rodu'
            };

            return (
              <div key={genNumber} className="heritage-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--forest-base)', marginBottom: '1rem', borderBottom: '1px solid var(--ivory-border)', paddingBottom: '0.6rem' }}>
                  {genTitles[genNumber]}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1rem' }}>
                  {group.map((person) => (
                    <div
                      key={person.id}
                      style={{
                        backgroundColor: 'var(--ivory-base)',
                        border: '1px solid var(--ivory-border)',
                        borderRadius: '16px',
                        padding: '1.1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.9rem'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                        <AncestorPortrait ancestor={person} size={62} />
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9E7836', textTransform: 'uppercase' }}>
                            {person.role}
                          </div>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.18rem', fontWeight: 700, color: 'var(--forest-base)' }}>
                            {person.firstName} {person.lastName}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {person.birthDate} – {person.deathDate}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Miejsce pochodzenia: <strong>{person.birthPlace}</strong>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{person.shortBio}</p>
                      <button
                        type="button"
                        onClick={() => onOpenStorytelling(person)}
                        className="btn-secondary"
                        style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.86rem' }}
                      >
                        <BookOpen size={16} /> Otwórz pełną biografię i dokumenty
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DODAWANIA WSKAZÓWKI O PRZODKU DO DRZEWA */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-backdrop-enter"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(16, 34, 26, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="heritage-card modal-panel-enter"
            style={{ maxWidth: '520px', width: '100%', padding: '2rem', border: '2px solid var(--gold-base)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.5rem', color: 'var(--forest-base)', marginBottom: '0.4rem' }}>
              Dodaj członka rodziny / wskazówkę badawczą
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Nowa osoba pojawi się natychmiast na Twoim drzewie genealogicznym ze statusem „Przekazano do weryfikacji archiwalnej”.
            </p>
            <form onSubmit={handleCreateClue} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {clueError && (
                <div
                  role="alert"
                  style={{
                    backgroundColor: 'rgba(139, 46, 36, 0.1)',
                    border: '1.5px solid #8B2E24',
                    color: '#5C1912',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <AlertTriangle size={16} color="#8B2E24" aria-hidden="true" />
                  <span>{clueError}</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label htmlFor="clue-first-name" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Imię *</label>
                  <input
                    id="clue-first-name"
                    required
                    type="text"
                    maxLength={60}
                    placeholder="np. Kazimierz"
                    value={newClue.firstName}
                    onChange={(e) => setNewClue({ ...newClue, firstName: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                  />
                </div>
                <div>
                  <label htmlFor="clue-last-name" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Nazwisko *</label>
                  <input
                    id="clue-last-name"
                    required
                    type="text"
                    maxLength={60}
                    placeholder="np. Korzeniowski"
                    value={newClue.lastName}
                    onChange={(e) => setNewClue({ ...newClue, lastName: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label htmlFor="clue-birth-year" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Rok urodzenia (opcjonalnie)</label>
                  <input
                    id="clue-birth-year"
                    type="text"
                    maxLength={10}
                    placeholder="np. 1882"
                    value={newClue.birthYear}
                    onChange={(e) => setNewClue({ ...newClue, birthYear: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                  />
                </div>
                <div>
                  <label htmlFor="clue-birth-place" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Miejsce pochodzenia (Google Maps)</label>
                  <PlaceAutocompleteInput
                    id="clue-birth-place"
                    placeholder="np. Stanisławów / Lwów"
                    value={newClue.birthPlace}
                    onChange={(val) => setNewClue({ ...newClue, birthPlace: val })}
                    onSelectPlace={(place) => setNewClue({ ...newClue, birthPlace: place.name, lat: place.lat, lng: place.lng })}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="clue-notes" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Wspomnienia lub wskazówka dla genealoga (opcjonalnie)</label>
                <textarea
                  id="clue-notes"
                  rows={3}
                  maxLength={400}
                  placeholder="np. Brat pradziadka Ignacego, służył w Legionach Polskich..."
                  value={newClue.notes}
                  onChange={(e) => setNewClue({ ...newClue, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', backgroundColor: 'var(--ivory-base)', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}>
                <input
                  type="checkbox"
                  checked={clueConsent}
                  onChange={(e) => setClueConsent(e.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>
                  * Oświadczam, że przekazywane informacje dotyczą osób zmarłych lub posiadam zgodę członka rodziny (a w przypadku osób małoletnich — zgodę rodzica/opiekuna prawnego zgodnie z art. 8 RODO).
                </span>
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ padding: '0.65rem 1.2rem' }}>
                  Anuluj
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                  Dodaj do drzewa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
