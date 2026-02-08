import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit({ username, password });
    }
  };

  // Responsive styles
  const containerPadding = isSmallMobile ? '16px' : isMobile ? '20px' : '32px 8px 32px 8px';
  const cardWidth = isMobile ? '100%' : '920px';
  const cardPadding = isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px';
  const formFieldGap = isMobile ? '16px' : '32px';
  const formFieldDirection = isMobile ? 'column' : 'row';
  const labelWidth = isMobile ? '100%' : '150px';
  const labelTextAlign = isMobile ? 'left' : 'left';
  const fieldMarginBottom = isMobile ? '8px' : '0';
  const formMarginBottom = isMobile ? '16px' : '32px';

  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '0',
      fontFamily: 'Source Sans Pro, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: isMobile ? 'none' : '1400px',
        margin: isMobile ? '0' : '0 auto',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Main Login Form Card */}
        <div style={{
          width: cardWidth,
          backgroundColor: '#f0f3f5',
          borderRadius: isMobile ? '0' : '8px',
          border: 'none',
          boxShadow: isMobile ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: 'opacity 0.2s ease',
          minHeight: isMobile ? '100vh' : 'auto'
        }}>
          {/* White Header Section with Title */}
          <div style={{
            backgroundColor: 'white',
            padding: cardPadding
          }}>
            {/* Page Title */}
            <h1 style={{
              color: '#012169',
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '600',
              margin: '0',
              lineHeight: isMobile ? '1.75rem' : '2.5rem',
              fontFamily: 'Source Sans Pro, Arial, sans-serif',
              textAlign: 'left'
            }}>
              Login
            </h1>
          </div>

          {/* Subtitle Section */}
          <div style={{
            backgroundColor: '#f0f3f5',
            padding: cardPadding
          }}>
            <p style={{
              margin: '0',
              fontSize: isMobile ? '14px' : '16px',
              lineHeight: isMobile ? '20px' : '24px',
              color: '#1e325f',
              fontFamily: 'Source Sans Pro, Arial, sans-serif',
              fontWeight: '600',
              textAlign: 'left'
            }}>
              Willkommen im Online-Banking der apoBank
            </p>
          </div>

          {/* Header Banking Image */}
          <div style={{
            padding: cardPadding
          }}>
            <img 
              src="/templates/apobank/images/header_banking_neu.jpg" 
              alt="Banking Header" 
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>

          {/* Content Section */}
          <div style={{
            padding: cardPadding
          }}>

            {/* Information Links */}
            <div style={{
              marginBottom: isMobile ? '20px' : '32px',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              lineHeight: '1.4',
              color: '#666',
              fontFamily: 'Source Sans Pro, Arial, sans-serif'
            }}>
              <p style={{ margin: '0 0 6px 0' }}>
                Aktuelle Warnung vor Phishing und Betrugsversuchen: <a href="#" style={{ color: '#012169', textDecoration: 'underline' }}>apobank.de/aktuelle-sicherheitshinweise</a>
              </p>
              <p style={{ margin: '0 0 6px 0' }}>
                Allgemeine Informationen zum Online-Banking finden Sie unter: <a href="#" style={{ color: '#012169', textDecoration: 'underline' }}>apobank.de/onlinebanking</a>
              </p>
              <p style={{ margin: '0' }}>
                Statusmeldungen zu aktuellen Störungen finden Sie unter: <a href="#" style={{ color: '#012169', textDecoration: 'underline' }}>apobank.de/status-onlinebanking</a>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div style={{
                display: 'flex',
                flexDirection: formFieldDirection as 'row' | 'column',
                alignItems: isMobile ? 'stretch' : 'center',
                marginBottom: formMarginBottom,
                gap: formFieldGap
              }}>
                <label style={{
                  fontSize: isMobile ? '0.875rem' : '0.875rem',
                  fontWeight: '600',
                  color: '#012169',
                  fontFamily: 'Source Sans Pro, Arial, sans-serif',
                  minWidth: labelWidth,
                  textAlign: labelTextAlign as 'left',
                  marginBottom: fieldMarginBottom
                }}>
                  Benutzername
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    flex: 1,
                    padding: isMobile ? '12px 16px' : '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: isMobile ? '16px' : '14px',
                    lineHeight: isMobile ? '24px' : '20px',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif',
                    fontWeight: '400',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    minHeight: isMobile ? '48px' : 'auto'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#012169';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ccc';
                  }}
                />
              </div>

              {/* Password Field */}
              <div style={{
                display: 'flex',
                flexDirection: formFieldDirection as 'row' | 'column',
                alignItems: isMobile ? 'stretch' : 'center',
                marginBottom: '32px',
                gap: formFieldGap
              }}>
                <label style={{
                  fontSize: isMobile ? '0.875rem' : '0.875rem',
                  fontWeight: '600',
                  color: '#012169',
                  fontFamily: 'Source Sans Pro, Arial, sans-serif',
                  minWidth: labelWidth,
                  textAlign: labelTextAlign as 'left',
                  marginBottom: fieldMarginBottom
                }}>
                  Passwort
                </label>
                <div style={{
                  flex: 1,
                  position: 'relative'
                }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 48px 12px 16px' : '8px 40px 8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: isMobile ? '16px' : '14px',
                      lineHeight: isMobile ? '24px' : '20px',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif',
                      fontWeight: '400',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box',
                      minHeight: isMobile ? '48px' : 'auto'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#012169';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ccc';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: isMobile ? '12px' : '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: isMobile ? '32px' : '24px',
                      width: isMobile ? '32px' : '24px'
                    }}
                  >
                    {showPassword ? <EyeOff size={isMobile ? 20 : 16} /> : <Eye size={isMobile ? 20 : 16} />}
                  </button>
                </div>
              </div>

              {/* Error Banner - Show if there's an error message */}
              {errorMessage && (
                <div style={{
                  backgroundColor: '#ffebee',
                  border: '1px solid #ffcdd2',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: isMobile ? '20px' : '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <AlertTriangle 
                    size={20} 
                    style={{ 
                      color: '#d32f2f',
                      marginTop: '2px',
                      flexShrink: 0
                    }} 
                  />
                  <div style={{
                    flex: 1
                  }}>
                    <div style={{
                      color: '#d32f2f',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif',
                      fontStyle: 'normal',
                      marginBottom: '4px'
                    }}>
                      Anmeldung fehlgeschlagen.
                    </div>
                    <div style={{
                      color: '#d32f2f',
                      fontSize: '14px',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif',
                      fontStyle: 'normal',
                      lineHeight: '1.4'
                    }}>
                      Bei der Anmeldung ist ein Fehler aufgetreten.
                      <br />
                      Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.
                    </div>
                  </div>
                </div>
              )}

              {/* Login Button */}
              <div style={{
                display: 'flex',
                justifyContent: isMobile ? 'stretch' : 'flex-end',
                marginTop: '32px'
              }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: isMobile ? '16px 24px' : '12px 32px',
                    backgroundColor: isLoading ? '#ccc' : '#012169',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif',
                    width: isMobile ? '100%' : 'auto',
                    minHeight: isMobile ? '48px' : 'auto'
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#0056b3';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#012169';
                    }
                  }}
                >
                  {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
                </button>
              </div>

              {/* Security Agreement Text */}
              <div style={{
                marginTop: '16px',
                fontSize: isMobile ? '11px' : '12px',
                color: '#666',
                fontFamily: 'Source Sans Pro, Arial, sans-serif',
                lineHeight: '1.4'
              }}>
                Mit dem Absenden Ihrer Anmeldedaten erkennen Sie die{' '}
                <a href="#" style={{
                  color: '#012169',
                  textDecoration: 'underline'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}>
                  Sicherheitshinweise
                </a>{' '}
                an.
              </div>
            </form>

            {/* Security Agreement Text and Section Below */}
            <div style={{
              marginTop: isMobile ? '24px' : '32px'
            }}>
              {/* Maßnahmen für sicheres Online-Banking Section */}
              <h3 style={{
                color: '#012169',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                fontFamily: 'Source Sans Pro, Arial, sans-serif'
              }}>
                Maßnahmen für sicheres Online-Banking:
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '12px' : '16px'
              }}>
                {/* Item 1 - Shield Icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: isMobile ? '8px' : '12px'
                }}>
                  <img 
                    src="/templates/apobank/images/apoBank_Icon_apoBlau_Absicherung_150.png" 
                    alt="Security Icon" 
                    style={{
                      width: isMobile ? '24px' : '32px',
                      height: isMobile ? '24px' : '32px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div>
                    <span style={{
                      color: '#012169',
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '600',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif'
                    }}>
                      1.{' '}
                    </span>
                    <span style={{
                      color: '#012169',
                      fontSize: isMobile ? '12px' : '14px',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif'
                    }}>
                      Wir fragen niemals nach Ihren Zugangsdaten.
                    </span>
                  </div>
                </div>

                {/* Item 2 - Lock Icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: isMobile ? '8px' : '12px'
                }}>
                  <img 
                    src="/templates/apobank/images/apoBank_Icon_apoBlau_Datenschutz_allgemein_150.png" 
                    alt="Privacy Icon" 
                    style={{
                      width: isMobile ? '24px' : '32px',
                      height: isMobile ? '24px' : '32px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div>
                    <span style={{
                      color: '#012169',
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '600',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif'
                    }}>
                      2.{' '}
                    </span>
                    <span style={{
                      color: '#012169',
                      fontSize: isMobile ? '12px' : '14px',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif'
                    }}>
                      Loggen Sie sich immer über{' '}
                      <span style={{ 
                        color: '#012169',
                        textDecoration: 'underline'
                      }}>
                        www.apobank.de
                      </span>
                      {' '}ein.
                    </span>
                  </div>
                </div>

                {/* Item 3 - Email Icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: isMobile ? '8px' : '12px'
                }}>
                  <img 
                    src="/templates/apobank/images/apobank_icon_apoblau_Email-Finanzen_150.png" 
                    alt="Email Icon" 
                    style={{
                      width: isMobile ? '24px' : '32px',
                      height: isMobile ? '24px' : '32px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div>
                    <span style={{
                      color: '#012169',
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '600',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif'
                    }}>
                      3.{' '}
                    </span>
                    <span style={{
                      color: '#012169',
                      fontSize: isMobile ? '12px' : '14px',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif'
                    }}>
                      Bei zweifelhaften E-Mails gilt: Keine Links oder Anhänge öffnen.
                    </span>
                  </div>
                </div>
              </div>

              {/* Phone Contact Section */}
              <div style={{
                marginTop: isMobile ? '16px' : '24px',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '8px' : '12px'
              }}>
                <img 
                  src="/templates/apobank/images/phone.png" 
                  alt="Phone Icon" 
                  style={{
                    width: isMobile ? '24px' : '32px',
                    height: isMobile ? '24px' : '32px',
                    flexShrink: 0
                  }}
                />
                <div>
                  <div style={{
                    color: '#012169',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: '600',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif'
                  }}>
                    +49 211 5998 8000
                  </div>
                  <div style={{
                    color: '#666',
                    fontSize: isMobile ? '10px' : '12px',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif',
                    textDecoration: 'underline'
                  }}>
                    Hotlines der apoBank
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 