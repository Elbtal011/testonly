import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

const KlarnaFooter: React.FC = () => {
  return (
    <footer className="klarna-footer">
      <div className="klarna-footer-container">
        <div className="klarna-footer-links">
          <a href="#" className="klarna-footer-link">Datenschutz</a>
          <a href="#" className="klarna-footer-link">AGB</a>
          <a href="#" className="klarna-footer-link">Impressum</a>
          <a href="#" className="klarna-footer-link">Hilfe</a>
        </div>
        
        <div className="klarna-footer-info">
          <p className="klarna-footer-text">
            © 2024 Klarna Bank AB. Alle Rechte vorbehalten.
          </p>
          <p className="klarna-footer-subtext">
            Sichere Zahlungen powered by Klarna
          </p>
        </div>
        
        <div className="klarna-footer-security">
          <div className="klarna-security-badges">
            <span className="klarna-security-badge"><Shield size={14} /> SSL</span>
            <span className="klarna-security-badge"><CheckCircle size={14} /> Verifiziert</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default KlarnaFooter;
