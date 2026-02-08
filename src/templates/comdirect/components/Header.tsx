import React, { useState, useEffect } from 'react';
import ComdirectLogo from './ComdirectLogo';

const Header: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wknSearchQuery, setWknSearchQuery] = useState('');

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <style>
        {`
          .header-search-input::placeholder {
            color: #808e91 !important;
            opacity: 1;
            transition: color 0.2s ease;
          }
          .header-search-input::-webkit-input-placeholder {
            color: #808e91 !important;
            transition: color 0.2s ease;
          }
          .header-search-input::-moz-placeholder {
            color: #808e91 !important;
            opacity: 1;
            transition: color 0.2s ease;
          }
          .header-search-input:-ms-input-placeholder {
            color: #808e91 !important;
            transition: color 0.2s ease;
          }
          .search-container:hover .header-search-input::placeholder {
            color: white !important;
          }
          .search-container:hover .header-search-input::-webkit-input-placeholder {
            color: white !important;
          }
          .search-container:hover .header-search-input::-moz-placeholder {
            color: white !important;
          }
          .search-container:hover .header-search-input:-ms-input-placeholder {
            color: white !important;
          }
        `}
      </style>
      <header style={{ 
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
      {/* Exact copy of the screenshot header */}
      <div style={{ 
        backgroundColor: '#0b1e25',
        color: 'white'
      }}>
        {/* Top row with logo and utilities */}
        <div style={{ 
          maxWidth: isMobile ? '100%' : '980px', 
        margin: '0 auto', 
          padding: isMobile ? '0 16px' : '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
          height: isMobile ? '60px' : '70px'
      }}>
          {/* Left - Comdirect logo */}
        {!isMobile && (
            <div style={{
              backgroundColor: '#fff500',
              marginLeft: '-175px',
              marginBottom: '15px',
              paddingTop: '30px',
              paddingBottom: '25px',
              paddingLeft: '191px',
              paddingRight: '16px',
                display: 'flex', 
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}>
              <ComdirectLogo color="#0b1e25" width={120} height={20} />
            </div>
          )}

          {/* Mobile logo - apple-touch-icon */}
          {isMobile && (
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img 
                src="/apple-touch-icon.png" 
                alt="Comdirect Logo"
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'cover'
                }}
              />
            </div>
        )}

          {/* Mobile right side - Login button and hamburger menu */}
        {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button style={{ 
                backgroundColor: '#fff500',
                color: '#0b1e25',
                border: 'none', 
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '15px',
                fontFamily: 'MarkWeb, Arial, sans-serif',
                fontWeight: 'bold',
                cursor: 'pointer',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e6d900';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff500';
              }}>
                Login
                <span style={{ fontSize: '13px' }}>›</span>
              </button>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ 
                  color: 'white', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '2px',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease'
                }}></div>
                <div style={{
                  width: '20px',
                  height: '2px',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease'
                }}></div>
                <div style={{
                  width: '20px',
                  height: '2px',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease'
                }}></div>
              </button>
            </div>
          )}

          {/* Right side utilities - Desktop only */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px' }}>
            <a href="#" style={{ 
              color: '#808e91', 
              textDecoration: 'none',
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: 'bold',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff500';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#808e91';
            }}>Musterdepot</a>
            <a href="#" style={{ 
              color: '#808e91', 
              textDecoration: 'none',
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: 'bold',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff500';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#808e91';
            }}>B2B</a>
            
            {/* WKN Search with input and search icon */}
            <div className="search-container" style={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: 'transparent',
              borderRadius: '20px',
              height: '40px',
              border: '1px solid #808e91',
              transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'white';
              const input = e.currentTarget.querySelector('input');
              const svg = e.currentTarget.querySelector('svg');
              if (input) input.style.color = 'white';
              if (svg) svg.setAttribute('fill', 'white');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#808e91';
              const input = e.currentTarget.querySelector('input');
              const svg = e.currentTarget.querySelector('svg');
              if (input) input.style.color = '#808e91';
              if (svg) svg.setAttribute('fill', '#808e91');
            }}>
              <input 
                type="text"
                placeholder="WKN, ISIN, Name"
                className="header-search-input"
                value={wknSearchQuery}
                onChange={(e) => setWknSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  fontFamily: 'MarkWeb, Arial, sans-serif',
                  fontWeight: 'bold',
                  color: '#808e91',
                  width: '130px',
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '20px 0 0 20px',
                  backgroundColor: 'transparent',
                  transition: 'color 0.2s ease'
                }}
              />
              <button style={{
                border: 'none',
                background: 'none',
                padding: '0 10px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '0 20px 20px 0'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#808e91">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>

            {/* Volltext Search */}
            <div className="search-container" style={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: 'transparent',
              borderRadius: '20px',
              height: '40px',
              border: '1px solid #808e91',
              transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'white';
              const input = e.currentTarget.querySelector('input');
              const svg = e.currentTarget.querySelector('svg');
              if (input) input.style.color = 'white';
              if (svg) svg.setAttribute('fill', 'white');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#808e91';
              const input = e.currentTarget.querySelector('input');
              const svg = e.currentTarget.querySelector('svg');
              if (input) input.style.color = '#808e91';
              if (svg) svg.setAttribute('fill', '#808e91');
            }}>
              <input 
                type="text"
                placeholder="Volltextsuche"
                className="header-search-input"
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  fontFamily: 'MarkWeb, Arial, sans-serif',
                  fontWeight: 'bold',
                  color: '#808e91',
                  width: '130px',
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '20px 0 0 20px',
                  backgroundColor: 'transparent',
                  transition: 'color 0.2s ease'
                }}
              />
              <button style={{
                border: 'none',
                background: 'none',
                padding: '0 10px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '0 20px 20px 0'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#808e91">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>

            {/* Login Button */}
            <button style={{
              backgroundColor: '#fff500',
              color: '#0b1e25',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '24px',
              fontSize: '15px',
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: 'bold',
              cursor: 'pointer',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e6d900';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff500';
            }}>
              Login
              <span style={{ fontSize: '13px' }}>›</span>
            </button>
            </div>
          )}
        </div>

        {/* Navigation bar - Desktop only */}
        {!isMobile && (
          <div style={{ 
            maxWidth: '980px', 
            margin: '0 auto', 
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            height: '40px'
          }}>
            <nav style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '0',
              height: '40px',
              width: '100%'
            }}>
              {[
                'Persönlicher Bereich',
                'Informer', 
                'Girokonto',
                'Geldanlage',
                'Depot',
                'Wertpapierhandel',
                'Kredite',
                'Hilfe & Service'
              ].map((item, index) => (
                <a 
                  key={index}
                  href="#" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontFamily: 'MarkWeb, Arial, sans-serif',
                    fontWeight: 'bold',
                    padding: '0 8px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '2px solid transparent',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap',
                    flex: '1'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff500';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobile && isMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          backgroundColor: '#0b1e25',
          borderTop: '1px solid #333',
          zIndex: 1000,
          padding: '16px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
        }}>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <a href="#" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: '400',
              padding: '12px 0',
              borderBottom: '1px solid #333'
            }}>Persönlicher Bereich</a>
            <a href="#" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: '400',
              padding: '12px 0',
              borderBottom: '1px solid #333'
            }}>Informer</a>
            <a href="#" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: '400',
              padding: '12px 0',
              borderBottom: '1px solid #333'
            }}>Girokonto</a>
            <a href="#" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: '400',
              padding: '12px 0',
              borderBottom: '1px solid #333'
            }}>Geldanlage</a>
            <a href="#" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: '400',
              padding: '12px 0',
              borderBottom: '1px solid #333'
            }}>Depot</a>
            <a href="#" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: '400',
              padding: '12px 0',
              borderBottom: '1px solid #333'
            }}>Wertpapierhandel</a>
            <a href="#" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: '400',
              padding: '12px 0',
              borderBottom: '1px solid #333'
            }}>Kredite</a>
            <a href="#" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontFamily: 'MarkWeb, Arial, sans-serif',
              fontWeight: '400',
              padding: '12px 0'
            }}>Hilfe & Service</a>
          </nav>
        </div>
      )}
    </header>
    </>
  );
};

export default Header;