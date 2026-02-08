import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorScreenProps {
  message: string;
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry }) => {
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
        padding: isMobile ? '30px 24px' : '40px 48px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Error Icon */}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#ffebee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={40} color="#d32f2f" />
          </div>
        </div>

        {/* Error Title */}
        <h2 style={{
          color: '#003366',
          fontSize: isMobile ? '24px' : '28px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
          fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
        }}>
          Ein Fehler ist aufgetreten
        </h2>

        {/* Error Message */}
        <p style={{
          color: '#666',
          fontSize: isMobile ? '16px' : '18px',
          lineHeight: '1.6',
          margin: '0 0 32px 0',
          fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
        }}>
          {message}
        </p>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              backgroundColor: '#c20831',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              padding: isMobile ? '14px 32px' : '16px 40px',
              fontSize: isMobile ? '16px' : '18px',
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
            Erneut versuchen
          </button>
        )}

        {/* Contact Info */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p style={{
            color: '#666',
            fontSize: '14px',
            margin: '0',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            Bei weiteren Problemen kontaktieren Sie uns unter:<br />
            <a href="tel:0211-900-20-111" style={{ color: '#003366', textDecoration: 'none' }}>
              0211 - 900 20 111
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;

