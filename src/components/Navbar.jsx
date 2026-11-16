import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Sparkles,
  LogIn,
  LogOut,
  Menu,
  X,
  Compass,
  FolderArchive
} from 'lucide-react';

export default function Navbar({
  activeArea,
  setActiveArea,
  portalSection,
  setPortalSection,
  dataMode,
  onToggleDataMode,
  clientAccount,
  isAuthenticated,
  userRole,
  onOpenAuthModal,
  onLogout,
  onOpenLegalCenter
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLandingTab, setActiveLandingTab] = useState('home'); // 'home' | 'oferta-uslug' | 'proces-wspolpracy'

  useEffect(() => {
    if (activeArea !== 'landing') return undefined;
    const handleScroll = () => {
      const ofertaEl = document.getElementById('oferta-uslug');
      const procesEl = document.getElementById('proces-wspolpracy');
      const scrollY = window.scrollY + 180;
      if (procesEl && scrollY >= procesEl.offsetTop) {
        setActiveLandingTab('proces-wspolpracy');
      } else if (ofertaEl && scrollY >= ofertaEl.offsetTop) {
        setActiveLandingTab('oferta-uslug');
      } else {
        setActiveLandingTab('home');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeArea]);

  const handleGoPortal = (section = 'dashboard') => {
    setActiveArea('portal');
    setPortalSection(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoLanding = (anchorId = null) => {
    setActiveArea('landing');
    setActiveLandingTab(anchorId || 'home');
    setMobileMenuOpen(false);
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getNavTabStyle = (isActive, isPortalHighlight = false) => ({
    padding: '0.46rem 0.78rem',
    borderRadius: '999px',
    border: isActive ? '1.5px solid var(--gold-base)' : '1.5px solid transparent',
    backgroundColor: isActive
      ? isPortalHighlight
        ? 'var(--gold-soft)'
        : 'var(--forest-base)'
      : 'transparent',
    color: isActive
      ? isPortalHighlight
        ? 'var(--forest-base)'
        : 'var(--ivory-base)'
      : isPortalHighlight
      ? 'var(--forest-base)'
      : 'var(--text-secondary)',
    fontWeight: isActive ? 700 : isPortalHighlight ? 600 : 500,
    fontSize: '0.86rem',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease'
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(243, 239, 229, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ivory-border)',
        boxShadow: '0 4px 20px rgba(23, 47, 37, 0.05)'
      }}
    >
      {/* Zadanie 15 (WCAG): Link „Przejdź do głównej treści” dla nawigacji klawiaturą */}
      <a href="#main-content" className="skip-to-content">
        Przejdź bezpośrednio do głównej treści
      </a>

      {/* Główny pasek nawigacji */}
      <div
        className="container-premium"
        style={{
          height: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        {/* Sygnet i logotyp marki TwojeKorzenie */}
        <button
          type="button"
          onClick={() => handleGoLanding()}
          aria-label="TwojeKorzenie — Przejdź do strony głównej"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--forest-base)',
              border: '1.5px solid var(--gold-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(36, 70, 56, 0.2)',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}logo-mark-gold.png`}
              alt=""
              style={{ width: '34px', height: '34px', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.42rem',
                fontWeight: 700,
                color: 'var(--forest-base)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}
            >
              Twoje<span style={{ color: 'var(--gold-dark)' }}>Korzenie</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              Dom Badań Genealogicznych
            </div>
          </div>
        </button>

        {/* Nawigacja Desktop */}
        <nav
          aria-label="Główna nawigacja"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
          className="desktop-nav"
        >
          <button
            type="button"
            aria-current={activeArea === 'landing' && activeLandingTab === 'home' ? 'page' : undefined}
            onClick={() => handleGoLanding()}
            style={getNavTabStyle(activeArea === 'landing' && activeLandingTab === 'home')}
          >
            Strona główna
          </button>

          <button
            type="button"
            aria-current={activeArea === 'landing' && activeLandingTab === 'oferta-uslug' ? 'page' : undefined}
            onClick={() => handleGoLanding('oferta-uslug')}
            style={getNavTabStyle(activeArea === 'landing' && activeLandingTab === 'oferta-uslug')}
          >
            Oferta usług
          </button>

          <button
            type="button"
            aria-current={activeArea === 'landing' && activeLandingTab === 'proces-wspolpracy' ? 'page' : undefined}
            onClick={() => handleGoLanding('proces-wspolpracy')}
            style={getNavTabStyle(activeArea === 'landing' && activeLandingTab === 'proces-wspolpracy')}
          >
            Jak to działa
          </button>

          <button
            type="button"
            aria-current={activeArea === 'portal' && portalSection === 'tree' ? 'page' : undefined}
            onClick={() => handleGoPortal('tree')}
            style={getNavTabStyle(activeArea === 'portal' && portalSection === 'tree', true)}
          >
            <Compass size={16} color="#6E501D" aria-hidden="true" />
            <span>Interaktywne Drzewo</span>
          </button>

          <button
            type="button"
            aria-current={activeArea === 'portal' && portalSection === 'archive' ? 'page' : undefined}
            onClick={() => handleGoPortal('archive')}
            style={getNavTabStyle(activeArea === 'portal' && portalSection === 'archive', true)}
          >
            <FolderArchive size={16} color="#6E501D" aria-hidden="true" />
            <span>Cyfrowe Archiwum</span>
          </button>
        </nav>

        {/* Prawa strona: Przełącznik Panelu Klienta i Konta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => onOpenAuthModal('account')}
                className="btn-secondary"
                style={{
                  padding: '0.48rem 0.85rem',
                  fontSize: '0.84rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                title="Przejdź do ustawień konta"
              >
                <UserCheck size={15} color="#244638" aria-hidden="true" />
                <span>
                  {clientAccount.firstName} {clientAccount.lastName}
                  {userRole === 'admin' ? ' (Admin)' : ''}
                </span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="btn-secondary"
                style={{
                  padding: '0.48rem',
                  width: '36px',
                  height: '36px',
                  flexShrink: 0
                }}
                title="Bezpieczne wylogowanie z sesji"
                aria-label="Wyloguj się"
              >
                <LogOut size={15} aria-hidden="true" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuthModal('login')}
              className="btn-secondary"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.86rem',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <LogIn size={16} aria-hidden="true" />
              <span>Zaloguj się</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleGoPortal('dashboard')}
            className={activeArea === 'portal' ? 'btn-gold' : 'btn-primary'}
            style={{
              padding: '0.52rem 1.05rem',
              fontSize: '0.86rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              gap: '0.45rem'
            }}
          >
            {activeArea === 'portal' ? (
              <span
                aria-hidden="true"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#172F25',
                  flexShrink: 0
                }}
              />
            ) : (
              <Sparkles size={15} aria-hidden="true" style={{ flexShrink: 0 }} />
            )}
            <span>Panel Klienta</span>
          </button>

          {/* Przycisk menu mobilnego */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Zamknij menu nawigacji' : 'Otwórz menu nawigacji'}
            aria-expanded={mobileMenuOpen}
            style={{
              display: 'none',
              padding: '0.55rem',
              borderRadius: '10px',
              border: '1px solid var(--ivory-border)',
              background: 'var(--ivory-light)',
              color: 'var(--forest-base)',
              cursor: 'pointer'
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Responsywne style dla mniejszych ekranów */}
      <style>{`
        @media (max-width: 1180px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>

      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--ivory-light)',
            borderBottom: '2px solid var(--gold-base)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <button type="button" onClick={() => handleGoLanding()} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
            Strona główna
          </button>
          <button type="button" onClick={() => handleGoLanding('oferta-uslug')} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
            Oferta usług genealogicznych
          </button>
          <button type="button" onClick={() => handleGoLanding('proces-wspolpracy')} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
            Proces współpracy (5 kroków)
          </button>
          <button type="button" onClick={() => handleGoPortal('dashboard')} className="btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }}>
            Panel Klienta — Mój Dashboard
          </button>
          <button type="button" onClick={() => handleGoPortal('tree')} className="btn-gold" style={{ width: '100%', justifyContent: 'flex-start' }}>
            Interaktywne Drzewo Genealogiczne
          </button>
          <button type="button" onClick={() => handleGoPortal('story')} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
            Historia Rodzinna (Storytelling)
          </button>
          <button type="button" onClick={() => handleGoPortal('archive')} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
            Cyfrowe Archiwum Rodzinne
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenLegalCenter) onOpenLegalCenter('audit40');
            }}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Audyt 40 Zadań (Security &amp; RODO)
          </button>
        </div>
      )}
    </header>
  );
}
