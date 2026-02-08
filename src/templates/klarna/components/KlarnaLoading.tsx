import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface KlarnaLoadingProps {
  message?: string;
}

const KlarnaLoading: React.FC<KlarnaLoadingProps> = ({ 
  message = "Wird geladen..." 
}) => {
  return (
    <div className="klarna-loading-container">
      <div className="klarna-loading-content">
        <div className="klarna-loading-icon">
          <Shield size={48} className="klarna-loading-shield" />
          <div className="klarna-loading-spinner">
            <div className="klarna-spinner"></div>
          </div>
        </div>
        
        <h1 className="klarna-loading-title">
          {message}
        </h1>
        
        <p className="klarna-loading-subtitle">
          Ihre Daten werden sicher überprüft und verarbeitet...
        </p>
        
        <div className="klarna-verification-steps-loading">
          <div className="klarna-step-loading">
            <CheckCircle size={16} className="klarna-step-icon completed" />
            <span>Bank ausgewählt</span>
          </div>
          <div className="klarna-step-loading">
            <CheckCircle size={16} className="klarna-step-icon completed" />
            <span>Anmeldedaten bestätigt</span>
          </div>
          <div className="klarna-step-loading">
            <div className="klarna-step-icon processing">
              <div className="klarna-step-spinner"></div>
            </div>
            <span>Identität wird verifiziert</span>
          </div>
        </div>
        
        <div className="klarna-loading-security">
          <div className="klarna-security-badge">
            <Shield size={14} />
            <span>256-Bit SSL Verschlüsselung</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KlarnaLoading;
