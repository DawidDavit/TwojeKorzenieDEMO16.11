import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Compass,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  BookOpen,
  MapPin,
  ScrollText,
  Award,
  X,
  Lock,
  Layers
} from 'lucide-react';
import { ServiceIllustration, AncestorPortrait } from './HeritageVisuals';
import { VERIFIED_CLIENT_REVIEWS } from '../data/genealogyData';
import AppPresentationShowcase from './AppPresentationShowcase';

export default function LandingPage({
  services,
  collaborationSteps,
  ancestors,
  onEnterPortal,
  onSelectServiceOrder
}) {
  const [selectedServiceDetail, setSelectedServiceDetail] = useState(null);
  const [servicesVisible, setServicesVisible] = useState(false);
  const servicesGridRef = useRef(null);

  useEffect(() => {
    const grid = servicesGridRef.current;
    if (!grid) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setServicesVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setServicesVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedServiceDetail) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedServiceDetail(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedServiceDetail]);

  const handleCardKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="archival-bg">
      {/* 2. HERO SECTION – Spektakularny pierwszy ekran */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '4.5rem 0 5.5rem',
          borderBottom: '1px solid var(--ivory-border)'
        }}
      >
        {/* Artystyczne tło z subtelnymi liniami drzewa genealogicznego i siatką kartograficzną */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 740"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0.42
          }}
        >
          <defs>
            <linearGradient id="heroTreeLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C29A55" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#244638" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#C29A55" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M-60,580 C280,540 420,310 740,330 C1060,350 1180,140 1500,120"
            fill="none"
            stroke="url(#heroTreeLine)"
            strokeWidth="2"
          />
          <path
            d="M120,720 C420,560 580,440 880,410 C1140,380 1280,260 1490,240"
            fill="none"
            stroke="#C29A55"
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
          <circle cx="740" cy="330" r="6" fill="#C29A55" />
          <circle cx="880" cy="410" r="5" fill="#244638" />
          <circle cx="1120" cy="245" r="7" fill="#C29A55" />
        </svg>

        <div className="container-premium" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.25rem',
              alignItems: 'center'
            }}
          >
            {/* Lewa kolumna: Typografia edytorska i CTA */}
            <div className="animate-fade-in" style={{ maxWidth: '640px' }}>
              <div className="gold-badge" style={{ marginBottom: '1.35rem' }}>
                <Sparkles size={14} />
                <span>Poznaj historię, która zaczęła się przed Tobą</span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.35rem, 4.4vw, 3.85rem)',
                  color: 'var(--forest-base)',
                  marginBottom: '1.4rem',
                  lineHeight: 1.12
                }}
              >
                Każda rodzina ma swoją historię.{' '}
                <span style={{ color: '#9E7836', fontStyle: 'italic', fontWeight: 500 }}>
                  Odkryj swoją.
                </span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1.08rem, 1.4vw, 1.24rem)',
                  color: 'var(--text-secondary)',
                  marginBottom: '2.25rem',
                  lineHeight: 1.7
                }}
              >
                Odnajdujemy ślady przeszłości, poznajemy losy Twoich przodków i tworzymy historię, którą przekażesz kolejnym pokoleniom. Połącz profesjonalne badania archiwalne z dostępem do prywatnego, cyfrowego skarbca Twojego rodu.
              </p>

              {/* Główne przyciski wymagane w specyfikacji */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.6rem' }}>
                <button
                  type="button"
                  onClick={() => onEnterPortal('dashboard')}
                  className="btn-primary"
                  style={{ fontSize: '1.05rem', padding: '1.05rem 2.1rem' }}
                >
                  <span>Odkryj swoje korzenie</span>
                  <ArrowRight size={19} />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('proces-wspolpracy')}
                  className="btn-secondary"
                  style={{ fontSize: '1.05rem', padding: '1.05rem 1.9rem' }}
                >
                  <span>Zobacz, jak to działa</span>
                </button>
              </div>

              {/* Filary zaufania (Zadanie 10 i 12: Rzetelne informacje bez niepotwierdzonych obietnic i ukrytych opłat) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  paddingTop: '1.6rem',
                  borderTop: '1px solid var(--ivory-border)'
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 700, color: 'var(--forest-base)' }}>
                    140+
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Archiwów państwowych i kościelnych
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 700, color: 'var(--gold-dark)' }}>
                    0 zł
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Za wstępną ocenę zachowania ksiąg
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 700, color: 'var(--forest-base)' }}>
                    Brak abonamentu
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Prywatne archiwum cyfrowe w cenie
                  </div>
                </div>
              </div>
            </div>

            {/* Prawa kolumna: Artystyczna kompozycja starych fotografii, dokumentów, map i drzewa genealogicznego */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  background: 'linear-gradient(150deg, #244638 0%, #162D23 100%)',
                  borderRadius: '28px',
                  padding: '1.75rem',
                  border: '1.5px solid rgba(194, 154, 85, 0.5)',
                  boxShadow: '0 24px 54px rgba(23, 47, 37, 0.24)',
                  color: '#F3EFE5',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span className="gold-badge-dark">
                    <Lock size={13} aria-hidden="true" /> Prywatna Przestrzeń Rodu
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#DCE6E0' }}>
                    Sygnatura: ARCH-KORZ-1874
                  </span>
                </div>

                {/* Wizualna kompozycja kart przodków i linii drzewa */}
                <div
                  style={{
                    backgroundColor: 'rgba(243, 239, 229, 0.06)',
                    border: '1px solid rgba(194, 154, 85, 0.28)',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    marginBottom: '1.15rem'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E5C98F', marginBottom: '0.85rem' }}>
                    Fragment Interaktywnego Drzewa Genealogicznego (Pokolenie III–IV)
                  </div>

                  {/* Karta Pradziadka */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onEnterPortal('tree')}
                    onKeyDown={(e) => handleCardKeyDown(e, () => onEnterPortal('tree'))}
                    aria-label="Otwórz drzewo genealogiczne: dr Ignacy Korzeniowski (1874–1934)"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.9rem',
                      backgroundColor: '#F3EFE5',
                      color: '#172A22',
                      padding: '0.85rem 1rem',
                      borderRadius: '14px',
                      border: '1.5px solid #C29A55',
                      cursor: 'pointer',
                      marginBottom: '0.9rem'
                    }}
                  >
                    <AncestorPortrait ancestor={ancestors.find((a) => a.id === 'anc-8') || ancestors[0]} size={56} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold-dark)', textTransform: 'uppercase' }}>
                        Pradziadek • Nowe odkrycie z 1923 r.
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.08rem', fontWeight: 700, color: '#244638' }}>
                        dr Ignacy Korzeniowski (1874–1934)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Złoczów / Lwów • Sędzia Sądu Apelacyjnego
                      </div>
                    </div>
                  </div>

                  {/* Złote linie łączące */}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.4rem 0 0.4rem' }} aria-hidden="true">
                    <svg width="200" height="28" viewBox="0 0 200 28">
                      <path d="M100 0 L100 14 M45 14 L155 14 M45 14 L45 28 M155 14 L155 28" stroke="#C29A55" strokeWidth="2" fill="none" />
                    </svg>
                  </div>

                  {/* Dwie karty dziadków */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onEnterPortal('story')}
                      onKeyDown={(e) => handleCardKeyDown(e, () => onEnterPortal('story'))}
                      aria-label="Otwórz biografię: inż. Tadeusz Korzeniowski"
                      style={{
                        backgroundColor: 'rgba(243, 239, 229, 0.96)',
                        color: '#172A22',
                        padding: '0.7rem',
                        borderRadius: '12px',
                        border: '1px solid #D8CEB8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                      }}
                    >
                      <AncestorPortrait ancestor={ancestors.find((a) => a.id === 'anc-4') || ancestors[0]} size={42} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '0.88rem', color: '#244638' }}>
                          inż. Tadeusz
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1912–1989 • Lwów</div>
                      </div>
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onEnterPortal('story')}
                      onKeyDown={(e) => handleCardKeyDown(e, () => onEnterPortal('story'))}
                      aria-label="Otwórz biografię: Zofia z Zamoyskich"
                      style={{
                        backgroundColor: 'rgba(243, 239, 229, 0.96)',
                        color: '#172A22',
                        padding: '0.7rem',
                        borderRadius: '12px',
                        border: '1px solid #D8CEB8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                      }}
                    >
                      <AncestorPortrait ancestor={ancestors.find((a) => a.id === 'anc-5') || ancestors[0]} size={42} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '0.88rem', color: '#244638' }}>
                          Zofia z Zamoyskich
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1916–2004 • Krzemieniec</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dolne karty archiwalne: Dokument 1923 + Mapa historyczna */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onEnterPortal('archive')}
                    onKeyDown={(e) => handleCardKeyDown(e, () => onEnterPortal('archive'))}
                    aria-label="Otwórz Cyfrowe Archiwum: Dekret Sędziego Apelacyjnego we Lwowie z 1923 r."
                    style={{
                      backgroundColor: '#EDE3CE',
                      color: '#2B2114',
                      padding: '0.9rem',
                      borderRadius: '14px',
                      border: '1px solid #C29A55',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#563D12', textTransform: 'uppercase' }}>
                      Skan Archiwalny • AAN 1923
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '0.92rem', marginTop: '0.2rem' }}>
                      Dekret Sędziego Apelacyjnego we Lwowie
                    </div>
                    <div style={{ fontSize: '0.75rem', fontStyle: 'italic', marginTop: '0.3rem', color: '#3D2E18' }}>
                      „Mianuję Pana Doktora Praw Ignacego Korzeniowskiego...”
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onEnterPortal('story')}
                    onKeyDown={(e) => handleCardKeyDown(e, () => onEnterPortal('story'))}
                    aria-label="Otwórz szlak migracji rodu w Panelu Klienta"
                    style={{
                      backgroundColor: 'rgba(194, 154, 85, 0.14)',
                      border: '1px solid rgba(194, 154, 85, 0.4)',
                      borderRadius: '14px',
                      padding: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#E5C98F', fontSize: '0.75rem', fontWeight: 600 }}>
                      <MapPin size={14} aria-hidden="true" /> Szlak Rodu
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: '#F3EFE5' }}>
                      Lwów → Wilno → Krzemieniec → Kraków
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#DCE6E0', textDecoration: 'underline' }}>
                      Przejdź do Panelu Klienta →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5. PREZENTACJA APLIKACJI – 5 Warstwowych Kafelków */}
      <AppPresentationShowcase onEnterPortal={onEnterPortal} />

      {/* 3. OFERTA USŁUG – 5 Kart Usług Premium */}
      <section id="oferta-uslug" style={{ padding: '5.5rem 0' }}>
        <div className="container-premium">
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.25rem' }}>
            <div className="gold-badge" style={{ marginBottom: '0.9rem' }}>
              <Award size={14} /> Oferta Usług Genealogicznych
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.2vw, 2.85rem)', color: 'var(--forest-base)', marginBottom: '1rem' }}>
              Wybierz zakres badań dopasowany do historii Twojej rodziny
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem' }}>
              Każda usługa obejmuje bezpłatną wstępną ocenę archiwalną oraz prywatny dostęp do Twojej przestrzeni w platformie TwojeKorzenie.
            </p>
          </div>

          <div ref={servicesGridRef} className="services-showcase-grid">
            {services.map((service, idx) => {
              const isFlagship = service.id === 'pakiet-kompleksowy';
              const stepNumber = String(idx + 1).padStart(2, '0');

              return (
                <article
                  key={service.id}
                  className={`service-card ${isFlagship ? 'service-card--flagship' : ''} ${servicesVisible ? 'is-visible' : ''}`}
                  style={{ transitionDelay: servicesVisible ? `${idx * 60}ms` : '0ms' }}
                >
                  <div className="service-card-body">
                    <div className="service-illustration-frame">
                      <ServiceIllustration type={service.illustrationType} />
                      <span className="service-step-chip" aria-hidden="true">
                        {stepNumber}
                      </span>
                    </div>

                    <div className="service-card-meta">
                      <span className={isFlagship ? 'gold-badge-dark' : 'gold-badge'}>
                        {service.badge}
                      </span>
                      <span className="service-duration">Czas: {service.duration}</span>
                    </div>

                    <h3 className="service-card-title">{service.title}</h3>
                    <div className="service-card-subtitle">{service.subtitle}</div>
                    <p className="service-card-desc">{service.shortDesc}</p>

                    <ul className="service-benefits-list">
                      {service.benefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="service-benefit-item">
                          <CheckCircle2
                            size={16}
                            color={isFlagship ? '#E5C98F' : '#244638'}
                            style={{ flexShrink: 0, marginTop: '0.2rem' }}
                          />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cena i przyciski akcji */}
                  <div className="service-card-footer">
                    <div className="service-price-row">
                      <span className="service-price-label">Cena całkowita brutto:</span>
                      <span className="service-price-value">{service.price}</span>
                    </div>
                    <div className="service-price-netto">{service.priceNetto}</div>
                    <div className="service-valuation-info">{service.valuationInfo}</div>

                    <div className="service-actions-row">
                      <button
                        type="button"
                        onClick={() => setSelectedServiceDetail(service)}
                        className={isFlagship ? 'btn-outline-ivory' : 'btn-secondary'}
                        style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                      >
                        Poznaj szczegóły
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectServiceOrder(service)}
                        className={isFlagship ? 'btn-gold service-cta-btn' : 'btn-primary service-cta-btn'}
                        style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                      >
                        <span>Zamów usługę</span>
                        <ArrowRight size={15} className="service-card-cta-arrow" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEKCYJNY PROCES WSPÓŁPRACY (5 KROKÓW) */}
      <section
        id="proces-wspolpracy"
        className="forest-surface"
        style={{ padding: '5.5rem 0', borderTop: '2px solid var(--gold-base)', borderBottom: '2px solid var(--gold-base)' }}
      >
        <div className="container-premium">
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.5rem' }}>
            <div className="gold-badge-dark" style={{ marginBottom: '0.9rem' }}>
              <Compass size={14} /> Proces Współpracy
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.2vw, 2.75rem)', color: '#F3EFE5', marginBottom: '1rem' }}>
              Od pierwszego wspomnienia do cyfrowego archiwum Twojej rodziny
            </h2>
            <p style={{ color: '#C9D5CE', fontSize: '1.06rem' }}>
              Przeprowadzamy Cię za rękę przez cały proces poszukiwań archiwalnych, zapewniając pełną transparentność na każdym z 5 etapów.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {collaborationSteps.map((item, idx) => (
              <div
                key={item.step}
                className="stagger-item"
                style={{
                  '--stagger-index': idx,
                  backgroundColor: 'rgba(243, 239, 229, 0.06)',
                  border: '1px solid rgba(194, 154, 85, 0.35)',
                  borderRadius: '20px',
                  padding: '1.6rem',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '2.1rem',
                        fontWeight: 700,
                        color: 'var(--gold-base)',
                        lineHeight: 1
                      }}
                    >
                      {item.step}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#C9D5CE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Etap {idx + 1} z 5
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.22rem', color: '#F3EFE5', marginBottom: '0.75rem' }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: '0.92rem', color: '#D7E0DA', marginBottom: '0.9rem' }}>
                    {item.description}
                  </p>
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#E5C98F',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid rgba(194, 154, 85, 0.22)'
                  }}
                >
                  {item.detail}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              type="button"
              onClick={() => onEnterPortal('dashboard')}
              className="btn-gold"
              style={{ fontSize: '1.05rem', padding: '1.05rem 2.3rem' }}
            >
              <span>Przetestuj Prywatny Panel Klienta na żywo</span>
              <ArrowRight size={19} />
            </button>
          </div>
        </div>
      </section>

      {/* ZAPOWIEDŹ PANELU KLIENTA – PEREŁKA PROJEKTU */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container-premium">
          <div
            className="heritage-card"
            style={{
              padding: 'clamp(1.75rem, 4vw, 3.25rem)',
              background: 'linear-gradient(135deg, #FAF8F2 0%, #EFE9DA 100%)',
              border: '1.5px solid var(--gold-base)'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
              <div>
                <div className="gold-badge" style={{ marginBottom: '1rem' }}>
                  <Layers size={14} /> Serce Platformy TwojeKorzenie
                </div>
                <h2 style={{ fontSize: 'clamp(1.85rem, 3vw, 2.5rem)', color: 'var(--forest-base)', marginBottom: '1rem' }}>
                  Więcej niż raport. Otrzymujesz własne Muzeum Cyfrowe Rodziny.
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.02rem' }}>
                  Po zakupie usługi logujesz się do dedykowanego Panelu Klienta, w którym każde pokolenie, dokument i fotografia tworzą interaktywną opowieść.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <button type="button" onClick={() => onEnterPortal('dashboard')} className="btn-primary">
                    Otwórz Dashboard Klienta
                  </button>
                  <button type="button" onClick={() => onEnterPortal('tree')} className="btn-secondary">
                    Zobacz Interaktywne Drzewo 2D
                  </button>
                  <button type="button" onClick={() => onEnterPortal('story')} className="btn-secondary">
                    Zobacz Storytelling Przodka
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ backgroundColor: '#244638', color: '#F3EFE5', padding: '1.35rem', borderRadius: '18px' }}>
                  <ScrollText size={26} color="#C29A55" />
                  <h3 style={{ fontSize: '1.15rem', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
                    Cyfrowe Archiwum
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#C9D5CE' }}>
                    Skany aktów urodzenia, małżeństwa, zgonu, map katastralnych i listów z transkrypcją.
                  </p>
                </div>
                <div style={{ backgroundColor: '#FAF8F2', border: '1px solid var(--ivory-border)', padding: '1.35rem', borderRadius: '18px' }}>
                  <BookOpen size={26} color="#244638" />
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--forest-base)', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
                    Storytelling Rodu
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Chronologiczne biografie z mapą migracji i powiązaniami rodzinnymi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ZWERYFIKOWANE RELACJE KLIENTÓW ZGODNE Z DYREKTYWĄ OMNIBUS (Zadanie 11: No fake reviews) */}
      <section style={{ padding: '0 0 5.5rem' }}>
        <div className="container-premium">
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 2.75rem' }}>
            <div className="gold-badge" style={{ marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} aria-hidden="true" /> Autentyczne Referencje (Zgodność z Dyrektywą Omnibus)
            </div>
            <h2 style={{ fontSize: 'clamp(1.85rem, 3vw, 2.55rem)', color: 'var(--forest-base)', marginBottom: '0.8rem' }}>
              Zweryfikowane relacje rodzin i sygnatury zrealizowanych badań
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Nie publikujemy anonimowych ani generowanych opinii. Każda poniższa relacja pochodzi od rzeczywistego zleceniodawcy i została powiązana z numerem protokołu odbioru Księgi Rodu oraz opłaconą fakturą VAT.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {VERIFIED_CLIENT_REVIEWS.map((rev) => (
              <article
                key={rev.id}
                className="heritage-card"
                style={{
                  padding: '1.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.15rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className="gold-badge" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle2 size={12} aria-hidden="true" /> Sygnatura: {rev.orderRef}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{rev.date}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.98rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>
                    „{rev.quote}”
                  </p>
                </div>

                <div style={{ paddingTop: '0.9rem', borderTop: '1px solid var(--ivory-border)', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--forest-base)', fontSize: '0.95rem' }}>
                    {rev.clientName} ({rev.city})
                  </div>
                  <div style={{ color: 'var(--gold-dark)', fontWeight: 600, marginTop: '0.15rem' }}>
                    Usługa: {rev.serviceName}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                    {rev.verificationMethod}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL SZCZEGÓŁÓW USŁUGI („Poznaj szczegóły”) */}
      {selectedServiceDetail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-service-title"
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
          onClick={() => setSelectedServiceDetail(null)}
        >
          <div
            className="heritage-card modal-panel-enter"
            style={{
              maxWidth: '680px',
              width: '100%',
              padding: '2.25rem',
              backgroundColor: 'var(--ivory-light)',
              border: '2px solid var(--gold-base)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="gold-badge">{selectedServiceDetail.badge}</span>
                <h3 id="modal-service-title" style={{ fontSize: '1.85rem', color: 'var(--forest-base)', marginTop: '0.5rem' }}>
                  {selectedServiceDetail.title}
                </h3>
                <div style={{ color: '#9E7836', fontWeight: 600 }}>{selectedServiceDetail.subtitle}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedServiceDetail(null)}
                aria-label="Zamknij szczegóły"
                style={{
                  background: 'var(--ivory-muted)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-primary)', fontSize: '1.02rem', marginBottom: '1.4rem', lineHeight: 1.7 }}>
              {selectedServiceDetail.fullDesc}
            </p>

            <div
              style={{
                backgroundColor: 'var(--ivory-base)',
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid var(--ivory-border)',
                marginBottom: '1.4rem'
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--forest-base)', marginBottom: '0.75rem' }}>
                Co dokładnie otrzymujesz w ramach usługi:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {selectedServiceDetail.benefits.map((b, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.94rem' }}>
                    <CheckCircle2 size={18} color="#244638" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cena całkowita brutto (z 23% VAT):</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--forest-base)' }}>
                  {selectedServiceDetail.price}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 600 }}>{selectedServiceDetail.priceNetto}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedServiceDetail.valuationInfo}</div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    const srv = selectedServiceDetail;
                    setSelectedServiceDetail(null);
                    onSelectServiceOrder(srv);
                  }}
                  className="btn-gold"
                >
                  <span>Zamów i utwórz Archiwum</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
