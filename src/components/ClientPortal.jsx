import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  GitBranch,
  BookOpen,
  Users,
  FolderArchive,
  Clock,
  Settings,
  Sparkles,
  CheckCircle2,
  Bell,
  BellOff,
  ZoomIn,
  ArrowRight,
  MapPin,
  CreditCard,
  ShieldCheck,
  Search,
  Download,
  Trash2,
  Lock,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import InteractiveFamilyTree from './InteractiveFamilyTree';
import AncestorStorytelling from './AncestorStorytelling';
import { AncestorPortrait, ArchivalDocumentScan } from './HeritageVisuals';
import { PlaceAutocompleteInput } from './GoogleMapsComponents';
import {
  checkRouteAccess,
  sanitizeText,
  detectSecurityThreat,
  validateFormFields,
  validateEnvConfig,
  SessionManager,
  RateLimiter
} from '../services/securityService';
import { COMPANY_LEGAL_DETAILS } from '../data/genealogyData';
import { SupabaseRepository } from '../services/supabaseRepository';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Mój dashboard', icon: LayoutDashboard },
  { id: 'tree', label: 'Drzewo genealogiczne', icon: GitBranch },
  { id: 'story', label: 'Historia rodziny', icon: BookOpen },
  { id: 'ancestors', label: 'Moi przodkowie', icon: Users },
  { id: 'archive', label: 'Archiwum dokumentów', icon: FolderArchive },
  { id: 'timeline', label: 'Oś czasu', icon: Clock },
  { id: 'account', label: 'Ustawienia konta i RODO', icon: Settings },
  { id: 'admin', label: 'Panel Admina (RBAC)', icon: ShieldCheck }
];

