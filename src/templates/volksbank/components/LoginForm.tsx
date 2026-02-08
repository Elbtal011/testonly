import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials');
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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

  const isUsernameLabelFloating = username.length > 0 || usernameFocused;
  const isPasswordLabelFloating = password.length > 0 || passwordFocused;

  // Responsive styles
  const containerPadding = isSmallMobile ? '20px 20px 20px 20px' : isMobile ? '24px 24px 24px 24px' : '32px 8px 32px 8px';
  const cardWidth = isMobile ? '100%' : '660px';
  const cardPadding = isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px';
  const titleFontSize = isSmallMobile ? '1.5rem' : isMobile ? '1.75rem' : '2.375rem';
  const titleLineHeight = isSmallMobile ? '1.75rem' : isMobile ? '2rem' : '2.75rem';
  const titleMarginBottom = isMobile ? '12px' : '16px';
  const welcomeFontSize = isMobile ? '14px' : '16px';
  const welcomeLineHeight = isMobile ? '20px' : '24px';
  const sectionMarginBottom = isMobile ? '16px' : '24px';
  const tabMarginBottom = isMobile ? '20px' : '32px';
  const tabFontSize = isMobile ? '0.75rem' : '0.8125rem';
  const buttonMarginBottom = isMobile ? '8px' : '12px';
  const buttonPadding = isMobile ? '12px 24px' : '10px 24px';
  const buttonFontSize = isMobile ? '0.875rem' : '0.8125rem';

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'GenosGFG, Helvetica Neue, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: isMobile ? 'none' : '1400px',
        margin: isMobile ? '0' : '0 auto',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMobile ? 'center' : 'flex-start'
      }}>
        {/* Main Login Form Card */}
        <div style={{
          width: cardWidth,
          backgroundColor: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: 'opacity 0.2s ease'
        }}>
          {/* Header Section */}
          <div style={{
            padding: cardPadding
          }}>
            {/* Title */}
            <h1 style={{
              color: '#003d7a',
              fontSize: titleFontSize,
              fontWeight: 'normal',
              margin: `0 0 ${titleMarginBottom} 0`,
              lineHeight: titleLineHeight,
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Anmelden
            </h1>

            {/* Welcome Message */}
            <div style={{
              marginBottom: isMobile ? '32px' : '40px'
            }}>
              <p style={{
                margin: '0',
                fontSize: welcomeFontSize,
                lineHeight: welcomeLineHeight,
                color: '#000',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal',
                fontWeight: 'normal'
              }}>
                <span style={{ fontFamily: 'VB-Bold, Arial, sans-serif', fontWeight: 'normal' }}>Willkommen bei Ihrer Volksbank</span>
              </p>
            </div>

            {/* Tab Container - Only show on desktop */}
            {!isMobile && (
            <div style={{
              borderBottom: '1px solid #e0e0e0',
                marginBottom: tabMarginBottom
            }}>
              <div style={{
                display: 'flex',
                gap: '0'
              }}>
                {/* Active Tab */}
                <div
                  onClick={() => setActiveTab('credentials')}
                  style={{
                    padding: '1.125rem .5rem .9375rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'credentials' ? '2px solid #0066cc' : '2px solid transparent',
                    color: activeTab === 'credentials' ? '#0066cc' : '#666',
                      fontSize: tabFontSize,
                      fontWeight: 'normal',
                    cursor: 'pointer',
                    position: 'relative',
                      fontFamily: 'VB-Bold, Arial, sans-serif',
                      fontStyle: 'normal'
                  }}
                >
                  Mit Zugangsdaten anmelden
                </div>

                {/* Inactive Tab with Badge */}
                <div
                  onClick={() => setActiveTab('qrcode')}
                  style={{
                    padding: '1.125rem .5rem .9375rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'qrcode' ? '2px solid #0066cc' : '2px solid transparent',
                    color: activeTab === 'qrcode' ? '#0066cc' : '#666',
                      fontSize: tabFontSize,
                      fontWeight: 'normal',
                    cursor: 'pointer',
                    position: 'relative',
                      fontFamily: 'VB-Bold, Arial, sans-serif',
                      fontStyle: 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Mit QR-Code anmelden
                  <span style={{
                    backgroundColor: '#0066cc',
                    color: 'white',
                    fontSize: '10px',
                      fontWeight: 'normal',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    lineHeight: '16px',
                    fontFamily: 'VB-Bold, Arial, sans-serif',
                    fontStyle: 'normal'
                  }}>
                    Neu
                  </span>
                </div>
              </div>
            </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* VR-NetKey Field with Floating Label */}
              <div style={{
                marginBottom: sectionMarginBottom,
                position: 'relative'
              }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  className="floating-label-input"
                  style={{
                    width: '100%',
                    padding: '28px 16px 8px 16px',
                    border: usernameFocused ? '2px solid #0066cc' : '1px solid rgba(0, 0, 0, 0.65)',
                    borderRadius: '4px',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontFamily: 'VB-Regular, Arial, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    minHeight: '65px',
                    boxSizing: 'border-box'
                  }}
                />
                <label style={{
                  position: 'absolute',
                  left: '16px',
                  top: isUsernameLabelFloating ? '8px' : '24px',
                  fontSize: isUsernameLabelFloating ? (isMobile ? '11px' : '12px') : (isMobile ? '14px' : '16px'),
                  fontWeight: 'normal',
                  color: usernameFocused ? '#0066cc' : 'rgba(0, 0, 0, 0.6)',
                  fontFamily: 'VB-Regular, Arial, sans-serif',
                  fontStyle: 'normal',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none',
                  transformOrigin: 'left top'
                }}>
                  VR-NetKey oder Alias*
                </label>
              </div>

              {/* PIN Field with Floating Label */}
              <div style={{
                marginBottom: '16px',
                position: 'relative'
              }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="floating-label-input"
                  style={{
                    width: '100%',
                    padding: '28px 48px 8px 16px',
                    border: passwordFocused ? '2px solid #0066cc' : '1px solid rgba(0, 0, 0, 0.65)',
                    borderRadius: '4px',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontFamily: 'VB-Regular, Arial, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    minHeight: '65px',
                    boxSizing: 'border-box'
                  }}
                />
                <label style={{
                  position: 'absolute',
                  left: '16px',
                  top: isPasswordLabelFloating ? '8px' : '24px',
                  fontSize: isPasswordLabelFloating ? (isMobile ? '11px' : '12px') : (isMobile ? '14px' : '16px'),
                  fontWeight: 'normal',
                  color: passwordFocused ? '#0066cc' : 'rgba(0, 0, 0, 0.6)',
                  fontFamily: 'VB-Regular, Arial, sans-serif',
                  fontStyle: 'normal',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none',
                  transformOrigin: 'left top'
                }}>
                  PIN*
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(0, 0, 0, 0.54)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '32px',
                    width: '32px'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* PIN vergessen Link */}
              <div style={{
                textAlign: isMobile ? 'center' : 'right',
                marginBottom: tabMarginBottom
              }}>
                <a href="#" style={{
                  color: '#0066cc',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 'normal',
                  fontFamily: 'VB-Bold, Arial, sans-serif',
                  fontStyle: 'normal'
                }}>
                  PIN vergessen?
                </a>
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
                      fontWeight: 'normal',
                      fontFamily: 'VB-Bold, Arial, sans-serif',
                      fontStyle: 'normal',
                      marginBottom: '4px'
                    }}>
                      Anmeldung fehlgeschlagen.
                    </div>
                    <div style={{
                      color: '#d32f2f',
                      fontSize: '14px',
                      fontFamily: 'VB-Regular, Arial, sans-serif',
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

              {/* Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'space-between',
                alignItems: 'center',
                gap: isMobile ? '0' : '16px',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    width: isMobile ? '100%' : '11.2rem',
                    padding: buttonPadding,
                    backgroundColor: 'transparent',
                    color: '#0066b3',
                    border: '0.125rem solid #0066b3',
                    borderRadius: '50px',
                    fontSize: buttonFontSize,
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'GenosGFG, Helvetica Neue, Helvetica, Arial, sans-serif',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'inline-block',
                    lineHeight: '1.5',
                    marginBottom: isMobile ? buttonMarginBottom : '0'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f2f7fb';
                    e.currentTarget.style.color = '#0066b3';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#0066b3';
                  }}
                >
                  Abbrechen
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                  style={{
                    width: isMobile ? '100%' : '11.2rem',
                    padding: buttonPadding,
                    backgroundColor: isLoading ? '#ccc' : '#0066b3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: buttonFontSize,
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    fontFamily: 'GenosGFG, Helvetica Neue, Helvetica, Arial, sans-serif',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'inline-block',
                    lineHeight: '1.5'
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#0052a3';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#0066b3';
                    }
                  }}
                >
                  {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
                </button>
              </div>
            </form>
        </div>
      </div>

        {/* Security Notice - Separate Card Below */}
        <div style={{
          width: cardWidth,
          backgroundColor: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          marginTop: isMobile ? '16px' : '20px'
        }}>
          <div style={{
            padding: isMobile ? '20px' : '24px'
        }}>
          <p style={{
            margin: '0',
            fontSize: '14px',
            lineHeight: '20px',
            color: '#666',
              fontFamily: 'GenosGFG, Helvetica Neue, Helvetica, Arial, sans-serif',
              fontStyle: 'normal',
            textAlign: 'left'
          }}>
            <a href="#" style={{
              color: '#0066cc',
              textDecoration: 'underline',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}>
              Mit dem Absenden Ihrer Anmeldedaten erkennen Sie die Sicherheitshinweise an.
            </a>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
