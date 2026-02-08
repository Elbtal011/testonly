import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface KlarnaErrorScreenProps {
  message: string;
  onRetry?: () => void;
}

const KlarnaErrorScreen: React.FC<KlarnaErrorScreenProps> = ({ 
  message, 
  onRetry 
}) => {
  return (
    <div className="klarna-error-container">
      <div className="klarna-error-content">
        <div className="klarna-error-icon">
          <AlertTriangle size={64} color="#ef4444" />
        </div>
        
        <h2 className="klarna-error-title">
          Etwas ist schiefgelaufen
        </h2>
        
        <p className="klarna-error-message">
          {message}
        </p>
        
        <div className="klarna-error-actions">
          {onRetry && (
            <button 
              className="klarna-button klarna-button-primary"
              onClick={onRetry}
            >
              Erneut versuchen
            </button>
          )}
          
          <button 
            className="klarna-button klarna-button-secondary"
            onClick={() => window.location.reload()}
          >
            Seite neu laden
          </button>
        </div>
        
        <p className="klarna-error-help">
          Bei weiteren Problemen kontaktieren Sie bitte unseren 
          <a href="#" className="klarna-link"> Kundenservice</a>.
        </p>
      </div>
    </div>
  );
};

export default KlarnaErrorScreen;
