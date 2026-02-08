import React, { useState, useEffect } from 'react';

const Footer: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return (
    <footer style={{
      marginTop: 'auto'
    }}>
      {/* First Row - Blue background with centered links and language switcher */}
      <div style={{
        backgroundColor: '#002d67',
        padding: '20px 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center'
        }}>
          {/* Centered Footer Links */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            alignItems: 'center',
            marginTop: '16px',
            marginBottom: '24px'
          }}>
            <a href="#" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              fontWeight: 'normal',
              lineHeight: '18px',
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              AGB
            </a>
            <span style={{ 
              color: 'white', 
              fontSize: '0.5rem',
              fontWeight: 'normal',
              lineHeight: '18px',
              padding: '0 4px',
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>•</span>
            <a href="#" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              fontWeight: 'normal',
              lineHeight: '18px',
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Impressum
            </a>
            <span style={{ 
              color: 'white', 
              fontSize: '0.5rem',
              fontWeight: 'normal',
              lineHeight: '18px',
              padding: '0 4px',
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>•</span>
            <a href="#" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              fontWeight: 'normal',
              lineHeight: '18px',
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Datenschutz
            </a>
          </div>

          {/* Language Switcher */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px',
            marginBottom: '16px'
          }}>
            <img src="/templates/volksbank/images/de-flag.svg" alt="Deutschland" style={{ width: '28px', height: '20px' }} />
            <span style={{ 
              color: 'white', 
              fontSize: '1rem',
              fontWeight: 'normal',
              lineHeight: '20px',
              fontFamily: 'GenosGFG, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Deutsch ▼
            </span>
          </div>
        </div>
      </div>

      {/* Second Row - White background with partnership text and logos */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Partnership text */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <span style={{ 
              color: '#666', 
              fontSize: '0.8125rem', 
              fontFamily: 'GenosGFG, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Wir machen den Weg frei. Gemeinsam mit den Spezialisten der Genossenschaftlichen FinanzGruppe Volksbanken Raiffeisenbanken
            </span>
          </div>

          {/* Partner Bank Logos - Responsive Layout */}
          {isMobile ? (
            // Mobile: Centered 3-column grid
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px 10px',
                alignItems: 'center',
                justifyItems: 'center',
                maxWidth: '300px'
              }}>
                <img src="/templates/volksbank/images/partners/SchwaebischHall.png" alt="Bausparkasse Schwäbisch Hall" style={{ height: '20px', maxWidth: '80px', objectFit: 'contain', opacity: '0.8' }} />
                <img src="/templates/volksbank/images/partners/UnionInvestment-5.avif" alt="Union Investment" style={{ height: '20px', maxWidth: '80px', objectFit: 'contain', opacity: '0.8' }} />
                <img src="/templates/volksbank/images/partners/RundV-3.avif" alt="R+V Versicherung" style={{ height: '20px', maxWidth: '80px', objectFit: 'contain', opacity: '0.8' }} />
                <img src="/templates/volksbank/images/partners/DZBANK_Initiativbank.png" alt="DZ BANK" style={{ height: '20px', maxWidth: '80px', objectFit: 'contain', opacity: '0.8' }} />
                <img src="/templates/volksbank/images/partners/DZPrivatbank.png" alt="DZ PRIVATBANK" style={{ height: '20px', maxWidth: '80px', objectFit: 'contain', opacity: '0.8' }} />
                <img src="/templates/volksbank/images/partners/VR_Smart_Finanz.png" alt="VR Smart Finanz" style={{ height: '20px', maxWidth: '80px', objectFit: 'contain', opacity: '0.8' }} />
                <img src="/templates/volksbank/images/partners/DGHYP-2.webp" alt="Deutsche Genossenschafts-Hypothekenbank" style={{ height: '20px', maxWidth: '80px', objectFit: 'contain', opacity: '0.8' }} />
                <img src="/templates/volksbank/images/partners/MünchenerHyp.png" alt="Münchener Hyp" style={{ height: '24px', maxWidth: '80px', objectFit: 'contain', opacity: '0.7' }} />
              </div>
            </div>
          ) : (
            // Desktop: Single row
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '40px',
              flexWrap: 'nowrap',
              width: '100%'
            }}>
              <img src="/templates/volksbank/images/partners/SchwaebischHall.png" alt="Bausparkasse Schwäbisch Hall" style={{ height: '26px', maxWidth: '100px', objectFit: 'contain', opacity: '0.8' }} />
              <img src="/templates/volksbank/images/partners/UnionInvestment-5.avif" alt="Union Investment" style={{ height: '26px', maxWidth: '100px', objectFit: 'contain', opacity: '0.8' }} />
              <img src="/templates/volksbank/images/partners/RundV-3.avif" alt="R+V Versicherung" style={{ height: '26px', maxWidth: '100px', objectFit: 'contain', opacity: '0.8' }} />
              <img src="/templates/volksbank/images/partners/DZBANK_Initiativbank.png" alt="DZ BANK" style={{ height: '26px', maxWidth: '100px', objectFit: 'contain', opacity: '0.8' }} />
              <img src="/templates/volksbank/images/partners/DZPrivatbank.png" alt="DZ PRIVATBANK" style={{ height: '26px', maxWidth: '100px', objectFit: 'contain', opacity: '0.8' }} />
              <img src="/templates/volksbank/images/partners/VR_Smart_Finanz.png" alt="VR Smart Finanz" style={{ height: '26px', maxWidth: '100px', objectFit: 'contain', opacity: '0.8' }} />
              <img src="/templates/volksbank/images/partners/DGHYP-2.webp" alt="Deutsche Genossenschafts-Hypothekenbank" style={{ height: '26px', maxWidth: '100px', objectFit: 'contain', opacity: '0.8' }} />
              <img src="/templates/volksbank/images/partners/MünchenerHyp.png" alt="Münchener Hyp" style={{ height: '30px', maxWidth: '100px', objectFit: 'contain', opacity: '0.7' }} />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
