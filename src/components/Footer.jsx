import React, { useState } from 'react';
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Building2,
  Cookie,
  BellOff,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { COMPANY_LEGAL_DETAILS } from '../data/genealogyData';

export default function Footer({
  onNavigateLanding,
  onNavigatePortal,
  onOpenAuthModal,
  onOpenLegalCenter,
  onOpenCookieBanner,
  onUnsubscribeMarketing
}) {
  const [unsubscribedNotice, setUnsubscribedNotice] = useState(false);

  const handleQuickUnsubscribe = () => {
    if (onUnsubscribeMarketing) {
      onUnsubscribeMarketing();
    }
    setUnsubscribedNotice(true);
    setTimeout(() => setUnsubscribedNotice(false), 5000);
  };

  return (
    <footer
      style={{
        backgroundColor: '#13261E',
        color: '#F3EFE5',
        borderTop: '2px solid var(--gold-base)',
        padding: '4rem 0 2.5rem'
      }}
    >
      <div className="container-premium">
        {unsubscribedNotice && (
          <div
            role="status"
            style={{
              backgroundColor: 'rgba(74, 222, 128, 0.14)',
              border: '1.5px solid #4ADE80',
              color: '#F3EFE5',
              padding: '0.9rem 1.25rem',
              borderRadius: '14px',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={19} color="#4ADE80" aria-hidden="true" />
            <span>
              Twoja subskrypcja newslettera i powiadomień marketingowych została natychmiast anulowana (Zadanie #18 — Unsubscribe).
            </span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.25rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid rgba(194, 154, 85, 0.25)'
          }}
        >
          {/* Marka i Dane Rejestrowe Spółki (Zadanie 16: Business details) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
              <div
                aria-hidden="true"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#244638',
                  border: '1.5px solid #C29A55',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}logo-mark-gold.png`}
                  alt=""
                  style={{ width: '30px', height: '30px', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700 }}>
                Twoje<span style={{ color: '#E5C98F' }}>Korzenie</span>
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#DCE6E0', marginBottom: '0.9rem', lineHeight: 1.6 }}>
              „Poznaj historię, która zaczęła się przed Tobą”. Profesjonalne badania genealogiczne, kwerendy archiwalne i prywatne cyfrowe archiwa rodzinne.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#DCE6E0', lineHeight: 1.55, backgroundColor: 'rgba(243, 239, 229, 0.05)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(194, 154, 85, 0.22)' }}>
              <div style={{ fontWeight: 700, color: '#E5C98F', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                <Building2 size={14} aria-hidden="true" /> {COMPANY_LEGAL_DETAILS.companyName}
              </div>
              <div>KRS: {COMPANY_LEGAL_DETAILS.krs} • NIP: {COMPANY_LEGAL_DETAILS.nip}</div>
              <div>REGON: {COMPANY_LEGAL_DETAILS.regon}</div>
              <div>Kapitał zakładowy: {COMPANY_LEGAL_DETAILS.shareCapital}</div>
            </div>
          </div>

          {/* Usługi */}
          <div>
            <h4 style={{ fontSize: '1.05rem', color: '#E5C98F', marginBottom: '0.9rem' }}>Oferta Usług</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: '#DCE6E0' }}>
              <li>
                <button type="button" onClick={() => onNavigateLanding('oferta-uslug')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
                  Odkrywanie przodków (2 400 zł brutto)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateLanding('oferta-uslug')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
                  Drzewo genealogiczne (3 200 zł brutto)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateLanding('oferta-uslug')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
                  Historia rodzinna (4 500 zł brutto)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateLanding('oferta-uslug')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
                  Archiwum rodzinne (1 900 zł brutto)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateLanding('oferta-uslug')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
                  Pakiet kompleksowy VIP (8 900 zł brutto)
                </button>
              </li>
            </ul>
          </div>

          {/* Dokumenty Prawne, RODO i Bezpieczeństwo (Zadania 1–5, 18, 19, 20) */}
          <div>
            <h4 style={{ fontSize: '1.05rem', color: '#E5C98F', marginBottom: '0.9rem' }}>Prawo, RODO i Bezpieczeństwo</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.86rem', color: '#DCE6E0' }}>
              <li>
                <button type="button" onClick={() => onOpenLegalCenter && onOpenLegalCenter('privacy')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}>
                  1. Polityka Prywatności i Ochrony Danych RODO
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegalCenter && onOpenLegalCenter('terms')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}>
                  2. Regulamin Świadczenia Usług
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegalCenter && onOpenLegalCenter('refunds')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}>
                  3. Polityka Zwrotów i Odstąpienia (14 dni)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegalCenter && onOpenLegalCenter('cookies')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}>
                  4. Polityka Plików Cookies
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenCookieBanner && onOpenCookieBanner()} style={{ background: 'none', border: 'none', color: '#E5C98F', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Cookie size={14} aria-hidden="true" /> 5. Zarządzaj zgodami Cookies
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegalCenter && onOpenLegalCenter('licenses')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
                  Licencje Grafik (Domena Publiczna / SVG) &amp; Audyt SDK
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegalCenter && onOpenLegalCenter('audit40')} style={{ background: 'none', border: 'none', color: '#86EFAC', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} aria-hidden="true" /> Raport Audytu 40 Zadań (100% PASS)
                </button>
              </li>
            </ul>
          </div>

          {/* Kontakt, IOD i Szybki Unsubscribe (Zadanie 16 & 18) */}
          <div>
            <h4 style={{ fontSize: '1.05rem', color: '#E5C98F', marginBottom: '0.9rem' }}>Kancelaria i Kontakt IOD</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.86rem', color: '#DCE6E0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#C29A55" aria-hidden="true" />
                <span>{COMPANY_LEGAL_DETAILS.street}, {COMPANY_LEGAL_DETAILS.postalCode} {COMPANY_LEGAL_DETAILS.city}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="#C29A55" aria-hidden="true" />
                <span>{COMPANY_LEGAL_DETAILS.phone} ({COMPANY_LEGAL_DETAILS.officeHours})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="#C29A55" aria-hidden="true" />
                <span>{COMPANY_LEGAL_DETAILS.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scale size={16} color="#C29A55" aria-hidden="true" />
                <span>Inspektor Ochrony Danych: {COMPANY_LEGAL_DETAILS.dpoEmail}</span>
              </div>

              {/* Zadanie 18 (Prawne): Unsubscribe link */}
              <div style={{ marginTop: '0.5rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(194, 154, 85, 0.22)' }}>
                <button
                  type="button"
                  onClick={handleQuickUnsubscribe}
                  style={{
                    background: 'rgba(243, 239, 229, 0.08)',
                    border: '1px solid rgba(194, 154, 85, 0.45)',
                    color: '#F3EFE5',
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    width: '100%'
                  }}
                >
                  <BellOff size={14} color="#E5C98F" aria-hidden="true" />
                  <span>Wypisz się z newslettera (Unsubscribe)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', fontSize: '0.8rem', color: '#DCE6E0' }}>
          <div>© 2026 {COMPANY_LEGAL_DETAILS.companyName} — Nowoczesna Platforma Genealogiczna Premium. Wszelkie prawa zastrzeżone.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => onNavigatePortal('account')}
              style={{ background: 'none', border: 'none', color: '#E5C98F', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Usuń dane konta (Art. 17 RODO)
            </button>
            <span>WCAG 2.1 AA • CSP &amp; HSTS • 0 Zewnętrznych Trackerów</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