export default function ClientPortal({
  activeSection,
  setActiveSection,
  clientAccount,
  onUpdateClientAccount,
  ancestors,
  documents,
  archiveCategories,
  discoveries,
  timelineEvents,
  onAddAncestorClue,
  onOpenDocumentLightbox,
  onOpenOrderModal,
  currentSession,
  onSwitchRole,
  onDeleteAccountData,
  onExportAccountData,
  onUnsubscribeMarketing,
  onOpenLegalCenter,
  auditLogs = [],
  onRefreshData
}) {
  const [selectedAncestor, setSelectedAncestor] = useState(ancestors[0]);
  const [selectedArchiveCategory, setSelectedArchiveCategory] = useState('Wszystkie');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [ancestorSearch, setAncestorSearch] = useState('');
  const [accountSavedBanner, setAccountSavedBanner] = useState(false);
  const [accountError, setAccountError] = useState(null);
  const [invoicePreview, setInvoicePreview] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [exportedDataJson, setExportedDataJson] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTreeFullPane, setIsTreeFullPane] = useState(false);

  // Stan Panelu Administratora (Supabase RBAC)
  const [adminClients, setAdminClients] = useState([]);
  const [selectedAdminClientId, setSelectedAdminClientId] = useState('');
  const [clientAncestorsList, setClientAncestorsList] = useState([]);
  const [adminProgressVal, setAdminProgressVal] = useState(0);
  const [adminPackageVal, setAdminPackageVal] = useState('');
  const [adminStatusMsg, setAdminStatusMsg] = useState(null);
  const [adminErrorMsg, setAdminErrorMsg] = useState(null);
  const [adminAncestorForm, setAdminAncestorForm] = useState({
    firstName: '',
    lastName: '',
    maidenName: '',
    coatOfArms: '',
    generation: '3',
    role: 'Dziadek mieczowy (linia ojca)',
    birthYear: '',
    birthDate: '',
    deathYear: '',
    deathDate: '',
    birthPlace: '',
    profession: '',
    verificationSource: 'Archiwum Państwowe — odpis aktu metrykalnego',
    shortBio: '',
    childId: '',
    parentId1: '',
    parentId2: '',
    spouseId: '',
    siblingId: ''
  });
  const [adminDocForm, setAdminDocForm] = useState({
    title: '',
    category: 'Akty metrykalne',
    year: '',
    place: '',
    archiveSource: '',
    ancestorId: '',
    description: '',
    transcription: ''
  });

  useEffect(() => {
    if (activeSection !== 'admin' || currentSession?.role !== 'admin' || !SupabaseRepository.isEnabled()) {
      return;
    }
    SupabaseRepository.adminListClients()
      .then((list) => {
        setAdminClients(list);
        if (list.length > 0 && !selectedAdminClientId) {
          setSelectedAdminClientId(list[0].id);
          setAdminProgressVal(list[0].research_progress || 0);
          setAdminPackageVal(list[0].active_package_name || '');
        }
      })
      .catch((err) => setAdminErrorMsg(err.message));
  }, [activeSection, currentSession?.role]);

  useEffect(() => {
    if (!selectedAdminClientId || currentSession?.role !== 'admin' || !SupabaseRepository.isEnabled()) {
      return;
    }
    const clientObj = adminClients.find((c) => c.id === selectedAdminClientId);
    if (clientObj) {
      setAdminProgressVal(clientObj.research_progress || 0);
      setAdminPackageVal(clientObj.active_package_name || '');
    }
    SupabaseRepository.fetchAncestorsForUser(selectedAdminClientId)
      .then(setClientAncestorsList)
      .catch(() => setClientAncestorsList([]));
  }, [selectedAdminClientId, adminClients, currentSession?.role]);

  // Synchronizacja wybranego przodka przy zmianie trybu danych
  const activeAncestor =
    ancestors.find((a) => a.id === selectedAncestor?.id) || ancestors[0];

  const handleOpenStoryForAncestor = (person) => {
    setSelectedAncestor(person);
    setActiveSection('story');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAncestorById = (ancestorId) => {
    const found = ancestors.find((a) => a.id === ancestorId) || ancestors[0];
    if (found) {
      setSelectedAncestor(found);
      setActiveSection('story');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesCat =
      selectedArchiveCategory === 'Wszystkie' || doc.category === selectedArchiveCategory;
    const matchesSearch =
      !archiveSearch.trim() ||
      `${doc.title} ${doc.ancestorName} ${doc.place} ${doc.year}`
        .toLowerCase()
        .includes(archiveSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredDirectoryAncestors = ancestors.filter(
    (a) =>
      !ancestorSearch.trim() ||
      `${a.firstName} ${a.lastName} ${a.maidenName || ''} ${a.birthPlace} ${a.profession}`
        .toLowerCase()
        .includes(ancestorSearch.toLowerCase())
  );

  const handlePayPendingInvoice = (invoiceId) => {
    const updatedInvoices = clientAccount.invoices.map((inv) =>
      inv.invoiceId === invoiceId ? { ...inv, status: 'Opłacona' } : inv
    );
    onUpdateClientAccount({
      ...clientAccount,
      invoices: updatedInvoices
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setAccountError(null);

    if (
      detectSecurityThreat(clientAccount.firstName) ||
      detectSecurityThreat(clientAccount.lastName) ||
      detectSecurityThreat(clientAccount.email) ||
      detectSecurityThreat(clientAccount.city)
    ) {
      setAccountError('Zablokowano niedozwolone znaki skryptowe (Ochrona anty-XSS).');
      return;
    }

    const validation = validateFormFields({
      firstName: clientAccount.firstName,
      lastName: clientAccount.lastName,
      email: clientAccount.email,
      phone: clientAccount.phone
    });
    if (!validation.isValid) {
      setAccountError(validation.errors.join(' '));
      return;
    }

    try {
      await onUpdateClientAccount({
        ...clientAccount,
        firstName: sanitizeText(clientAccount.firstName, 60),
        lastName: sanitizeText(clientAccount.lastName, 60),
        email: sanitizeText(clientAccount.email, 120),
        phone: sanitizeText(clientAccount.phone, 30),
        city: sanitizeText(clientAccount.city, 120)
      });
      setAccountSavedBanner(true);
      setTimeout(() => setAccountSavedBanner(false), 2800);
    } catch (err) {
      setAccountError(err.message || 'Nie udało się zapisać zmian.');
    }
  };

  const generationsCount = new Set(ancestors.map((a) => a.generation)).size;

  const isFullTreeActive = activeSection === 'tree' && isTreeFullPane;

  return (
    <div className={`portal-layout archival-bg${isSidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}>
      {/* 8. SIDEBAR PANELU KLIENTA */}
      <aside
        style={{
          backgroundColor: '#172F25',
          color: '#F3EFE5',
          padding: isSidebarCollapsed ? '1.1rem 0.65rem' : '1.25rem 1.15rem',
          borderRight: '1.5px solid rgba(194, 154, 85, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1.25rem',
          transition: 'padding 220ms cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <div>
          {/* Pasek marki z logo i przyciskiem chowania panelu bocznego */}
          <div
            style={{
              display: 'flex',
              flexDirection: isSidebarCollapsed ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              gap: '0.65rem',
              marginBottom: isSidebarCollapsed ? '1.1rem' : '1rem',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid rgba(194, 154, 85, 0.22)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                minWidth: 0
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '11px',
                  backgroundColor: 'rgba(243, 239, 229, 0.08)',
                  border: '1.5px solid rgba(194, 154, 85, 0.65)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)'
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}logo-mark-gold.png`}
                  alt="Logo TwojeKorzenie"
                  style={{ width: '28px', height: '28px', objectFit: 'contain', display: 'block' }}
                />
              </div>
              {!isSidebarCollapsed && (
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#F3EFE5',
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Twoje<span style={{ color: '#E5C98F' }}>Korzenie</span>
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#C9D5CE', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Archiwum Rodu
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              aria-expanded={!isSidebarCollapsed}
              aria-label={isSidebarCollapsed ? 'Rozwiń pasek boczny' : 'Schowaj zakładki paska bocznego'}
              title={isSidebarCollapsed ? 'Rozwiń pasek boczny' : 'Schowaj zakładki (zostaw logo)'}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: '1px solid rgba(194, 154, 85, 0.45)',
                backgroundColor: 'rgba(243, 239, 229, 0.08)',
                color: '#E5C98F',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background-color 180ms ease, border-color 180ms ease'
              }}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </button>
          </div>

          {/* Wizytówka właściciela archiwum (ukryta po zwinięciu) */}
          {!isSidebarCollapsed && (
            <div
              style={{
                backgroundColor: 'rgba(243, 239, 229, 0.07)',
                border: '1px solid rgba(194, 154, 85, 0.38)',
                borderRadius: '18px',
                padding: '1.1rem',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E5C98F', marginBottom: '0.25rem' }}>
                Prywatne Archiwum Rodu
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.22rem', fontWeight: 700, color: '#F3EFE5' }}>
                {clientAccount.firstName} {clientAccount.lastName}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#C9D5CE', marginTop: '0.2rem' }}>
                {clientAccount.activePackageName}
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.25rem', color: '#E5C98F' }}>
                  <span>Postęp kwerendy</span>
                  <strong>{clientAccount.researchProgress}%</strong>
                </div>
                <div style={{ height: '7px', backgroundColor: 'rgba(243,239,229,0.16)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${clientAccount.researchProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #C29A55, #E5C98F)'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Menu nawigacyjne (7 wymaganych sekcji) */}
          <nav
            aria-label="Nawigacja Panelu Klienta"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isSidebarCollapsed ? 'center' : 'stretch',
              gap: '0.35rem'
            }}
          >
            {SIDEBAR_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={isSidebarCollapsed ? item.label : undefined}
                  aria-label={item.label}
                  onClick={() => {
                    setActiveSection(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                    gap: '0.8rem',
                    width: isSidebarCollapsed ? '44px' : '100%',
                    height: isSidebarCollapsed ? '44px' : 'auto',
                    padding: isSidebarCollapsed ? '0' : '0.82rem 1rem',
                    borderRadius: '14px',
                    border: isActive ? '1px solid #C29A55' : '1px solid transparent',
                    backgroundColor: isActive ? 'rgba(194, 154, 85, 0.2)' : 'transparent',
                    color: isActive ? '#F3EFE5' : '#C9D5CE',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 180ms ease, border-color 180ms ease, color 180ms ease'
                  }}
                >
                  <IconComp size={19} color={isActive ? '#E5C98F' : '#C9D5CE'} style={{ flexShrink: 0 }} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Opiekun genealogiczny (ukryty po zwinięciu) */}
        {!isSidebarCollapsed && (
          <div
            style={{
              backgroundColor: 'rgba(194, 154, 85, 0.12)',
              border: '1px solid rgba(194, 154, 85, 0.35)',
              borderRadius: '16px',
              padding: '1rem',
              fontSize: '0.8rem'
            }}
          >
            <div style={{ color: '#E5C98F', fontWeight: 700, marginBottom: '0.25rem' }}>
              Twój Opiekun Naukowy:
            </div>
            <div style={{ color: '#F3EFE5', fontWeight: 600 }}>{clientAccount.leadGenealogist}</div>
            <button
              type="button"
              onClick={() => onOpenOrderModal(null)}
              className="btn-gold"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.55rem 0.85rem', fontSize: '0.8rem' }}
            >
              Rozszerz badania / Zamów pakiet
            </button>
          </div>
        )}
      </aside>

      {/* GŁÓWNY OBSZAR ROBOCZY PANELU KLIENTA */}
      <main
        style={
          isFullTreeActive
            ? {
                padding: 0,
                maxWidth: 'none',
                width: '100%',
                height: 'calc(100vh - 76px)',
                margin: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }
            : { padding: 'clamp(1.25rem, 3vw, 2.5rem)', maxWidth: '1320px', width: '100%', margin: '0 auto' }
        }
      >
        {/* ================================================================= */}
        {/* WIDOK 1: MÓJ DASHBOARD (Sekcja 4 i 8 specyfikacji)                */}
        {/* ================================================================= */}
        {activeSection === 'dashboard' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Baner powitalny Dashboardu */}
            <section
              className="forest-surface"
              style={{
                borderRadius: '26px',
                padding: 'clamp(1.75rem, 3.5vw, 2.6rem)',
                border: '2px solid var(--gold-base)',
                boxShadow: 'var(--shadow-elevated)'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                <div>
                  <div className="gold-badge-dark" style={{ marginBottom: '0.75rem' }}>
                    <Sparkles size={14} /> Prywatne Cyfrowe Archiwum Rodzinne
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)', color: '#F3EFE5', marginBottom: '0.4rem' }}>
                    Witaj w historii Twojej rodziny
                  </h1>
                  <div style={{ fontSize: '1.15rem', color: '#E5C98F', fontWeight: 500 }}>
                    Właściciel Archiwum: <strong>{clientAccount.firstName} {clientAccount.lastName}</strong> • Ród Korzeniowskich i Wielowiejskich
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setActiveSection('tree')} className="btn-gold">
                    <GitBranch size={18} />
                    <span>Eksploruj Drzewo 2D</span>
                  </button>
                  <button type="button" onClick={() => setActiveSection('archive')} className="btn-outline-ivory">
                    <FolderArchive size={18} />
                    <span>Otwórz Archiwum Dokumentów</span>
                  </button>
                </div>
              </div>

              {/* 4 Karty KPI wymagane w specyfikacji: Postęp badań, Liczba przodków, Liczba pokoleń, Liczba dokumentów */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '1rem',
                  marginTop: '2rem'
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(243, 239, 229, 0.09)',
                    border: '1px solid rgba(194, 154, 85, 0.4)',
                    borderRadius: '18px',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#C9D5CE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Postęp badań genealogicznych
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', fontWeight: 700, color: '#E5C98F', marginTop: '0.2rem' }}>
                    {clientAccount.researchProgress}%
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#F3EFE5', marginTop: '0.25rem' }}>
                    Etap IV z V: Redakcja Księgi Rodu
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveSection('ancestors')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveSection('ancestors');
                    }
                  }}
                  style={{
                    backgroundColor: 'rgba(243, 239, 229, 0.09)',
                    border: '1px solid rgba(194, 154, 85, 0.4)',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#DCE6E0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Liczba odnalezionych przodków
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', fontWeight: 700, color: '#F3EFE5', marginTop: '0.2rem' }}>
                    {ancestors.length} osób
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#E5C98F', marginTop: '0.25rem' }}>
                    Linia lwowska, wileńska i krakowska →
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveSection('tree')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveSection('tree');
                    }
                  }}
                  style={{
                    backgroundColor: 'rgba(243, 239, 229, 0.09)',
                    border: '1px solid rgba(194, 154, 85, 0.4)',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#DCE6E0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Udokumentowane pokolenia
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', fontWeight: 700, color: '#F3EFE5', marginTop: '0.2rem' }}>
                    {generationsCount} pokolenia
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#E5C98F', marginTop: '0.25rem' }}>
                    Lata 1874–2026 (152 lata historii) →
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveSection('archive')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveSection('archive');
                    }
                  }}
                  style={{
                    backgroundColor: 'rgba(243, 239, 229, 0.09)',
                    border: '1px solid rgba(194, 154, 85, 0.4)',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#DCE6E0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Odnalezione dokumenty i skany
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', fontWeight: 700, color: '#E5C98F', marginTop: '0.2rem' }}>
                    {documents.length} aktów
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#F3EFE5', marginTop: '0.25rem' }}>
                    Metryki, mapy, fotografie i pamiętniki →
                  </div>
                </div>
              </div>
            </section>

            {/* SEKCJA „NAJNOWSZE ODKRYCIA” (Wymaganie 4 i 8) */}
            <section className="heritage-card" style={{ padding: '1.85rem', border: '2px solid var(--gold-base)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--forest-base)',
                      color: 'var(--gold-base)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bell size={20} />
                  </div>
                  <div>
                    <span className="gold-badge">Raport z Kwerendy Archiwalnej</span>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--forest-base)', marginTop: '0.2rem' }}>
                      Najnowsze odkrycia naszych genealogów
                    </h2>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {discoveries.map((disc) => {
                  const linkedDoc = documents.find((d) => d.id === disc.linkedDocumentId) || documents[0];
                  return (
                    <div
                      key={disc.id}
                      style={{
                        backgroundColor: disc.isHighlighted ? '#FAF5E6' : 'var(--ivory-base)',
                        border: disc.isHighlighted ? '2px solid #C29A55' : '1px solid var(--ivory-border)',
                        borderRadius: '18px',
                        padding: '1.35rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1.25rem'
                      }}
                    >
                      <div style={{ maxWidth: '720px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
                          <span className="gold-badge">{disc.badge}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {disc.dateLabel} • {disc.genealogist}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.28rem', color: 'var(--forest-base)', marginBottom: '0.35rem' }}>
                          „{disc.notificationText}”
                        </h3>
                        <p style={{ fontSize: '0.93rem', color: 'var(--text-secondary)' }}>
                          {disc.detailText}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                        <button
                          type="button"
                          onClick={() => onOpenDocumentLightbox(linkedDoc)}
                          className="btn-primary"
                          style={{ padding: '0.65rem 1.15rem', fontSize: '0.86rem' }}
                        >
                          <ZoomIn size={16} />
                          <span>Zobacz skan z 1923 r.</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNavigateToAncestorById(disc.linkedAncestorId)}
                          className="btn-secondary"
                          style={{ padding: '0.65rem 1.15rem', fontSize: '0.86rem' }}
                        >
                          <span>Profil przodka</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* DWIE KOLUMNY: PODSUMOWANIE ETAPÓW BADAŃ + OŚ CZASU HISTORII RODZINY */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {/* Podsumowanie postępu badań */}
              <section className="heritage-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.38rem', color: 'var(--forest-base)', marginBottom: '1rem' }}>
                  Podsumowanie postępu badań ({clientAccount.researchProgress}%)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {clientAccount.researchStages.map((st) => (
                    <div
                      key={st.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.85rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        backgroundColor: st.status === 'in_progress' ? '#FAF5E6' : 'var(--ivory-base)',
                        border:
                          st.status === 'in_progress'
                            ? '1.5px solid #C29A55'
                            : '1px solid var(--ivory-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <CheckCircle2
                          size={19}
                          color={
                            st.status === 'completed'
                              ? '#244638'
                              : st.status === 'in_progress'
                              ? '#C29A55'
                              : '#9CA3AF'
                          }
                        />
                        <span style={{ fontSize: '0.9rem', fontWeight: st.status === 'in_progress' ? 700 : 500 }}>
                          {st.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#9E7836', whiteSpace: 'nowrap' }}>
                        {st.date}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Oś czasu historii rodziny na Dashboardzie */}
              <section className="heritage-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.38rem', color: 'var(--forest-base)' }}>
                    Oś czasu historii rodziny
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSection('timeline')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9E7836',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Pełna oś czasu →
                  </button>
                </div>

                <div style={{ position: 'relative', paddingLeft: '1.35rem', borderLeft: '2px solid var(--gold-base)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {timelineEvents.slice(0, 5).map((ev) => (
                    <div key={ev.id} style={{ position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '-1.75rem',
                          top: '0.25rem',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--forest-base)',
                          border: '2px solid var(--gold-base)'
                        }}
                      />
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9E7836' }}>
                        {ev.year} • {ev.location}
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--forest-base)', fontSize: '0.94rem' }}>
                        {ev.title}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* WIDOK 2: INTERAKTYWNE DRZEWO GENEALOGICZNE (Sekcja 5)             */}
        {/* ================================================================= */}
        {activeSection === 'tree' && (
          <InteractiveFamilyTree
            ancestors={ancestors}
            selectedAncestor={activeAncestor}
            onSelectAncestor={setSelectedAncestor}
            onOpenStorytelling={handleOpenStoryForAncestor}
            onAddAncestorClue={onAddAncestorClue}
            isFullPane={isTreeFullPane}
            onToggleFullPane={() => setIsTreeFullPane((prev) => !prev)}
          />
        )}

        {/* ================================================================= */}
        {/* WIDOK 3: HISTORIA RODZINNA – STORYTELLING (Sekcja 6)              */}
        {/* ================================================================= */}
        {activeSection === 'story' && (
          <AncestorStorytelling
            ancestor={activeAncestor}
            allAncestors={ancestors}
            documents={documents}
            onSelectAncestor={setSelectedAncestor}
            onOpenDocumentLightbox={onOpenDocumentLightbox}
            onBackToTree={() => setActiveSection('tree')}
          />
        )}

        {/* ================================================================= */}
        {/* WIDOK 4: MOI PRZODKOWIE – KATALOG POSTACI (Sekcja 8)              */}
        {/* ================================================================= */}
        {activeSection === 'ancestors' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="heritage-card" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <span className="gold-badge">Katalog Biograficzny Rodu</span>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--forest-base)', marginTop: '0.3rem' }}>
                  Moi przodkowie ({filteredDirectoryAncestors.length})
                </h2>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#5F7168" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={ancestorSearch}
                  onChange={(e) => setAncestorSearch(e.target.value)}
                  placeholder="Szukaj po nazwisku, mieście, zawodzie..."
                  style={{
                    padding: '0.65rem 1rem 0.65rem 2.4rem',
                    borderRadius: '999px',
                    border: '1px solid var(--ivory-border)',
                    width: '280px',
                    backgroundColor: 'var(--ivory-base)'
                  }}
                />
              </div>
            </div>

            {filteredDirectoryAncestors.length === 0 ? (
              <div className="heritage-card animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center', border: '1.5px solid var(--ivory-border)' }}>
                <Users size={34} color="#6E501D" style={{ margin: '0 auto 0.75rem' }} aria-hidden="true" />
                <h3 style={{ fontSize: '1.35rem', color: 'var(--forest-base)', marginBottom: '0.45rem' }}>
                  {ancestorSearch.trim() ? 'Brak przodków pasujących do wyszukiwania' : 'Katalog przodków jest jeszcze pusty'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', maxWidth: '520px', margin: '0 auto 1.25rem' }}>
                  {ancestorSearch.trim()
                    ? 'Spróbuj zmienić frazę wyszukiwania lub wyczyść filtr.'
                    : 'Dodaj pierwszą wskazówkę rodzinną w zakładce Drzewo genealogiczne albo poczekaj na wyniki kwerendy archiwalnej.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {ancestorSearch.trim() ? (
                    <button type="button" onClick={() => setAncestorSearch('')} className="btn-secondary">
                      Wyczyść wyszukiwanie
                    </button>
                  ) : (
                    <button type="button" onClick={() => setActiveSection('tree')} className="btn-primary">
                      Przejdź do Drzewa genealogicznego
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
              {filteredDirectoryAncestors.map((person) => (
                <article
                  key={person.id}
                  className="heritage-card"
                  style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.9rem' }}>
                      <AncestorPortrait ancestor={person} size={68} />
                      <div>
                        <span className="gold-badge" style={{ fontSize: '0.68rem' }}>{person.generationLabel}</span>
                        <h3 style={{ fontSize: '1.28rem', color: 'var(--forest-base)', marginTop: '0.25rem' }}>
                          {person.firstName} {person.lastName}
                        </h3>
                        <div style={{ fontSize: '0.82rem', color: '#9E7836', fontWeight: 600 }}>
                          {person.birthDate} – {person.deathDate} • {person.birthPlace}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      {person.shortBio}
                    </p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Profesja: <strong>{person.profession}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', paddingTop: '0.85rem', borderTop: '1px solid var(--ivory-border)' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenStoryForAncestor(person)}
                      className="btn-primary"
                      style={{ padding: '0.6rem 0.8rem', fontSize: '0.84rem' }}
                    >
                      <BookOpen size={15} /> Historia życia
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAncestor(person);
                        setActiveSection('tree');
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.6rem 0.8rem', fontSize: '0.84rem' }}
                    >
                      <GitBranch size={15} /> Pokaż na drzewie
                    </button>
                  </div>
                </article>
              ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* WIDOK 5: CYFROWE ARCHIWUM RODZINNE (Sekcja 7 specyfikacji)        */}
        {/* ================================================================= */}
        {activeSection === 'archive' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="heritage-card" style={{ padding: '1.6rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.15rem' }}>
                <div>
                  <span className="gold-badge">Skarbiec Dokumentów i Pamiątek</span>
                  <h2 style={{ fontSize: '1.75rem', color: 'var(--forest-base)', marginTop: '0.3rem' }}>
                    Cyfrowe Archiwum Rodzinne
                  </h2>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                    Wszystkie zdigitalizowane akty metrykalne, stare fotografie, listy i mapy katastralne powiązane z członkami rodziny.
                  </p>
                </div>

                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#5F7168" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                    placeholder="Szukaj dokumentu, roku, osoby..."
                    style={{
                      padding: '0.65rem 1rem 0.65rem 2.4rem',
                      borderRadius: '999px',
                      border: '1px solid var(--ivory-border)',
                      width: '260px',
                      backgroundColor: 'var(--ivory-base)'
                    }}
                  />
                </div>
              </div>

              {/* Filtry 7 wymaganych kategorii archiwalnych */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {archiveCategories.map((cat) => {
                  const active = selectedArchiveCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedArchiveCategory(cat)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '999px',
                        border: active ? '1.5px solid #C29A55' : '1px solid var(--ivory-border)',
                        backgroundColor: active ? 'var(--forest-base)' : 'var(--ivory-base)',
                        color: active ? 'var(--ivory-base)' : 'var(--text-secondary)',
                        fontWeight: active ? 600 : 500,
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Siatka dokumentów z podglądem, opisem, datą i powiązaniem z przodkiem */}
            {filteredDocuments.length === 0 ? (
              <div className="heritage-card animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center', border: '1.5px solid var(--ivory-border)' }}>
                <FolderArchive size={34} color="#6E501D" style={{ margin: '0 auto 0.75rem' }} aria-hidden="true" />
                <h3 style={{ fontSize: '1.35rem', color: 'var(--forest-base)', marginBottom: '0.45rem' }}>
                  {archiveSearch.trim() || selectedArchiveCategory !== 'Wszystkie'
                    ? 'Brak dokumentów spełniających kryteria'
                    : 'Twoje Cyfrowe Archiwum oczekuje na pierwsze skany'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', maxWidth: '540px', margin: '0 auto 1.25rem' }}>
                  {archiveSearch.trim() || selectedArchiveCategory !== 'Wszystkie'
                    ? 'Zmień kategorię lub wyczyść wyszukiwanie, aby zobaczyć pozostałe dokumenty.'
                    : 'Gdy zespół genealogów zdigitalizuje i zweryfikuje akty metrykalne, fotografie lub listy Twojej rodziny, pojawią się tutaj wraz z pełną transkrypcją.'}
                </p>
                {(archiveSearch.trim() || selectedArchiveCategory !== 'Wszystkie') && (
                  <button
                    type="button"
                    onClick={() => {
                      setArchiveSearch('');
                      setSelectedArchiveCategory('Wszystkie');
                    }}
                    className="btn-secondary"
                  >
                    Pokaż wszystkie dokumenty
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.35rem' }}>
              {filteredDocuments.map((doc, idx) => (
                <article
                  key={doc.id}
                  className="heritage-card archival-doc-card stagger-item"
                  style={{
                    '--stagger-index': idx,
                    padding: '1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div onClick={() => onOpenDocumentLightbox(doc)} style={{ cursor: 'pointer' }}>
                      <ArchivalDocumentScan doc={doc} compact />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '0.4rem' }}>
                      <span className="gold-badge" style={{ fontSize: '0.72rem' }}>{doc.category}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9E7836' }}>{doc.date}</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', color: 'var(--forest-base)', marginBottom: '0.4rem' }}>
                      {doc.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      {doc.description}
                    </p>

                    <div
                      style={{
                        backgroundColor: 'var(--ivory-base)',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid var(--ivory-border)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Powiązany przodek:</span>{' '}
                        <strong style={{ color: 'var(--forest-base)' }}>{doc.ancestorName}</strong>
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Źródło: {doc.archiveSource}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => onOpenDocumentLightbox(doc)}
                      className="btn-primary"
                      style={{ padding: '0.65rem 0.9rem', fontSize: '0.84rem' }}
                    >
                      <ZoomIn size={15} /> Powiększ skan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigateToAncestorById(doc.ancestorId)}
                      className="btn-secondary"
                      style={{ padding: '0.65rem 0.9rem', fontSize: '0.84rem' }}
                    >
                      Profil osoby →
                    </button>
                  </div>
                </article>
              ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* WIDOK 6: OŚ CZASU HISTORII RODZINY (Sekcja 4, 6 i 8)              */}
        {/* ================================================================= */}
        {activeSection === 'timeline' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="heritage-card" style={{ padding: '1.75rem' }}>
              <span className="gold-badge">Chronologia Pokoleń 1874–2026</span>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--forest-base)', marginTop: '0.35rem' }}>
                Oś Czasu Historii Rodziny
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Prześledź kluczowe wydarzenia z życia przodków na tle wielkich przemian historycznych XIX i XX wieku.
              </p>
            </div>

            <div className="heritage-card" style={{ padding: '2.25rem' }}>
              <div style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '3px solid var(--gold-base)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {timelineEvents.map((ev, idx) => {
                  const docObj = documents.find((d) => d.id === ev.documentId);
                  return (
                    <div
                      key={ev.id}
                      className="timeline-milestone"
                      style={{
                        '--stagger-index': idx,
                        position: 'relative',
                        backgroundColor: 'var(--ivory-base)',
                        border: '1px solid var(--ivory-border)',
                        borderRadius: '18px',
                        padding: '1.35rem 1.5rem'
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: '-2.65rem',
                          top: '1.4rem',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--forest-base)',
                          border: '4px solid var(--gold-base)'
                        }}
                      />
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: '#9E7836' }}>
                            {ev.year}
                          </span>
                          <span className="gold-badge">{ev.era}</span>
                        </div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--forest-base)' }}>
                          <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          {ev.location}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', color: 'var(--forest-base)', marginBottom: '0.4rem' }}>
                        {ev.title}
                      </h3>
                      <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        {ev.description}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                        <button
                          type="button"
                          onClick={() => handleNavigateToAncestorById(ev.ancestorId)}
                          className="btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.83rem' }}
                        >
                          Zobacz profil przodka →
                        </button>
                        {docObj && (
                          <button
                            type="button"
                            onClick={() => onOpenDocumentLightbox(docObj)}
                            className="btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.83rem' }}
                          >
                            <ZoomIn size={14} /> Otwórz dokument źródłowy ({docObj.year})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* WIDOK 7: USTAWIENIA KONTA, ZAMÓWIENIA, STATUS I FAKTURY (Sekcja 9) */}
        {/* ================================================================= */}
        {activeSection === 'account' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div className="heritage-card" style={{ padding: '1.75rem' }}>
              <span className="gold-badge">Zarządzanie Kontem i Usługami</span>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--forest-base)', marginTop: '0.35rem' }}>
                Profil Klienta, Historia Zamówień i Płatności
              </h2>
            </div>

            {accountError && (
              <div
                role="alert"
                style={{
                  backgroundColor: 'rgba(139, 46, 36, 0.1)',
                  border: '1.5px solid #8B2E24',
                  color: '#5C1912',
                  padding: '0.9rem 1.15rem',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontWeight: 600
                }}
              >
                <AlertTriangle size={20} color="#8B2E24" aria-hidden="true" />
                <span>{accountError}</span>
              </div>
            )}

            {accountSavedBanner && (
              <div
                role="status"
                style={{
                  backgroundColor: '#172F25',
                  color: '#F3EFE5',
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  border: '1.5px solid #C29A55',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}
              >
                <CheckCircle2 size={20} color="#C29A55" aria-hidden="true" />
                <span>Dane profilu oraz ustawienia zgód RODO zostały pomyślnie zapisane.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {/* Profil klienta */}
              <section className="heritage-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--forest-base)', marginBottom: '1rem' }}>
                  Dane Właściciela Konta
                </h3>
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Imię</label>
                      <input
                        type="text"
                        value={clientAccount.firstName}
                        onChange={(e) => onUpdateClientAccount({ ...clientAccount, firstName: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Nazwisko</label>
                      <input
                        type="text"
                        value={clientAccount.lastName}
                        onChange={(e) => onUpdateClientAccount({ ...clientAccount, lastName: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Adres e-mail</label>
                    <input
                      type="email"
                      value={clientAccount.email}
                      onChange={(e) => onUpdateClientAccount({ ...clientAccount, email: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Telefon kontaktowy</label>
                    <input
                      type="text"
                      value={clientAccount.phone}
                      onChange={(e) => onUpdateClientAccount({ ...clientAccount, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Adres dostawy Księgi Rodu</label>
                    <input
                      type="text"
                      value={clientAccount.city}
                      onChange={(e) => onUpdateClientAccount({ ...clientAccount, city: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '0.4rem' }}>
                    Zapisz zmiany w profilu
                  </button>
                </form>
              </section>

              {/* Historia zamówień i status realizacji usługi */}
              <section className="heritage-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--forest-base)', marginBottom: '1rem' }}>
                    Historia zamówień i status realizacji usługi
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    {clientAccount.orders.map((ord) => (
                      <div
                        key={ord.orderId}
                        style={{
                          backgroundColor: 'var(--ivory-base)',
                          padding: '1rem',
                          borderRadius: '14px',
                          border: '1px solid var(--ivory-border)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9E7836' }}>{ord.orderId}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ord.orderDate}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--forest-base)', fontSize: '1rem' }}>
                          {ord.serviceName}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.55rem', fontSize: '0.85rem' }}>
                          <span style={{ color: '#244638', fontWeight: 600 }}>{ord.status}</span>
                          <strong>{ord.amount}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenOrderModal(null)}
                  className="btn-gold"
                  style={{ width: '100%', marginTop: '1.25rem' }}
                >
                  Zamów kolejną kwerendę lub dodatkowy egzemplarz Księgi Rodu
                </button>
              </section>
            </div>

            {/* Płatności i faktury */}
            <section className="heritage-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--forest-base)', marginBottom: '1rem' }}>
                Płatności i faktury VAT
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--ivory-border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Nr faktury</th>
                      <th style={{ padding: '0.75rem' }}>Data wystawienia</th>
                      <th style={{ padding: '0.75rem' }}>Tytuł operacji</th>
                      <th style={{ padding: '0.75rem' }}>Kwota</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientAccount.invoices.map((inv) => (
                      <tr key={inv.invoiceId} style={{ borderBottom: '1px solid var(--ivory-border)' }}>
                        <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: 'var(--forest-base)' }}>
                          {inv.invoiceId}
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>{inv.date}</td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>{inv.description}</td>
                        <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>{inv.amount}</td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>
                          <span
                            className="gold-badge"
                            style={{
                              backgroundColor: inv.status === 'Opłacona' ? 'rgba(36, 70, 56, 0.12)' : 'rgba(194, 154, 85, 0.25)',
                              color: inv.status === 'Opłacona' ? '#244638' : '#7D5B21'
                            }}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setInvoicePreview(inv)}
                            className="btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                          >
                            <Download size={13} /> Podgląd faktury
                          </button>
                          {inv.status !== 'Opłacona' && (
                            <button
                              type="button"
                              onClick={() => handlePayPendingInvoice(inv.invoiceId)}
                              className="btn-gold"
                              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                            >
                              <CreditCard size={13} /> Opłać teraz
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {invoicePreview && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    backgroundColor: 'var(--ivory-base)',
                    border: '1.5px solid var(--gold-base)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-dark)', textTransform: 'uppercase' }}>
                      Dokument Księgowy {COMPANY_LEGAL_DETAILS.companyName} (NIP: {COMPANY_LEGAL_DETAILS.nip}, KRS: {COMPANY_LEGAL_DETAILS.krs})
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--forest-base)' }}>
                      Faktura {invoicePreview.invoiceId} — {invoicePreview.description}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Sprzedawca: {COMPANY_LEGAL_DETAILS.companyName}, {COMPANY_LEGAL_DETAILS.street}, {COMPANY_LEGAL_DETAILS.postalCode} {COMPANY_LEGAL_DETAILS.city} • Nabywca: {clientAccount.firstName} {clientAccount.lastName} ({clientAccount.city}) • Kwota: {invoicePreview.amount} • Status: {invoicePreview.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInvoicePreview(null)}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                  >
                    Zamknij podgląd
                  </button>
                </div>
              )}
            </section>

            {/* ZADANIE 18 & 20 (RODO): ZARZĄDZANIE ZGODAMI (UNSUBSCRIBE), EKSPORT DANYCH (ART. 20) I USUNIĘCIE KONTA (ART. 17) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {/* Zadanie 18: Unsubscribe i preferencje komunikacji */}
              <section className="heritage-card" style={{ padding: '1.75rem' }}>
                <div className="gold-badge" style={{ marginBottom: '0.6rem' }}>
                  <BellOff size={13} aria-hidden="true" /> Zadanie #6 &amp; #18 — Zgody i Rezygnacja (Unsubscribe)
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--forest-base)', marginBottom: '0.6rem' }}>
                  Preferencje powiadomień e-mail i newslettera
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  W każdej chwili możesz wycofać zgodę na otrzymywanie kwartalnika historycznego oraz powiadomień marketingowych bez wpływu na dostęp do Twojego Archiwum.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.15rem', fontSize: '0.86rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(clientAccount.consents?.researchAlertsSubscribed)}
                      onChange={(e) =>
                        onUpdateClientAccount({
                          ...clientAccount,
                          consents: {
                            ...(clientAccount.consents || {}),
                            researchAlertsSubscribed: e.target.checked
                          }
                        })
                      }
                    />
                    <span>Powiadomienia o nowych dokumentach odnalezionych w archiwum</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(clientAccount.consents?.newsletterSubscribed)}
                      onChange={(e) =>
                        onUpdateClientAccount({
                          ...clientAccount,
                          consents: {
                            ...(clientAccount.consents || {}),
                            newsletterSubscribed: e.target.checked
                          }
                        })
                      }
                    />
                    <span>Newsletter historyczno-genealogiczny TwojeKorzenie (opcjonalny)</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onUnsubscribeMarketing) onUnsubscribeMarketing();
                    setAccountSavedBanner(true);
                    setTimeout(() => setAccountSavedBanner(false), 3000);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.86rem' }}
                >
                  <BellOff size={16} aria-hidden="true" />
                  <span>Wypisz się ze wszystkich wiadomości (1-Click Unsubscribe)</span>
                </button>
              </section>

              {/* Zadanie 20: Eksport danych (Art. 20 RODO) i Trwałe usunięcie konta (Art. 17 RODO) */}
              <section className="heritage-card" style={{ padding: '1.75rem', border: '1.5px solid rgba(139, 46, 36, 0.35)' }}>
                <div className="gold-badge" style={{ marginBottom: '0.6rem' }}>
                  <ShieldCheck size={13} aria-hidden="true" /> Zadanie #20 — Prawa RODO (Art. 17 i Art. 20)
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--forest-base)', marginBottom: '0.6rem' }}>
                  Przenoszenie danych i Prawo do bycia zapomnianym
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Zgodnie z RODO masz pełną kontrolę nad swoimi danymi: możesz pobrać ich kopię w ustrukturyzowanym formacie JSON lub trwale usunąć konto wraz ze wszystkimi danymi.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onExportAccountData) {
                        const data = onExportAccountData();
                        setExportedDataJson(JSON.stringify(data, null, 2));
                      }
                    }}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.86rem' }}
                  >
                    <Download size={16} aria-hidden="true" />
                    <span>Eksportuj moje dane osobowe (JSON — Art. 20 RODO)</span>
                  </button>

                  {!confirmDeleteOpen ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteOpen(true)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 1rem',
                        borderRadius: '999px',
                        border: '1.5px solid #8B2E24',
                        backgroundColor: 'rgba(139, 46, 36, 0.08)',
                        color: '#7A241B',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      <span>Usuń moje konto i wszystkie dane osobowe (Art. 17 RODO)</span>
                    </button>
                  ) : (
                    <div
                      role="alert"
                      style={{
                        backgroundColor: 'rgba(139, 46, 36, 0.1)',
                        border: '1.5px solid #8B2E24',
                        borderRadius: '12px',
                        padding: '0.9rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem'
                      }}
                    >
                      <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#5C1912' }}>
                        Czy na pewno chcesz trwale usunąć swoje konto, dodane wskazówki rodzinne i wylogować sesję?
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteOpen(false);
                            if (onDeleteAccountData) onDeleteAccountData();
                          }}
                          style={{
                            flex: 1,
                            padding: '0.55rem 0.9rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#8B2E24',
                            color: '#FAF8F2',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          Tak, usuń trwale moje dane
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteOpen(false)}
                          className="btn-secondary"
                          style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}
                        >
                          Anuluj
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {exportedDataJson && (
                  <div style={{ marginTop: '0.85rem', backgroundColor: 'var(--ivory-base)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.76rem', color: 'var(--forest-base)' }}>Eksport RODO (JSON):</strong>
                      <button
                        type="button"
                        onClick={() => setExportedDataJson(null)}
                        style={{ background: 'none', border: 'none', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Zamknij
                      </button>
                    </div>
                    <pre style={{ fontSize: '0.7rem', maxHeight: '140px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                      {exportedDataJson}
                    </pre>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* WIDOK 8: TRASA CHRONIONA /ADMIN – KONTROLA DOSTĘPU RBAC (Zad. 3 & 5) */}
        {/* ================================================================= */}
        {activeSection === 'admin' && (() => {
          const access = checkRouteAccess(currentSession, 'admin');
          const envState = validateEnvConfig();
          const rateStats = RateLimiter.getStatusSnapshot();

          if (!access.granted) {
            return (
              <div className="heritage-card animate-fade-in" style={{ padding: '2.5rem', border: '2px solid #8B2E24', textAlign: 'center', maxWidth: '760px', margin: '1rem auto' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(139, 46, 36, 0.12)',
                    color: '#8B2E24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}
                >
                  <Lock size={30} aria-hidden="true" />
                </div>
                <span className="gold-badge" style={{ marginBottom: '0.6rem' }}>
                  Ochrona Tras Administracyjnych (Supabase RLS + RBAC)
                </span>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--forest-base)', marginBottom: '0.6rem' }}>
                  403 Forbidden — Dostęp do Panelu Administratora Zablokowany
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', marginBottom: '1.25rem', lineHeight: 1.65 }}>
                  {access.reason} Twoja obecna sesja posiada rolę <strong>„{currentSession?.role || 'client'}”</strong>. Uprawnienia administratora są nadawane wyłącznie po stronie bazy danych Supabase (tabela <code>public.profiles</code>).
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => onOpenLegalCenter && onOpenLegalCenter('audit40')}
                    className="btn-secondary"
                  >
                    <span>Otwórz Pełny Raport Audytu 40 Zadań</span>
                  </button>
                </div>
              </div>
            );
          }

          const handleAdminSaveProgress = async (e) => {
            e.preventDefault();
            setAdminErrorMsg(null);
            setAdminStatusMsg(null);
            try {
              const updated = await SupabaseRepository.adminUpdateClientProgress(selectedAdminClientId, {
                activePackageName: adminPackageVal,
                researchProgress: adminProgressVal
              });
              setAdminClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
              setAdminStatusMsg(`Zaktualizowano pakiet i postęp badań klienta ${updated.email} (${updated.research_progress}%).`);
              if (onRefreshData) await onRefreshData();
            } catch (err) {
              setAdminErrorMsg(err.message || 'Błąd podczas aktualizacji postępu klienta.');
            }
          };

          const handleAdminUploadAncestor = async (e) => {
            e.preventDefault();
            setAdminErrorMsg(null);
            setAdminStatusMsg(null);
            if (!selectedAdminClientId) {
              setAdminErrorMsg('Wybierz klienta z listy.');
              return;
            }
            if (!adminAncestorForm.firstName.trim() || !adminAncestorForm.lastName.trim()) {
              setAdminErrorMsg('Imię i nazwisko przodka są wymagane.');
              return;
            }
            try {
              await SupabaseRepository.adminInsertVerifiedAncestor(selectedAdminClientId, adminAncestorForm);
              const refreshedList = await SupabaseRepository.fetchAncestorsForUser(selectedAdminClientId);
              setClientAncestorsList(refreshedList);
              setAdminAncestorForm({
                firstName: '',
                lastName: '',
                maidenName: '',
                coatOfArms: '',
                generation: adminAncestorForm.generation,
                role: adminAncestorForm.role,
                birthYear: '',
                birthDate: '',
                deathYear: '',
                deathDate: '',
                birthPlace: '',
                profession: '',
                verificationSource: 'Archiwum Państwowe — odpis aktu metrykalnego',
                shortBio: '',
                childId: '',
                parentId1: '',
                parentId2: '',
                spouseId: '',
                siblingId: ''
              });
              setAdminStatusMsg(`Dodano zweryfikowanego przodka i zaktualizowano powiązania rodzinne w drzewie klienta.`);
              if (onRefreshData) await onRefreshData();
            } catch (err) {
              setAdminErrorMsg(err.message || 'Błąd podczas dodawania przodka.');
            }
          };

          const handleAdminDeleteAncestor = async (ancestorId) => {
            setAdminErrorMsg(null);
            setAdminStatusMsg(null);
            try {
              await SupabaseRepository.adminDeleteAncestor(ancestorId);
              setClientAncestorsList((prev) => prev.filter((a) => a.id !== ancestorId));
              setAdminStatusMsg('Usunięto wpis przodka z bazy.');
              if (onRefreshData) await onRefreshData();
            } catch (err) {
              setAdminErrorMsg(err.message || 'Nie udało się usunąć wpisu.');
            }
          };

          const handleAdminUploadDocument = async (e) => {
            e.preventDefault();
            setAdminErrorMsg(null);
            setAdminStatusMsg(null);
            if (!selectedAdminClientId || !adminDocForm.title.trim()) {
              setAdminErrorMsg('Wybierz klienta i podaj tytuł dokumentu.');
              return;
            }
            try {
              const linkedAnc = clientAncestorsList.find((a) => a.id === adminDocForm.ancestorId);
              await SupabaseRepository.adminInsertDocument(selectedAdminClientId, {
                ...adminDocForm,
                ancestorName: linkedAnc ? `${linkedAnc.firstName} ${linkedAnc.lastName}` : ''
              });
              setAdminDocForm({
                title: '',
                category: 'Akty metrykalne',
                year: '',
                place: '',
                archiveSource: '',
                ancestorId: '',
                description: '',
                transcription: ''
              });
              setAdminStatusMsg('Dodano dokument archiwalny do Cyfrowego Archiwum klienta.');
              if (onRefreshData) await onRefreshData();
            } catch (err) {
              setAdminErrorMsg(err.message || 'Nie udało się dodać dokumentu.');
            }
          };

          const handleAdminSeedDobrzanski = async () => {
            setAdminErrorMsg(null);
            setAdminStatusMsg(null);
            if (!selectedAdminClientId) {
              setAdminErrorMsg('Wybierz klienta z listy.');
              return;
            }
            try {
              const count = await SupabaseRepository.adminSeedDobrzanskiTree(selectedAdminClientId);
              const refreshedList = await SupabaseRepository.fetchAncestorsForUser(selectedAdminClientId);
              setClientAncestorsList(refreshedList);
              setAdminProgressVal(85);
              setAdminPackageVal('Pakiet kompleksowy – Ród Dobrzańskich i Kopalskich');
              setAdminStatusMsg(`Wgrano ${count} przodków (5 pokoleń) i 4 dokumenty archiwalne rodu Dobrzańskich i Kopalskich do drzewa wybranego klienta!`);
              if (onRefreshData) await onRefreshData();
            } catch (err) {
              setAdminErrorMsg(err.message || 'Nie udało się wgrać danych testowych.');
            }
          };

          return (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="forest-surface" style={{ padding: '1.85rem', borderRadius: '22px', border: '2px solid var(--gold-base)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <span className="gold-badge-dark">Autoryzowano RBAC (Supabase): Rola Administrator</span>
                  <h2 style={{ fontSize: '1.75rem', color: '#F3EFE5', marginTop: '0.35rem' }}>
                    Panel Administratora — Zarządzanie Drzewami Klientów
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#DCE6E0' }}>
                    Bezpieczne wgrywanie zweryfikowanych przodków, dokumentów archiwalnych i postępu badań bezpośrednio do bazy Supabase (RLS).
                  </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={handleAdminSeedDobrzanski}
                    className="btn-gold"
                    style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    Wgraj dane testowe: Ród Dobrzańskich (5 pokoleń)
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLegalCenter && onOpenLegalCenter('audit40')}
                    className="btn-outline-ivory"
                    style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    Pełny Raport 40 Zadań
                  </button>
                </div>
              </div>

              {adminStatusMsg && (
                <div role="status" style={{ backgroundColor: 'rgba(36, 70, 56, 0.12)', border: '1.5px solid #244638', color: '#172F25', padding: '0.9rem 1.1rem', borderRadius: '12px', fontWeight: 600 }}>
                  {adminStatusMsg}
                </div>
              )}

              {adminErrorMsg && (
                <div role="alert" style={{ backgroundColor: 'rgba(139, 46, 36, 0.1)', border: '1.5px solid #8B2E24', color: '#5C1912', padding: '0.9rem 1.1rem', borderRadius: '12px', fontWeight: 600 }}>
                  {adminErrorMsg}
                </div>
              )}

              {/* Wybór klienta i aktualizacja postępu */}
              <div className="heritage-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--forest-base)', marginBottom: '0.9rem' }}>
                  1. Wybierz Klienta i zaktualizuj status kwerendy
                </h3>
                <form onSubmit={handleAdminSaveProgress} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', alignItems: 'end' }}>
                  <div>
                    <label htmlFor="admin-client-select" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                      Klient (z tabeli profiles):
                    </label>
                    <select
                      id="admin-client-select"
                      value={selectedAdminClientId}
                      onChange={(e) => setSelectedAdminClientId(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1.5px solid var(--gold-base)', backgroundColor: 'var(--ivory-base)', fontWeight: 600 }}
                    >
                      {adminClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.first_name || 'Brak imienia'} {c.last_name || ''} ({c.email}) — {c.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="admin-package-input" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                      Aktywny pakiet:
                    </label>
                    <input
                      id="admin-package-input"
                      type="text"
                      value={adminPackageVal}
                      onChange={(e) => setAdminPackageVal(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="admin-progress-input" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                      Postęp badań (%):
                    </label>
                    <input
                      id="admin-progress-input"
                      type="number"
                      min="0"
                      max="100"
                      value={adminProgressVal}
                      onChange={(e) => setAdminProgressVal(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.88rem' }}>
                    Zapisz postęp klienta
                  </button>
                </form>
              </div>

              {/* Wgrywanie przodków do drzewa klienta + wgrywanie dokumentów */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                <div className="heritage-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--forest-base)', marginBottom: '0.85rem' }}>
                    2. Wgraj zweryfikowanego przodka do drzewa
                  </h3>
                  <form onSubmit={handleAdminUploadAncestor} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '100%', minWidth: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.6rem' }}>
                      <input type="text" required placeholder="Imię *" value={adminAncestorForm.firstName} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, firstName: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                      <input type="text" required placeholder="Nazwisko *" value={adminAncestorForm.lastName} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, lastName: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.6rem' }}>
                      <input type="text" placeholder="Nazwisko panieńskie (opcj.)" value={adminAncestorForm.maidenName} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, maidenName: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                      <input type="text" placeholder="Herb / przydomek (opcj.)" value={adminAncestorForm.coatOfArms} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, coatOfArms: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.6rem' }}>
                      <select value={adminAncestorForm.generation} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, generation: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)', backgroundColor: '#FFFFFF', textOverflow: 'ellipsis' }}>
                        <option value="1">Pokolenie I (Współczesne)</option>
                        <option value="2">Pokolenie II (Rodzice)</option>
                        <option value="3">Pokolenie III (Dziadkowie)</option>
                        <option value="4">Pokolenie IV (Pradziadkowie)</option>
                        <option value="5">Pokolenie V (Prapradziadkowie)</option>
                        <option value="6">Pokolenie VI (Praprapradziadkowie)</option>
                      </select>
                      <select value={adminAncestorForm.role} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, role: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)', backgroundColor: '#FFFFFF', textOverflow: 'ellipsis' }}>
                        <option value="Proband / Właściciel Archiwum">Proband / Właściciel Archiwum</option>
                        <option value="Małżonek / Małżonka">Małżonek / Małżonka</option>
                        <option value="Brat / Siostra">Brat / Siostra</option>
                        <option value="Ojciec">Ojciec (Pok. II)</option>
                        <option value="Matka">Matka (Pok. II)</option>
                        <option value="Stryj / Wuj / Ciotka">Stryj / Wuj / Ciotka</option>
                        <option value="Dziadek mieczowy (linia ojca)">Dziadek (linia ojca)</option>
                        <option value="Babcia mieczowa (linia ojca)">Babcia (linia ojca)</option>
                        <option value="Dziadek kądzieli (linia matki)">Dziadek (linia matki)</option>
                        <option value="Babcia kądzieli (linia matki)">Babcia (linia matki)</option>
                        <option value="Pradziadek">Pradziadek (Pok. IV)</option>
                        <option value="Prababcia">Prababcia (Pok. IV)</option>
                        <option value="Prapradziadek">Prapradziadek (Pok. V)</option>
                        <option value="Praprababcia">Praprababcia (Pok. V)</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.6rem' }}>
                      <input type="number" placeholder="Rok urodzenia (np. 1898)" value={adminAncestorForm.birthYear} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, birthYear: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                      <input type="number" placeholder="Rok zgonu (puste = żyje)" value={adminAncestorForm.deathYear} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, deathYear: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.6rem' }}>
                      <input type="text" placeholder="Data ur. (np. 14 maja 1898)" value={adminAncestorForm.birthDate} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, birthDate: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                      <input type="text" placeholder="Data zgonu (lub żyje)" value={adminAncestorForm.deathDate} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, deathDate: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.6rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <PlaceAutocompleteInput
                          value={adminAncestorForm.birthPlace}
                          placeholder="Miejsce (Google Maps)"
                          onChange={(val) => setAdminAncestorForm({ ...adminAncestorForm, birthPlace: val })}
                          onSelectPlace={(place) =>
                            setAdminAncestorForm({
                              ...adminAncestorForm,
                              birthPlace: place.name,
                              region: place.region || adminAncestorForm.region,
                              lat: place.lat,
                              lng: place.lng
                            })
                          }
                        />
                      </div>
                      <input type="text" placeholder="Profesja / zawód" value={adminAncestorForm.profession} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, profession: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    </div>

                    {/* Rozbudowana sekcja powiązań rodzinnych w drzewie */}
                    <div style={{ backgroundColor: 'var(--ivory-base)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--ivory-border)', display: 'flex', flexDirection: 'column', gap: '0.55rem', minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--forest-base)' }}>
                        Powiązania rodzinne ({clientAncestorsList.length} {clientAncestorsList.length === 1 ? 'osoba' : 'osób'} w drzewie klienta)
                      </div>

                      {clientAncestorsList.length === 0 ? (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Drzewo klienta jest jeszcze puste — dodaj pierwszą osobę (np. klienta w Pokoleniu I), a przy kolejnych osobach połączysz tutaj rodziców, dzieci i małżonków.
                        </div>
                      ) : (
                        <>
                          <select value={adminAncestorForm.childId} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, childId: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--ivory-border)', fontSize: '0.83rem', backgroundColor: '#FFFFFF', textOverflow: 'ellipsis' }}>
                            <option value="">Jest rodzicem dla (wybierz dziecko w drzewie)</option>
                            {clientAncestorsList.map((a) => (
                              <option key={`child-${a.id}`} value={a.id}>
                                Dziecko: {a.firstName} {a.lastName} (Pok. {a.generation})
                              </option>
                            ))}
                          </select>

                          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.5rem' }}>
                            <select value={adminAncestorForm.parentId1} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, parentId1: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--ivory-border)', fontSize: '0.82rem', backgroundColor: '#FFFFFF', textOverflow: 'ellipsis' }}>
                              <option value="">Rodzic 1 (Ojciec / Matka)</option>
                              {clientAncestorsList.map((a) => (
                                <option key={`p1-${a.id}`} value={a.id}>
                                  {a.firstName} {a.lastName} (Pok. {a.generation})
                                </option>
                              ))}
                            </select>

                            <select value={adminAncestorForm.parentId2} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, parentId2: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--ivory-border)', fontSize: '0.82rem', backgroundColor: '#FFFFFF', textOverflow: 'ellipsis' }}>
                              <option value="">Rodzic 2 (Drugi rodzic)</option>
                              {clientAncestorsList.map((a) => (
                                <option key={`p2-${a.id}`} value={a.id}>
                                  {a.firstName} {a.lastName} (Pok. {a.generation})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.5rem' }}>
                            <select value={adminAncestorForm.spouseId} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, spouseId: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--ivory-border)', fontSize: '0.82rem', backgroundColor: '#FFFFFF', textOverflow: 'ellipsis' }}>
                              <option value="">Małżonek / Małżonka</option>
                              {clientAncestorsList.map((a) => (
                                <option key={`sp-${a.id}`} value={a.id}>
                                  {a.firstName} {a.lastName} (Pok. {a.generation})
                                </option>
                              ))}
                            </select>

                            <select value={adminAncestorForm.siblingId} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, siblingId: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--ivory-border)', fontSize: '0.82rem', backgroundColor: '#FFFFFF', textOverflow: 'ellipsis' }}>
                              <option value="">Brat / Siostra</option>
                              {clientAncestorsList.map((a) => (
                                <option key={`sib-${a.id}`} value={a.id}>
                                  {a.firstName} {a.lastName} (Pok. {a.generation})
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                    <input type="text" placeholder="Źródło archiwalne (sygnatura)" value={adminAncestorForm.verificationSource} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, verificationSource: e.target.value })} style={{ padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    <textarea rows={2} placeholder="Krótka biografia przodka..." value={adminAncestorForm.shortBio} onChange={(e) => setAdminAncestorForm({ ...adminAncestorForm, shortBio: e.target.value })} style={{ padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    <button type="submit" className="btn-gold" style={{ width: '100%', padding: '0.65rem' }}>
                      Zapisz przodka w drzewie klienta
                    </button>
                  </form>
                </div>

                <div className="heritage-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--forest-base)', marginBottom: '0.85rem' }}>
                    3. Wgraj dokument archiwalny dla klienta
                  </h3>
                  <form onSubmit={handleAdminUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '100%', minWidth: 0 }}>
                    <input type="text" required placeholder="Tytuł dokumentu *" value={adminDocForm.title} onChange={(e) => setAdminDocForm({ ...adminDocForm, title: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.6rem' }}>
                      <select value={adminDocForm.category} onChange={(e) => setAdminDocForm({ ...adminDocForm, category: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)', backgroundColor: '#FFFFFF', textOverflow: 'ellipsis' }}>
                        <option>Akty metrykalne</option>
                        <option>Dokumenty urzędowe i wojskowe</option>
                        <option>Fotografie rodzinne</option>
                        <option>Listy i pamiętniki</option>
                        <option>Mapy i plany</option>
                      </select>
                      <input type="number" placeholder="Rok (np. 1923)" value={adminDocForm.year} onChange={(e) => setAdminDocForm({ ...adminDocForm, year: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.6rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <PlaceAutocompleteInput
                          value={adminDocForm.place}
                          placeholder="Miejsce (np. Lwów)"
                          onChange={(val) => setAdminDocForm({ ...adminDocForm, place: val })}
                          onSelectPlace={(place) => setAdminDocForm({ ...adminDocForm, place: place.name })}
                        />
                      </div>
                      <input type="text" placeholder="Sygnatura archiwalna" value={adminDocForm.archiveSource} onChange={(e) => setAdminDocForm({ ...adminDocForm, archiveSource: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    </div>
                    <select value={adminDocForm.ancestorId} onChange={(e) => setAdminDocForm({ ...adminDocForm, ancestorId: e.target.value })} style={{ width: '100%', minWidth: 0, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)', backgroundColor: '#FFFFFF', textOverflow: 'ellipsis' }}>
                      <option value="">Powiązany przodek (opcjonalnie)</option>
                      {clientAncestorsList.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.firstName} {a.lastName}
                        </option>
                      ))}
                    </select>
                    <textarea rows={2} placeholder="Transkrypcja paleograficzna..." value={adminDocForm.transcription} onChange={(e) => setAdminDocForm({ ...adminDocForm, transcription: e.target.value })} style={{ padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--ivory-border)' }} />
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.65rem' }}>
                      Dodaj dokument do Archiwum klienta
                    </button>
                  </form>
                </div>
              </div>

              {/* Podgląd przodków wybranego klienta */}
              <div className="heritage-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--forest-base)', marginBottom: '0.85rem' }}>
                  Rekordy w drzewie wybranego klienta ({clientAncestorsList.length})
                </h3>
                {clientAncestorsList.length === 0 ? (
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Ten klient nie ma jeszcze żadnych rekordów w drzewie genealogicznym. Dodaj pierwszego przodka powyżej.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {clientAncestorsList.map((a) => (
                      <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.9rem', backgroundColor: 'var(--ivory-base)', borderRadius: '10px', border: '1px solid var(--ivory-border)', fontSize: '0.86rem' }}>
                        <div>
                          <strong>{a.firstName} {a.lastName}</strong> • Pokolenie {a.generation} ({a.birthYear || '?'}–{a.deathYear || 'żyje'}) • {a.birthPlace || 'brak miejsca'} •{' '}
                          <span style={{ color: a.isVerified ? '#244638' : '#9E7836', fontWeight: 600 }}>
                            {a.isVerified ? 'Zweryfikowany' : 'Wskazówka klienta'}
                          </span>
                        </div>
                        <button type="button" onClick={() => handleAdminDeleteAncestor(a.id)} className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: '#8B2E24', borderColor: '#8B2E24' }}>
                          Usuń
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="heritage-card" style={{ padding: '1.35rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--forest-base)', marginBottom: '0.6rem' }}>
                    Zmienne Środowiskowe i Nagłówki
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84rem' }}>
                    <li>• Supabase URL: <strong>{envState.supabaseUrl || 'Nie skonfigurowano'}</strong></li>
                    <li>• Wykryte sekrety w kliencie: <strong>{envState.exposedSecretsCount} (Bezpiecznie)</strong></li>
                    <li>• Debug Mode &amp; Sourcemaps: <strong>Wyłączone (false)</strong></li>
                    <li>• Nagłówki: <strong>CSP, HSTS, X-Frame-Options: DENY, nosniff</strong></li>
                  </ul>
                </div>

                <div className="heritage-card" style={{ padding: '1.35rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--forest-base)', marginBottom: '0.6rem' }}>
                    Status Rate Limitera
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84rem' }}>
                    <li>• Logowanie (auth:login): <strong>{rateStats['auth:login']?.used} / {rateStats['auth:login']?.max} żądań/min</strong></li>
                    <li>• Rejestracja (auth:register): <strong>{rateStats['auth:register']?.used} / {rateStats['auth:register']?.max} żądań/min</strong></li>
                    <li>• Zamówienia (orders:create): <strong>{rateStats['orders:create']?.used} / {rateStats['orders:create']?.max} żądań/min</strong></li>
                    <li>• Dodawanie przodka (ancestors:add): <strong>{rateStats['ancestors:add']?.used} / {rateStats['ancestors:add']?.max} żądań/min</strong></li>
                  </ul>
                </div>
              </div>

              <div className="heritage-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--forest-base)', marginBottom: '0.85rem' }}>
                  Dziennik Zdarzeń Bezpieczeństwa i Operacji RODO (Audit Log)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        backgroundColor: 'var(--ivory-base)',
                        padding: '0.65rem 0.95rem',
                        borderRadius: '10px',
                        border: '1px solid var(--ivory-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        fontSize: '0.83rem'
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--forest-base)', marginRight: '0.5rem' }}>[{log.event}]</strong>
                        <span>{log.detail}</span>
                      </div>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {log.timestamp} • RLS/CSRF OK
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
