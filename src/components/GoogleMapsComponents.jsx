import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ExternalLink, Navigation, Check } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Szybkie podpowiedzi historycznych miast Rzeczypospolitej i Kresów (dostępne natychmiast przed wpisaniem 3 znaków)
const HISTORICAL_PLACES_PRESETS = [
  { name: 'Kraków, Polska', shortName: 'Kraków', region: 'Małopolska', lat: 50.0647, lng: 19.945 },
  { name: 'Lwów, Ukraina (dawniej Galicja / II RP)', shortName: 'Lwów', region: 'Galicja Wschodnia / Kresy', lat: 49.8397, lng: 24.0297 },
  { name: 'Wilno, Litwa (dawniej Wileńszczyzna / II RP)', shortName: 'Wilno', region: 'Wileńszczyzna / Kresy', lat: 54.6872, lng: 25.2797 },
  { name: 'Warszawa, Polska', shortName: 'Warszawa', region: 'Mazowsze', lat: 52.2297, lng: 21.0122 },
  { name: 'Gdańsk, Polska', shortName: 'Gdańsk', region: 'Pomorze', lat: 54.352, lng: 18.6466 },
  { name: 'Poznań, Polska', shortName: 'Poznań', region: 'Wielkopolska', lat: 52.4064, lng: 16.9252 },
  { name: 'Krzemieniec, Ukraina (Wołyń)', shortName: 'Krzemieniec', region: 'Wołyń / Kresy', lat: 50.0981, lng: 25.7275 },
  { name: 'Złoczów, Ukraina (dawniej woj. tarnopolskie)', shortName: 'Złoczów', region: 'Galicja / Kresy', lat: 49.8074, lng: 24.9014 },
  { name: 'Stanisławów (Iwano-Frankiwsk), Ukraina', shortName: 'Stanisławów', region: 'Pokucie / Kresy', lat: 48.9226, lng: 24.7111 },
  { name: 'Grodno, Białoruś (dawniej Kresy)', shortName: 'Grodno', region: 'Grodzieńszczyzna', lat: 53.6694, lng: 23.8131 }
];

let googleMapsScriptPromise = null;

