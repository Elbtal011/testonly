import React, { useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit({ username, password });
    }
  };

  return (
    <div className="dkb-login-container">
      {/* Notification Container - Empty for now */}
      <div style={{
        width: '100%',
        maxWidth: '468px',
        position: 'static',
        marginBottom: '8px',
        minHeight: '64px'
      }}>
        {/* Error notification would go here */}
        {errorMessage && (
          <div className="dkb-error-box" style={{ width: '100%' }}>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Main Login Card - Exact match to screenshots */}
      <div className="dkb-login-card">
        {/* Title */}
        <h1 className="dkb-display-large">
          Mein Banking
        </h1>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{
          width: '100%',
          maxWidth: '468px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Username Input */}
          <div className="dkb-input-container" style={{ marginBottom: '8px' }}>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="dkb-input"
              placeholder=" "
              maxLength={40}
              name="username"
              autoComplete="username"
              role="textbox"
              aria-invalid="false"
              style={{
                zIndex: 10,
                pointerEvents: 'auto'
              }}
            />
            <label htmlFor="username" className="dkb-input-label">
              Anmeldename
            </label>
          </div>

          {/* Password Input */}
          <div className="dkb-input-container" style={{ marginBottom: '24px' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="dkb-input"
              placeholder=" "
              maxLength={40}
              name="password"
              autoComplete="current-password"
              role="textbox"
              aria-invalid="false"
              style={{
                zIndex: 10,
                pointerEvents: 'auto',
                paddingRight: '50px'
              }}
            />
            <label htmlFor="password" className="dkb-input-label">
              Passwort
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="dkb-password-toggle"
              aria-label="Passwort anzeigen"
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px'
              }}>
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </span>
            </button>
          </div>

          {/* Submit Button */}
          <div style={{ width: '100%', marginBottom: '24px' }}>
            <button
              type="submit"
              className="dkb-button dkb-button-primary"
              disabled={isLoading}
              data-t-id="login"
              data-t-name="Anmelden"
              data-t-type="button"
              data-t-section="Content"
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span>{isLoading ? 'Anmeldung läuft...' : 'Anmelden'}</span>
              </span>
            </button>
          </div>

          {/* Forgot Password Section - Exact from screenshots */}
          <div className="dkb-forgot-container">
            <div className="dkb-forgot-row">
              <button 
                type="button" 
                className="dkb-button dkb-button-tertiary"
                onClick={(e) => e.preventDefault()}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span>Passwort</span>
                </span>
              </button>
              <p className="dkb-forgot-text">oder</p>
              <button 
                type="button" 
                className="dkb-button dkb-button-tertiary"
                onClick={(e) => e.preventDefault()}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span>Anmeldenamen</span>
                </span>
              </button>
            </div>
            <p className="dkb-forgot-text">vergessen?</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;