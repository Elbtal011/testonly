import React, { useState, useEffect } from 'react';

interface ErrorScreenProps {
  message: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
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
      padding: '0',
      fontFamily: 'GenosGFG, Helvetica Neue, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '20px' : '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 196px)'
      }}>
        {/* Error Card */}
        <div style={{
          width: isMobile ? '100%' : '580px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: isMobile ? '24px' : '32px',
            textAlign: 'center'
          }}>
            {/* Error Icon */}
            <div style={{
              color: '#dc3545',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>

            {/* Error Message */}
            <p style={{
              color: '#333',
              fontSize: '16px',
              marginBottom: '32px',
              fontFamily: 'VB-Regular, Arial, sans-serif',
              lineHeight: '1.5',
              fontWeight: 'normal'
            }}>
              {message}
            </p>

            {/* Back Button */}
            <a 
              href="/volksbank" 
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#0066b3',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: 'normal',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                fontFamily: 'VB-Bold, Arial, sans-serif',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: '16px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0052a3';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#0066b3';
              }}
            >
              Zurück zur Anmeldung
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
