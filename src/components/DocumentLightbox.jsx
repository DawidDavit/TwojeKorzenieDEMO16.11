import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, User, FileText, Sparkles, ShieldCheck } from 'lucide-react';
import { ArchivalDocumentScan } from './HeritageVisuals';

export default function DocumentLightbox({ documentItem, onClose, onNavigateToAncestor }) {
  const [scale, setScale] = useState(1);

  // Zadanie 15 (WCAG): Nawigacja klawiaturą (Escape zamyka okno, +/- zmienia powiększenie)
  useEffect(() => {
    if (!documentItem) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(2.0, +(s + 0.2).toFixed(2)));
      if (e.key === '-') setScale((s) => Math.max(0.85, +(s - 0.2).toFixed(2)));
      if (e.key === '0') setScale(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [documentItem, onClose]);

  if (!documentItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-doc-title"
      className="modal-backdrop-enter"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        backgroundColor: 'rgba(14, 28, 22, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="heritage-card modal-panel-enter"
        style={{
          maxWidth: '960px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: 'var(--ivory-light)',
          border: '2px solid var(--gold-base)',
          padding: '1.75rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pasek górny z kontrolkami powiększenia */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--ivory-border)',
            marginBottom: '1.25rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="gold-badge">{documentItem.category}</span>
              {documentItem.isNewDiscovery && (
                <span className="gold-badge" style={{ backgroundColor: '#244638', color: '#F3EFE5' }}>
                  <Sparkles size={12} /> Nowe Odkrycie
                </span>
              )}
            </div>
            <h3 id="lightbox-doc-title" style={{ fontSize: '1.45rem', color: 'var(--forest-base)', marginTop: '0.35rem' }}>
              {documentItem.title}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.85, +(s - 0.2).toFixed(2)))}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              <ZoomOut size={15} /> Oddal
            </button>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', minWidth: '50px', textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.0, +(s + 0.2).toFixed(2)))}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              <ZoomIn size={15} /> Powiększ
            </button>
            <button
              type="button"
              onClick={() => setScale(1)}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
            >
              <RotateCcw size={14} /> 100%
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij podgląd dokumentu"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1px solid var(--ivory-border)',
                backgroundColor: 'var(--ivory-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Obszar powiększanego skanu dokumentu */}
        <div
          style={{
            backgroundColor: '#172F25',
            borderRadius: '16px',
            padding: '1.5rem',
            overflow: 'auto',
            maxHeight: '420px',
            marginBottom: '1.4rem',
            border: '1px solid #C29A55'
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              maxWidth: '720px',
              margin: '0 auto'
            }}
          >
            <ArchivalDocumentScan doc={documentItem} />
          </div>
        </div>

        {/* Metadane archiwalne, transkrypcja i powiązanie z członkiem rodziny */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'var(--ivory-base)',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid var(--ivory-border)'
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--forest-base)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} color="#9E7836" /> Pełna transkrypcja i tłumaczenie paleograficzne
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.96rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>
              {documentItem.transcription}
            </p>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              {documentItem.description}
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--ivory-base)',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid var(--ivory-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Data dokumentu:</span>{' '}
                <strong>{documentItem.date}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Miejsce:</span>{' '}
                <strong>{documentItem.place}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Sygnatura archiwalna:</span>{' '}
                <strong>{documentItem.archiveSource}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Język oryginału:</span>{' '}
                <strong>{documentItem.language}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Powiązany członek rodziny:</span>{' '}
                <strong style={{ color: 'var(--forest-base)' }}>{documentItem.ancestorName}</strong>
              </div>
              <div style={{ paddingTop: '0.35rem', borderTop: '1px solid var(--ivory-border)', fontSize: '0.8rem', color: 'var(--forest-base)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} color="#244638" aria-hidden="true" />
                <span>Licencja: Domena Publiczna / Autorska Rekonstrukcja Cyfrowa TwojeKorzenie</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onNavigateToAncestor(documentItem.ancestorId);
                onClose();
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.88rem' }}
            >
              <User size={16} />
              <span>Przejdź do profilu przodka: {documentItem.ancestorName}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
