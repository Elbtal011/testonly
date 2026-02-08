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
            border: '3px solid #e0e0e0',
            borderTop: '3px solid #ff0018',
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
            border: '3px solid #e0e0e0',
            borderTop: '3px solid #005ca9',
            borderRight: '3px solid #005ca9',
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
            border: '3px solid #e0e0e0',
            borderTop: '3px solid #ff0018',
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
            border: '3px solid #e0e0e0',
            borderTop: '3px solid #4CAF50',
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
            border: '2px solid #e0e0e0',
            borderTop: '2px solid #ff0018',
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
            border: '3px solid #e0e0e0',
            borderTop: '3px solid #ff0018',
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
    backgroundColor: 'rgba(44, 44, 44, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)'
  };

  const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#3c3c3c',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid #555',
    maxWidth: '400px',
    width: '90%',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const messageStyle: React.CSSProperties = {
    color: 'white',
    fontWeight: 'normal',
    fontSize: type === 'transition' ? '14px' : '16px',
    fontFamily: 'SparkasseWeb, Arial, sans-serif',
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
        `}
      </style>
      <div style={containerStyle}>
        <div style={contentStyle}>
          {getLoadingIcon()}
          <p style={messageStyle}>
            {message}{dots}
          </p>
          {showProgress && duration > 0 && (
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#666',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#ff0018',
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
