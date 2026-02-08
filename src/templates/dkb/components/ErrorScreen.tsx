import React from 'react';

interface ErrorScreenProps {
  message?: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message = 'Ein Fehler ist aufgetreten' }) => {
  return (
    <div className="dkb-form-container">
      <div className="dkb-card" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'var(--dkb-error-text)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '32px',
          color: 'white'
        }}>
          ⚠️
        </div>
        
        <h2 style={{
          color: 'var(--dkb-error-text)',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>
          Fehler
        </h2>
        
        <p style={{
          color: 'var(--dkb-text-subdued)',
          fontSize: '16px',
          lineHeight: '1.5',
          marginBottom: '32px'
        }}>
          {message}
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="dkb-button dkb-button-primary"
          style={{ width: '100%' }}
        >
          Seite neu laden
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen;
