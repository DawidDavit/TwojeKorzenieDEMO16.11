import React from 'react';

// Portret archiwalny przodka z pełnym tekstem alternatywnym (Zadanie 13: Add alt text & Zadanie 19: Licencja autorska SVG)
export function AncestorPortrait({ ancestor, size = 72, showFrame = true }) {
  const initials = `${ancestor?.firstName?.[0] || 'T'}${ancestor?.lastName?.[0] || 'K'}`;
  const isFemale = ancestor?.firstName?.endsWith('a');
  const tone = ancestor?.portraitTone || '#244638';
  const altLabel = `Portret archiwalny: ${ancestor?.firstName || ''} ${ancestor?.lastName || ''} (${ancestor?.birthYear || 'XIX/XX w.'}) — Autorska ilustracja wektorowa TwojeKorzenie`;

  return (
    <div
      role="img"
      aria-label={altLabel}
      title={altLabel}
      style={{
        width: size,
        height: size,
        borderRadius: showFrame ? '16px' : '50%',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        border: showFrame ? '2px solid #C29A55' : '1.5px solid #C29A55',
        boxShadow: '0 6px 16px rgba(23, 47, 37, 0.16)',
        background: `radial-gradient(circle at 30% 25%, #F3EFE5 0%, #D9CEB8 55%, ${tone} 100%)`
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <title>{altLabel}</title>
        <defs>
          <radialGradient id={`grad-${ancestor?.id || 'default'}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FAF6EC" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#DECFA8" stopOpacity="0.55" />
            <stop offset="100%" stopColor={tone} stopOpacity="0.92" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#grad-${ancestor?.id || 'default'})`} />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#C29A55" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.65" />
        <circle cx="50" cy="50" r="39" fill="none" stroke="#244638" strokeWidth="0.4" opacity="0.3" />

        {isFemale ? (
          <g fill={tone} opacity="0.88">
            <path d="M22 96 C24 72, 36 64, 50 64 C64 64, 76 72, 78 96 Z" />
            <path d="M36 36 C36 22, 64 22, 64 36 C66 44, 62 52, 50 52 C38 52, 34 44, 36 36 Z" fill="#3B2F22" opacity="0.22" />
            <circle cx="50" cy="40" r="14" />
            <circle cx="50" cy="68" r="3.2" fill="#C29A55" stroke="#FAF6EC" strokeWidth="0.8" />
          </g>
        ) : (
          <g fill={tone} opacity="0.9">
            <path d="M18 96 C21 70, 34 62, 50 62 C66 62, 79 70, 82 96 Z" />
            <path d="M43 63 L50 78 L57 63 Z" fill="#F3EFE5" opacity="0.85" />
            <path d="M48.5 67 L50 77 L51.5 67 Z" fill="#C29A55" />
            <circle cx="50" cy="39" r="14.5" />
          </g>
        )}

        <rect x="6" y="6" width="24" height="16" rx="4" fill="#172F25" opacity="0.82" />
        <text
          x="18"
          y="17"
          textAnchor="middle"
          fill="#E5C98F"
          fontSize="9"
          fontFamily="Playfair Display, Georgia, serif"
          fontWeight="700"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}

// Elegancka ilustracja dla każdej z 5 kart usług z opisem alternatywnym (Zadanie 13 & 19)
export function ServiceIllustration({ type, alt }) {
  const descriptions = {
    'compass-archives': 'Ilustracja kompasu genealogicznego i ksiąg metrykalnych – usługa Odkrywanie przodków',
    'royal-tree': 'Ilustracja rozłożystego drzewa genealogicznego ze złotymi węzłami pokoleń',
    'chronicle-book': 'Ilustracja otwartej Księgi Historii Rodziny z pieczęcią archiwalną',
    'digital-vault': 'Ilustracja cyfrowego skarbca archiwalnego i konserwacji starych fotografii',
    'imperial-crest': 'Ilustracja herbu rodowego w złotej tarczy – Pakiet Kompleksowy VIP'
  };
  const altText = alt || descriptions[type] || 'Ilustracja usługi genealogicznej TwojeKorzenie';

  return (
    <div
      role="img"
      aria-label={altText}
      title={`${altText} (Licencja Własna TwojeKorzenie SVG)`}
      style={{
        height: '148px',
        background: 'linear-gradient(135deg, #1E3B2F 0%, #244638 60%, #162B22 100%)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(194, 154, 85, 0.35)'
      }}
    >
      <svg viewBox="0 0 280 140" width="100%" height="100%" aria-hidden="true">
        <title>{altText}</title>
        <defs>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C29A55" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#C29A55" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="140" cy="70" r="65" fill="url(#goldGlow)" />
        <line x1="20" y1="35" x2="260" y2="35" stroke="#C29A55" strokeOpacity="0.14" strokeDasharray="3 3" />
        <line x1="20" y1="105" x2="260" y2="105" stroke="#C29A55" strokeOpacity="0.14" strokeDasharray="3 3" />
        <circle cx="140" cy="70" r="48" fill="none" stroke="#C29A55" strokeOpacity="0.35" strokeWidth="1" />
        <circle cx="140" cy="70" r="56" fill="none" stroke="#F3EFE5" strokeOpacity="0.15" strokeWidth="0.7" strokeDasharray="4 4" />

        {type === 'compass-archives' && (
          <g stroke="#C29A55" fill="none" strokeWidth="1.6">
            <circle cx="140" cy="70" r="30" fill="#172F25" />
            <polygon points="140,42 147,65 140,59 133,65" fill="#C29A55" />
            <polygon points="140,98 147,75 140,81 133,75" fill="#F3EFE5" opacity="0.6" />
            <circle cx="140" cy="70" r="4" fill="#F3EFE5" />
            <rect x="64" y="48" width="32" height="44" rx="3" stroke="#F3EFE5" strokeOpacity="0.5" />
            <line x1="70" y1="58" x2="90" y2="58" stroke="#C29A55" />
            <line x1="70" y1="66" x2="88" y2="66" stroke="#F3EFE5" strokeOpacity="0.5" />
            <rect x="184" y="48" width="32" height="44" rx="3" stroke="#F3EFE5" strokeOpacity="0.5" />
            <circle cx="200" cy="74" r="7" stroke="#C29A55" />
          </g>
        )}

        {type === 'royal-tree' && (
          <g stroke="#C29A55" fill="none" strokeWidth="1.6">
            <path d="M140 105 L140 68" strokeWidth="2.5" />
            <path d="M140 82 C115 80, 102 65, 102 48" />
            <path d="M140 82 C165 80, 178 65, 178 48" />
            <path d="M140 68 C126 56, 122 44, 122 34" />
            <path d="M140 68 C154 56, 158 44, 158 34" />
            <circle cx="140" cy="106" r="8" fill="#C29A55" />
            <circle cx="102" cy="46" r="7" fill="#172F25" stroke="#F3EFE5" />
            <circle cx="178" cy="46" r="7" fill="#172F25" stroke="#F3EFE5" />
            <circle cx="122" cy="34" r="6" fill="#C29A55" />
            <circle cx="158" cy="34" r="6" fill="#C29A55" />
            <circle cx="140" cy="52" r="7" fill="#F3EFE5" />
          </g>
        )}

        {type === 'chronicle-book' && (
          <g stroke="#C29A55" fill="none" strokeWidth="1.6">
            <path d="M92 42 Q116 36 140 44 L140 100 Q116 92 92 98 Z" fill="#172F25" stroke="#F3EFE5" />
            <path d="M188 42 Q164 36 140 44 L140 100 Q164 92 188 98 Z" fill="#172F25" stroke="#C29A55" />
            <line x1="102" y1="56" x2="130" y2="58" stroke="#C29A55" />
            <line x1="102" y1="66" x2="130" y2="68" stroke="#F3EFE5" strokeOpacity="0.6" />
            <line x1="102" y1="76" x2="126" y2="78" stroke="#F3EFE5" strokeOpacity="0.6" />
            <circle cx="164" cy="66" r="11" stroke="#C29A55" />
            <path d="M158 66 L163 71 L172 61" stroke="#F3EFE5" />
          </g>
        )}

        {type === 'digital-vault' && (
          <g stroke="#C29A55" fill="none" strokeWidth="1.6">
            <rect x="92" y="36" width="66" height="54" rx="5" fill="#172F25" stroke="#F3EFE5" />
            <rect x="118" y="48" width="70" height="56" rx="5" fill="#244638" stroke="#C29A55" />
            <circle cx="153" cy="72" r="12" stroke="#F3EFE5" />
            <path d="M132 94 C138 84, 168 84, 174 94" stroke="#C29A55" />
            <circle cx="105" cy="50" r="4" fill="#C29A55" />
          </g>
        )}

        {type === 'imperial-crest' && (
          <g stroke="#C29A55" fill="none" strokeWidth="1.7">
            <path d="M140 28 L174 42 L174 72 C174 94, 158 106, 140 114 C122 106, 106 94, 106 72 L106 42 Z" fill="#172F25" />
            <path d="M140 36 L166 47 L166 71 C166 88, 153 98, 140 105 C127 98, 114 88, 114 71 L114 47 Z" stroke="#F3EFE5" strokeOpacity="0.55" strokeWidth="1" />
            <circle cx="140" cy="68" r="14" fill="#C29A55" fillOpacity="0.2" stroke="#C29A55" />
            <path d="M132 68 L138 74 L150 61" stroke="#F3EFE5" strokeWidth="2.2" />
          </g>
        )}
      </svg>
    </div>
  );
}

// Wizualizacja skanu dokumentu archiwalnego z opisem dostępności i licencją domeny publicznej (Zadanie 13 & 19)
export function ArchivalDocumentScan({ doc, compact = false }) {
  const scanAlt = `Skan dokumentu archiwalnego: ${doc?.title || 'Dokument metrykalny'} (${doc?.date || doc?.year || ''}, ${doc?.place || ''}) — Domena Publiczna / Archiwum Rodzinne`;

  return (
    <div
      role="img"
      aria-label={scanAlt}
      style={{
        backgroundColor: doc?.paperTone || '#EDE3CE',
        backgroundImage:
          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.45) 0%, transparent 60%), repeating-linear-gradient(0deg, rgba(125, 91, 33, 0.04) 0px, rgba(125, 91, 33, 0.04) 1px, transparent 1px, transparent 22px)',
        border: '1px solid #C5B393',
        borderRadius: compact ? '12px' : '16px',
        padding: compact ? '1rem' : '1.6rem',
        color: '#2B2114',
        position: 'relative',
        boxShadow: 'inset 0 0 32px rgba(138, 104, 52, 0.18), 0 6px 18px rgba(23, 47, 37, 0.08)',
        overflow: 'hidden'
      }}
    >
      {/* Nagłówek urzędowy z epoki */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px double #8C6E3D', paddingBottom: '0.55rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.68rem', letterSpacing: '0.12em', fontWeight: 700, color: '#4A3616', textTransform: 'uppercase' }}>
          {doc?.stampText || 'ARCHIWUM PAŃSTWOWE • ODPIS WIERZYTELNY'}
        </span>
        <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '0.85rem', color: '#244638' }}>
          A.D. {doc?.year}
        </span>
      </div>

      {/* Kaligraficzny podgląd treści */}
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: compact ? '0.85rem' : '1.02rem',
          lineHeight: 1.55,
          color: '#2B2114',
          marginBottom: compact ? '0.75rem' : '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: compact ? 3 : 8,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {doc?.transcription}
      </p>

      {/* Stopka z pieczęcią lakową / urzędową i oznaczeniem licencji */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#4E3B20', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Miejsce sporządzenia:
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#244638' }}>{doc?.place}</div>
          {!compact && (
            <div style={{ fontSize: '0.66rem', color: '#4E3B20', marginTop: '0.2rem' }}>
              Status prawny skanu: Domena Publiczna / Licencja Archiwalna TwojeKorzenie
            </div>
          )}
        </div>

        <div
          style={{
            width: compact ? '44px' : '58px',
            height: compact ? '44px' : '58px',
            borderRadius: '50%',
            border: '2px dashed #7A241B',
            backgroundColor: 'rgba(139, 46, 36, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-11deg)',
            flexShrink: 0
          }}
          title="Pieczęć uwierzytelniająca archiwum"
        >
          <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#7A241B', textAlign: 'center', lineHeight: 1.1 }}>
            PIECZĘĆ
            <br />
            {doc?.year}
          </span>
        </div>
      </div>
    </div>
  );
}
