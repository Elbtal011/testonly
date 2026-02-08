import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
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
    <header style={{ width: '100%' }}>
      {/* Top Navigation Bar - Hidden on mobile */}
      {!isMobile && (
        <div style={{
          backgroundColor: '#003366',
          padding: '8px 0',
          fontSize: '13px',
          color: 'white'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* Left side - Customer types */}
            <div style={{
              display: 'flex',
              gap: '24px'
            }}>
              <a href="#" onClick={(e) => e.preventDefault()} style={{
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                fontSize: '13px'
              }}>
                Privatkunden
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} style={{
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                fontSize: '13px'
              }}>
                Geschäftskunden
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} style={{
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                fontSize: '13px'
              }}>
                Firmenkunden
              </a>
            </div>

            {/* Right side - Contact info */}
            <div style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center'
            }}>
              <span style={{
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                fontSize: '13px'
              }}>
                BLZ: 300 209 00
              </span>
              <span style={{
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                fontSize: '13px'
              }}>
                BIC: CMCIDEDD
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div style={{
        backgroundColor: 'white',
        padding: isMobile ? '12px 0' : '16px 0',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* TARGOBANK Logo */}
          <img
            src="/images/targobank-logo.svg"
            alt="TARGOBANK"
            onClick={onLogoClick}
            style={{ 
              height: isMobile ? '36px' : '42px',
              width: 'auto',
              cursor: onLogoClick ? 'pointer' : 'default'
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

