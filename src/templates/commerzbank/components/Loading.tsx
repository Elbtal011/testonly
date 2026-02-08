import React, { useState, useEffect } from 'react';

interface LoadingProps {
  message?: string;
  type?: 'default' | 'login' | 'verification' | 'processing' | 'upload' | 'transition';
  showProgress?: boolean;
  duration?: number; // in seconds
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Bitte warten Sie...', 
  type = 'default',
  showProgress = false,
  duration = 0
}) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Animate progress bar if duration is provided
  useEffect(() => {
    if (showProgress && duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (duration * 10); // Update every 100ms
          return Math.min(prev + increment, 100);
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [showProgress, duration]);

  // Animate dots for loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getLoadingIcon = () => {
    switch (type) {
      case 'login':
        return (
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #002e3c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
        );
      case 'verification':
        return (
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #FFD700',
            borderRight: '3px solid #FFD700',
            borderRadius: '50%',
            animation: 'spin 1.2s linear infinite',
            margin: '0 auto 20px'
          }} />
        );
      case 'processing':
        return (
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #002e3c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
        );
      case 'upload':
        return (
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #28a745',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px'
          }} />
        );
      case 'transition':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #002e3c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px'
          }} />
        );
      default:
        return (
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #002e3c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
        );
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box'
  };

  const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 46, 60, 0.15)',
    border: '1px solid #e5e7eb',
    maxWidth: '400px',
    width: '90%'
  };

  const messageStyle: React.CSSProperties = {
    color: '#002e3c',
    fontWeight: '500',
    fontSize: type === 'transition' ? '14px' : '16px',
    fontFamily: 'Gotham, Arial, sans-serif',
    marginBottom: showProgress ? '20px' : '0'
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .loading-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
            z-index: 9999 !important;
          }
        `}
      </style>
      <div className="loading-overlay" style={containerStyle}>
        <div style={contentStyle}>
          {getLoadingIcon()}
          <p style={messageStyle}>
            {message}{dots}
          </p>
          {showProgress && duration > 0 && (
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#002e3c',
                borderRadius: '2px',
                transition: 'width 0.1s ease'
              }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Loading; 