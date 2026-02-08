import React, { useState, useEffect } from 'react';

interface LoadingProps {
  message?: string;
  type?: 'default' | 'login' | 'verification' | 'processing' | 'upload' | 'transition';
  showProgress?: boolean;
  duration?: number;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Bitte warten Sie...', 
  type = 'default',
  showProgress = false,
  duration = 0
}) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (showProgress && duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (duration * 10);
          return Math.min(prev + increment, 100);
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [showProgress, duration]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/templates/deutsche_bank/images/dbbg-F3E4CS63.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '3px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        
        {/* Deutsche Bank Logo */}
        <div style={{
          marginBottom: '30px'
        }}>
          <img 
            src="/templates/deutsche_bank/images/DB-Logotype-ri-sRGB-DXJQ2K2F.svg" 
            alt="Deutsche Bank" 
            style={{ 
              height: '32px',
              width: 'auto'
            }}
          />
        </div>

        {/* Loading Spinner */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e0e0e0',
            borderTop: '3px solid #0550d1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>

        {/* Loading Message */}
        <p style={{
          fontSize: '16px',
          color: '#000000',
          margin: '0 0 16px 0',
          fontWeight: '500'
        }}>
          {message}{dots}
        </p>

        {/* Progress Bar */}
        {showProgress && (
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e0e0e0',
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '16px'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#0550d1',
              borderRadius: '2px',
              transition: 'width 0.1s ease'
            }} />
          </div>
        )}

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @media (max-width: 768px) {
              .db-loading-main {
                background-image: none !important;
                background-color: #1e2a78 !important;
              }
              .db-loading-card {
                padding: 30px 20px !important;
                margin: 20px !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Loading;