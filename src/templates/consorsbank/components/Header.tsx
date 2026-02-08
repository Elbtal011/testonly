import React, { useState, useEffect } from 'react';
import '../ConsorsbankStyle.css';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false); // Close mobile menu on desktop
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header style={{
          backgroundColor: '#ffffff',
          padding: '15px 0',
          position: 'relative',
          zIndex: 1000,
          borderBottom: '1px solid #e0e0e0',
          marginBottom: '0'
        }}>
          <div style={{
            maxWidth: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 15px',
            height: '50px'
          }}>
            {/* Mobile Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <img 
                src="/templates/consorsbank/images/logo.svg" 
                alt="Consors bank!" 
                style={{
                  height: '35px',
                  width: 'auto'
                }}
              />
            </div>

            {/* Mobile Menu Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {/* Mobile Login Button */}
              <button className="button button-primary button--mini" style={{
                fontSize: '10px',
                fontWeight: '600',
                padding: '4px 8px',
                minHeight: '28px',
                lineHeight: '1'
              }}>
                Login
              </button>

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '30px',
                  height: '30px'
                }}
                aria-label="Menu"
              >
                <span style={{
                  display: 'block',
                  width: '20px',
                  height: '2px',
                  backgroundColor: '#333',
                  margin: '2px 0',
                  transition: '0.3s',
                  transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
                }} />
                <span style={{
                  display: 'block',
                  width: '20px',
                  height: '2px',
                  backgroundColor: '#333',
                  margin: '2px 0',
                  transition: '0.3s',
                  opacity: mobileMenuOpen ? '0' : '1'
                }} />
                <span style={{
                  display: 'block',
                  width: '20px',
                  height: '2px',
                  backgroundColor: '#333',
                  margin: '2px 0',
                  transition: '0.3s',
                  transform: mobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
                }} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e0e0e0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              zIndex: 999
            }}>
              {/* Top Navigation Links */}
              <div style={{
                padding: '15px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <a href="#" style={{
                    color: '#464646',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '8px 0'
                  }}>FinanzCoach</a>
                  <a href="#" style={{
                    color: '#464646',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '8px 0'
                  }}>Community</a>
                  <a href="#" style={{
                    color: '#464646',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '8px 0'
                  }}>Blog</a>
                  <button className="button button-secondary" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '8px 16px',
                    marginTop: '8px',
                    width: 'fit-content'
                  }}>
                    Watchlist
                  </button>
                </div>
              </div>

              {/* Main Navigation Links */}
              <div style={{
                padding: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <a href="#" style={{
                    color: '#333333',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '400',
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>Girokonto</a>
                  <a href="#" style={{
                    color: '#333333',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '400',
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>Sparen & Anlegen</a>
                  <a href="#" style={{
                    color: '#333333',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '400',
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>Wertpapierhandel</a>
                  <a href="#" style={{
                    color: '#333333',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '400',
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>Finanzieren</a>
                  <a href="#" style={{
                    color: '#333333',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '400',
                    padding: '10px 0'
                  }}>Service</a>
                </div>
              </div>
            </div>
          )}
        </header>
      </>
    );
  }

  // Desktop Header (existing code)
  return (
    <>
      {/* Consors Bank Header - Bigger logo with proper spacing */}
      <header style={{
        backgroundColor: '#ffffff',
        padding: '20px 0 0 0',
        position: 'relative',
        zIndex: 1000,
        marginBottom: '20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'stretch',
          height: '85px'
        }}>
          {/* Logo Section - Much Bigger, No Separator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            backgroundColor: '#ffffff',
            marginRight: '30px'
          }}>
            <img 
              src="/templates/consorsbank/images/logo.svg" 
              alt="Consors bank!" 
              style={{
                height: '80px',
                width: 'auto'
              }}
            />
          </div>

          {/* Right Side - Stacked Navigation */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Top Row - Small Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '8px 20px',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e0e0e0',
              height: '40px'
            }}>
              {/* Top Links */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                {/* Text Links */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '13px',
                  color: '#464646',
                  fontWeight: '600'
                }}>
                  <a href="#" style={{
                    color: '#464646',
                    textDecoration: 'none',
                    padding: '0 8px',
                    fontWeight: '600'
                  }}>FinanzCoach</a>
                  <span style={{ color: '#ccc' }}>|</span>
                  <a href="#" style={{
                    color: '#464646',
                    textDecoration: 'none',
                    padding: '0 8px',
                    fontWeight: '600'
                  }}>Community</a>
                  <span style={{ color: '#ccc' }}>|</span>
                  <a href="#" style={{
                    color: '#464646',
                    textDecoration: 'none',
                    padding: '0 8px',
                    fontWeight: '600'
                  }}>Blog</a>
                </div>

                {/* Watchlist Button - Grey Gradient */}
                <button className="button button-secondary button--mini" style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  minHeight: '24px',
                  lineHeight: '1'
                }}>
                  Watchlist
                </button>

                {/* Login Button - Blue Gradient */}
                <button className="button button-primary button--mini" style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  minHeight: '24px',
                  lineHeight: '1'
                }}>
                  Login
                </button>
              </div>
            </div>

            {/* Bottom Row - Main Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#3a3a3a',
              height: '45px',
              padding: '0 20px',
              borderRadius: '4px'
            }}>
              <nav style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%'
              }}>
                <a href="#" style={{
                  color: '#cccccc',
                  textDecoration: 'none',
                  padding: '0 18px',
                  fontSize: '13px',
                  fontWeight: '400',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#cccccc'}
                >
                  Girokonto
                </a>
                <a href="#" style={{
                  color: '#cccccc',
                  textDecoration: 'none',
                  padding: '0 18px',
                  fontSize: '13px',
                  fontWeight: '400',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#cccccc'}
                >
                  Sparen & Anlegen
                </a>
                <a href="#" style={{
                  color: '#cccccc',
                  textDecoration: 'none',
                  padding: '0 18px',
                  fontSize: '13px',
                  fontWeight: '400',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#cccccc'}
                >
                  Wertpapierhandel
                </a>
                <a href="#" style={{
                  color: '#cccccc',
                  textDecoration: 'none',
                  padding: '0 18px',
                  fontSize: '13px',
                  fontWeight: '400',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#cccccc'}
                >
                  Finanzieren
                </a>
                <a href="#" style={{
                  color: '#cccccc',
                  textDecoration: 'none',
                  padding: '0 18px',
                  fontSize: '13px',
                  fontWeight: '400',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#cccccc'}
                >
                  Service
                </a>

                {/* Search Icon */}
                <div style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: '#cccccc',
                    cursor: 'pointer',
                    padding: '8px',
                    fontSize: '16px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#cccccc'}
                  >
                    🔍
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
