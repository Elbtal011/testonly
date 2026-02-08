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
      {/* TARGOBANK Footer - Single Row Design */}
      <div style={{
        backgroundColor: '#003366',
        borderTop: '1px solid #004080'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0'
        }}>
          {/* Left side - TARGOBANK Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: isMobile ? '20px 0' : '40px 0'
          }}>
            <img 
              src="/images/targobank-icon-white.svg" 
              alt="TARGOBANK" 
              style={{ 
                height: isMobile ? '40px' : '48px', 
                width: 'auto',
                marginRight: isMobile ? '0' : '20px'
              }} 
            />
          </div>

          {/* Center - Navigation Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            flex: isMobile ? 'none' : 1,
            justifyContent: 'center',
            flexWrap: 'wrap',
            textAlign: 'center',
            padding: isMobile ? '20px 0' : '60px 0'
          }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 'normal',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              padding: '0 8px',
              whiteSpace: 'nowrap'
            }}>
              Impressum
            </a>
            <span style={{ 
              color: 'white', 
              fontSize: isMobile ? '12px' : '14px',
              padding: '0 4px'
            }}>|</span>
            <a href="#" onClick={(e) => e.preventDefault()} style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 'normal',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              padding: '0 8px',
              whiteSpace: 'nowrap'
            }}>
              Datenschutz
            </a>
            <span style={{ 
              color: 'white', 
              fontSize: isMobile ? '12px' : '14px',
              padding: '0 4px'
            }}>|</span>
            <a href="#" onClick={(e) => e.preventDefault()} style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 'normal',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              padding: '0 8px',
              whiteSpace: 'nowrap'
            }}>
              AGB, Rechtliche Hinweise & Barrierefreiheit
            </a>
            <span style={{ 
              color: 'white', 
              fontSize: isMobile ? '12px' : '14px',
              padding: '0 4px'
            }}>|</span>
            <a href="#" onClick={(e) => e.preventDefault()} style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 'normal',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              padding: '0 8px',
              whiteSpace: 'nowrap'
            }}>
              Preise & Leistungen
            </a>
            <span style={{ 
              color: 'white', 
              fontSize: isMobile ? '12px' : '14px',
              padding: '0 4px'
            }}>|</span>
            <a href="#" onClick={(e) => e.preventDefault()} style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 'normal',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              padding: '0 8px',
              whiteSpace: 'nowrap'
            }}>
              Sicherheit
            </a>
            <span style={{ 
              color: 'white', 
              fontSize: isMobile ? '12px' : '14px',
              padding: '0 4px'
            }}>|</span>
            <a href="#" onClick={(e) => e.preventDefault()} style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 'normal',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              padding: '0 8px',
              whiteSpace: 'nowrap'
            }}>
              Kredit
            </a>
          </div>

          {/* Right side - Language Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: isMobile ? '20px 0' : '60px 0'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 'bold',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              DE
            </span>
            <span style={{ 
              color: 'white', 
              fontSize: isMobile ? '12px' : '14px',
              padding: '0 4px'
            }}>|</span>
            <span style={{ 
              color: '#ccc', 
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 'normal',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              EN
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

