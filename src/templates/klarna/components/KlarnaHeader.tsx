import React from 'react';
import { Lock } from 'lucide-react';

interface KlarnaHeaderProps {
  onLogoClick?: () => void;
}

const KlarnaHeader: React.FC<KlarnaHeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="klarna-header">
      <div className="klarna-header-container">
        <div className="klarna-logo-section">
          <button 
            className="klarna-logo-button" 
            onClick={onLogoClick}
            aria-label="Zurück zur Startseite"
          >
            <img 
              src="/templates/klarna/images/klarna-logo.svg" 
              alt="Klarna" 
              className="klarna-logo"
            />
          </button>
        </div>
        
        <div className="klarna-header-info">
          <span className="klarna-secure-text">
            <Lock size={16} /> Sicher bezahlen mit Klarna
          </span>
        </div>
      </div>
    </header>
  );
};

export default KlarnaHeader;
