import React, { useState, useEffect } from 'react';
import ComdirectLogo from './ComdirectLogo';

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
      backgroundColor: '#0b1e25',
        color: 'white', 
        position: 'relative', 
      overflow: 'hidden',
      marginTop: isMobile ? '40px' : '60px'
      }}>
      {/* Background decorative shapes */}
        <div style={{ 
          position: 'absolute', 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 1
        }}>
        <svg 
          aria-hidden="true" 
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '90%',
            height: '80%',
            opacity: 0.6
          }}
          viewBox="0 0 1920 312" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <path 
            clipRule="evenodd" 
            d="m388 86c0 16.6-13.4 30-30 30s-30-13.4-30-30 13.4-30 30-30 30 13.4 30 30zm-30 15c8.3 0 15-6.7 15-15s-6.7-15-15-15-15 6.7-15 15 6.7 15 15 15z" 
            fill="#3f4b50" 
            fillRule="evenodd"
          />
          <path 
            d="m268 118c66.3 0 120 53.7 120 120h-120z" 
            fill="#27343a"
          />
          <g fill="#3f4b50">
            <circle cx="238" cy="148" r="5"/>
            <circle cx="238" cy="128" r="5"/>
            <circle cx="218" cy="128" r="5"/>
            <circle cx="258" cy="148" r="5"/>
            <circle cx="258" cy="128" r="5"/>
            <circle cx="258" cy="168" r="5"/>
          </g>
          <circle cx="1688" cy="86" fill="#fff500" r="5"/>
          <circle cx="1688" cy="66" fill="#fff500" r="5"/>
          <circle cx="1708" cy="66" fill="#fff500" r="5"/>
          <circle cx="1668" cy="86" fill="#fff500" r="5"/>
          <circle cx="1668" cy="66" fill="#fff500" r="5"/>
          <circle cx="1668" cy="106" fill="#fff500" r="5"/>
          <path 
            d="m1538 238c0-33.1 26.9-60 60-60s60 26.9 60 60h-30c0-16.6-13.4-30-30-30s-30 13.4-30 30z" 
            fill="#27343a"
          />
                  </svg>
      </div>

      {/* Footer content */}
        <div style={{ 
        position: 'relative',
        zIndex: 2,
        maxWidth: '980px',
          margin: '0 auto', 
        padding: isMobile ? '40px 20px' : '60px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
          gap: isMobile ? '40px' : '60px',
          alignItems: 'start'
        }}>
          {/* Left section - Logo and tagline */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
              width: 'auto'
        }}>
              <ComdirectLogo color="#fff500" width={200} height={50} />
          </div>
            <div style={{
              fontSize: '16px',
              color: 'white',
              fontFamily: 'MarkWeb, Arial, sans-serif',
              lineHeight: '1.4'
              }}>
              mehr verstehen,<br />
              mehr vermögen.
        </div>
      </div>

          {/* Right section - Links grid */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '30px' : '40px'
          }}>
            {/* Column 1 - Kontakt */}
          <div style={{ 
            display: 'flex', 
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h4 style={{
            fontSize: '14px', 
                fontWeight: 'bold',
                color: 'white',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                margin: '0 0 8px 0'
          }}>
                Kontakt
              </h4>
            <a href="#" style={{ 
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                Über uns
              </a>
              <a href="#" style={{
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                Presse
              </a>
            <a href="#" style={{ 
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                Magazin
              </a>
            </div>

            {/* Column 2 - Karriere */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'white',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                margin: '0 0 8px 0'
              }}>
                Karriere
              </h4>
              <a href="#" style={{
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                Community
              </a>
            <a href="#" style={{ 
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                Apps
              </a>
              <a href="#" style={{
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                Kunden werben Kunden
              </a>
            </div>

            {/* Column 3 - Impressum */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h4 style={{
            fontSize: '14px', 
                fontWeight: 'bold',
                color: 'white',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                margin: '0 0 8px 0'
              }}>
                Impressum
              </h4>
            <a href="#" style={{ 
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                Datenschutz
              </a>
              <a href="#" style={{
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                Einwilligungseinstellungen
              </a>
            <a href="#" style={{ 
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                Sicherheit
              </a>
            <a href="#" style={{ 
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                Nutzungsbedingungen
              </a>
            <a href="#" style={{ 
                fontSize: '13px',
                color: 'white',
                textDecoration: 'none',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                opacity: 0.9,
                transition: 'opacity 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                AGB
              </a>
            </div>

            {/* Column 4 - Social Media */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center'
              }}>
                {/* Facebook */}
                <a href="#" style={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  transition: 'opacity 0.2s ease'
            }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a href="#" style={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a href="#" style={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.9,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - Copyright */}
        <div style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontFamily: 'MarkWeb, Arial, sans-serif'
        }}>
          © comdirect - eine Marke der Commerzbank AG
        </div>
      </div>
    </footer>
  );
};

export default Footer;
