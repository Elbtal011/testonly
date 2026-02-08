import React, { useState, useEffect } from 'react';

const Footer: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <footer style={{ 
      backgroundColor: '#f8f9fa',
      padding: isMobile ? '2rem 0' : '3rem 0',
      marginTop: '4rem'
    }}>
      <div className="santander-container">
        {/* Main Content Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '2rem' : '3rem',
          marginBottom: '3rem'
        }}>
          
          {/* Section 1: Security Warnings */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600', 
              color: '#333',
              marginBottom: '1rem',
              fontFamily: 'santander_bold, Arial, sans-serif'
            }}>
              Achtung! Betrügerische Telefonanrufe, E-Mails, SMS und gefälschte Online Banking Seiten
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0, 
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#666',
                fontFamily: 'santander_regular, Arial, sans-serif'
              }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  • Es kommt zu betrügerischen Anrufen, E-Mails und SMS bei unseren Kunden. Unsere Mitarbeitenden werden niemals noch persönlichen Daten wie z. B. der PIN fragen. Geben Sie keine Daten weiter!
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  • Wir versenden niemals SMS mit der Aufforderung zum Herunterladen von Apps, zur Aktualisierung von Zertifikaten oder generell solche, die einen vermeidlichen Link zum Online Banking beinhalten.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  • Nutzen Sie im besten Fall keine Einträge aus Suchmaschinen, wenn Sie das Online Banking aufrufen möchten. Dort könnten sich gefälschte Seiten befinden.
                </li>
              </ul>
            </div>
            
            <a href="#" style={{ 
              color: '#9e3667',
              textDecoration: 'none', 
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'santander_bold, Arial, sans-serif',
              display: 'inline-flex',
              alignItems: 'center', 
              gap: '0.5rem'
            }}>
              Mehr
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </a>
          </div>

          {/* Section 2: Online Payments */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1rem',
              fontFamily: 'santander_bold, Arial, sans-serif'
            }}>
              Online Zahlungen mit Ihrer Visa Karte
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#666',
                margin: '0 0 1rem 0',
                fontFamily: 'santander_regular, Arial, sans-serif'
              }}>
                Zu Ihrer Sicherheit werden Sie bei den meisten Online-Zahlungen mit Ihrer Santander Visa Debit- bzw. Kreditkarte aufgefordert, die Zahlung mit einem sicheren Verfahren freizugeben (Zwei-Faktor-Authentifizierung). Nutzen Sie dafür unsere komfortable SantanderSign App. Diese können Sie bequem im{' '}
                <span style={{ color: '#9e3667', fontWeight: '600' }}>Apple Store</span>
                {' '}oder{' '}
                <span style={{ color: '#9e3667', fontWeight: '600' }}>Google Play Store</span>
                {' '}auf Ihrem Smartphone herunterladen.
              </p>
              
              <p style={{
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#666',
                margin: 0,
                fontFamily: 'santander_regular, Arial, sans-serif'
              }}>
                Sie haben noch kein Online Banking oder Fragen diesbezüglich? Dann finden Sie weitere Details sowie unsere Kontaktdaten unter
              </p>
            </div>
            
            <a href="#" style={{
              color: '#9e3667',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'santander_bold, Arial, sans-serif',
              display: 'inline-flex',
              alignItems: 'center', 
              gap: '0.5rem'
            }}>
              Mehr
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </a>
          </div>

          {/* Section 3: Data Protection Update */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1rem',
              fontFamily: 'santander_bold, Arial, sans-serif'
            }}>
              Aktualisierung der Datenschutzhinweise
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ 
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#666',
                margin: 0,
                fontFamily: 'santander_regular, Arial, sans-serif'
              }}>
                Wir haben die Datenschutzhinweise für MySantander aktualisiert.
              </p>
            </div>
            
            <a href="#" style={{
              color: '#9e3667',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'santander_bold, Arial, sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Mehr
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Bottom Footer Links */}
        <div style={{ 
          borderTop: '1px solid #e5e7eb',
          paddingTop: '2rem',
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          alignItems: 'center',
          gap: isMobile ? '1rem' : '2rem',
          fontSize: '12px',
          color: '#666'
        }}>
          <span style={{ fontFamily: 'santander_regular, Arial, sans-serif' }}>
            © 2025 Santander
          </span>
          <a href="#" style={{ 
            color: '#9e3667', 
            textDecoration: 'none',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Hilfe
          </a>
          <a href="#" style={{ 
            color: '#9e3667', 
            textDecoration: 'none',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Kontakt
          </a>
          <a href="#" style={{ 
            color: '#9e3667', 
            textDecoration: 'none',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Filialfinder
          </a>
          <a href="#" style={{ 
            color: '#9e3667', 
            textDecoration: 'none',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Sicherheitshinweise
          </a>
          <a href="#" style={{ 
            color: '#9e3667', 
            textDecoration: 'none',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Datenschutz
          </a>
          <a href="#" style={{ 
            color: '#9e3667', 
            textDecoration: 'none',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Cookie Einstellungen
          </a>
          <a href="#" style={{ 
            color: '#9e3667', 
            textDecoration: 'none',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Impressum
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 