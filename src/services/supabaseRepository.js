import { supabase, isSupabaseConfigured } from './supabaseClient';
import { sanitizeText, sanitizePayload } from './securityService';

function mapAncestorFromDb(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    maidenName: row.maiden_name || null,
    generation: Number(row.generation) || 1,
    generationLabel: row.generation_label || `Pokolenie ${row.generation || 1}`,
    role: row.role || 'Członek rodziny',
    birthDate: row.birth_date || '',
    birthYear: row.birth_year || null,
    deathDate: row.death_date || 'żyje',
    deathYear: row.death_year || null,
    birthPlace: row.birth_place || '',
    region: row.region || '',
    coordinates: row.coordinates || { x: 55, y: 55, city: row.birth_place || 'Polska', period: '' },
    profession: row.profession || '',
    coatOfArms: row.coat_of_arms || '',
    portraitTone: row.portrait_tone || '#2E5947',
    parentIds: Array.isArray(row.parent_ids) ? row.parent_ids : [],
    spouseId: row.spouse_id || null,
    siblingIds: Array.isArray(row.sibling_ids) ? row.sibling_ids : [],
    childrenIds: Array.isArray(row.children_ids) ? row.children_ids : [],
    isVerified: Boolean(row.is_verified),
    verificationSource: row.verification_source || 'Weryfikacja archiwalna TwojeKorzenie',
    shortBio: row.short_bio || '',
    storyParagraphs: Array.isArray(row.story_paragraphs) ? row.story_paragraphs : [],
    lifeEvents: Array.isArray(row.life_events) ? row.life_events : [],
    residences: Array.isArray(row.residences) ? row.residences : []
  };
}

function mapDocumentFromDb(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ancestorId: row.ancestor_id || null,
    ancestorName: row.ancestor_name || '',
    category: row.category || 'Akty metrykalne',
    title: row.title || '',
    date: row.doc_date || '',
    year: row.year || null,
    place: row.place || '',
    archiveSource: row.archive_source || '',
    language: row.language || 'Polski',
    stampText: row.stamp_text || 'ARCHIWUM PAŃSTWOWE • ODPIS WIERZYTELNY',
    paperTone: row.paper_tone || '#EDE3CE',
    isNewDiscovery: Boolean(row.is_new_discovery),
    description: row.description || '',
    transcription: row.transcription || ''
  };
}

function mapProfileToAccount(profile, ordersRows = []) {
  const mappedOrders = ordersRows.map((o) => ({
    id: o.id,
    orderId: o.order_number,
    serviceId: o.service_id,
    serviceName: o.service_name,
    orderDate: new Date(o.created_at).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    status: o.status,
    statusBadge: o.status?.toLowerCase().includes('zrealizowane') ? 'completed' : 'active',
    amount: o.amount,
    accessGranted: true,
    familyClue: o.family_clues || ''
  }));

  const mappedInvoices = ordersRows.map((o) => ({
    invoiceId: o.invoice_number,
    date: new Date(o.created_at).toLocaleDateString('pl-PL'),
    description: `Zamówienie usługi: ${o.service_name} (${o.order_number})`,
    amount: `${o.amount}${o.price_netto ? ` (${o.price_netto})` : ''}`,
    paymentMethod: o.payment_method,
    status: o.invoice_status || 'Opłacona'
  }));

  return {
    id: profile.id,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    city: profile.city || '',
    memberSince: new Date(profile.created_at).toLocaleDateString('pl-PL', {
      month: 'long',
      year: 'numeric'
    }),
    role: profile.role === 'admin' ? 'admin' : 'client',
    ageVerified: Boolean(profile.age_verified),
    consents: profile.consents || {
      termsAccepted: true,
      privacyAccepted: true,
      ageConfirmed: Boolean(profile.age_verified),
      newsletterSubscribed: false,
      researchAlertsSubscribed: true
    },
    activePackageId: profile.active_package_id || 'pakiet-kompleksowy',
    activePackageName: profile.active_package_name || 'Oczekuje na wybór pakietu badawczego',
    leadGenealogist: profile.lead_genealogist || 'dr Marek Wolski (Archiwista & Historyk XIX/XX w.)',
    researchProgress: Number(profile.research_progress) || 0,
    researchStages: Array.isArray(profile.research_stages) ? profile.research_stages : [],
    orders: mappedOrders,
    invoices: mappedInvoices
  };
}

