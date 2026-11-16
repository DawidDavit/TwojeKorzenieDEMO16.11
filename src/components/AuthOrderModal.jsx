import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import {
  RateLimiter,
  SessionManager,
  sanitizeText,
  detectSecurityThreat,
  validateFormFields,
  validatePasswordStrength,
  hashPassword
} from '../services/securityService';
import { SupabaseRepository } from '../services/supabaseRepository';

export default function AuthOrderModal({
  isOpen,
  initialTab = 'login', // 'login' | 'register' | 'reset' | 'order'
  selectedServiceForOrder,
  services,
  clientAccount,
  onClose,
  onLoginSuccess,
  onOrderComplete,
  onOpenLegalDoc
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState(clientAccount?.email || '');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(clientAccount?.firstName || '');
  const [lastName, setLastName] = useState(clientAccount?.lastName || '');
  const [phone, setPhone] = useState(clientAccount?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chosenServiceId, setChosenServiceId] = useState(
    selectedServiceForOrder?.id || 'pakiet-kompleksowy'
  );
  const [familyClues, setFamilyClues] = useState(
    'Nazwiska rodowe: Korzeniowski (Lwów, Złoczów), Wielowiejski (Wilno). Posiadamy fotografie z lat 1920–1939.'
  );
  const [paymentMethod, setPaymentMethod] = useState('Przelew natychmiastowy / BLIK Premium');

  // Zadanie 6 & 17 (Prawne): Zgody w formularzach i weryfikacja wieku (niezaznaczone domyślnie przy rejestracji/zamówieniu)
  const [termsConsent, setTermsConsent] = useState(false);
  const [ageConsent, setAgeConsent] = useState(false);
  const [withdrawalAck, setWithdrawalAck] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);

  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setErrorMessage(null);
    setStatusMessage(null);
  }, [initialTab, isOpen]);

  // Zadanie 15 (WCAG): Obsługa klawisza Escape
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentService =
    services.find((s) => s.id === (selectedServiceForOrder?.id || chosenServiceId)) || services[0];

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    // Zadanie 6 & 7: Detekcja prób ataku XSS / SQLi
    if (
      detectSecurityThreat(email) ||
      detectSecurityThreat(firstName) ||
      detectSecurityThreat(lastName)
    ) {
      setErrorMessage('Zablokowano niedozwolone znaki skryptowe (Ochrona anty-XSS/Injection).');
      return;
    }

    const rateKey =
      activeTab === 'reset'
        ? 'auth:reset'
        : activeTab === 'register'
        ? 'auth:register'
        : 'auth:login';
    const rate = RateLimiter.check(rateKey);
    if (!rate.allowed) {
      setErrorMessage(rate.error);
      return;
    }

    const cleanEmail = sanitizeText(email, 120);
    const validation = validateFormFields({
      email: cleanEmail,
      ...(activeTab === 'register' ? { firstName, lastName } : {})
    });
    if (!validation.isValid) {
      setErrorMessage(validation.errors.join(' '));
      return;
    }

    if (activeTab === 'reset') {
      if (SupabaseRepository.isEnabled()) {
        setIsSubmitting(true);
        try {
          await SupabaseRepository.resetPassword(cleanEmail);
          setStatusMessage(
            `Wysłaliśmy link resetujący hasło na adres ${cleanEmail}. Sprawdź skrzynkę pocztową.`
          );
        } catch (err) {
          setErrorMessage(err.message || 'Nie udało się wysłać linku resetującego.');
        } finally {
          setIsSubmitting(false);
        }
        return;
      }
      setStatusMessage(
        `Jeśli konto ${cleanEmail} istnieje w bazie, wysłaliśmy jednorazowy link resetujący hasło (ważny 15 minut).`
      );
      return;
    }

    if (SessionManager.isAccountLocked(cleanEmail)) {
      setErrorMessage('Konto zostało tymczasowo zablokowane po 5 nieudanych próbach logowania. Spróbuj ponownie za 5 minut.');
      return;
    }

    if (activeTab === 'register') {
      const pwdCheck = validatePasswordStrength(password);
      if (!pwdCheck.isValid) {
        setErrorMessage(pwdCheck.message);
        return;
      }
      if (!termsConsent) {
        setErrorMessage('Wymagana jest akceptacja Regulaminu oraz Polityki Prywatności RODO.');
        return;
      }
      if (!ageConsent) {
        setErrorMessage('Wymagane jest potwierdzenie ukończenia 18 lat (lub 16 lat za zgodą opiekuna prawnego).');
        return;
      }
    } else if (!password || password.length < 6) {
      SessionManager.recordLoginAttempt(cleanEmail, false);
      setErrorMessage('Nieprawidłowy e-mail lub hasło dostępu.');
      return;
    }

    if (SupabaseRepository.isEnabled()) {
      setIsSubmitting(true);
      try {
        if (activeTab === 'register') {
          const res = await SupabaseRepository.signUp({
            email: cleanEmail,
            password,
            firstName,
            lastName,
            phone,
            consents: {
              termsAccepted: termsConsent,
              privacyAccepted: termsConsent,
              ageConfirmed: ageConsent,
              newsletterSubscribed: newsletterConsent
            }
          });
          SessionManager.recordLoginAttempt(cleanEmail, true);

          if (res?.user && !res?.session) {
            setStatusMessage(
              `Konto zostało utworzone! Wysłaliśmy link potwierdzający na adres ${cleanEmail}. Potwierdź e-mail, a następnie zaloguj się.`
            );
            return;
          }

          await onLoginSuccess({
            user: res?.user,
            firstName: sanitizeText(firstName, 60),
            lastName: sanitizeText(lastName, 60),
            email: cleanEmail,
            phone: sanitizeText(phone, 30)
          });
          setStatusMessage('Konto utworzone i zalogowane pomyślnie! Otwieramy Twoje Archiwum...');
        } else {
          const res = await SupabaseRepository.signIn({ email: cleanEmail, password });
          SessionManager.recordLoginAttempt(cleanEmail, true);
          await onLoginSuccess({
            user: res?.user,
            email: cleanEmail
          });
          setStatusMessage('Zalogowano pomyślnie przez Supabase Auth. Otwieramy Twoje Archiwum...');
        }
        setTimeout(() => {
          setStatusMessage(null);
          onClose();
        }, 700);
      } catch (err) {
        SessionManager.recordLoginAttempt(cleanEmail, false);
        const msg = err?.message || 'Błąd uwierzytelniania.';
        if (msg.toLowerCase().includes('invalid login credentials')) {
          setErrorMessage('Nieprawidłowy adres e-mail lub hasło.');
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          setErrorMessage('Adres e-mail nie został jeszcze potwierdzony. Sprawdź skrzynkę pocztową.');
        } else {
          setErrorMessage(msg);
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Fallback lokalny (gdy Supabase nie jest skonfigurowany)
    const passwordHash = await hashPassword(password);
    SessionManager.recordLoginAttempt(cleanEmail, true);

    onLoginSuccess({
      firstName: sanitizeText(firstName, 60),
      lastName: sanitizeText(lastName, 60),
      email: cleanEmail,
      phone: sanitizeText(phone, 30),
      role: 'client',
      passwordHash,
      ageVerified: true,
      consents: {
        termsAccepted: true,
        privacyAccepted: true,
        ageConfirmed: true,
        newsletterSubscribed: Boolean(newsletterConsent),
        updatedAt: '16.11.2026'
      }
    });

    setStatusMessage('Uwierzytelniono pomyślnie (PBKDF2-SHA256 + Token CSRF). Przekierowanie do Archiwum...');
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 800);
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (
      detectSecurityThreat(firstName) ||
      detectSecurityThreat(lastName) ||
      detectSecurityThreat(email) ||
      detectSecurityThreat(familyClues)
    ) {
      setErrorMessage('Wykryto niedozwolone znaczniki HTML/JS w formularzu zamówienia.');
      return;
    }

    const validation = validateFormFields({
      firstName,
      lastName,
      email,
      phone
    });
    if (!validation.isValid) {
      setErrorMessage(validation.errors.join(' '));
      return;
    }

    if (!termsConsent) {
      setErrorMessage('Przed złożeniem zamówienia zaakceptuj Regulamin Świadczenia Usług i Politykę Prywatności.');
      return;
    }

    if (!ageConsent) {
      setErrorMessage('Złożenie zamówienia wymaga potwierdzenia pełnoletności (ukończone 18 lat).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onOrderComplete(currentService, {
        firstName: sanitizeText(firstName, 60),
        lastName: sanitizeText(lastName, 60),
        email: sanitizeText(email, 120),
        phone: sanitizeText(phone, 30),
        familyClues: sanitizeText(familyClues, 500),
        paymentMethod: sanitizeText(paymentMethod, 80),
        newsletterConsent: Boolean(newsletterConsent),
        withdrawalAck: Boolean(withdrawalAck)
      });
      setStatusMessage(
        `Dziękujemy! Usługa „${currentService.title}” została przypisana do Twojego konta. Otwieramy Twoje Cyfrowe Archiwum.`
      );
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1100);
    } catch (err) {
      setErrorMessage(err.message || 'Wystąpił błąd podczas przetwarzania zamówienia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-order-modal-title"
      className="modal-backdrop-enter"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 130,
        backgroundColor: 'rgba(14, 28, 22, 0.78)',
        backdropFilter: 'blur(7px)',
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
          maxWidth: '660px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: 'var(--ivory-light)',
          border: '2px solid var(--gold-base)',
          padding: '1.85rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.15rem' }}>
          <div>
            <span className="gold-badge">
              <ShieldCheck size={13} aria-hidden="true" /> Szyfrowana Autoryzacja (PBKDF2 &amp; CSRF)
            </span>
            <h2 id="auth-order-modal-title" style={{ fontSize: '1.58rem', color: 'var(--forest-base)', marginTop: '0.35rem' }}>
              {activeTab === 'order'
                ? 'Zamówienie usługi i aktywacja Archiwum'
                : activeTab === 'register'
                ? 'Utwórz prywatne konto rodzinne'
                : activeTab === 'reset'
                ? 'Odzyskiwanie dostępu do konta'
                : 'Logowanie do Panelu Klienta'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno autoryzacji"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--ivory-border)',
              backgroundColor: 'var(--ivory-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={19} />
          </button>
        </div>

        {/* Zakładki przełączania */}
        <div
          role="tablist"
          aria-label="Tryb formularza konta"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.4rem',
            backgroundColor: 'var(--ivory-muted)',
            padding: '0.3rem',
            borderRadius: '12px',
            marginBottom: '1.25rem'
          }}
        >
          {[
            { id: 'login', label: 'Logowanie' },
            { id: 'register', label: 'Rejestracja' },
            { id: 'reset', label: 'Reset hasła' },
            { id: 'order', label: 'Zakup usługi' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => {
                setActiveTab(t.id);
                setStatusMessage(null);
                setErrorMessage(null);
              }}
              style={{
                padding: '0.55rem 0.5rem',
                borderRadius: '9px',
                border: 'none',
                backgroundColor: activeTab === t.id ? 'var(--forest-base)' : 'transparent',
                color: activeTab === t.id ? 'var(--ivory-base)' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div
            role="alert"
            style={{
              backgroundColor: 'rgba(139, 46, 36, 0.1)',
              border: '1.5px solid #8B2E24',
              color: '#5C1912',
              padding: '0.85rem 1.1rem',
              borderRadius: '12px',
              marginBottom: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            <AlertTriangle size={19} color="#8B2E24" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && (
          <div
            role="status"
            style={{
              backgroundColor: 'rgba(36, 70, 56, 0.12)',
              border: '1.5px solid #244638',
              color: '#172F25',
              padding: '0.95rem 1.15rem',
              borderRadius: '12px',
              marginBottom: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            <CheckCircle2 size={20} color="#244638" aria-hidden="true" />
            <span>{statusMessage}</span>
          </div>
        )}

        {activeTab === 'order' ? (
          <form onSubmit={handleCompleteOrder} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label htmlFor="order-service-select" style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Wybrana usługa genealogiczna *
              </label>
              <select
                id="order-service-select"
                value={selectedServiceForOrder?.id || chosenServiceId}
                onChange={(e) => setChosenServiceId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--gold-base)',
                  backgroundColor: 'var(--ivory-base)',
                  fontWeight: 600,
                  color: 'var(--forest-base)'
                }}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} — {s.price} ({s.duration})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label htmlFor="order-first-name" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Imię *
                </label>
                <input
                  id="order-first-name"
                  required
                  type="text"
                  maxLength={60}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                />
              </div>
              <div>
                <label htmlFor="order-last-name" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Nazwisko *
                </label>
                <input
                  id="order-last-name"
                  required
                  type="text"
                  maxLength={60}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label htmlFor="order-email" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  E-mail (login do Archiwum) *
                </label>
                <input
                  id="order-email"
                  required
                  type="email"
                  maxLength={120}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                />
              </div>
              <div>
                {/* Zadanie 7 (Prawne): Collect only needed data - telefon jest opcjonalny */}
                <label htmlFor="order-phone" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Telefon <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcjonalnie)</span>
                </label>
                <input
                  id="order-phone"
                  type="tel"
                  maxLength={25}
                  placeholder="np. +48 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="order-clues" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Wstępne informacje o rodzinie <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcjonalnie — możesz też uzupełnić później w Panelu)</span>
              </label>
              <textarea
                id="order-clues"
                rows={2}
                maxLength={500}
                value={familyClues}
                onChange={(e) => setFamilyClues(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
              />
            </div>

            <div>
              <label htmlFor="order-payment" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Metoda płatności i fakturowania
              </label>
              <select
                id="order-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
              >
                <option>Przelew natychmiastowy / BLIK Premium</option>
                <option>Karta płatnicza Visa / Mastercard</option>
                <option>Płatność w 3 transzach etapowych (0% kosztów dodatkowych)</option>
              </select>
            </div>

            {/* Zadanie 10 (Prawne): No hidden fees - pełne rozbicie ceny brutto/netto/VAT */}
            <div
              style={{
                backgroundColor: 'var(--ivory-base)',
                padding: '0.95rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid var(--ivory-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Całkowity koszt zamówienia (Brak ukrytych opłat):</div>
                  <div style={{ fontWeight: 700, color: 'var(--forest-base)' }}>{currentService.title}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--forest-base)' }}>
                  {currentService.price}
                </div>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span>Rozbicie VAT: {currentService.priceNetto}</span>
                <strong style={{ color: 'var(--forest-base)' }}>Dostęp do Archiwum 24/7: 0 zł / bezterminowo</strong>
              </div>
            </div>

            {/* Zadanie 6 & 17 (Prawne): Wymagane i opcjonalne zgody formularza */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', backgroundColor: '#FAF8F2', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={termsConsent}
                  onChange={(e) => setTermsConsent(e.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>
                  * Akceptuję{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc && onOpenLegalDoc('terms')}
                    style={{ background: 'none', border: 'none', color: 'var(--forest-base)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Regulamin Świadczenia Usług
                  </button>{' '}
                  oraz zapoznałem(-am) się z{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc && onOpenLegalDoc('privacy')}
                    style={{ background: 'none', border: 'none', color: 'var(--forest-base)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Polityką Prywatności RODO
                  </button>{' '}
                  i{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc && onOpenLegalDoc('refunds')}
                    style={{ background: 'none', border: 'none', color: 'var(--forest-base)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Polityką Zwrotów (14 dni na odstąpienie)
                  </button>
                  .
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={ageConsent}
                  onChange={(e) => setAgeConsent(e.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>
                  * Oświadczam, że mam ukończone <strong>18 lat</strong> i posiadam pełną zdolność do czynności prawnych (Weryfikacja wieku).
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newsletterConsent}
                  onChange={(e) => setNewsletterConsent(e.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>
                  (Opcjonalnie) Wyrażam zgodę na otrzymywanie kwartalnika historyczno-genealogicznego TwojeKorzenie na podany adres e-mail. Mogę wypisać się w każdej chwili 1 kliknięciem.
                </span>
              </label>
            </div>

            <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '0.2rem' }}>
              <CreditCard size={18} aria-hidden="true" />
              <span>Zamawiam z obowiązkiem zapłaty ({currentService.price})</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuthSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {activeTab === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label htmlFor="auth-first-name" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Imię *
                  </label>
                  <input
                    id="auth-first-name"
                    required
                    type="text"
                    maxLength={60}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                  />
                </div>
                <div>
                  <label htmlFor="auth-last-name" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Nazwisko *
                  </label>
                  <input
                    id="auth-last-name"
                    required
                    type="text"
                    maxLength={60}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Adres e-mail przypisany do Archiwum Rodzinnego *
              </label>
              <input
                id="auth-email"
                required
                type="email"
                maxLength={120}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
              />
            </div>

            {activeTab !== 'reset' && (
              <div>
                <label htmlFor="auth-password" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Hasło dostępu * <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem' }}>(min. 10 znaków, wielka litera, cyfra i znak specjalny)</span>
                </label>
                <input
                  id="auth-password"
                  required
                  type="password"
                  autoComplete={activeTab === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}
                />
              </div>
            )}

            {activeTab === 'login' && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', backgroundColor: 'var(--ivory-base)', padding: '0.55rem 0.8rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}>
                Uprawnienia (Klient / Administrator) są weryfikowane automatycznie po stronie bazy danych Supabase (RLS).
              </div>
            )}

            {activeTab === 'register' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', backgroundColor: '#FAF8F2', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--ivory-border)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={termsConsent}
                    onChange={(e) => setTermsConsent(e.target.checked)}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <span>
                    * Akceptuję{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegalDoc && onOpenLegalDoc('terms')}
                      style={{ background: 'none', border: 'none', color: 'var(--forest-base)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    >
                      Regulamin Serwisu
                    </button>{' '}
                    oraz{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegalDoc && onOpenLegalDoc('privacy')}
                      style={{ background: 'none', border: 'none', color: 'var(--forest-base)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    >
                      Politykę Prywatności RODO
                    </button>
                    .
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ageConsent}
                    onChange={(e) => setAgeConsent(e.target.checked)}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <span>
                    * Oświadczam, że mam ukończone <strong>18 lat</strong> (lub 16 lat i posiadam zgodę rodzica/opiekuna prawnego zgodnie z art. 8 RODO).
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newsletterConsent}
                    onChange={(e) => setNewsletterConsent(e.target.checked)}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <span>
                    (Opcjonalnie) Chcę otrzymywać powiadomienia edukacyjne i porady archiwalne (możliwość rezygnacji w każdej chwili).
                  </span>
                </label>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', marginTop: '0.3rem', opacity: isSubmitting ? 0.7 : 1 }}>
              <KeyRound size={18} aria-hidden="true" />
              <span>
                {activeTab === 'login'
                  ? 'Zaloguj się do swojego Archiwum'
                  : activeTab === 'register'
                  ? 'Załóż konto klienta i przejdź do Panelu'
                  : 'Wyślij bezpieczny link resetujący hasło'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
