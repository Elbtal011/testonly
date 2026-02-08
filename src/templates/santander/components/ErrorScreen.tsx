import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  message = 'Ein Fehler ist aufgetreten', 
  onRetry 
}) => {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: '#f9fcfd'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem 2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <AlertTriangle size={48} color="#dc2626" />
        </div>
        
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#444',
          margin: '0 0 1rem 0',
          fontFamily: 'santander_headline_bold, Arial, sans-serif'
        }}>
          Fehler
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: '#6f7779',
          margin: '0 0 2rem 0',
          lineHeight: '1.5',
          fontFamily: 'santander_regular, Arial, sans-serif'
        }}>
          {message}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '12px 24px',
              backgroundColor: '#9e3667',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'santander_bold, Arial, sans-serif',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#732645';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#9e3667';
            }}
          >
            Erneut versuchen
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen; 