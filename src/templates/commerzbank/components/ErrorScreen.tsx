import React from 'react';

interface ErrorScreenProps {
  message: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
  return (
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '4rem 2rem',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 46, 60, 0.1)',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          color: '#EF4444',
          marginBottom: '1.5rem'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ margin: '0 auto' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <h2 style={{
          color: '#002e3c',
          fontSize: '1.75rem',
          fontWeight: '500',
          marginBottom: '1rem',
          fontFamily: 'Gotham, Arial, sans-serif'
        }}>
          Ein Fehler ist aufgetreten
        </h2>
        <p style={{
          color: '#002e3c',
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
          fontFamily: 'Gotham, Arial, sans-serif'
        }}>
          {message}
        </p>
        <a 
          href="/" 
          style={{
            backgroundColor: '#FFD700',
            color: '#002e3c',
            border: '2px solid #FFD700',
            padding: '12px 24px',
            borderRadius: '4px',
            fontFamily: 'Gotham, Arial, sans-serif',
            fontWeight: '500',
            fontSize: '1rem',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e6d400';
            e.currentTarget.style.borderColor = '#e6d400';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FFD700';
            e.currentTarget.style.borderColor = '#FFD700';
          }}
        >
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
};

export default ErrorScreen; 