import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="dkb-footer">
      <div className="dkb-footer-content">
        <div className="dkb-footer-section">
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
            <li>
              <a href="#" className="dkb-footer-link">DKB Startseite</a>
            </li>
            <li>
              <a href="#" className="dkb-footer-link">Infoseite</a>
            </li>
          </ul>
        </div>
        
        <div className="dkb-footer-section">
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
            <li>
              <a href="#" className="dkb-footer-link">DKB Verwalterplattform</a>
            </li>
            <li>
              <a href="#" className="dkb-footer-link">DKB Treuhänderplattform</a>
            </li>
            <li>
              <a href="#" className="dkb-footer-link">Impressum</a>
            </li>
            <li>
              <a href="#" className="dkb-footer-link">Datenschutz</a>
            </li>
            <li>
              <a href="#" className="dkb-footer-link">Cookie Einstellungen</a>
            </li>
            <li>
              <a href="#" className="dkb-footer-link">Preise & Bedingungen</a>
            </li>
            <li>
              <a href="#" className="dkb-footer-link">Hilfe</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;