import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings2 } from 'lucide-react';
import { CookieConsentManager } from '../services/securityService';

export default function CookieConsentBanner({ isOpenOverride, onCloseOverride, onOpenLegalDoc }) {
  const [consent, setConsent] = useState(() => CookieConsentManager.getConsent());
  const [showDetails, setShowDetails] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (consent) {
      setFunctional(Boolean(consent.functional));
      setAnalytics(Boolean(consent.analytics));
      setMarketing(Boolean(consent.marketing));
    }
  }, [consent]);

  const isVisible = isOpenOverride || !consent;
  if (!isVisible) return null;

  const handleRejectOptional = () => {
    const saved = CookieConsentManager.saveConsent({
      functional: false,
      analytics: false,
      marketing: false
    });
    setConsent(saved);
    if (onCloseOverride) onCloseOverride();
  };

  const handleAcceptSelected = () => {
    const saved = CookieConsentManager.saveConsent({
      functional,
      analytics,
      marketing
    });
    setConsent(saved);
    if (onCloseOverride) onCloseOverride();
  };

  const handleAcceptAll = () => {
    const saved = CookieConsentManager.saveConsent({
      functional: true,
      analytics: true,
      marketing: true
    });
    setConsent(saved);
    if (onCloseOverride) onCloseOverride();
  };

  return (
    <aside
      role="region"
      aria-label="Baner zgody na pliki cookies i prywatność"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        right: '1rem',
        zIndex: 140,
        maxWidth: '1060px',
        margin: '0 auto',
        backgroundColor: '#FAF8F2',
        color: '#172A22',
        border: '2px solid var(--forest-base)',
        borderRadius: '20px',
        padding: '1.35rem 1.6rem',
        boxShadow: '0 20px 48px rgba(16, 34, 26, 0.28)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--forest-base)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              <Cookie size={16} color="#6E501D" aria-hidden="true" />
              <span>Szacunek dla prywatności i RODO (Brak zewnętrznych trackerów)</span>
            </div>
            <h2 style={{ fontSize: '1.18rem', color: 'var(--forest-base)', marginBottom: '0.35rem' }}>
              Twoje dane i ustawienia plików cookies w TwojeKorzenie
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Stosujemy wyłącznie niezbędną pamięć lokalną (localStorage/sessionStorage) do utrzymania bezpiecznej sesji, ochrony CSRF oraz zapamiętania Twojego drzewa genealogicznego. Opcjonalne funkcje są <strong>domyślnie wyłączone</strong>. Szczegóły znajdziesz w{' '}
              <button
                type="button"
                onClick={() => onOpenLegalDoc('cookies')}
                style={{ background: 'none', border: 'none', color: 'var(--forest-base)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
              >
                Polityce Cookies
              </button>{' '}
              oraz{' '}
              <button
                type="button"
                onClick={() => onOpenLegalDoc('privacy')}
                style={{ background: 'none', border: 'none', color: 'var(--forest-base)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
              >
                Polityce Prywatności RODO
              </button>
              .
            </p>
          </div>

          {/* Zadanie 5 & 9: Równoważne wizualnie przyciski bez dark patterns */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={handleRejectOptional}
              className="btn-secondary"
              style={{ padding: '0.65rem 1.15rem', fontSize: '0.86rem', fontWeight: 600 }}
            >
              Odrzuć opcjonalne (Tylko niezbędne)
            </button>

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="btn-secondary"
              style={{ padding: '0.65rem 1.05rem', fontSize: '0.86rem' }}
            >
              <Settings2 size={15} aria-hidden="true" />
              <span>{showDetails ? 'Ukryj opcje' : 'Dostosuj zgody'}</span>
            </button>

            <button
              type="button"
              onClick={handleAcceptAll}
              className="btn-primary"
              style={{ padding: '0.65rem 1.2rem', fontSize: '0.86rem', fontWeight: 600 }}
            >
              Akceptuj wszystkie
            </button>
          </div>
        </div>

        {showDetails && (
          <div
            style={{
              backgroundColor: 'var(--ivory-base)',
              border: '1px solid var(--ivory-border)',
              borderRadius: '14px',
              padding: '1rem 1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.84rem' }}>
                <input type="checkbox" checked disabled style={{ marginTop: '0.25rem' }} />
                <span>
                  <strong style={{ display: 'block', color: 'var(--forest-base)' }}>Niezbędne (Zawsze aktywne)</strong>
                  Bezpieczeństwo sesji, tokeny anty-CSRF, integralność danych drzewa i zapamiętanie wyboru zgód.
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={functional}
                  onChange={(e) => setFunctional(e.target.checked)}
                  style={{ marginTop: '0.25rem' }}
                />
                <span>
                  <strong style={{ display: 'block', color: 'var(--forest-base)' }}>Funkcjonalne (Opcjonalne)</strong>
                  Zapamiętywanie ostatnio wybranego przodka, powiększenia mapy drzewa 2D oraz filtrów archiwum.
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  style={{ marginTop: '0.25rem' }}
                />
                <span>
                  <strong style={{ display: 'block', color: 'var(--forest-base)' }}>Analityczne (Opcjonalne)</strong>
                  Anonimowe statystyki wydajności interfejsu bez przekazywania danych podmiotom trzecim.
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  style={{ marginTop: '0.25rem' }}
                />
                <span>
                  <strong style={{ display: 'block', color: 'var(--forest-base)' }}>Komunikacja (Opcjonalne)</strong>
                  Powiadomienia o publikacjach historycznych i poradnikach genealogicznych TwojeKorzenie.
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid var(--ivory-border)' }}>
              <button
                type="button"
                onClick={handleAcceptSelected}
                className="btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.84rem' }}
              >
                <ShieldCheck size={15} aria-hidden="true" />
                <span>Zapisz mój wybór zgód</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
