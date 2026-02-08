import React from 'react';

interface QRErrorScreenProps {
  onRetry?: () => void;
}

const QRErrorScreen: React.FC<QRErrorScreenProps> = ({ onRetry }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '90%',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          color: '#dc3545',
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 24px 0',
          fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
        }}>
          QR-Code Fehler
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '24px',
          marginBottom: '32px'
        }}>
          Der QR-Code konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              backgroundColor: '#0018a8',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
            }}
          >
            Erneut versuchen
          </button>
        )}
      </div>
    </div>
  );
};

export default QRErrorScreen;