import React, { useEffect, useState } from 'react';
import Loading from './Loading';

const QRErrorScreen: React.FC = () => {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Show loading for 2 seconds before showing error (simulating error processing)
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showLoading) {
    return (
      <Loading 
        message="Fehler wird verarbeitet"
        type="transition"
        duration={2}
      />
    );
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '40px 20px',
      textAlign: 'center' as const
    }}>
      <div style={{
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '12px',
        padding: '50px 40px',
        marginBottom: '30px',
        animation: 'fadeIn 0.5s ease-in'
      }}>
        <div style={{
          fontSize: '64px',
          color: '#721c24',
          marginBottom: '25px',
          animation: 'shake 0.6s ease-in-out'
        }}>
          ❌
        </div>
        
        <h1 style={{
          color: '#0B1E25',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '20px',
          fontFamily: '"MarkWeb-Bold", Arial, sans-serif'
        }}>
          QR-Code konnte nicht erkannt werden
        </h1>
        
        <p style={{
          color: '#721c24',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '20px',
          fontWeight: '500',
          fontFamily: '"MarkWeb-Medium", Arial, sans-serif'
        }}>
          Der hochgeladene QR-Code konnte nicht korrekt identifiziert werden.
        </p>
        
        <p style={{
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.6',
          marginBottom: '20px',
          fontFamily: '"MarkWeb-Regular", Arial, sans-serif'
        }}>
          Bitte versuchen Sie es erneut mit einem klareren Foto oder Scan.
        </p>
        
        <p style={{
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: '"MarkWeb-Regular", Arial, sans-serif'
        }}>
          Sie werden automatisch zum Upload-Bereich weitergeleitet...
        </p>
        
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f5c6cb',
          borderTop: '4px solid #721c24',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '25px auto 0'
        }}></div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default QRErrorScreen;