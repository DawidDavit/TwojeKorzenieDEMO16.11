import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ClientPortal from './components/ClientPortal';
import DocumentLightbox from './components/DocumentLightbox';
import AuthOrderModal from './components/AuthOrderModal';
import Footer from './components/Footer';
import CookieConsentBanner from './components/CookieConsentBanner';
import LegalComplianceCenter from './components/LegalComplianceCenter';
import HeritageLoader from './components/HeritageLoader';
import { GenealogyRepository } from './services/apiService';
import { SessionManager } from './services/securityService';
import { supabase } from './services/supabaseClient';
import { SupabaseRepository } from './services/supabaseRepository';
import { Lock, LogIn, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeArea, setActiveArea] = useState('landing'); // 'landing' | 'portal'
  const [portalSection, setPortalSection] = useState('dashboard');
  const [dataMode, setDataMode] = useState(() => GenealogyRepository.getDataMode());
  const [ancestors, setAncestors] = useState(() =>
    GenealogyRepository.getAncestors(GenealogyRepository.getDataMode())
  );
  const [clientAccount, setClientAccount] = useState(() =>
    GenealogyRepository.getClientAccount()
  );
  const [currentSession, setCurrentSession] = useState(() =>
    SessionManager.getCurrentSession()
  );
  const [auditLogs, setAuditLogs] = useState(() =>
    GenealogyRepository.getAuditLogs()
  );
  const [lightboxDocument, setLightboxDocument] = useState(null);
  const [cookieBannerOverride, setCookieBannerOverride] = useState(false);
  const [legalCenterState, setLegalCenterState] = useState({
    isOpen: false,
    tab: 'audit40'
  });
  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    tab: 'login',
    selectedService: null
  });
  const [deletionNotice, setDeletionNotice] = useState(null);

  const [documents, setDocuments] = useState(() =>
    GenealogyRepository.getDocuments()
  );
  const [authLoading, setAuthLoading] = useState(() => SupabaseRepository.isEnabled());

  const isAuthenticated = Boolean(currentSession?.isAuthenticated);
  const services = GenealogyRepository.getServices();
  const collaborationSteps = GenealogyRepository.getCollaborationSteps();
  const archiveCategories = GenealogyRepository.getArchiveCategories();
  const discoveries = GenealogyRepository.getDiscoveries();
  const timelineEvents = GenealogyRepository.getTimeline();

  const [dbSetupWarning, setDbSetupWarning] = useState(false);

  const loadSupabaseUserData = async () => {
    if (!SupabaseRepository.isEnabled()) return;
    try {
      const { user, profile, account, dbReady } = await SupabaseRepository.getSessionAndProfile();
      if (!user) {
        SessionManager.clearSession();
        setCurrentSession(null);
        setDbSetupWarning(false);
        setDocuments(GenealogyRepository.getDocuments());
        setAncestors(GenealogyRepository.getAncestors('demo'));
        return;
      }

      const synced = SessionManager.syncSupabaseSession(user, profile);
      setCurrentSession(synced);
      setDbSetupWarning(dbReady === false);
      if (account) {
        setClientAccount(account);
      }

      if (dbReady === false) {
        setAncestors(GenealogyRepository.getAncestors('demo'));
        setDocuments(GenealogyRepository.getDocuments());
        return;
      }

      const [dbAncestors, dbDocs, dbLogs] = await Promise.all([
        SupabaseRepository.fetchAncestorsForUser(user.id).catch(() => []),
        SupabaseRepository.fetchDocumentsForUser(user.id).catch(() => []),
        SupabaseRepository.fetchAuditLogs().catch(() => [])
      ]);

      if (dataMode === 'live') {
        setAncestors(dbAncestors);
        setDocuments(dbDocs);
      } else {
        setAncestors(GenealogyRepository.getAncestors('demo'));
        setDocuments(GenealogyRepository.getDocuments());
      }
      if (dbLogs.length > 0) {
        setAuditLogs(dbLogs);
      }
    } catch {
      // fallback safely if network/RLS error occurs
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!SupabaseRepository.isEnabled()) {
      setAncestors(GenealogyRepository.getAncestors(dataMode));
      setDocuments(GenealogyRepository.getDocuments());
      return;
    }

    let active = true;
    const syncData = async () => {
      if (active) await loadSupabaseUserData();
    };
    syncData();

    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) {
        SessionManager.clearSession();
        setCurrentSession(null);
        setAncestors(GenealogyRepository.getAncestors('demo'));
        setDocuments(GenealogyRepository.getDocuments());
      } else {
        loadSupabaseUserData();
      }
    });

    return () => {
      active = false;
      authSub?.subscription?.unsubscribe();
    };
  }, [dataMode]);

  const refreshAuditLogs = () => {
    setAuditLogs(GenealogyRepository.getAuditLogs());
  };

  const handleToggleDataMode = (nextMode) => {
    GenealogyRepository.setDataMode(nextMode);
    setDataMode(nextMode);
    refreshAuditLogs();
  };

  const handleEnterPortal = (section = 'dashboard') => {
    setActiveArea('portal');
    setPortalSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateLanding = (anchorId = null) => {
    setActiveArea('landing');
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddAncestorClue = async (clueData) => {
    if (SupabaseRepository.isEnabled() && currentSession?.userId) {
      await SupabaseRepository.addClientAncestorClue(currentSession.userId, clueData);
      if (dataMode !== 'live') {
        GenealogyRepository.setDataMode('live');
        setDataMode('live');
      }
      await loadSupabaseUserData();
      return;
    }
    GenealogyRepository.addAncestorClue(clueData);
    setAncestors(GenealogyRepository.getAncestors(dataMode));
    refreshAuditLogs();
  };

  const handleUpdateClientAccount = async (updated) => {
    if (SupabaseRepository.isEnabled() && currentSession?.userId) {
      await SupabaseRepository.updateOwnProfile(currentSession.userId, updated);
      await loadSupabaseUserData();
      return;
    }
    const saved = GenealogyRepository.saveClientAccount(updated);
    setClientAccount(saved);
    refreshAuditLogs();
  };

  const handleOpenServiceOrder = (serviceObj = null) => {
    setAuthModalState({
      isOpen: true,
      tab: 'order',
      selectedService: serviceObj || services[4]
    });
  };

  const handleOpenAuthModal = (tab = 'login') => {
    if (tab === 'account' && isAuthenticated) {
      handleEnterPortal('account');
      return;
    }
    setAuthModalState({
      isOpen: true,
      tab: tab === 'account' ? 'login' : tab,
      selectedService: null
    });
  };

  const handleOpenLegalCenter = (tab = 'audit40') => {
    setLegalCenterState({
      isOpen: true,
      tab
    });
  };

  const handleLoginSuccess = async (userData) => {
    if (SupabaseRepository.isEnabled()) {
      GenealogyRepository.setDataMode('live');
      setDataMode('live');
      await loadSupabaseUserData();
      setDeletionNotice(null);
      setActiveArea('portal');
      setPortalSection('dashboard');
      return;
    }

    const newSession = SessionManager.createSession({
      userId: clientAccount?.id || 'usr-korzeniowski-01',
      email: userData.email,
      role: 'client'
    });
    setCurrentSession(newSession);

    const updated = GenealogyRepository.saveClientAccount({
      ...clientAccount,
      ...userData
    });
    setClientAccount(updated);
    setDeletionNotice(null);
    setActiveArea('portal');
    setPortalSection('dashboard');
    refreshAuditLogs();
  };

  const handleLogout = async () => {
    if (SupabaseRepository.isEnabled()) {
      await SupabaseRepository.signOut().catch(() => {});
    }
    SessionManager.clearSession();
    setCurrentSession(null);
    refreshAuditLogs();
  };

  const handleSwitchRole = () => {
    // Rola jest weryfikowana wyłącznie po stronie bazy danych Supabase (profiles.role)
    refreshAuditLogs();
  };

  const handleOrderComplete = async (service, customerData) => {
    if (SupabaseRepository.isEnabled()) {
      if (!currentSession?.userId) {
        throw new Error('Zaloguj się lub utwórz konto w zakładce Rejestracja, aby przypisać zamówienie do swojego konta w bazie Supabase.');
      }
      await SupabaseRepository.createOrder(currentSession.userId, service, customerData);
      GenealogyRepository.setDataMode('live');
      setDataMode('live');
      await loadSupabaseUserData();
      setActiveArea('portal');
      setPortalSection('dashboard');
      return;
    }

    const newSession = SessionManager.createSession({
      userId: clientAccount?.id || 'usr-korzeniowski-01',
      email: customerData.email,
      role: currentSession?.role || 'client'
    });
    setCurrentSession(newSession);

    const { updatedAccount } = GenealogyRepository.createOrder(service, customerData);
    setClientAccount(updatedAccount);
    setActiveArea('portal');
    setPortalSection('dashboard');
    refreshAuditLogs();
  };

  const handleUnsubscribeMarketing = () => {
    const updated = GenealogyRepository.unsubscribeAllMarketing();
    setClientAccount(updated);
    refreshAuditLogs();
  };

  const handleExportAccountData = () => {
    const bundle = GenealogyRepository.exportUserDataGdpr();
    refreshAuditLogs();
    return bundle;
  };

  const handleDeleteAccountData = async () => {
    if (SupabaseRepository.isEnabled() && currentSession?.userId) {
      await SupabaseRepository.gdprEraseOwnData();
    }
    const result = GenealogyRepository.deleteUserAccountAndData();
    setCurrentSession(null);
    setClientAccount(GenealogyRepository.getClientAccount());
    setAncestors(GenealogyRepository.getAncestors('demo'));
    setDataMode('demo');
    setDeletionNotice(`Twoje konto oraz powiązane dane osobowe zostały trwale usunięte zgodnie z Art. 17 RODO (${result.timestamp}).`);
    setActiveArea('landing');
    refreshAuditLogs();
  };

  const handleNavigateToAncestorFromDoc = () => {
    setActiveArea('portal');
    setPortalSection('story');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HeritageLoader visible={authLoading} />
      <Navbar
        activeArea={activeArea}
        setActiveArea={setActiveArea}
        portalSection={portalSection}
        setPortalSection={setPortalSection}
        dataMode={dataMode}
        onToggleDataMode={handleToggleDataMode}
        clientAccount={clientAccount}
        isAuthenticated={isAuthenticated}
        userRole={currentSession?.role || 'client'}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onOpenLegalCenter={handleOpenLegalCenter}
      />

      {dbSetupWarning && (
        <div
          role="alert"
          style={{
            backgroundColor: '#8B2E24',
            color: '#F3EFE5',
            padding: '0.85rem 1.25rem',
            borderBottom: '2px solid var(--gold-base)',
            textAlign: 'center',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          Zalogowano w Supabase Auth, ale tabele w bazie danych jeszcze nie istnieją (błąd 404). Uruchom migrację z pliku supabase/migrations/20261116000001_init_twojekorzenie_schema.sql w Supabase SQL Editor.
        </div>
      )}

      {deletionNotice && (
        <div
          role="status"
          style={{
            backgroundColor: '#172F25',
            color: '#F3EFE5',
            padding: '0.85rem 1.25rem',
            borderBottom: '2px solid var(--gold-base)',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          {deletionNotice}
        </div>
      )}

      <div id="main-content" tabIndex={-1} style={{ flex: 1, outline: 'none' }}>
        {activeArea === 'landing' ? (
          <LandingPage
            services={services}
            collaborationSteps={collaborationSteps}
            ancestors={ancestors}
            onEnterPortal={handleEnterPortal}
            onSelectServiceOrder={handleOpenServiceOrder}
          />
        ) : !isAuthenticated ? (
          /* Zadanie 4 & 5: Ochrona Panelu Klienta przed dostępem niezalogowanego użytkownika */
          <div className="archival-bg" style={{ padding: '5rem 1.25rem', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="heritage-card animate-fade-in" style={{ maxWidth: '580px', width: '100%', padding: '2.5rem', border: '2px solid var(--gold-base)', textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--forest-base)',
                  color: 'var(--gold-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}
              >
                <Lock size={28} aria-hidden="true" />
              </div>
              <span className="gold-badge" style={{ marginBottom: '0.6rem' }}>
                <ShieldCheck size={13} aria-hidden="true" /> Chroniona Przestrzeń Archiwalna (Zadanie #4 i #5)
              </span>
              <h1 style={{ fontSize: '1.85rem', color: 'var(--forest-base)', marginBottom: '0.6rem' }}>
                Wymagane zalogowanie do Prywatnego Archiwum
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', marginBottom: '1.6rem', lineHeight: 1.65 }}>
                Twoja sesja została zamknięta lub wygasła. Aby przeglądać prywatne drzewo genealogiczne, skany dokumentów i faktury, zaloguj się ponownie.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => handleOpenAuthModal('login')}
                  className="btn-primary"
                >
                  <LogIn size={18} aria-hidden="true" />
                  <span>Zaloguj się ponownie</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateLanding()}
                  className="btn-secondary"
                >
                  <span>Wróć na stronę główną</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ClientPortal
            activeSection={portalSection}
            setActiveSection={setPortalSection}
            clientAccount={clientAccount}
            onUpdateClientAccount={handleUpdateClientAccount}
            ancestors={ancestors}
            documents={documents}
            archiveCategories={archiveCategories}
            discoveries={discoveries}
            timelineEvents={timelineEvents}
            onAddAncestorClue={handleAddAncestorClue}
            onOpenDocumentLightbox={(doc) => setLightboxDocument(doc)}
            onOpenOrderModal={handleOpenServiceOrder}
            currentSession={currentSession}
            onSwitchRole={handleSwitchRole}
            onDeleteAccountData={handleDeleteAccountData}
            onExportAccountData={handleExportAccountData}
            onUnsubscribeMarketing={handleUnsubscribeMarketing}
            onOpenLegalCenter={handleOpenLegalCenter}
            auditLogs={auditLogs}
            onRefreshData={loadSupabaseUserData}
          />
        )}
      </div>

      <Footer
        onNavigateLanding={handleNavigateLanding}
        onNavigatePortal={handleEnterPortal}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenLegalCenter={handleOpenLegalCenter}
        onOpenCookieBanner={() => setCookieBannerOverride(true)}
        onUnsubscribeMarketing={handleUnsubscribeMarketing}
      />

      {/* Lightbox do powiększania skanów dokumentów */}
      <DocumentLightbox
        documentItem={lightboxDocument}
        onClose={() => setLightboxDocument(null)}
        onNavigateToAncestor={handleNavigateToAncestorFromDoc}
      />

      {/* Modal Logowania / Rejestracji / Resetu Hasła / Zakupu Usługi */}
      <AuthOrderModal
        isOpen={authModalState.isOpen}
        initialTab={authModalState.tab}
        selectedServiceForOrder={authModalState.selectedService}
        services={services}
        clientAccount={clientAccount}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onLoginSuccess={handleLoginSuccess}
        onOrderComplete={handleOrderComplete}
        onOpenLegalDoc={(docTab) => handleOpenLegalCenter(docTab)}
      />

      {/* Centrum Prawa, RODO i Raport Audytu 40 Zadań */}
      <LegalComplianceCenter
        isOpen={legalCenterState.isOpen}
        initialTab={legalCenterState.tab}
        currentSession={currentSession}
        onSwitchRole={handleSwitchRole}
        onClose={() => setLegalCenterState({ ...legalCenterState, isOpen: false })}
      />

      {/* Baner Zgody na Pliki Cookies (Zadanie #5 z listy prawnej) */}
      <CookieConsentBanner
        isOpenOverride={cookieBannerOverride}
        onCloseOverride={() => setCookieBannerOverride(false)}
        onOpenLegalDoc={(docTab) => handleOpenLegalCenter(docTab)}
      />
    </div>
  );
}
