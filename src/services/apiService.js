// Warstwa abstrakcji API i repozytorium danych TwojeKorzenie z zabezpieczeniami OWASP i RODO
// Zintegrowana z kontrolą dostępu (RBAC/IDOR), Rate Limiterem, sumami kontrolnymi SecureStorage i tokenami CSRF

import {
  SERVICES_CATALOG,
  COLLABORATION_STEPS,
  DEMO_ANCESTORS,
  LIVE_CLIENT_ANCESTORS,
  ARCHIVE_CATEGORIES,
  ARCHIVE_DOCUMENTS,
  RECENT_DISCOVERIES,
  FAMILY_TIMELINE_EVENTS,
  INITIAL_CLIENT_ACCOUNT,
  COMPANY_LEGAL_DETAILS,
  VERIFIED_CLIENT_REVIEWS
} from '../data/genealogyData';

import {
  SecureStorage,
  SessionManager,
  RateLimiter,
  authorizeUserAction,
  sanitizeText,
  sanitizePayload,
  validateEnvConfig
} from './securityService';

const STORAGE_KEY_ACCOUNT = 'twojekorzenie_client_account_v1';
const STORAGE_KEY_CUSTOM_ANCESTORS = 'twojekorzenie_custom_ancestors_v1';
const STORAGE_KEY_MODE = 'twojekorzenie_data_mode_v1';
const STORAGE_KEY_AUDIT_LOG = 'twojekorzenie_security_audit_log_v1';

const envState = validateEnvConfig();

// Konfiguracja bezpiecznego połączenia z backendem (Zadanie 1, 2, 9, 12)
export const API_CONFIG = {
  baseUrl: envState.apiBaseUrl,
  debug: false, // Zadanie 12: Tryb debugowania trwale wyłączony
  useMockBackend: true,
  securityHeaders: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json; charset=utf-8'
  },
  endpoints: {
    auth: '/auth/session',
    ancestors: '/genealogy/ancestors',
    documents: '/archive/documents',
    orders: '/billing/orders',
    invoices: '/billing/invoices',
    gdprErasure: '/privacy/erasure',
    gdprExport: '/privacy/export'
  }
};

function appendAuditLog(event, detail) {
  try {
    const logs = SecureStorage.getItem(STORAGE_KEY_AUDIT_LOG, []);
    const entry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('pl-PL'),
      event: sanitizeText(event, 80),
      detail: sanitizeText(detail, 220),
      csrfVerified: Boolean(SessionManager.getCsrfToken())
    };
    SecureStorage.setItem(STORAGE_KEY_AUDIT_LOG, [entry, ...logs].slice(0, 30));
  } catch {
    // ignore storage errors
  }
}