export function loadGoogleMapsSdk() {
  if (!GOOGLE_MAPS_API_KEY) return Promise.resolve(null);
  if (typeof window !== 'undefined' && window.google?.maps?.places) {
    return Promise.resolve(window.google.maps);
  }
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY
    )}&libraries=places&language=pl`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google?.maps || null);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

/**
 * Pole wyszukiwania lokalizacji z podpowiedziami Google Maps Places API
 * (oraz automatycznym fallbackiem geocodingu na żywo, gdy nie podano klucza VITE_GOOGLE_MAPS_API_KEY).
 */
export function PlaceAutocompleteInput({
  value,
  onChange,
  onSelectPlace,
  placeholder = 'Wyszukaj miejscowość w Google Maps (np. Lwów, Kraków)...',
  required = false,
  id,
  ariaLabel
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = (value || '').trim();
    if (!isOpen) return undefined;

    if (q.length < 2) {
      setSuggestions(HISTORICAL_PLACES_PRESETS.slice(0, 6));
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        // 1. Jeśli dostępny klucz Google Maps API -> użyj Google Places AutocompleteService + Geocoder
        if (GOOGLE_MAPS_API_KEY) {
          const gmaps = await loadGoogleMapsSdk().catch(() => null);
          if (gmaps?.places) {
            const service = new gmaps.places.AutocompleteService();
            service.getPlacePredictions(
              { input: q, language: 'pl' },
              (predictions, status) => {
                if (cancelled) return;
                if (status === gmaps.places.PlacesServiceStatus.OK && predictions?.length) {
                  setSuggestions(
                    predictions.slice(0, 6).map((p) => ({
                      placeId: p.place_id,
                      name: p.description,
                      shortName: p.structured_formatting?.main_text || p.description.split(',')[0],
                      region: p.structured_formatting?.secondary_text || '',
                      source: 'Google Maps'
                    }))
                  );
                } else {
                  setSuggestions([]);
                }
                setLoading(false);
              }
            );
            return;
          }
        }

        // 2. Wyszukiwanie geocodingu na żywo + dopasowanie miast historycznych
        const localMatches = HISTORICAL_PLACES_PRESETS.filter((p) =>
          p.name.toLowerCase().includes(q.toLowerCase())
        );

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&accept-language=pl&q=${encodeURIComponent(
            q
          )}`
        );
        if (!res.ok) throw new Error('Geocoding network error');
        const data = await res.json();
        if (cancelled) return;

        const remoteMatches = (Array.isArray(data) ? data : []).map((item) => {
          const shortName =
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.name ||
            item.display_name.split(',')[0];
          const region =
            item.address?.state || item.address?.country || item.display_name.split(',').slice(1, 3).join(', ').trim();
          return {
            name: item.display_name,
            shortName,
            region,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            source: 'Google Maps / Geocoder'
          };
        });

        const merged = [...localMatches];
        for (const rem of remoteMatches) {
          if (!merged.some((m) => m.shortName.toLowerCase() === rem.shortName.toLowerCase())) {
            merged.push(rem);
          }
        }
        setSuggestions(merged.slice(0, 6));
      } catch {
        if (!cancelled) {
          const fallback = HISTORICAL_PLACES_PRESETS.filter((p) =>
            p.name.toLowerCase().includes(q.toLowerCase())
          );
          setSuggestions(fallback);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 240);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, isOpen]);

  const handleChooseSuggestion = async (item) => {
    let resolvedLat = item.lat;
    let resolvedLng = item.lng;

    if ((!resolvedLat || !resolvedLng) && item.placeId && window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const geoRes = await geocoder.geocode({ placeId: item.placeId });
        const loc = geoRes?.results?.[0]?.geometry?.location;
        if (loc) {
          resolvedLat = loc.lat();
          resolvedLng = loc.lng();
        }
      } catch {
        // ignore geocode error
      }
    }

    const displayVal = item.shortName
      ? item.region && !item.shortName.includes(item.region)
        ? `${item.shortName} (${item.region.split(',')[0]})`
        : item.shortName
      : item.name;

    onChange(displayVal);
    if (onSelectPlace) {
      onSelectPlace({
        name: displayVal,
        shortName: item.shortName || displayVal,
        fullAddress: item.name,
        region: item.region || '',
        lat: resolvedLat || null,
        lng: resolvedLng || null
      });
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleChooseSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <MapPin
          size={15}
          color="#9E7836"
          aria-hidden="true"
          style={{ position: 'absolute', left: '0.65rem', pointerEvents: 'none' }}
        />
        <input
          id={id}
          type="text"
          required={required}
          value={value}
          aria-label={ariaLabel || placeholder}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '0.55rem 0.65rem 0.55rem 2.1rem',
            borderRadius: '8px',
            border: isOpen ? '1.5px solid var(--gold-base)' : '1px solid var(--ivory-border)',
            backgroundColor: '#FFFFFF'
          }}
        />
      </div>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Podpowiedzi lokalizacji Google Maps"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 90,
            backgroundColor: '#FAF8F2',
            border: '1.5px solid var(--gold-base)',
            borderRadius: '12px',
            boxShadow: '0 14px 32px rgba(23, 47, 37, 0.18)',
            overflow: 'hidden',
            maxHeight: '260px',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: '#172F25',
              color: '#E5C98F',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>Wyszukiwarka lokalizacji Google Maps</span>
            {loading && <span>Szukam…</span>}
          </div>

          {suggestions.length === 0 && !loading ? (
            <div style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Wpisz nazwę miejscowości (np. Lwów, Kraków, Wilno) — naciśnij Enter, aby użyć wpisanego tekstu.
            </div>
          ) : (
            suggestions.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={`${item.name}-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={isHighlighted}
                  onClick={() => handleChooseSuggestion(item)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.55rem 0.8rem',
                    border: 'none',
                    borderBottom: '1px solid var(--ivory-border)',
                    backgroundColor: isHighlighted ? 'rgba(194, 154, 85, 0.18)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <MapPin size={14} color="#244638" style={{ flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--forest-base)' }}>{item.shortName}</strong>
                      {item.region && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.35rem' }}>
                          — {item.region}
                        </span>
                      )}
                    </div>
                  </div>
                  <Check size={13} color="#9E7836" style={{ opacity: isHighlighted ? 1 : 0.35, flexShrink: 0 }} />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

const GEOCODE_CACHE = new Map();

function latLngToTileFloat(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const clampedLat = Math.max(-85, Math.min(85, lat));
  const x = ((lng + 180) / 360) * n;
  const latRad = (clampedLat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y, n };
}

function SatelliteCityMap({ residence, fallbackQuery }) {
  const containerRef = useRef(null);
  const [coords, setCoords] = useState(() => {
    if (residence?.lat && residence?.lng) {
      return { lat: Number(residence.lat), lng: Number(residence.lng) };
    }
    return { lat: 51.7592, lng: 19.456 };
  });
  const [zoom, setZoom] = useState(12);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 640, h: 360 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const lastWheelRef = useRef(0);
  const stateRef = useRef({ zoom: 12, pan: { x: 0, y: 0 }, size: { w: 640, h: 360 } });

  stateRef.current = { zoom, pan, size };

  useEffect(() => {
    setPan({ x: 0, y: 0 });
    setZoom(12);
    if (residence?.lat && residence?.lng) {
      setCoords({ lat: Number(residence.lat), lng: Number(residence.lng) });
      return undefined;
    }

    const query = (residence?.city || fallbackQuery || 'Łódź, Polska').trim();
    const preset = HISTORICAL_PLACES_PRESETS.find(
      (p) =>
        query.toLowerCase().includes(p.shortName.toLowerCase()) ||
        p.name.toLowerCase() === query.toLowerCase()
    );
    if (preset) {
      setCoords({ lat: preset.lat, lng: preset.lng });
      return undefined;
    }

    if (GEOCODE_CACHE.has(query)) {
      setCoords(GEOCODE_CACHE.get(query));
      return undefined;
    }

    let cancelled = false;
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { 'Accept-Language': 'pl' } }
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (cancelled || !Array.isArray(items) || !items[0]) return;
        const next = { lat: Number(items[0].lat), lng: Number(items[0].lon) };
        if (!Number.isNaN(next.lat) && !Number.isNaN(next.lng)) {
          GEOCODE_CACHE.set(query, next);
          setCoords(next);
        }
      })
      .catch(() => {
        // zachowaj domyślne współrzędne przy braku sieci
      });

    return () => {
      cancelled = true;
    };
  }, [residence?.city, residence?.lat, residence?.lng, fallbackQuery]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const updateSize = () => {
      setSize({ w: el.clientWidth || 640, h: el.clientHeight || 360 });
    };
    updateSize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    if (ro) ro.observe(el);
    return () => {
      if (ro) ro.disconnect();
    };
  }, []);

  // Obsługa Ctrl + scroll (lub Cmd + scroll) z przybliżaniem w stronę kursora
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const handleWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const now = performance.now();
      if (now - lastWheelRef.current < 75) return;
      lastWheelRef.current = now;

      const delta = e.deltaY < 0 ? 1 : -1;
      const { zoom: curZoom, pan: curPan, size: curSize } = stateRef.current;
      const nextZoom = Math.max(5, Math.min(18, curZoom + delta));
      if (nextZoom === curZoom) return;

      const rect = el.getBoundingClientRect();
      const cursorDx = e.clientX - rect.left - curSize.w / 2;
      const cursorDy = e.clientY - rect.top - curSize.h / 2;
      const factor = Math.pow(2, nextZoom - curZoom);

      setZoom(nextZoom);
      setPan({
        x: cursorDx - (cursorDx - curPan.x) * factor,
        y: cursorDy - (cursorDy - curPan.y) * factor
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const tileSize = 256;
  const { x: centerTileX, y: centerTileY, n } = latLngToTileFloat(coords.lat, coords.lng, zoom);
  const pixelCenterX = centerTileX * tileSize - pan.x;
  const pixelCenterY = centerTileY * tileSize - pan.y;

  const minTileX = Math.floor((pixelCenterX - size.w / 2) / tileSize);
  const maxTileX = Math.floor((pixelCenterX + size.w / 2) / tileSize);
  const minTileY = Math.max(0, Math.floor((pixelCenterY - size.h / 2) / tileSize));
  const maxTileY = Math.min(n - 1, Math.floor((pixelCenterY + size.h / 2) / tileSize));

  const tiles = [];
  for (let ty = minTileY; ty <= maxTileY; ty += 1) {
    for (let tx = minTileX; tx <= maxTileX; tx += 1) {
      const wrappedX = ((tx % n) + n) % n;
      const left = Math.round(size.w / 2 + tx * tileSize - pixelCenterX);
      const top = Math.round(size.h / 2 + ty * tileSize - pixelCenterY);
      tiles.push({ key: `${zoom}-${tx}-${ty}`, x: wrappedX, y: ty, left, top });
    }
  }

  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pan.x,
      origY: pan.y
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.active) return;
    setPan({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY)
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragRef.current.active = false;
  };

  const handleZoomStep = (delta) => {
    const nextZoom = Math.max(5, Math.min(18, zoom + delta));
    if (nextZoom === zoom) return;
    const factor = Math.pow(2, nextZoom - zoom);
    setZoom(nextZoom);
    setPan((p) => ({ x: p.x * factor, y: p.y * factor }));
  };

  const pinLeft = size.w / 2 + pan.x;
  const pinTop = size.h / 2 + pan.y;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#15251E',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none'
      }}
      aria-label={`Mapa satelitarna: ${residence?.city || fallbackQuery}`}
    >
      {/* Warstwa 1: Zdjęcia satelitarne (Esri World Imagery) z delikatnym tonowaniem archiwalnym */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'contrast(1.06) saturate(0.92)'
        }}
      >
        {tiles.map((t) => (
          <img
            key={`sat-${t.key}`}
            src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${t.y}/${t.x}`}
            alt=""
            draggable={false}
            onLoad={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            style={{
              position: 'absolute',
              left: `${t.left}px`,
              top: `${t.top}px`,
              width: `${tileSize + 1}px`,
              height: `${tileSize + 1}px`,
              opacity: 0,
              transition: 'opacity 180ms cubic-bezier(0.23, 1, 0.32, 1)',
              pointerEvents: 'none'
            }}
          />
        ))}
      </div>

      {/* Warstwa 2: Wyłącznie nazwy miast, miejscowości i granic (Esri World_Boundaries_and_Places — bez rzek i oznaczeń dróg) */}
      {tiles.map((t) => (
        <img
          key={`lbl-${t.key}`}
          src={`https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${zoom}/${t.y}/${t.x}`}
          alt=""
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          style={{
            position: 'absolute',
            left: `${t.left}px`,
            top: `${t.top}px`,
            width: `${tileSize + 1}px`,
            height: `${tileSize + 1}px`,
            opacity: 0.92,
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Subtelna winieta muzealna przy krawędziach */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 42px rgba(13, 28, 21, 0.45)'
        }}
      />

      {/* Znacznik wybranej miejscowości */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: `${pinLeft}px`,
          top: `${pinTop}px`,
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.55))'
        }}
      >
        <div
          style={{
            marginBottom: '6px',
            padding: '0.22rem 0.6rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(23, 47, 37, 0.92)',
            border: '1px solid #C29A55',
            color: '#FAF6EC',
            fontSize: '0.72rem',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          {residence?.city || fallbackQuery}
        </div>
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            backgroundColor: '#C29A55',
            border: '2.5px solid #FAF6EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#172F25'
            }}
          />
        </div>
      </div>

      {/* Podpowiedź Ctrl + Scroll w lewym górnym rogu */}
      <div
        style={{
          position: 'absolute',
          top: '0.65rem',
          left: '0.65rem',
          padding: '0.26rem 0.6rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(23, 47, 37, 0.85)',
          border: '1px solid rgba(194, 154, 85, 0.45)',
          color: '#E5C98F',
          fontSize: '0.7rem',
          fontWeight: 600,
          pointerEvents: 'none',
          backdropFilter: 'blur(6px)'
        }}
      >
        Ctrl + scroll: powiększenie · Przeciągnij, aby przesunąć
      </div>

      {/* Panel sterowania zoomem i resetem w prawym górnym rogu */}
      <div
        style={{
          position: 'absolute',
          top: '0.65rem',
          right: '0.65rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          zIndex: 5
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Przybliż mapę"
          onClick={() => handleZoomStep(1)}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            border: '1px solid #C29A55',
            backgroundColor: 'rgba(23, 47, 37, 0.92)',
            color: '#FAF6EC',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          +
        </button>
        <span
          style={{
            fontSize: '0.66rem',
            fontWeight: 700,
            color: '#E5C98F',
            backgroundColor: 'rgba(23, 47, 37, 0.88)',
            padding: '0.1rem 0.35rem',
            borderRadius: '6px',
            border: '1px solid rgba(194, 154, 85, 0.4)'
          }}
        >
          z{zoom}
        </span>
        <button
          type="button"
          aria-label="Oddal mapę"
          onClick={() => handleZoomStep(-1)}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            border: '1px solid #C29A55',
            backgroundColor: 'rgba(23, 47, 37, 0.92)',
            color: '#FAF6EC',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          −
        </button>
        {(pan.x !== 0 || pan.y !== 0 || zoom !== 12) && (
          <button
            type="button"
            aria-label="Wyśrodkuj mapę"
            title="Wyśrodkuj na punkcie"
            onClick={() => {
              setPan({ x: 0, y: 0 });
              setZoom(12);
            }}
            style={{
              marginTop: '0.15rem',
              padding: '0.2rem 0.4rem',
              borderRadius: '6px',
              border: '1px solid #C29A55',
              backgroundColor: 'rgba(23, 47, 37, 0.92)',
              color: '#E5C98F',
              fontSize: '0.64rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Prawdziwa interaktywna mapa satelitarna dla sekcji „Miejsca zamieszkania i szlak życia na mapie”.
 * Obsługuje zarówno natywny SDK Google Maps JS (gdy ustawiono VITE_GOOGLE_MAPS_API_KEY),
 * jak i satelitarną mapę z nazwami miast, miejscowości i ulic (bez punktów POI i lokali).
 */
export function GoogleHeritageMap({ person }) {
  const residences = Array.isArray(person?.residences) && person.residences.length > 0
    ? person.residences
    : person?.birthPlace
    ? [{ city: person.birthPlace, years: String(person.birthYear || ''), note: 'Miejsce pochodzenia przodka', lat: person?.coordinates?.lat, lng: person?.coordinates?.lng }]
    : [{ city: 'Kraków, Polska', years: '', note: 'Domyślna lokalizacja archiwalna' }];

  const [activeIdx, setActiveIdx] = useState(0);
  const [sdkReady, setSdkReady] = useState(false);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    setActiveIdx(0);
  }, [person?.id]);

  // Jeśli użytkownik skonfigurował klucz VITE_GOOGLE_MAPS_API_KEY, inicjalizujemy pełną mapę wektorową JS z markerami i polilinią szlaku
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return undefined;
    let cancelled = false;
    loadGoogleMapsSdk()
      .then((gmaps) => {
        if (!cancelled && gmaps) setSdkReady(true);
      })
      .catch(() => {
        if (!cancelled) setSdkReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sdkReady || !mapContainerRef.current || !window.google?.maps) return;
    const gmaps = window.google.maps;
    const map = new gmaps.Map(mapContainerRef.current, {
      zoom: 6,
      center: { lat: 50.0647, lng: 19.945 },
      mapTypeId: 'hybrid',
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ saturation: -65 }, { lightness: -35 }] },
        { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { featureType: 'road.highway', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'labels.text', stylers: [{ visibility: 'on' }] },
        { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'on' }] }
      ]
    });

    const geocoder = new gmaps.Geocoder();
    const bounds = new gmaps.LatLngBounds();
    const pathCoords = [];

    const placeMarker = (pos, resItem, index) => {
      pathCoords.push(pos);
      bounds.extend(pos);
      const marker = new gmaps.Marker({
        position: pos,
        map,
        label: {
          text: String(index + 1),
          color: '#FAF8F2',
          fontWeight: 'bold'
        },
        title: `${resItem.city} (${resItem.years || ''})`
      });
      const info = new gmaps.InfoWindow({
        content: `<div style="font-family:Georgia,serif;padding:4px 6px"><strong style="color:#244638">${resItem.city}</strong><br/><span style="font-size:12px;color:#555">${resItem.note || ''} (${resItem.years || ''})</span></div>`
      });
      marker.addListener('click', () => info.open(map, marker));
    };

    (async () => {
      for (let i = 0; i < residences.length; i++) {
        const r = residences[i];
        if (r.lat && r.lng) {
          placeMarker({ lat: Number(r.lat), lng: Number(r.lng) }, r, i);
        } else {
          try {
            const result = await geocoder.geocode({ address: r.city });
            const loc = result?.results?.[0]?.geometry?.location;
            if (loc) {
              placeMarker({ lat: loc.lat(), lng: loc.lng() }, r, i);
            }
          } catch {
            // ignore geocode failure
          }
        }
      }
      if (pathCoords.length > 1) {
        new gmaps.Polyline({
          path: pathCoords,
          geodesic: true,
          strokeColor: '#C29A55',
          strokeOpacity: 0.9,
          strokeWeight: 3,
          map
        });
        map.fitBounds(bounds);
      } else if (pathCoords.length === 1) {
        map.setCenter(pathCoords[0]);
        map.setZoom(11);
      }
    })();
  }, [sdkReady, person?.id]);

  const safeIdx = Math.min(activeIdx, residences.length - 1);
  const currentRes = residences[safeIdx] || residences[0];
  const mapQuery =
    currentRes?.lat && currentRes?.lng
      ? `${currentRes.lat},${currentRes.lng}`
      : currentRes?.city || person?.birthPlace || 'Kraków, Polska';

  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&hl=pl&z=11&t=h&output=embed`;
  const externalGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    currentRes?.city || mapQuery
  )}`;

  return (
    <div>
      {/* Kontener prawdziwej mapy Google Maps */}
      <div
        style={{
          height: '360px',
          borderRadius: '16px',
          backgroundColor: '#15251E',
          border: '1.5px solid #C29A55',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '0.85rem',
          boxShadow: 'inset 0 0 18px rgba(23, 47, 37, 0.12)'
        }}
      >
        {GOOGLE_MAPS_API_KEY && sdkReady ? (
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        ) : (
          <SatelliteCityMap residence={currentRes} fallbackQuery={mapQuery} />
        )}

        {/* Pływający pasek informacyjny na dole mapy */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.65rem',
            left: '0.65rem',
            right: '0.65rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(23, 47, 37, 0.92)',
            color: '#F3EFE5',
            padding: '0.45rem 0.8rem',
            borderRadius: '10px',
            border: '1px solid #C29A55',
            fontSize: '0.76rem',
            backdropFilter: 'blur(6px)'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Navigation size={13} color="#E5C98F" style={{ flexShrink: 0 }} />
            <span>
              Punkt na mapie: <strong style={{ color: '#E5C98F' }}>{currentRes?.city}</strong>
            </span>
          </span>

          <a
            href={externalGoogleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#E5C98F',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              flexShrink: 0
            }}
          >
            <span>Google Maps</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Interaktywna lista miejsc zamieszkania — kliknięcie przełącza lokalizację na mapie Google */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {residences.map((res, idx) => {
          const isSelected = idx === safeIdx;
          return (
            <button
              key={`${res.city}-${idx}`}
              type="button"
              onClick={() => setActiveIdx(idx)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                textAlign: 'left',
                padding: '0.65rem 0.9rem',
                backgroundColor: isSelected ? 'rgba(36, 70, 56, 0.09)' : 'var(--ivory-base)',
                borderRadius: '10px',
                border: isSelected ? '1.5px solid var(--gold-base)' : '1px solid var(--ivory-border)',
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'background-color 180ms ease, border-color 180ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MapPin size={16} color={isSelected ? '#244638' : '#9E7836'} style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: 'var(--forest-base)', display: 'block' }}>{res.city}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {res.note || 'Miejsce powiązane z historią przodka'}
                  </div>
                </div>
              </div>
              {res.years && (
                <span className="gold-badge" style={{ fontSize: '0.72rem', flexShrink: 0 }}>
                  {res.years}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
