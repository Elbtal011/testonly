import React, { useState } from 'react';
import '../ConsorsbankStyle.css';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit({ username, password });
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '40px 20px 60px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Main content container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: window.innerWidth > 768 ? 'row' : 'column',
        gap: window.innerWidth > 768 ? '60px' : '30px',
        alignItems: 'flex-start'
      }}>
        {/* Left Column - Login Form */}
        <div style={{
          flex: window.innerWidth > 768 ? '0 0 400px' : '1',
          backgroundColor: 'white',
          padding: '0',
          borderRadius: '0',
          boxShadow: 'none',
          width: window.innerWidth > 768 ? 'auto' : '100%',
          maxWidth: window.innerWidth > 768 ? 'none' : '400px'
        }}>
          {/* Form Title */}
          <h2 style={{
            color: '#333333',
            fontSize: '20px',
            fontWeight: 'normal',
            margin: '0 0 30px 0',
            fontFamily: 'Arial, sans-serif'
          }}>
            Loggen Sie sich ein:
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div style={{
              marginBottom: '20px'
            }}>
              <label style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 'normal',
                marginBottom: '8px',
                fontFamily: 'Arial, sans-serif',
                minWidth: '200px',
                whiteSpace: 'nowrap'
              }}>
                Kontonummer / UserID:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  backgroundColor: 'white',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0080a6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cccccc';
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{
              marginBottom: '15px'
            }}>
              <label style={{
                display: 'block',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 'normal',
                marginBottom: '8px',
                fontFamily: 'Arial, sans-serif',
                minWidth: '200px',
                whiteSpace: 'nowrap'
              }}>
                Online-PIN / Passwort:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  backgroundColor: 'white',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0080a6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cccccc';
                }}
              />
            </div>

            {/* Links Row */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '25px',
              fontSize: '12px'
            }}>
              <a href="#" style={{
                color: '#0080a6',
                textDecoration: 'underline',
                fontFamily: 'Arial, sans-serif'
              }}>
                Online-PIN vergessen
              </a>
              <a href="#" style={{
                color: '#0080a6',
                textDecoration: 'underline',
                fontFamily: 'Arial, sans-serif'
              }}>
                Fragen zum TAN-Verfahren?
              </a>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                backgroundColor: '#ffebee',
                border: '1px solid #ffcdd2',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '20px',
                color: '#d32f2f',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif'
              }}>
                {errorMessage}
              </div>
            )}

            {/* Login Button */}
            <div style={{
              marginBottom: '30px'
            }}>
              <button
                type="submit"
                disabled={isLoading}
                className="button button-primary"
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '12px 24px',
                  minHeight: '40px',
                  lineHeight: '1',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? 'Anmeldung läuft...' : 'Einloggen'}
                {!isLoading && (
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    ›
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Additional Links */}
          <div style={{
            borderTop: '1px solid #e5e5e5',
            paddingTop: '20px',
            fontSize: '12px',
            color: '#666666',
            fontFamily: 'Arial, sans-serif'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <a href="#" style={{
                color: '#0080a6',
                textDecoration: 'underline'
              }}>
                Noch kein Kunde? Jetzt Konto eröffnen
              </a>
            </div>
            <div>
              <a href="#" style={{
                color: '#0080a6',
                textDecoration: 'underline'
              }}>
                Probleme beim Login?
              </a>
            </div>
          </div>
        </div>

        {/* Right Column - Information/Content */}
        <div style={{
          flex: '1',
          paddingLeft: window.innerWidth > 768 ? '20px' : '0',
          marginTop: window.innerWidth > 768 ? '0' : '20px'
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5'
          }}>
            <h3 style={{
              color: '#333333',
              fontSize: '18px',
              fontWeight: 'normal',
              margin: '0 0 20px 0',
              fontFamily: 'Arial, sans-serif'
            }}>
              Sicher anmelden
            </h3>
            <p style={{
              color: '#666666',
              fontSize: '14px',
              lineHeight: '1.5',
              margin: '0 0 15px 0',
              fontFamily: 'Arial, sans-serif'
            }}>
              Ihre Sicherheit ist uns wichtig. Melden Sie sich mit Ihrer Kontonummer oder UserID und Ihrer Online-PIN an.
            </p>
            <p style={{
              color: '#666666',
              fontSize: '14px',
              lineHeight: '1.5',
              margin: '0',
              fontFamily: 'Arial, sans-serif'
            }}>
              Bei Fragen zur Anmeldung oder zu TAN-Verfahren stehen wir Ihnen gerne zur Verfügung.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;