export const GenealogyRepository = {
  getCompanyDetails() {
    return COMPANY_LEGAL_DETAILS;
  },

  getVerifiedReviews() {
    return VERIFIED_CLIENT_REVIEWS;
  },

  getAuditLogs() {
    return SecureStorage.getItem(STORAGE_KEY_AUDIT_LOG, [
      {
        id: 'log-init-1',
        timestamp: '15:45:00',
        event: 'SYSTEM_INIT',
        detail: 'Zainicjalizowano zabezpieczenia CSP, HSTS, RBAC, RateLimiter oraz ochronę RODO.',
        csrfVerified: true
      }
    ]);
  },

  getServices() {
    return SERVICES_CATALOG;
  },

  getCollaborationSteps() {
    return COLLABORATION_STEPS;
  },

  getArchiveCategories() {
    return ARCHIVE_CATEGORIES;
  },

  getDataMode() {
    const saved = SecureStorage.getItem(STORAGE_KEY_MODE, 'demo');
    return saved === 'live' ? 'live' : 'demo';
  },

  setDataMode(mode) {
    const cleanMode = mode === 'live' ? 'live' : 'demo';
    SecureStorage.setItem(STORAGE_KEY_MODE, cleanMode);
    appendAuditLog('DATA_MODE_SWITCH', `Przełączono tryb danych na: ${cleanMode}`);
    return cleanMode;
  },

  getAncestors(mode = 'demo') {
    const customList = SecureStorage.getItem(STORAGE_KEY_CUSTOM_ANCESTORS, []);
    const safeCustom = Array.isArray(customList) ? customList : [];

    if (mode === 'live') {
      return [...LIVE_CLIENT_ANCESTORS, ...safeCustom];
    }
    return [...DEMO_ANCESTORS, ...safeCustom];
  },

  addAncestorClue(newPerson) {
    // Zadanie 8 & 9: Rate limiting + autoryzacja + sanityzacja formularza
    const rate = RateLimiter.check('ancestors:add');
    if (!rate.allowed) {
      throw new Error(rate.error);
    }

    const session = SessionManager.getCurrentSession();
    const authCheck = authorizeUserAction(session, session?.userId, 'create_ancestor_clue');
    if (!authCheck.allowed) {
      throw new Error(authCheck.error);
    }

    const clean = sanitizePayload(newPerson, 400);
    const customList = SecureStorage.getItem(STORAGE_KEY_CUSTOM_ANCESTORS, []);
    const safeList = Array.isArray(customList) ? customList : [];

    const birthYearInt = parseInt(clean.birthYear, 10) || 1900;
    // Zadanie 17 (RODO): Ochrona małoletnich (jeśli rok urodzenia > 2008 i brak zgody opiekuna)
    const isMinor = birthYearInt > 2008;

    const created = {
      id: `custom-${Date.now()}`,
      firstName: sanitizeText(clean.firstName, 60),
      lastName: sanitizeText(clean.lastName, 60),
      maidenName: clean.maidenName ? sanitizeText(clean.maidenName, 60) : null,
      generation: Math.min(6, Math.max(1, Number(clean.generation) || 4)),
      generationLabel: `Pokolenie ${clean.generation || 'IV'} (Wskazówka Klienta)`,
      role: sanitizeText(clean.role || 'Przodek zgłoszony do weryfikacji', 80),
      birthDate: isMinor ? 'Dane chronione (osoba małoletnia)' : sanitizeText(clean.birthYear || 'ok. 1900', 40),
      birthYear: birthYearInt,
      deathDate: sanitizeText(clean.deathYear || 'nieznana', 40),
      deathYear: parseInt(clean.deathYear, 10) || null,
      birthPlace: sanitizeText(clean.birthPlace || 'Do ustalenia w kwerendzie', 80),
      region: sanitizeText(clean.region || 'Polska / Kresy', 80),
      coordinates: {
        x: 60,
        y: 60,
        city: sanitizeText(clean.birthPlace || 'Polska', 60),
        period: `${birthYearInt}`
      },
      profession: sanitizeText(clean.profession || 'Przekaz rodzinny w weryfikacji', 100),
      coatOfArms: 'W trakcie badań',
      portraitSeed: `custom-${Date.now()}`,
      portraitTone: '#7D5B21',
      parentIds: [],
      spouseId: null,
      siblingIds: [],
      childrenIds: ['anc-2'],
      isVerified: false,
      verificationSource: 'Zgłoszone przez Klienta – przypisano do kwerendy archiwalnej',
      shortBio: sanitizeText(
        clean.notes || 'Informacja przekazana przez klienta do weryfikacji w księgach metrykalnych.',
        350
      ),
      storyParagraphs: [
        sanitizeText(
          clean.notes ||
            'Ten profil został dodany przez właściciela konta jako wskazówka rodzinna dla zespołu genealogów TwojeKorzenie. Po odnalezieniu metryk w archiwum profil zostanie uzupełniony o skany oryginalnych aktów.',
          500
        )
      ],
      lifeEvents: [
        {
          year: String(birthYearInt),
          title: `Wskazówka rodzinna: ${sanitizeText(clean.firstName, 40)} ${sanitizeText(clean.lastName, 40)}`,
          place: sanitizeText(clean.birthPlace || 'Polska', 60),
          desc: sanitizeText(clean.notes || 'Przekazano do weryfikacji archiwalnej.', 250)
        }
      ],
      residences: [
        {
          city: sanitizeText(clean.birthPlace || 'Miejscowość rodzinna', 60),
          years: String(birthYearInt),
          x: 62,
          y: 58,
          note: 'Lokalizacja wskazana przez rodzinę'
        }
      ]
    };

    const updated = [...safeList, created];
    SecureStorage.setItem(STORAGE_KEY_CUSTOM_ANCESTORS, updated);
    appendAuditLog('ANCESTOR_CLUE_ADDED', `Dodano wskazówkę o przodku: ${created.firstName} ${created.lastName}`);
    return created;
  },

  getDocuments() {
    return ARCHIVE_DOCUMENTS;
  },

  getDiscoveries() {
    return RECENT_DISCOVERIES;
  },

  getTimeline() {
    return FAMILY_TIMELINE_EVENTS;
  },

  getClientAccount() {
    const saved = SecureStorage.getItem(STORAGE_KEY_ACCOUNT, null);
    if (saved && typeof saved === 'object' && saved.email) {
      return {
        ...INITIAL_CLIENT_ACCOUNT,
        ...saved,
        consents: {
          ...INITIAL_CLIENT_ACCOUNT.consents,
          ...(saved.consents || {})
        }
      };
    }
    return INITIAL_CLIENT_ACCOUNT;
  },

  saveClientAccount(account) {
    const rate = RateLimiter.check('account:update');
    if (!rate.allowed) {
      throw new Error(rate.error);
    }

    const sanitized = sanitizePayload(account, 400);
    // Nigdy nie przechowujemy jawnego pola password w obiekcie konta (Zadanie 17)
    delete sanitized.password;
    delete sanitized.plainPassword;

    SecureStorage.setItem(STORAGE_KEY_ACCOUNT, sanitized);
    appendAuditLog('ACCOUNT_UPDATED', `Zaktualizowano profil konta: ${sanitized.email}`);
    return sanitized;
  },

  unsubscribeAllMarketing() {
    const current = this.getClientAccount();
    const updated = {
      ...current,
      consents: {
        ...(current.consents || {}),
        newsletterSubscribed: false,
        researchAlertsSubscribed: false,
        unsubscribedAt: new Date().toLocaleString('pl-PL')
      }
    };
    SecureStorage.setItem(STORAGE_KEY_ACCOUNT, updated);
    appendAuditLog('UNSUBSCRIBE_MARKETING', `Wypisano adres ${current.email} z komunikatów marketingowych.`);
    return updated;
  },

  exportUserDataGdpr() {
    const account = this.getClientAccount();
    const customAncestors = SecureStorage.getItem(STORAGE_KEY_CUSTOM_ANCESTORS, []);
    const exportBundle = {
      exportedAt: new Date().toISOString(),
      dataController: COMPANY_LEGAL_DETAILS.companyName,
      gdprBasis: 'Art. 20 RODO — Prawo do przenoszenia danych',
      accountProfile: {
        id: account.id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        phone: account.phone,
        city: account.city,
        consents: account.consents,
        orders: account.orders,
        invoices: account.invoices
      },
      customFamilyClues: customAncestors
    };
    appendAuditLog('GDPR_DATA_EXPORT', 'Wygenerowano pełny eksport danych osobowych (Art. 20 RODO).');
    return exportBundle;
  },

  deleteUserAccountAndData() {
    // Zadanie 20 z listy prawnej: Trwałe usunięcie konta i danych (Prawo do bycia zapomnianym - Art. 17 RODO)
    SecureStorage.removeItem(STORAGE_KEY_ACCOUNT);
    SecureStorage.removeItem(STORAGE_KEY_CUSTOM_ANCESTORS);
    SecureStorage.removeItem(STORAGE_KEY_MODE);
    SessionManager.clearSession();
    appendAuditLog('GDPR_DATA_ERASURE', 'Wykonano trwałe usunięcie danych konta zgodnie z Art. 17 RODO.');
    return {
      deleted: true,
      timestamp: new Date().toLocaleString('pl-PL')
    };
  },

  createOrder(service, customerData) {
    const rate = RateLimiter.check('orders:create');
    if (!rate.allowed) {
      throw new Error(rate.error);
    }

    const cleanCustomer = sanitizePayload(customerData, 400);
    const current = this.getClientAccount();
    const orderNumber = `ZAM/2026/11/${Math.floor(310 + Math.random() * 600)}`;
    const invoiceNumber = `FV/2026/11/${Math.floor(400 + Math.random() * 500)}`;
    const today = '16 listopada 2026';

    const newOrder = {
      orderId: orderNumber,
      serviceId: service.id,
      serviceName: `${service.title} – ${service.subtitle}`,
      orderDate: today,
      status: 'Przyjęte do realizacji – Przypisano genealoga',
      statusBadge: 'active',
      amount: service.price,
      accessGranted: true,
      familyClue: cleanCustomer?.familyClues || ''
    };

    const newInvoice = {
      invoiceId: invoiceNumber,
      date: '16.11.2026',
      description: `Zamówienie usługi: ${service.title} (${orderNumber})`,
      amount: `${service.price} (${service.priceNetto || 'w tym 23% VAT'})`,
      paymentMethod: cleanCustomer?.paymentMethod || 'Karta płatnicza / BLIK Premium',
      status: 'Opłacona'
    };

    const updatedAccount = {
      ...current,
      firstName: cleanCustomer?.firstName || current.firstName,
      lastName: cleanCustomer?.lastName || current.lastName,
      email: cleanCustomer?.email || current.email,
      phone: cleanCustomer?.phone || current.phone,
      consents: {
        ...(current.consents || {}),
        termsAccepted: true,
        privacyAccepted: true,
        ageConfirmed: true,
        newsletterSubscribed: Boolean(cleanCustomer?.newsletterConsent),
        updatedAt: '16.11.2026'
      },
      activePackageId: service.id,
      activePackageName: `${service.title} – ${service.subtitle}`,
      orders: [newOrder, ...current.orders],
      invoices: [newInvoice, ...current.invoices]
    };

    this.saveClientAccount(updatedAccount);
    appendAuditLog('ORDER_CREATED', `Utworzono zamówienie ${orderNumber} na usługę ${service.title}`);
    return { updatedAccount, newOrder, newInvoice };
  }
};
