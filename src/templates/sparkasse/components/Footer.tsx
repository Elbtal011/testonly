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
      {/* First Section - "Immer in Ihrer Nähe" with contact info and services */}
      <div style={{
        backgroundColor: '#2c2c2c',
        color: 'white',
        padding: '60px 0 40px 0'
      }}>
        <div style={{
          maxWidth: isMobile ? '100%' : '980px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Title */}
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'normal',
            textAlign: 'center',
            marginBottom: '40px',
            fontFamily: 'SparkasseWebBold, Arial, sans-serif',
            color: 'white'
          }}>
            Immer in Ihrer Nähe
          </h2>

          {/* Contact Info */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              fontSize: '14px',
              lineHeight: '24px',
              fontFamily: 'SparkasseWeb, Arial, sans-serif',
              marginBottom: '8px'
            }}>
              <span style={{ color: 'white' }}>24 h Privatkunden Service & Beratung: 030 869 869 69</span>
              <span style={{ margin: '0 20px', color: '#999' }}>•</span>
              <span style={{ color: 'white' }}>Für Unternehmen: BusinessCenter: 030 869 866 68</span>
            </div>
            <div style={{
              fontSize: '14px',
              lineHeight: '24px',
              fontFamily: 'SparkasseWeb, Arial, sans-serif'
            }}>
              <span style={{ color: 'white' }}>24 h Online-Banking-Hotline: 030 869 869 57</span>
              <span style={{ margin: '0 20px', color: '#999' }}>•</span>
              <span style={{ color: 'white' }}>24 h Karten-Sperr-Notruf: 030 869 869 05</span>
              <span style={{ margin: '0 20px', color: '#999' }}>•</span>
              <span style={{ color: '#ff0018' }}>Weitere Telefonnummern</span>
            </div>
          </div>

          {/* Service Icons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '20px' : '80px',
            marginBottom: '60px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              textAlign: 'center',
              minWidth: '120px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'transparent',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                border: '2px solid white'
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div style={{
                fontSize: '14px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                color: 'white',
                lineHeight: '18px'
              }}>
                Online-Assistentin Linda
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              minWidth: '120px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'transparent',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                border: '2px solid white'
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div style={{
                fontSize: '14px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                color: 'white',
                lineHeight: '18px',
                textAlign: 'center'
              }}>
                Beratungstermin<br />vereinbaren
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              minWidth: '120px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'transparent',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                border: '2px solid white'
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div style={{
                fontSize: '14px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
              color: 'white',
              lineHeight: '18px',
                textAlign: 'center'
              }}>
                Öffnungszeiten & Filialen
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              minWidth: '120px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'transparent',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                border: '2px solid white'
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div style={{
                fontSize: '14px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                color: 'white',
                lineHeight: '18px'
              }}>
                Live-Chat
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              minWidth: '120px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'transparent',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                border: '2px solid white'
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </div>
              <div style={{
                fontSize: '14px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
              color: 'white', 
                lineHeight: '18px'
              }}>
                WhatsApp
              </div>
            </div>
          </div>

          {/* Important Services Section */}
          <div style={{
            borderTop: '1px solid #444',
            paddingTop: '40px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'normal',
              fontFamily: 'SparkasseWebBold, Arial, sans-serif',
              color: 'white',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              WICHTIGE SERVICES
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #444'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <span style={{
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  color: 'white'
                }}>
                  IBAN und BIC berechnen
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #444'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2l9 4.9V17L12 22l-9-5V6.9z"/>
                </svg>
                <span style={{
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  color: 'white'
                }}>
                  Adresse ändern
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #444'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"/>
                  <path d="M16 8l2-2 2 2"/>
                  <path d="M19 13v6"/>
                  <path d="M3 7l6.5 4.5L16 7"/>
                </svg>
                <span style={{
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  color: 'white'
                }}>
                  Kartenverlust melden
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #444'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2l9 4.9V17L12 22l-9-5V6.9z"/>
                </svg>
                <span style={{
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  color: 'white'
                }}>
                  Dispositionskredit einrichten oder ändern
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #444'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <span style={{
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  color: 'white'
                }}>
                  Online-Kunde werden
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #444'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2l9 4.9V17L12 22l-9-5V6.9z"/>
                </svg>
                <span style={{
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  color: 'white'
                }}>
                  Gutscheine kaufen
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #444'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span style={{
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  color: 'white'
                }}>
                  Online-Banking-Hilfe
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #444'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  color: 'white'
                }}>
                  Alle Serviceleistungen im Überblick
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Section - Service Categories */}
      <div style={{
        backgroundColor: '#2c2c2c',
        color: 'white',
        padding: '40px 0',
        borderTop: '1px solid #444'
      }}>
        <div style={{
          maxWidth: isMobile ? '100%' : '980px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? '30px' : '60px'
          }}>
            {/* Rund ums Banking */}
            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 'normal',
                fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                color: 'white',
                marginBottom: '20px'
              }}>
                Rund ums Banking
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Online-Kunde werden', 'Online-Banking-Hilfe', 'App Sparkasse', 'Aktuelle Warnmeldungen', 'Sicherheit im Internet', 'Computercheck'].map(item => (
                  <a key={item} href="#" style={{
                    color: '#ccc',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    lineHeight: '20px'
                  }}>
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Kredite und Finanzierungen */}
            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 'normal',
                fontFamily: 'SparkasseWebBold, Arial, sans-serif',
              color: 'white', 
                marginBottom: '20px'
              }}>
                Kredite und Finanzierungen
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['S-Privatkredit', 'S-Autokredit', 'Immobilienfinanzierung', 'Modernisierungskredit', 'S-Privatkredit Plus', 'Dispositionskredit'].map(item => (
                  <a key={item} href="#" style={{
                    color: '#ccc',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    lineHeight: '20px'
                  }}>
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Wertpapiere und Depots */}
            <div>
              <h4 style={{
                fontSize: '16px',
              fontWeight: 'normal',
              fontFamily: 'SparkasseWebBold, Arial, sans-serif',
              color: 'white',
                marginBottom: '20px'
              }}>
                Wertpapiere und Depots
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Depotmodelle', 'Fonds', 'Deka Investments', 'SmartVermögen', 'Anlage-Check', 'BörsenCenter'].map(item => (
                  <a key={item} href="#" style={{
                    color: '#ccc',
              textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    lineHeight: '20px'
                  }}>
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Ihre Sparkasse */}
            <div>
              <h4 style={{
                fontSize: '16px',
              fontWeight: 'normal',
              fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                color: 'white',
                marginBottom: '20px'
              }}>
                Ihre Sparkasse
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Gemeinsam für Berlin', 'Nachhaltigkeit', 'Karriere', 'PresseCenter', 'Mediathek', 'SparkassenShop', 'Newsletter'].map(item => (
                  <a key={item} href="#" style={{
                    color: '#ccc',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    lineHeight: '20px'
                  }}>
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
          </div>

      {/* Third Section - Awards */}
      <div style={{
        backgroundColor: '#2c2c2c',
        color: 'white',
        padding: '60px 0',
        borderTop: '1px solid #444'
      }}>
        <div style={{
          maxWidth: isMobile ? '100%' : '980px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '40px' : '60px',
            alignItems: 'flex-start',
            textAlign: 'center'
          }}>
            <div>
              <img 
                src="/templates/sparkasse/images/1711607374144.jpg" 
                alt="Erfolgsfaktor Familie Award"
                style={{
                  width: '160px',
                  height: '160px',
                  margin: '0 auto 20px auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
              <div style={{
                fontSize: '16px',
                fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                color: 'white',
                marginBottom: '8px',
                lineHeight: '1.3'
              }}>
                Erfolgsfaktor Familie
              </div>
              <div style={{
                fontSize: '14px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                color: '#ccc',
                lineHeight: '1.4'
              }}>
                Fortschrittsindex<br />Vereinbarkeit 2024
              </div>
            </div>

            <div>
              <img 
                src="/templates/sparkasse/images/1724414854797.jpg" 
                alt="Attraktivste Arbeitgeber Award"
                style={{
                  width: '160px',
                  height: '160px',
                  margin: '0 auto 20px auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
              <div style={{
                fontSize: '16px',
                fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                color: 'white',
                marginBottom: '8px',
                lineHeight: '1.3'
              }}>
                Attraktivste Arbeitgeber
              </div>
              <div style={{
                fontSize: '14px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                color: '#ccc',
                lineHeight: '1.4'
              }}>
                2024<br />1. Platz: Schüler
              </div>
            </div>

            <div>
              <img 
                src="/templates/sparkasse/images/1745937737648.png" 
                alt="Focus Money City Contest Award"
                style={{
                  width: '160px',
                  height: '160px',
                  margin: '0 auto 20px auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
              <div style={{
                fontSize: '16px',
                fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                color: 'white',
                marginBottom: '8px',
                lineHeight: '1.3'
              }}>
                Ausgezeichnete Vermögensverwaltung
              </div>
              <div style={{
                fontSize: '14px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                color: '#ccc',
                lineHeight: '1.4'
              }}>
                Rating Q2/25
              </div>
            </div>

                        <div>
              <img 
                src="/templates/sparkasse/images/1747640438370.png" 
                alt="Private Banking Beratung Award"
                style={{
                  width: '160px',
                  height: '160px',
                  margin: '0 auto 20px auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
              <div style={{
                fontSize: '16px',
                fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                color: 'white',
                marginBottom: '8px',
                lineHeight: '1.3'
              }}>
                Private Banking Beratung und Service
              </div>
              <div style={{
                fontSize: '14px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                color: '#ccc',
                lineHeight: '1.4'
              }}>
                FOCUS MONEY März 2025
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Legal Links and Social */}
      <div style={{
        backgroundColor: '#2c2c2c',
        color: 'white',
        padding: '40px 0',
        borderTop: '1px solid #444'
      }}>
        <div style={{
          maxWidth: isMobile ? '100%' : '980px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Language Selector */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <img 
              src="/templates/sparkasse/images/de-flag.svg" 
              alt="Deutsch" 
              style={{ width: '20px', height: '15px' }}
            />
            <span style={{ 
              marginLeft: '8px',
              fontSize: '14px',
              fontFamily: 'SparkasseWeb, Arial, sans-serif',
              color: 'white'
            }}>
              Deutsch ▼
            </span>
          </div>

          {/* Legal Links */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '20px',
            fontSize: '14px',
            fontFamily: 'SparkasseWeb, Arial, sans-serif'
          }}>
            {['AGB', 'Cookie-Einstellungen anpassen', 'Datenschutz', 'Preise und Hinweise', 'Barrierefreiheit'].map(item => (
              <a key={item} href="#" style={{
                color: '#ccc',
                textDecoration: 'none'
              }}>
                {item}
              </a>
            ))}
          </div>

              <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '20px',
            fontSize: '14px',
            fontFamily: 'SparkasseWeb, Arial, sans-serif'
          }}>
            {['Barriere melden', 'Impressum', 'Filialen A-Z', 'Geldautomaten A-Z'].map(item => (
              <a key={item} href="#" style={{
                color: '#ccc',
                textDecoration: 'none'
              }}>
                {item}
              </a>
            ))}
              </div>

          {/* Social Media Icons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px'
          }}>
            {[
              { name: 'Facebook', icon: 'F' },
              { name: 'Instagram', icon: 'I' },
              { name: 'YouTube', icon: 'Y' },
              { name: 'LinkedIn', icon: 'L' }
            ].map(social => (
              <a key={social.name} href="#" style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textDecoration: 'none',
                fontSize: '18px',
                fontFamily: 'SparkasseWebBold, Arial, sans-serif'
              }}>
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