export const SupabaseRepository = {
  isEnabled() {
    return isSupabaseConfigured && Boolean(supabase);
  },

  async logAudit(event, detail) {
    if (!this.isEnabled()) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      await supabase.from('audit_logs').insert({
        actor_id: userData.user.id,
        event: sanitizeText(event, 80),
        detail: sanitizeText(detail, 240)
      });
    } catch {
      // ignore audit logging failure
    }
  },

  async fetchAuditLogs() {
    if (!this.isEnabled()) return [];
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, actor_id, event, detail, created_at')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      timestamp: new Date(row.created_at).toLocaleTimeString('pl-PL'),
      event: row.event,
      detail: row.detail,
      csrfVerified: true
    }));
  },

  async signUp({ email, password, firstName, lastName, phone, consents }) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const { data, error } = await supabase.auth.signUp({
      email: sanitizeText(email, 120),
      password,
      options: {
        data: {
          first_name: sanitizeText(firstName, 60),
          last_name: sanitizeText(lastName, 60),
          phone: sanitizeText(phone || '', 30),
          age_verified: Boolean(consents?.ageConfirmed),
          terms_accepted: Boolean(consents?.termsAccepted),
          privacy_accepted: Boolean(consents?.privacyAccepted),
          newsletter_subscribed: Boolean(consents?.newsletterSubscribed)
        }
      }
    });
    if (error) throw error;
    return data;
  },

  async signIn({ email, password }) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizeText(email, 120),
      password
    });
    if (error) throw error;
    await this.logAudit('AUTH_LOGIN', `Zalogowano użytkownika: ${sanitizeText(email, 120)}`);
    return data;
  },

  async signOut() {
    if (!this.isEnabled()) return;
    await this.logAudit('AUTH_LOGOUT', 'Wylogowano użytkownika z sesji Supabase Auth.');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const { error } = await supabase.auth.resetPasswordForEmail(sanitizeText(email, 120), {
      redirectTo: window.location.origin
    });
    if (error) throw error;
  },

  async getSessionAndProfile() {
    if (!this.isEnabled()) return { user: null, profile: null, account: null, dbReady: false };
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;
    const user = sessionData?.session?.user || null;
    if (!user) return { user: null, profile: null, account: null, dbReady: true };

    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profErr) {
      // Jeśli tabela jeszcze nie istnieje (404 / PGRST205), nie blokuj samej sesji Auth
      return {
        user,
        profile: null,
        account: {
          id: user.id,
          email: user.email || '',
          firstName: user.user_metadata?.first_name || 'Użytkownik',
          lastName: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          city: '',
          role: 'client',
          orders: [],
          invoices: [],
          researchProgress: 0,
          researchStages: [],
          activePackageName: 'Brak tabel w bazie Supabase — uruchom migrację SQL',
          leadGenealogist: 'dr Marek Wolski'
        },
        dbReady: false,
        dbError: profErr.message
      };
    }

    let resolvedProfile = profile;
    // Jeśli użytkownik zarejestrował się przed uruchomieniem triggera, utwórz jego profil
    if (!resolvedProfile) {
      const { data: createdProf } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          role: 'client'
        })
        .select()
        .maybeSingle();
      resolvedProfile = createdProf || null;
    }

    const { data: ordersRows } = await supabase
      .from('orders')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    const account = resolvedProfile ? mapProfileToAccount(resolvedProfile, ordersRows || []) : null;
    return { user, profile: resolvedProfile, account, dbReady: true };
  },

  async updateOwnProfile(userId, updatedFields) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const clean = sanitizePayload(updatedFields, 400);
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: clean.firstName,
        last_name: clean.lastName,
        phone: clean.phone || '',
        city: clean.city || '',
        consents: clean.consents
      })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    await this.logAudit('PROFILE_UPDATED', `Zaktualizowano profil użytkownika (${data.email}).`);
    return data;
  },

  async fetchAncestorsForUser(ownerId) {
    if (!this.isEnabled() || !ownerId) return [];
    const { data, error } = await supabase
      .from('ancestors')
      .select('*')
      .eq('owner_id', ownerId)
      .order('generation', { ascending: false })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapAncestorFromDb);
  },

  async addClientAncestorClue(ownerId, clueData) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const clean = sanitizePayload(clueData, 400);
    const birthYearInt = parseInt(clean.birthYear, 10) || 1900;
    const isMinor = birthYearInt > 2008;

    const payload = {
      owner_id: ownerId,
      first_name: sanitizeText(clean.firstName, 60),
      last_name: sanitizeText(clean.lastName, 60),
      maiden_name: clean.maidenName ? sanitizeText(clean.maidenName, 60) : null,
      generation: Math.min(6, Math.max(1, Number(clean.generation) || 4)),
      generation_label: `Pokolenie ${clean.generation || 'IV'} (Wskazówka Klienta)`,
      role: sanitizeText(clean.role || 'Przodek zgłoszony do weryfikacji', 80),
      birth_date: isMinor ? 'Dane chronione (osoba małoletnia)' : sanitizeText(clean.birthYear || 'ok. 1900', 40),
      birth_year: birthYearInt,
      death_date: sanitizeText(clean.deathYear || 'nieznana', 40),
      death_year: parseInt(clean.deathYear, 10) || null,
      birth_place: sanitizeText(clean.birthPlace || 'Do ustalenia w kwerendzie', 80),
      region: sanitizeText(clean.region || 'Polska / Kresy', 80),
      coordinates: {
        x: 60,
        y: 60,
        lat: clean.lat || null,
        lng: clean.lng || null,
        city: sanitizeText(clean.birthPlace || 'Polska', 60),
        period: `${birthYearInt}`
      },
      profession: sanitizeText(clean.profession || 'Przekaz rodzinny w weryfikacji', 100),
      coat_of_arms: 'W trakcie badań',
      portrait_tone: '#7D5B21',
      is_verified: false,
      verification_source: 'Zgłoszone przez Klienta – przypisano do kwerendy archiwalnej',
      short_bio: sanitizeText(clean.notes || 'Informacja przekazana przez klienta do weryfikacji.', 350),
      story_paragraphs: [
        sanitizeText(
          clean.notes ||
            'Ten profil został dodany przez właściciela konta jako wskazówka rodzinna dla zespołu genealogów TwojeKorzenie.',
          500
        )
      ],
      life_events: [
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
          lat: clean.lat || null,
          lng: clean.lng || null,
          note: 'Lokalizacja wskazana przez rodzinę'
        }
      ],
      created_by: ownerId
    };

    const { data, error } = await supabase.from('ancestors').insert(payload).select().single();
    if (error) throw error;
    await this.logAudit('ANCESTOR_CLUE_ADDED', `Dodano wskazówkę o przodku: ${payload.first_name} ${payload.last_name}`);
    return mapAncestorFromDb(data);
  },

  async fetchDocumentsForUser(ownerId) {
    if (!this.isEnabled() || !ownerId) return [];
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDocumentFromDb);
  },

  async createOrder(ownerId, service, customerData) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const clean = sanitizePayload(customerData, 400);
    const orderNumber = `ZAM/2026/11/${Math.floor(310 + Math.random() * 600)}`;
    const invoiceNumber = `FV/2026/11/${Math.floor(400 + Math.random() * 500)}`;

    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .insert({
        owner_id: ownerId,
        order_number: orderNumber,
        invoice_number: invoiceNumber,
        service_id: service.id,
        service_name: `${service.title} – ${service.subtitle}`,
        amount: service.price,
        price_netto: service.priceNetto || 'w tym 23% VAT',
        payment_method: clean.paymentMethod || 'Przelew natychmiastowy / BLIK Premium',
        status: 'Przyjęte do realizacji – Przypisano genealoga',
        invoice_status: 'Opłacona',
        family_clues: clean.familyClues || ''
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    await supabase
      .from('profiles')
      .update({
        first_name: clean.firstName,
        last_name: clean.lastName,
        phone: clean.phone || '',
        active_package_id: service.id,
        active_package_name: `${service.title} – ${service.subtitle}`,
        research_progress: 15
      })
      .eq('id', ownerId);

    await this.logAudit('ORDER_CREATED', `Utworzono zamówienie ${orderNumber} na usługę ${service.title}`);
    return orderRow;
  },

  async gdprEraseOwnData() {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const { error } = await supabase.rpc('gdpr_erase_my_data');
    if (error) throw error;
    await supabase.auth.signOut();
  },

  // =========================================================================
  // FUNKCJE ADMINISTRATORSKIE (chronione przez RLS + private.is_admin() w DB)
  // =========================================================================
  async adminListClients() {
    if (!this.isEnabled()) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, active_package_name, research_progress, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async adminUpdateClientProgress(clientId, { activePackageName, researchProgress }) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const { data, error } = await supabase
      .from('profiles')
      .update({
        active_package_name: sanitizeText(activePackageName, 140),
        research_progress: Math.min(100, Math.max(0, Number(researchProgress) || 0))
      })
      .eq('id', clientId)
      .select()
      .single();
    if (error) throw error;
    await this.logAudit('ADMIN_UPDATE_CLIENT', `Zaktualizowano postęp badań klienta ${data.email} (${data.research_progress}%)`);
    return data;
  },

  async adminInsertVerifiedAncestor(clientId, ancestorInput) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const clean = sanitizePayload(ancestorInput, 600);
    const { data: userData } = await supabase.auth.getUser();
    const birthYearInt = parseInt(clean.birthYear, 10) || null;
    const deathYearInt = parseInt(clean.deathYear, 10) || null;

    const parentIds = Array.isArray(clean.parentIds)
      ? clean.parentIds.filter(Boolean)
      : [clean.parentId1, clean.parentId2, clean.parentId].filter(Boolean);
    const childrenIds = Array.isArray(clean.childrenIds)
      ? clean.childrenIds.filter(Boolean)
      : clean.childId
      ? [clean.childId]
      : [];
    const siblingIds = Array.isArray(clean.siblingIds)
      ? clean.siblingIds.filter(Boolean)
      : clean.siblingId
      ? [clean.siblingId]
      : [];

    const genNum = Math.min(8, Math.max(1, Number(clean.generation) || 3));
    const genRoman = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI' }[genNum] || String(genNum);

    const payload = {
      owner_id: clientId,
      first_name: sanitizeText(clean.firstName, 60),
      last_name: sanitizeText(clean.lastName, 60),
      maiden_name: clean.maidenName ? sanitizeText(clean.maidenName, 60) : null,
      generation: genNum,
      generation_label: sanitizeText(clean.generationLabel || `Pokolenie ${genRoman} (${clean.role || 'Przodek'})`, 80),
      role: sanitizeText(clean.role || 'Przodek', 80),
      birth_date: sanitizeText(clean.birthDate || String(birthYearInt || ''), 40),
      birth_year: birthYearInt,
      death_date: sanitizeText(clean.deathDate || (deathYearInt ? String(deathYearInt) : 'żyje'), 40),
      death_year: deathYearInt,
      birth_place: sanitizeText(clean.birthPlace || '', 80),
      region: sanitizeText(clean.region || '', 80),
      coordinates: {
        x: 55,
        y: 55,
        lat: clean.lat || null,
        lng: clean.lng || null,
        city: sanitizeText(clean.birthPlace || 'Polska', 60),
        period: ''
      },
      profession: sanitizeText(clean.profession || '', 100),
      coat_of_arms: sanitizeText(clean.coatOfArms || '', 80),
      portrait_tone: clean.portraitTone || '#244638',
      parent_ids: parentIds,
      spouse_id: clean.spouseId || null,
      children_ids: childrenIds,
      sibling_ids: siblingIds,
      is_verified: true,
      verification_source: sanitizeText(clean.verificationSource || 'Zweryfikowano w Archiwum Państwowym', 180),
      short_bio: sanitizeText(clean.shortBio || '', 400),
      story_paragraphs: clean.shortBio ? [sanitizeText(clean.shortBio, 600)] : [],
      life_events: birthYearInt
        ? [
            {
              year: String(birthYearInt),
              title: `Narodziny: ${sanitizeText(clean.firstName, 40)} ${sanitizeText(clean.lastName, 40)}`,
              place: sanitizeText(clean.birthPlace || 'Polska', 60),
              desc: sanitizeText(clean.verificationSource || 'Wpis potwierdzony w księgach metrykalnych.', 240)
            }
          ]
        : [],
      residences: clean.birthPlace
        ? [
            {
              city: sanitizeText(clean.birthPlace, 60),
              years: birthYearInt ? `${birthYearInt}` : '',
              x: 56,
              y: 58,
              lat: clean.lat || null,
              lng: clean.lng || null,
              note: 'Miejsce pochodzenia potwierdzone archiwalnie'
            }
          ]
        : [],
      created_by: userData?.user?.id || null
    };

    const { data, error } = await supabase.from('ancestors').insert(payload).select().single();
    if (error) throw error;

    // Dwukierunkowa aktualizacja relacji w bazie danych (rodzice <-> dzieci, małżonkowie, rodzeństwo)
    const newId = data.id;
    try {
      // 1. Jeśli wskazano dziecko (np. dodajemy rodzica/dziadka dla istniejącej osoby), dopisz newId do parent_ids dziecka
      for (const cid of childrenIds) {
        const { data: childRow } = await supabase.from('ancestors').select('parent_ids').eq('id', cid).maybeSingle();
        if (childRow) {
          const updatedParents = Array.from(new Set([...(childRow.parent_ids || []), newId]));
          await supabase.from('ancestors').update({ parent_ids: updatedParents }).eq('id', cid);
        }
      }
      // 2. Jeśli wskazano rodziców, dopisz newId do children_ids każdego rodzica
      for (const pid of parentIds) {
        const { data: parentRow } = await supabase.from('ancestors').select('children_ids').eq('id', pid).maybeSingle();
        if (parentRow) {
          const updatedChildren = Array.from(new Set([...(parentRow.children_ids || []), newId]));
          await supabase.from('ancestors').update({ children_ids: updatedChildren }).eq('id', pid);
        }
      }
      // 3. Jeśli wskazano małżonka, ustaw spouse_id u małżonka
      if (clean.spouseId) {
        await supabase.from('ancestors').update({ spouse_id: newId }).eq('id', clean.spouseId);
      }
      // 4. Jeśli wskazano rodzeństwo, dopisz newId do sibling_ids
      for (const sid of siblingIds) {
        const { data: sibRow } = await supabase.from('ancestors').select('sibling_ids').eq('id', sid).maybeSingle();
        if (sibRow) {
          const updatedSibs = Array.from(new Set([...(sibRow.sibling_ids || []), newId]));
          await supabase.from('ancestors').update({ sibling_ids: updatedSibs }).eq('id', sid);
        }
      }
    } catch {
      // ignore secondary relation sync error
    }

    await this.logAudit('ADMIN_ADD_ANCESTOR', `Wgrano zweryfikowanego przodka ${payload.first_name} ${payload.last_name} dla klienta ${clientId}`);
    return mapAncestorFromDb(data);
  },

  async adminDeleteAncestor(ancestorId) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const { error } = await supabase.from('ancestors').delete().eq('id', ancestorId);
    if (error) throw error;
    await this.logAudit('ADMIN_DELETE_ANCESTOR', `Usunięto rekord przodka ${ancestorId}`);
  },

  async adminInsertDocument(clientId, docInput) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    const clean = sanitizePayload(docInput, 800);
    const payload = {
      owner_id: clientId,
      ancestor_id: clean.ancestorId || null,
      ancestor_name: sanitizeText(clean.ancestorName || '', 100),
      category: sanitizeText(clean.category || 'Akty metrykalne', 60),
      title: sanitizeText(clean.title, 140),
      doc_date: sanitizeText(clean.date || '', 40),
      year: parseInt(clean.year, 10) || null,
      place: sanitizeText(clean.place || '', 80),
      archive_source: sanitizeText(clean.archiveSource || '', 140),
      language: sanitizeText(clean.language || 'Polski', 40),
      is_new_discovery: true,
      description: sanitizeText(clean.description || '', 400),
      transcription: sanitizeText(clean.transcription || '', 800)
    };
    const { data, error } = await supabase.from('documents').insert(payload).select().single();
    if (error) throw error;
    await this.logAudit('ADMIN_ADD_DOCUMENT', `Dodano skan dokumentu "${payload.title}" dla klienta ${clientId}`);
    return mapDocumentFromDb(data);
  },

  async adminSeedDobrzanskiTree(clientId) {
    if (!this.isEnabled()) throw new Error('Supabase nie jest skonfigurowany.');
    await supabase.from('documents').delete().eq('owner_id', clientId);
    await supabase.from('ancestors').delete().eq('owner_id', clientId);

    const makeUuid = () => {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      const bytes = new Uint8Array(16);
      if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        crypto.getRandomValues(bytes);
      } else {
        for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
      }
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    };

    const id1 = makeUuid(); // Mikołaj
    const id2 = makeUuid(); // Halina Dobrzańska
    const id3 = makeUuid(); // Stanisław Dobrzański
    const id4 = makeUuid(); // Stefania Kopalska
    const id5 = makeUuid(); // Ludwik Dobrzański
    const id6 = makeUuid(); // Marianna Brudek
    const id7 = makeUuid(); // Antoni Kopalski
    const id8 = makeUuid(); // Władysława Stanecka
    const id9 = makeUuid(); // Maciej Dobrzański
    const id10 = makeUuid(); // Małgorzata Rosołek

    const ancestorsPayload = [
      {
        id: id1,
        owner_id: clientId,
        first_name: 'Mikołaj',
        last_name: 'Dobrzański',
        maiden_name: null,
        generation: 1,
        generation_label: 'Pokolenie I (Proband / Wnuk)',
        role: 'Wnuk Haliny Dobrzańskiej',
        birth_date: 'współcześnie',
        birth_year: 2000,
        death_date: 'żyje',
        death_year: null,
        birth_place: 'Łódź',
        region: 'Województwo łódzkie',
        coordinates: { x: 52, y: 62, lat: 51.7592, lng: 19.456, city: 'Łódź', period: 'współcześnie' },
        profession: 'Kustosz archiwum rodzinnego',
        portrait_tone: '#2E5947',
        parent_ids: [id2],
        spouse_id: null,
        children_ids: [],
        is_verified: true,
        verification_source: 'Przekaz rodzinny — linia babci Haliny Dobrzańskiej',
        short_bio: 'Współczesny potomek rodów Dobrzańskich i Kopalskich z ziemi łęczyckiej, wielkopolskiej i Łodzi.',
        story_paragraphs: [
          'Mikołaj jest wnukiem Haliny Dobrzańskiej i inicjatorem cyfrowego uporządkowania metryk rodzinnych sięgających początków XIX wieku (Chwalborzyce, Grzegorzew, Dąbie, Ozorków oraz Łódź-Bałuty).'
        ],
        life_events: [
          { year: '2026', title: 'Uporządkowanie drzewa od strony babci Haliny', place: 'Łódź', desc: 'Połączenie 5 pokoleń przodków z ksiąg parafialnych oraz zbiorów Szukaj w Archiwach.' }
        ],
        residences: [
          { city: 'Łódź, Polska', years: 'współcześnie', x: 52, y: 62, lat: 51.7592, lng: 19.456, note: 'Współczesne miasto rodzinne' }
        ]
      },
      {
        id: id2,
        owner_id: clientId,
        first_name: 'Halina',
        last_name: 'Dobrzańska',
        maiden_name: 'Dobrzańska',
        generation: 2,
        generation_label: 'Pokolenie II (Babcia Mikołaja)',
        role: 'Babcia (linia macierzysta)',
        birth_date: 'ok. 1932',
        birth_year: 1932,
        death_date: 'żyje',
        death_year: null,
        birth_place: 'Łódź',
        region: 'Województwo łódzkie',
        coordinates: { x: 52, y: 62, lat: 51.7592, lng: 19.456, city: 'Łódź', period: 'XX w.' },
        profession: 'Przekaz rodzinny',
        portrait_tone: '#3B5E4D',
        parent_ids: [id3, id4],
        spouse_id: null,
        children_ids: [id1],
        is_verified: true,
        verification_source: 'Przekaz rodzinny — córka Stanisława Dobrzańskiego i Stefanii Kopalskiej',
        short_bio: 'Babcia Mikołaja, córka Stanisława Dobrzańskiego oraz Stefanii z domu Kopalskiej.',
        story_paragraphs: [
          'Halina Dobrzańska jest córką Stanisława Dobrzańskiego oraz Stefanii Kopalskiej, którzy pobrali się 27 maja 1928 roku w parafii Najświętszej Marii Panny w Łodzi.'
        ],
        life_events: [],
        residences: [
          { city: 'Łódź, Polska', years: 'XX–XXI w.', x: 52, y: 62, lat: 51.7592, lng: 19.456, note: 'Łódzkie korzenie rodziny Dobrzańskich' }
        ]
      },
      {
        id: id3,
        owner_id: clientId,
        first_name: 'Stanisław',
        last_name: 'Dobrzański',
        maiden_name: null,
        generation: 3,
        generation_label: 'Pokolenie III (Pradziadek Mikołaja)',
        role: 'Pradziadek',
        birth_date: '6 sierpnia 1905',
        birth_year: 1905,
        death_date: 'nieznana',
        death_year: null,
        birth_place: 'Ozorków',
        region: 'Ziemia łęczycka / Łódzkie',
        coordinates: { x: 48, y: 58, lat: 51.9645, lng: 19.2869, city: 'Ozorków', period: '1905–XX w.' },
        profession: 'Robotnik fabryczny (Fabrikarbeiter)',
        portrait_tone: '#244638',
        parent_ids: [id5, id6],
        spouse_id: id4,
        children_ids: [id2],
        is_verified: true,
        verification_source: 'Parafia Ozorków akt 123 (1905); Ślub: Parafia Łódź NMP akt 243 (1928); USC Łódź akt 717 (1940)',
        short_bio: 'Robotnik fabryczny urodzony w Ozorkowie. W akcie ślubu z 1928 r. zachował się jego własnoręczny podpis; w 1940 r. zgłosił śmierć ojca Ludwika.',
        story_paragraphs: [
          'Stanisław Dobrzański urodził się 6 sierpnia 1905 roku w Ozorkowie (Parafia Ozorków, akt nr 123) jako syn Ludwika Dobrzańskiego i Marianny z domu Brudek.',
          '27 maja 1928 roku w parafii Najświętszej Marii Panny w Łodzi poślubił Stefanię Kopalską (akt nr 243). Oboje byli piśmienni — w księdze małżeństw zachowały się ich własnoręczne podpisy. Pracował wówczas jako robotnik fabryczny.',
          '1 marca 1940 roku zgłaszał w urzędzie śmierć swojego ojca Ludwika. Urzędnik odnotował: „Der Anzeigende hat sich durch Sozialversicherungsbuch Nr. 3412515 ausgewiesen” — Stanisław wylegitymował się książeczką ubezpieczenia społecznego nr 3412515 i figurował w dokumencie jako „Fabrikarbeiter” (robotnik fabryczny).'
        ],
        life_events: [
          { year: '1905', title: 'Narodziny w Ozorkowie', place: 'Ozorków (Parafia Ozorków akt 123)', desc: 'Urodzony 6 sierpnia 1905 r. jako syn Ludwika i Marianny Brudek.' },
          { year: '1928', title: 'Ślub ze Stefanią Kopalską', place: 'Łódź, Parafia NMP (akt 243)', desc: 'Ślub 27 maja 1928 r.; w akcie widnieje jego własnoręczny podpis oraz zawód robotnika fabrycznego.' },
          { year: '1940', title: 'Zgłoszenie zgonu ojca Ludwika', place: 'Łódź (USC akt 717)', desc: 'Wylegitymował się książeczką ubezpieczenia społecznego nr 3412515 (Fabrikarbeiter).' }
        ],
        residences: [
          { city: 'Ozorków, Polska', years: '1905', x: 48, y: 58, lat: 51.9645, lng: 19.2869, note: 'Miejsce urodzenia (Parafia Ozorków akt 123)' },
          { city: 'Łódź, Bałuty, Polska', years: '1928–1940', x: 52, y: 62, lat: 51.7878, lng: 19.4426, note: 'Ślub w Parafii NMP (1928) oraz miejsce pracy jako robotnik fabryczny' }
        ]
      },
      {
        id: id4,
        owner_id: clientId,
        first_name: 'Stefania',
        last_name: 'Dobrzańska',
        maiden_name: 'Kopalska',
        generation: 3,
        generation_label: 'Pokolenie III (Prababcia Mikołaja)',
        role: 'Prababcia',
        birth_date: '7 sierpnia 1903',
        birth_year: 1903,
        death_date: 'nieznana',
        death_year: null,
        birth_place: 'Łódź, Bałuty',
        region: 'Województwo łódzkie',
        coordinates: { x: 52, y: 60, lat: 51.7919, lng: 19.4445, city: 'Łódź, Bałuty', period: '1903–XX w.' },
        profession: 'Robotniczka fabryczna',
        portrait_tone: '#6E501D',
        parent_ids: [id7, id8],
        spouse_id: id3,
        children_ids: [id2],
        is_verified: true,
        verification_source: 'Parafia Łódź NMP akt 2899 (Geneteka); Ślub: Parafia Łódź NMP akt 243 (1928)',
        short_bio: 'Urodzona w 1903 r. na łódzkich Bałutach córka Antoniego Kopalskiego i Władysławy Staneckiej. Robotniczka, żona Stanisława Dobrzańskiego.',
        story_paragraphs: [
          'Stefania Kopalska przyszła na świat 7 sierpnia 1903 roku na Bałutach w Łodzi (Parafia Łódź NMP, akt nr 2899 / Geneteka) jako córka Antoniego Kopalskiego i Władysławy Staneckiej.',
          '27 maja 1928 roku wyszła za mąż za Stanisława Dobrzańskiego w parafii NMP w Łodzi (akt nr 243). W chwili ślubu pracowała jako robotniczka i własnoręcznie podpisała akt małżeństwa.'
        ],
        life_events: [
          { year: '1903', title: 'Narodziny na Bałutach', place: 'Łódź, Bałuty (Parafia NMP akt 2899)', desc: 'Urodzona 7 sierpnia 1903 r. jako córka Antoniego i Władysławy Staneckiej.' },
          { year: '1928', title: 'Ślub ze Stanisławem Dobrzańskim', place: 'Łódź, Parafia NMP (akt 243)', desc: 'Ślub 27 maja 1928 r.; w akcie zachował się jej podpis oraz zawód robotniczki.' }
        ],
        residences: [
          { city: 'Bałuty, Łódź, Polska', years: '1903–1928', x: 52, y: 60, lat: 51.7919, lng: 19.4445, note: 'Miejsce urodzenia (akt 2899) i ślubu w Parafii NMP (akt 243)' }
        ]
      },
      {
        id: id5,
        owner_id: clientId,
        first_name: 'Ludwik',
        last_name: 'Dobrzański vel Dobrzyński',
        maiden_name: null,
        generation: 4,
        generation_label: 'Pokolenie IV (2x Pradziadek Mikołaja)',
        role: '2x Pradziadek',
        birth_date: '5 sierpnia 1857',
        birth_year: 1857,
        death_date: '1 marca 1940',
        death_year: 1940,
        birth_place: 'Dąbie',
        region: 'Wielkopolska / Łódzkie',
        coordinates: { x: 44, y: 55, lat: 52.0869, lng: 18.8211, city: 'Dąbie', period: '1857–1940' },
        profession: 'Żołnierz (1886), później szewc (Schumacher)',
        portrait_tone: '#172F25',
        parent_ids: [id9, id10],
        spouse_id: id6,
        children_ids: [id3],
        is_verified: true,
        verification_source: 'Parafia Dąbie akt 48 (1857); Ślub: Parafia Ozorków akt 40 (1886); Szukaj w Archiwach: 6208930 [244]; Zgon: USC Łódź akt 717 (1940)',
        short_bio: 'Urodzony w Dąbiu (Wielkopolska), w 1886 r. żołnierz w Ozorkowie, a następnie wieloletni szewc w Łodzi przy ul. Drewnowskiej 36 (Holzstrasse 36).',
        story_paragraphs: [
          'Ludwik Dobrzański vel Dobrzyński urodził się 5 sierpnia 1857 roku w Dąbiu w Wielkopolsce (Parafia Dąbie, akt nr 48) jako syn Macieja Dobrzańskiego i Małgorzaty Rosołek.',
          '16 listopada 1886 roku w Ozorkowie poślubił Mariannę Brudek (Parafia Ozorków, akt nr 40; oboje niepiśmienni). W akcie ślubu zapisany został jako żołnierz.',
          'W późniejszych latach osiadł w Łodzi i pracował jako szewc („Schumacher Ludwik Dobrzański”), co potwierdza zarówno karta meldunkowa do spisu ludności z 1920 roku (Szukaj w Archiwach: jednostka 6208930, skan 244), jak i akt zgonu. Wraz z żoną Marianną mieszkał przy Holzstrasse 36 (historyczna Drewnowska 36). Zmarł 1 marca 1940 roku w Łodzi na przerost gruczołu krokowego (Parafia Łódź USC, akt nr 717).'
        ],
        life_events: [
          { year: '1857', title: 'Narodziny w Dąbiu', place: 'Dąbie, woj. wielkopolskie (akt 48)', desc: 'Urodzony 5 sierpnia 1857 r. jako syn Macieja Dobrzańskiego i Małgorzaty Rosołek.' },
          { year: '1886', title: 'Ślub z Marianną Brudek', place: 'Ozorków (Parafia Ozorków akt 40)', desc: 'Ślub 16 listopada 1886 r.; odnotowany jako żołnierz.' },
          { year: '1920', title: 'Karta meldunkowa spisu ludności', place: 'Łódź, ul. Drewnowska 36 (Holzstrasse 36)', desc: 'Zapisany jako szewc mieszkający z żoną Marianną (Szukaj w Archiwach 6208930 [244]).' },
          { year: '1940', title: 'Śmierć w Łodzi', place: 'Łódź (USC akt 717)', desc: 'Zmarł 1 marca 1940 r. jako szewc (Schumacher); zgon zgłosił syn Stanisław.' }
        ],
        residences: [
          { city: 'Dąbie, woj. wielkopolskie, Polska', years: '1857', x: 44, y: 55, lat: 52.0869, lng: 18.8211, note: 'Miejsce urodzenia (Parafia Dąbie akt 48)' },
          { city: 'Ozorków, Polska', years: '1886–1905', x: 48, y: 58, lat: 51.9645, lng: 19.2869, note: 'Ślub z Marianną Brudek (1886) i narodziny syna Stanisława (1905)' },
          { city: 'ul. Drewnowska 36, Łódź, Polska', years: '1920–1940', x: 52, y: 61, lat: 51.7805, lng: 19.4495, note: 'Dawna Holzstrasse 36 — mieszkanie Ludwika i Marianny oraz pracownia szewska' }
        ]
      },
      {
        id: id6,
        owner_id: clientId,
        first_name: 'Marianna',
        last_name: 'Dobrzańska',
        maiden_name: 'Brudek',
        generation: 4,
        generation_label: 'Pokolenie IV (2x Prababcia Mikołaja)',
        role: '2x Prababcia',
        birth_date: '11 lutego 1869',
        birth_year: 1869,
        death_date: 'nieznana',
        death_year: null,
        birth_place: 'Ozorków',
        region: 'Ziemia łęczycka / Łódzkie',
        coordinates: { x: 48, y: 58, lat: 51.9645, lng: 19.2869, city: 'Ozorków', period: '1869–XX w.' },
        profession: 'Prowadzenie domu',
        portrait_tone: '#7D5B21',
        parent_ids: [],
        spouse_id: id5,
        children_ids: [id3],
        is_verified: true,
        verification_source: 'Parafia Łęczyca akt 225 (1869); Ślub: Parafia Ozorków akt 40 (1886); Spis 1920',
        short_bio: 'Urodzona 11 lutego 1869 r. w Ozorkowie. Żona szewca Ludwika Dobrzańskiego, z którym mieszkała w Łodzi przy Holzstrasse 36.',
        story_paragraphs: [
          'Marianna Brudek urodziła się 11 lutego 1869 roku w Ozorkowie (Parafia Łęczyca, akt nr 225).',
          '16 listopada 1886 roku w Ozorkowie poślubiła Ludwika Dobrzańskiego (akt nr 40). W 1920 roku mieszkała wraz z mężem w Łodzi przy ulicy Drewnowskiej 36 (Holzstrasse 36).'
        ],
        life_events: [
          { year: '1869', title: 'Narodziny w Ozorkowie', place: 'Ozorków (Parafia Łęczyca akt 225)', desc: 'Urodzona 11 lutego 1869 r.' },
          { year: '1886', title: 'Ślub z Ludwikiem Dobrzańskim', place: 'Ozorków (Parafia Ozorków akt 40)', desc: 'Ślub 16 listopada 1886 r.' }
        ],
        residences: [
          { city: 'Ozorków, Polska', years: '1869–1886', x: 48, y: 58, lat: 51.9645, lng: 19.2869, note: 'Miejsce urodzenia i ślubu' },
          { city: 'ul. Drewnowska 36, Łódź, Polska', years: '1920', x: 52, y: 61, lat: 51.7805, lng: 19.4495, note: 'Dawna Holzstrasse 36' }
        ]
      },
      {
        id: id7,
        owner_id: clientId,
        first_name: 'Antoni',
        last_name: 'Kopalski vel Kopalak',
        maiden_name: null,
        generation: 4,
        generation_label: 'Pokolenie IV (2x Pradziadek Mikołaja)',
        role: '2x Pradziadek',
        birth_date: '15 maja 1874',
        birth_year: 1874,
        death_date: '5 kwietnia 1924',
        death_year: 1924,
        birth_place: 'Smolice',
        region: 'Województwo łódzkie',
        coordinates: { x: 54, y: 58, lat: 51.9083, lng: 19.5553, city: 'Smolice', period: '1874–1924' },
        profession: 'Woźnica',
        portrait_tone: '#244638',
        parent_ids: [],
        spouse_id: id8,
        children_ids: [id4],
        is_verified: true,
        verification_source: 'Parafia Stryków akt 41 (1874); Ślub: Parafia Łódź NMP akt 238 (1902); Szukaj w Archiwach: 6209146 [321,316]; Zgon: Parafia Łódź NMP akt 382 (1924)',
        short_bio: 'Woźnica urodzony w Smolicach (parafia Stryków). Od 1902 r. mąż Władysławy Staneckiej; mieszkał w Łodzi przy ul. Targowej, a od 1919 r. przy ul. Kielma 41 (Marynarskiej).',
        story_paragraphs: [
          'Antoni Kopalski vel Kopalak urodził się 15 maja 1874 roku w Smolicach (Parafia Stryków, akt nr 41).',
          '4 maja 1902 roku w parafii Najświętszej Marii Panny w Łodzi poślubił Władysławę Stanecką (akt nr 238; oboje niepiśmienni). W akcie ślubu figuruje jako woźnica.',
          'Po ślubie mieszkali początkowo przy ulicy Targowej w Łodzi, a 14 września 1919 roku przeprowadzili się na ulicę Kielma 41 (dzisiejsza ulica Marynarska; Szukaj w Archiwach: jednostka 6209146, skany 316, 321). Zmarł 5 kwietnia 1924 roku w Łodzi (Parafia Łódź NMP, akt nr 382).'
        ],
        life_events: [
          { year: '1874', title: 'Narodziny w Smolicach', place: 'Smolice (Parafia Stryków akt 41)', desc: 'Urodzony 15 maja 1874 r.' },
          { year: '1902', title: 'Ślub z Władysławą Stanecką', place: 'Łódź, Parafia NMP (akt 238)', desc: 'Ślub 4 maja 1902 r.; zawód: woźnica.' },
          { year: '1919', title: 'Przeprowadzka na ul. Kielma 41', place: 'Łódź (dzisiejsza ul. Marynarska)', desc: 'Przeprowadzka z ul. Targowej 14 września 1919 r. (Szukaj w Archiwach 6209146).' },
          { year: '1924', title: 'Śmierć w Łodzi', place: 'Łódź (Parafia NMP akt 382)', desc: 'Zmarł 5 kwietnia 1924 r.' }
        ],
        residences: [
          { city: 'Smolice, gmina Stryków, Polska', years: '1874', x: 54, y: 58, lat: 51.9083, lng: 19.5553, note: 'Miejsce urodzenia (Parafia Stryków akt 41)' },
          { city: 'ul. Targowa, Łódź, Polska', years: '1902–1919', x: 53, y: 62, lat: 51.7606, lng: 19.4712, note: 'Pierwsze miejsce zamieszkania po ślubie' },
          { city: 'ul. Marynarska 41 (dawniej Kielma), Łódź, Polska', years: '1919–1924', x: 52, y: 60, lat: 51.7972, lng: 19.4488, note: 'Dom rodziny Kopalskich od 14 września 1919 r.' }
        ]
      },
      {
        id: id8,
        owner_id: clientId,
        first_name: 'Władysława',
        last_name: 'Kopalska',
        maiden_name: 'Stanecka',
        generation: 4,
        generation_label: 'Pokolenie IV (2x Prababcia Mikołaja)',
        role: '2x Prababcia',
        birth_date: '28 listopada 1885',
        birth_year: 1885,
        death_date: 'nieznana',
        death_year: null,
        birth_place: 'Osieczno',
        region: 'Okolice Brzykowa / Łódzkie',
        coordinates: { x: 50, y: 63, lat: 51.55, lng: 19.15, city: 'Osieczno', period: '1885–XX w.' },
        profession: 'Prowadzenie domu',
        portrait_tone: '#6E501D',
        parent_ids: [],
        spouse_id: id7,
        children_ids: [id4],
        is_verified: true,
        verification_source: 'Parafia Brzyków akt 76 (1885); Ślub: Parafia Łódź NMP akt 238 (1902)',
        short_bio: 'Urodzona 28 listopada 1885 r. w Osiecznie. Żona Antoniego Kopalskiego, z którym mieszkała w Łodzi przy ul. Targowej i ul. Kielma 41.',
        story_paragraphs: [
          'Władysława Stanecka urodziła się 28 listopada 1885 roku w Osiecznie (Parafia Brzyków, akt nr 76).',
          '4 maja 1902 roku poślubiła w Łodzi Antoniego Kopalskiego (Parafia Łódź NMP, akt nr 238). Wraz z mężem mieszkała przy ulicy Targowej, a od 14 września 1919 roku przy ulicy Kielma 41 (obecnie Marynarskiej).'
        ],
        life_events: [
          { year: '1885', title: 'Narodziny w Osiecznie', place: 'Osieczno (Parafia Brzyków akt 76)', desc: 'Urodzona 28 listopada 1885 r.' },
          { year: '1902', title: 'Ślub z Antonim Kopalskim', place: 'Łódź, Parafia NMP (akt 238)', desc: 'Ślub 4 maja 1902 r.' },
          { year: '1919', title: 'Zamieszkanie przy ul. Kielma 41', place: 'Łódź (dzisiejsza Marynarska)', desc: 'Przeprowadzka 14 września 1919 r.' }
        ],
        residences: [
          { city: 'Osieczno, Polska', years: '1885', x: 50, y: 63, lat: 51.55, lng: 19.15, note: 'Miejsce urodzenia (Parafia Brzyków akt 76)' },
          { city: 'ul. Marynarska 41 (dawniej Kielma), Łódź, Polska', years: '1919–XX w.', x: 52, y: 60, lat: 51.7972, lng: 19.4488, note: 'Miejsce zamieszkania z Antonim Kopalskim' }
        ]
      },
      {
        id: id9,
        owner_id: clientId,
        first_name: 'Maciej',
        last_name: 'Dobrzański',
        maiden_name: null,
        generation: 5,
        generation_label: 'Pokolenie V (3x Pradziadek Mikołaja)',
        role: '3x Pradziadek (Ojciec Ludwika)',
        birth_date: '16 lutego 1821',
        birth_year: 1821,
        death_date: '1 lutego 1882',
        death_year: 1882,
        birth_place: 'Chwalborzyce (dom nr 8)',
        region: 'Wielkopolska / Ziemia łęczycka',
        coordinates: { x: 42, y: 54, lat: 52.1039, lng: 18.7381, city: 'Chwalborzyce', period: '1821–1882' },
        profession: 'Służący (1849)',
        portrait_tone: '#172F25',
        parent_ids: [],
        spouse_id: id10,
        children_ids: [id5],
        is_verified: true,
        verification_source: 'Parafia Chwalborzyce akt 5 (1821, BASIA); Ślub: Parafia Grzegorzew akt 8 (1849); Zgon: Parafia Ozorków akt 15 (1882)',
        short_bio: 'Urodzony w Chwalborzycach w domu nr 8 w 1821 r. W chwili ślubu w 1849 r. kawaler służący; zmarł w 1882 r. w Ozorkowie.',
        story_paragraphs: [
          'Maciej Dobrzański urodził się 16 lutego 1821 roku w Chwalborzycach (woj. wielkopolskie) w domu nr 8 (Parafia Chwalborzyce, akt nr 5 — indeksacja BASIA).',
          '5 lutego 1849 roku w Grzegorzewie poślubił Małgorzatę Rosołek (Parafia Grzegorzew, akt nr 8; oboje niepiśmienni). W akcie ślubu zapisany został jako kawaler służący w Chwalborzycach.',
          'Zmarł 1 lutego 1882 roku w Ozorkowie (Parafia Ozorków, akt nr 15).'
        ],
        life_events: [
          { year: '1821', title: 'Narodziny w Chwalborzycach', place: 'Chwalborzyce, dom nr 8 (akt 5 BASIA)', desc: 'Urodzony 16 lutego 1821 r.' },
          { year: '1849', title: 'Ślub z Małgorzatą Rosołek', place: 'Grzegorzew (Parafia Grzegorzew akt 8)', desc: 'Ślub 5 lutego 1849 r.; zapisany jako kawaler służący w Chwalborzycach.' },
          { year: '1882', title: 'Śmierć w Ozorkowie', place: 'Ozorków (Parafia Ozorków akt 15)', desc: 'Zmarł 1 lutego 1882 r.' }
        ],
        residences: [
          { city: 'Chwalborzyce, woj. wielkopolskie, Polska', years: '1821–1849', x: 42, y: 54, lat: 52.1039, lng: 18.7381, note: 'Dom nr 8 — miejsce urodzenia (akt 5 BASIA) i młodości' },
          { city: 'Ozorków, Polska', years: '1882', x: 48, y: 58, lat: 51.9645, lng: 19.2869, note: 'Miejsce zgonu (Parafia Ozorków akt 15)' }
        ]
      },
      {
        id: id10,
        owner_id: clientId,
        first_name: 'Małgorzata',
        last_name: 'Dobrzańska',
        maiden_name: 'Rosołek',
        generation: 5,
        generation_label: 'Pokolenie V (3x Prababcia Mikołaja)',
        role: '3x Prababcia (Matka Ludwika)',
        birth_date: '1 lipca 1829',
        birth_year: 1829,
        death_date: '30 lipca 1910',
        death_year: 1910,
        birth_place: 'Przybyłowo',
        region: 'Wielkopolska / Łódź Bałuty',
        coordinates: { x: 41, y: 53, lat: 52.1869, lng: 18.7586, city: 'Przybyłowo', period: '1829–1910' },
        profession: 'Córka wyrobników / dawniej gospodarza',
        portrait_tone: '#7D5B21',
        parent_ids: [],
        spouse_id: id9,
        children_ids: [id5],
        is_verified: true,
        verification_source: 'Parafia Grzegorzew akt 82 (1829); Ślub: Parafia Grzegorzew akt 8 (1849); Zgon: Parafia Łódź NMP akt 1298 (1910)',
        short_bio: 'Urodzona w Przybyłowie w 1829 r. W akcie ślubu z 1849 r. opisana jako córka wyrobników (wcześniej jej ojciec był gospodarzem). Zmarła w 1910 r. na Bałutach.',
        story_paragraphs: [
          'Małgorzata Rosołek urodziła się 1 lipca 1829 roku w Przybyłowie (Parafia Grzegorzew, akt nr 82).',
          '5 lutego 1849 roku w Grzegorzewie wyszła za mąż za Macieja Dobrzańskiego (akt nr 8). W akcie ślubu opisano ją jako córkę wyrobników z Przybyłowa — co ciekawe, we wcześniejszych aktach jej ojciec występował jako gospodarz, co wskazuje na utratę lub sprzedaż ziemi i gospodarstwa.',
          'Pod koniec życia przeniosła się do Łodzi i zmarła 30 lipca 1910 roku na Bałutach (Parafia Łódź NMP, akt nr 1298).'
        ],
        life_events: [
          { year: '1829', title: 'Narodziny w Przybyłowie', place: 'Przybyłowo (Parafia Grzegorzew akt 82)', desc: 'Urodzona 1 lipca 1829 r.' },
          { year: '1849', title: 'Ślub z Maciejem Dobrzańskim', place: 'Grzegorzew (Parafia Grzegorzew akt 8)', desc: 'Ślub 5 lutego 1849 r.; opisana jako córka wyrobników z Przybyłowa.' },
          { year: '1910', title: 'Śmierć na Bałutach', place: 'Bałuty, Łódź (Parafia Łódź NMP akt 1298)', desc: 'Zmarła 30 lipca 1910 r. w wieku 81 lat.' }
        ],
        residences: [
          { city: 'Przybyłowo, gmina Grzegorzew, Polska', years: '1829–1849', x: 41, y: 53, lat: 52.1869, lng: 18.7586, note: 'Miejsce urodzenia i ślubu (Parafia Grzegorzew)' },
          { city: 'Bałuty, Łódź, Polska', years: '1910', x: 52, y: 60, lat: 51.7919, lng: 19.4445, note: 'Miejsce zgonu 30 lipca 1910 r. (Parafia Łódź NMP akt 1298)' }
        ]
      }
    ];

    const { error: ancErr } = await supabase.from('ancestors').insert(ancestorsPayload);
    if (ancErr) throw ancErr;

    const docsPayload = [
      {
        owner_id: clientId,
        ancestor_id: id3,
        ancestor_name: 'Stanisław Dobrzański & Stefania Kopalska',
        category: 'Akty metrykalne',
        title: 'Akt małżeństwa Stanisława Dobrzańskiego i Stefanii Kopalskiej',
        doc_date: '27 maja 1928',
        year: 1928,
        place: 'Łódź, Bałuty',
        archive_source: 'Parafia Łódź NMP, akt nr 243',
        language: 'Polski',
        is_new_discovery: true,
        description: 'Akt ślubu pradziadków Mikołaja z 1928 r. Zawiera własnoręczne podpisy obojga małżonków oraz wskazanie ich zawodów (robotnik fabryczny i robotniczka).',
        transcription: 'Działo się w Łodzi w parafii Najświętszej Marii Panny dnia 27 maja 1928 roku. Stawili się osobiście Stanisław Dobrzański, robotnik fabryczny urodzony w Ozorkowie, oraz Stefania Kopalska, robotniczka urodzona na Bałutach w Łodzi. Akt został przez oboje nowożeńców własnoręcznie podpisany.'
      },
      {
        owner_id: clientId,
        ancestor_id: id5,
        ancestor_name: 'Ludwik Dobrzański vel Dobrzyński',
        category: 'Akty metrykalne',
        title: 'Akt zgonu szewca Ludwika Dobrzańskiego (USC Łódź)',
        doc_date: '1 marca 1940',
        year: 1940,
        place: 'Łódź',
        archive_source: 'Parafia Łódź (USC), akt nr 717 • Szukaj w Archiwach 6208930 [244]',
        language: 'Niemiecki / Polski',
        is_new_discovery: true,
        description: 'Akt zgonu 2x pradziadka Ludwika Dobrzańskiego z 1940 r., zgłoszony przez jego syna Stanisława, który wylegitymował się książeczką ubezpieczenia społecznego nr 3412515.',
        transcription: 'Schumacher Ludwik Dobrzański, zamieszkały przy Holzstrasse 36 (Drewnowska 36), zmarł dnia 1 marca 1940 roku. Zgłaszający zgon syn Stanisław Dobrzański (Fabrikarbeiter) wylegitymował się książeczką ubezpieczenia społecznego: „Der Anzeigende hat sich durch Sozialversicherungsbuch Nr. 3412515 ausgewiesen”.'
      },
      {
        owner_id: clientId,
        ancestor_id: id7,
        ancestor_name: 'Antoni Kopalski & Władysława Stanecka',
        category: 'Dokumenty urzędowe i wojskowe',
        title: 'Karta meldunkowa rodziny Kopalskich (ul. Targowa → ul. Kielma 41)',
        doc_date: '14 września 1919',
        year: 1919,
        place: 'Łódź',
        archive_source: 'Szukaj w Archiwach: jednostka 6209146 [skany 316, 321]',
        language: 'Polski',
        is_new_discovery: false,
        description: 'Dokumentacja meldunkowa dokumentująca przeprowadzkę Antoniego Kopalskiego (woźnicy) i Władysławy ze Staneckich z ul. Targowej na ul. Kielma 41 (dzisiejszą Marynarską).',
        transcription: 'Antoni Kopalski vel Kopalak (ur. 15 maja 1874 w Smolicach, zawód: woźnica) wraz z żoną Władysławą z domu Stanecką (ur. 28 listopada 1885 w Osiecznie) przeniósł miejsce zamieszkania z ulicy Targowej w Łodzi pod adres ulica Kielma 41 (obecnie Marynarska) dnia 14 września 1919 roku.'
      },
      {
        owner_id: clientId,
        ancestor_id: id9,
        ancestor_name: 'Maciej Dobrzański & Małgorzata Rosołek',
        category: 'Akty metrykalne',
        title: 'Akt urodzenia Macieja Dobrzańskiego (Chwalborzyce, dom nr 8)',
        doc_date: '16 lutego 1821',
        year: 1821,
        place: 'Chwalborzyce',
        archive_source: 'Parafia Chwalborzyce, akt nr 5 (BASIA)',
        language: 'Polski',
        is_new_discovery: false,
        description: 'Najstarszy odnaleziony akt metrykalny z 1821 r. dotyczący 3x pradziadka Macieja Dobrzańskiego oraz późniejsze powiązanie ze ślubem w Grzegorzewie (1849).',
        transcription: 'Roku 1821 dnia 16 lutego w Chwalborzycach w domu pod numerem 8 przyszedł na świat Maciej Dobrzański. W dniu 5 lutego 1849 roku w parafii Grzegorzew (akt nr 8) jako kawaler służący w Chwalborzycach poślubił Małgorzatę Rosołek z Przybyłowa.'
      }
    ];

    const { error: docErr } = await supabase.from('documents').insert(docsPayload);
    if (docErr) throw docErr;

    await supabase
      .from('profiles')
      .update({
        active_package_name: 'Pakiet kompleksowy – Ród Dobrzańskich i Kopalskich',
        research_progress: 85
      })
      .eq('id', clientId);

    await this.logAudit('ADMIN_SEED_TREE', `Wgrano 5-pokoleniowe drzewo testowe Dobrzańskich/Kopalskich dla klienta ${clientId}`);
    return ancestorsPayload.length;
  }
};
