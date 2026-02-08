import React, { useState, useEffect } from 'react';

// Primary navigation items (top row) - muted color, hidden when scrolled
const primaryNavItems = [
  'Privatkunden',
  'Unternehmerkunden',
  'Wealth Management',
  'Firmenkunden',
  'Karriere'
];

// Secondary navigation items (second row) - white color, always visible
const secondaryNavItems = [
  'Konten & Karten',
  'Wertpapierhandel',
  'Sparen & Anlegen',
  'Kredit & Finanzierung',
  'Versicherungen & Vorsorge',
  'Magazin',
  'Hilfe & Kontakt'
];

const Header: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) {
        setIsMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll for sticky header transformation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && isMobile) {
        const target = event.target as Element;
        if (!target.closest('header')) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isMobile]);

  return (
    <header style={{ 
      backgroundColor: '#002e3c', 
      color: 'white',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      height: isMobile ? '72px' : (isScrolled ? '64px' : '128px'),
      overflow: 'hidden',
      transition: 'height 0.3s ease'
    }}>
      {/* Desktop Layout */}
      {!isMobile && (
        <div style={{ 
          maxWidth: '1680px', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-start',
          height: '128px',
          padding: '0 32px',
          transform: isScrolled ? 'translateY(-64px)' : 'translateY(0)',
          transition: 'transform 0.3s ease'
        }}>
          {/* Logo - Outside navigation container */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            paddingRight: '32px',
            flexShrink: 0,
            height: '100%',
            paddingTop: '12px',
            transition: 'all 0.3s ease'
          }}>
            <a href="#" style={{ display: 'block' }}>
              <img
                src="/templates/commerzbank/images/commerzbank.svg"
                alt="Commerzbank Logo"
                style={{ 
                  height: isScrolled ? '38px' : '76px',
                  width: 'auto',
                  transition: 'height 0.3s ease'
                }}
              />
            </a>
          </div>

          {/* Navigation Container - Both rows stacked */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            paddingTop: '18px'
          }}>
            {/* Top Row: Primary Nav + Right Icons */}
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '28px',
              marginBottom: '34px',
              opacity: isScrolled ? 0 : 1,
              transition: 'opacity 0.2s ease'
            }}>
              {/* Primary Navigation - Muted white ~60% opacity */}
              <nav style={{ 
                display: 'flex', 
                gap: '24px', 
                alignItems: 'center'
              }}>
                {primaryNavItems.map((item) => (
                  <a 
                    key={item}
                    href="#" 
                    style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      textDecoration: 'none',
                      fontSize: '17px',
                      fontWeight: '500',
                      fontFamily: 'Gotham, Arial, sans-serif',
                      transition: 'color 0.3s ease',
                      whiteSpace: 'nowrap',
                      lineHeight: '28px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                  >
                    {item}
                  </a>
                ))}
              </nav>

              {/* Right side - Search Icon and Login */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Search Icon with text */}
                <a 
                  href="#"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    fontSize: '17px',
                    fontWeight: '500',
                    fontFamily: 'Gotham, Arial, sans-serif'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                >
                  <svg fill="currentColor" width="20px" height="20px" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M17.41 14h-2.17A8 8 0 1 0 14 15.24v2.17l6 6L23.41 20ZM9 15a6 6 0 1 1 6-6 6 6 0 0 1-6 6Zm7 1.59V16h.59l4 4-.59.59Z"></path>
                  </svg>
                </a>

                {/* Lock Icon with Login text */}
                <a 
                  href="#"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '17px',
                    fontWeight: '500',
                    fontFamily: 'Gotham, Arial, sans-serif',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                >
                  <svg fill="currentColor" width="18px" height="18px" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  <span>Login</span>
                </a>
              </div>
            </div>

            {/* Bottom Row: Secondary Navigation - White color */}
            <nav style={{ 
              display: 'flex', 
              gap: '24px', 
              alignItems: 'center',
              height: '32px'
            }}>
              {secondaryNavItems.map((item) => (
                <a 
                  key={item}
                  href="#" 
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '400',
                    fontFamily: 'Gotham, Arial, sans-serif',
                    transition: 'opacity 0.3s ease',
                    whiteSpace: 'nowrap',
                    lineHeight: '32px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div style={{ 
          padding: '0 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '72px'
        }}>
          {/* Logo - Ribbon logo for mobile */}
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="/templates/commerzbank/images/CB-2022-Ribbon_RGB.svg"
                alt="Commerzbank Logo"
                style={{ height: '36px', width: 'auto' }}
              />
            </a>
          </div>

          {/* Mobile Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Search Button */}
            <button 
              style={{ 
                color: 'white', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Suche"
            >
              <svg fill="currentColor" width="26px" height="26px" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M17.41 14h-2.17A8 8 0 1 0 14 15.24v2.17l6 6L23.41 20ZM9 15a6 6 0 1 1 6-6 6 6 0 0 1-6 6Zm7 1.59V16h.59l4 4-.59.59Z"></path>
              </svg>
            </button>

            {/* Login Button */}
            <a 
              href="#"
              style={{ 
                color: 'white', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none'
              }}
              aria-label="Login"
            >
              <svg fill="currentColor" width="26px" height="26px" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </a>

            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ 
                color: 'white', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              <div style={{
                width: '26px',
                height: '2.5px',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
              }}></div>
              <div style={{
                width: '26px',
                height: '2.5px',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                opacity: isMenuOpen ? '0' : '1'
              }}></div>
              <div style={{
                width: '26px',
                height: '2.5px',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                transform: isMenuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none'
              }}></div>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Backdrop and Dropdown */}
      {isMobile && isMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="mobile-menu-backdrop"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Mobile menu */}
          <div className="mobile-menu">
            <nav>
              {/* Primary Navigation Section */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'rgba(255,255,255,0.6)', 
                  marginBottom: '0.5rem',
                  paddingLeft: '0.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Bereiche
                </div>
                {primaryNavItems.map((item) => (
                  <a 
                    key={item}
                    href="#" 
                    onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); }}
                  >
                    {item}
                  </a>
                ))}
              </div>

              {/* Divider */}
              <div style={{ 
                height: '1px', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                margin: '1rem 0' 
              }}></div>

              {/* Secondary Navigation Section */}
              <div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'rgba(255,255,255,0.6)', 
                  marginBottom: '0.5rem',
                  paddingLeft: '0.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Services
                </div>
                {secondaryNavItems.map((item) => (
                  <a 
                    key={item}
                    href="#" 
                    onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
