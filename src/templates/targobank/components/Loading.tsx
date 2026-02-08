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
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getSpinnerColors = () => {
    switch (type) {
      case 'login':
        return { border: '#e0e0e0', accent: '#00b6ed' };
      case 'verification':
        return { border: '#e0e0e0', accent: '#c20831' };
      case 'processing':
        return { border: '#e0e0e0', accent: '#003366' };
      case 'upload':
        return { border: '#e0e0e0', accent: '#28a745' };
      case 'transition':
        return { border: '#e0e0e0', accent: '#00b6ed' };
      default:
        return { border: '#e0e0e0', accent: '#003366' };
    }
  };

  const colors = getSpinnerColors();
  const size = type === 'transition' 
    ? { width: '32px', height: '32px', borderWidth: '2px' } 
    : { width: '48px', height: '48px', borderWidth: '3px' };

  return (
    <>
      <style>
        {`
          @keyframes targoSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '30px 24px' : '40px 48px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 51, 102, 0.15)',
          border: '1px solid #e0e0e0',
          maxWidth: isMobile ? '320px' : '400px',
          width: '90%'
        }}>
          <div style={{
            width: size.width,
            height: size.height,
            border: `${size.borderWidth} solid ${colors.border}`,
            borderTop: `${size.borderWidth} solid ${colors.accent}`,
            borderRadius: '50%',
            animation: 'targoSpin 1s linear infinite',
            margin: type === 'transition' ? '0 auto 15px' : '0 auto 20px'
          }} />
          <p style={{
            color: '#333',
            fontWeight: '500',
            fontSize: type === 'transition' ? (isMobile ? '14px' : '16px') : (isMobile ? '16px' : '18px'),
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
            marginBottom: showProgress ? '20px' : '0',
            lineHeight: '1.5'
          }}>
            {message}{dots}
          </p>
          {showProgress && duration > 0 && (
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#e0e0e0',
              borderRadius: '3px',
              overflow: 'hidden',
              marginTop: '20px'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#00b6ed',
                borderRadius: '3px',
                transition: 'width 0.1s ease',
                background: 'linear-gradient(90deg, #00b6ed 0%, #0099cc 100%)'
              }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Loading;

