import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  message = 'Ein Fehler ist aufgetreten',
  onRetry,
  showRetryButton = true
}) => {
  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'SparkasseWebMedium, Helvetica, Arial, sans-serif',
      minHeight: 'calc(100vh - 116px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '90%',
        backgroundColor: '#3c3c3c',
        borderRadius: '12px',
        border: '1px solid #555',
        padding: '40px',
        textAlign: 'center'
      }}>
        <AlertTriangle 
          size={64} 
          style={{ 
            color: '#ff6b6b',
            marginBottom: '24px'
          }} 
        />
        
        <h2 style={{
          color: 'white',
          fontSize: '24px',
          fontFamily: 'SparkasseWebBold, Arial, sans-serif',
          marginBottom: '16px'
        }}>
          Fehler
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '16px',
          fontFamily: 'SparkasseWeb, Arial, sans-serif',
          lineHeight: '1.5',
          marginBottom: showRetryButton ? '32px' : '0'
        }}>
          {message}
        </p>
        
        {showRetryButton && onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '12px 32px',
              backgroundColor: '#ff0018',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              fontFamily: 'SparkasseWebBold, Arial, sans-serif'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d50017'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff0018'}
          >
            Erneut versuchen
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen;
