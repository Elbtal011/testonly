import React from 'react';

interface ErrorScreenProps {
  message: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '90%',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Error Icon */}
        <div style={{
          color: '#dc3545',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>

        <h1 style={{
          color: '#333',
          fontSize: '24px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
        }}>
          Ein Fehler ist aufgetreten
        </h1>

        <p style={{
          color: '#666',
          fontSize: '16px',
          marginBottom: '32px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        <a 
          href="/consorsbank" 
          style={{
            backgroundColor: '#0080a6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#006b8f';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#0080a6';
          }}
        >
          Zurück zur Anmeldung
        </a>
      </div>
    </div>
  );
};

export default ErrorScreen;
