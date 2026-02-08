import React from 'react';

interface ErrorScreenProps {
  message: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: '40px 20px'
    }}>
      <div className="ing-card" style={{ 
        padding: '40px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          background: '#e30613',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </div>
        
        <h2 className="heading--m" style={{ color: '#e30613' }}>
          Fehler aufgetreten
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.5',
          marginBottom: '30px',
          fontFamily: 'ING Me, Arial, sans-serif'
        }}>
          {message}
        </p>
        
        <button 
          className="button button--secondary"
          onClick={() => window.location.reload()}
          style={{ width: '100%', maxWidth: '300px' }}
        >
          Seite neu laden
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen;
