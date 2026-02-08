import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw } from 'lucide-react';

interface PushTANScreenProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  message?: string;
}

export const PushTANScreen: React.FC<PushTANScreenProps> = ({ 
  onConfirm,
  onCancel,
  message = 'Bitte bestätigen Sie die Anfrage in Ihrer TARGOBANK App.'
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes targoPulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(0, 182, 237, 0.4);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 0 20px rgba(0, 182, 237, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(0, 182, 237, 0);
            }
          }
        `}
      </style>
      
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
          maxWidth: '500px',
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: isMobile ? '40px 24px' : '50px 48px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Phone Icon with Animation */}
          <div style={{
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'targoPulse 2s infinite'
            }}>
              <Smartphone size={50} color="#00b6ed" />
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            color: '#003366',
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '900',
            margin: '0 0 16px 0',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            Push-TAN Bestätigung
          </h1>

          {/* Message */}
          <p style={{
            color: '#666',
            fontSize: isMobile ? '16px' : '18px',
            lineHeight: '1.6',
            margin: '0 0 24px 0',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            {message}
          </p>

          {/* Waiting indicator */}
          <div style={{
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <RefreshCw 
                size={20} 
                color="#00b6ed"
                style={{
                  animation: 'spin 2s linear infinite'
                }}
              />
              <span style={{
                color: '#003366',
                fontSize: '16px',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Warte auf Bestätigung{dots}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div style={{
            textAlign: 'left',
            marginBottom: '32px'
          }}>
            <h3 style={{
              color: '#003366',
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '0 0 12px 0',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              So bestätigen Sie:
            </h3>
            <ol style={{
              color: '#666',
              fontSize: '14px',
              margin: '0',
              paddingLeft: '20px',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              lineHeight: '1.8'
            }}>
              <li>Öffnen Sie die TARGOBANK App auf Ihrem Smartphone</li>
              <li>Prüfen Sie die Push-Benachrichtigung</li>
              <li>Bestätigen Sie die Anfrage mit Ihrem Fingerabdruck oder PIN</li>
            </ol>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {onConfirm && (
              <button
                onClick={onConfirm}
                style={{
                  backgroundColor: '#c20831',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '14px 32px',
                  fontSize: '16px',
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
                Ich habe bestätigt
              </button>
            )}
            
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '2px solid #ddd',
                  borderRadius: '50px',
                  padding: '12px 32px',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#003366';
                  e.currentTarget.style.color = '#003366';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                  e.currentTarget.style.color = '#666';
                }}
              >
                Abbrechen
              </button>
            )}
          </div>

          {/* Help Link */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #e0e0e0'
          }}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                color: '#00b6ed',
                fontSize: '14px',
                textDecoration: 'none',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}
            >
              Keine Push-Benachrichtigung erhalten?
            </a>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default PushTANScreen;

