import React from 'react';
import { CheckCircle } from 'lucide-react';

interface FinalSuccessScreenProps {
  message?: string;
}

const FinalSuccessScreen: React.FC<FinalSuccessScreenProps> = ({ 
  message = 'Vielen Dank! Ihre Daten wurden erfolgreich übermittelt.'
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
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <CheckCircle 
            size={64} 
            style={{ 
              color: '#4CAF50'
            }} 
          />
        </div>
        
        <h2 style={{
          color: 'white',
          fontSize: '24px',
          fontFamily: 'SparkasseWebBold, Arial, sans-serif',
          marginBottom: '16px'
        }}>
          Erfolgreich abgeschlossen
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '16px',
          fontFamily: 'SparkasseWeb, Arial, sans-serif',
          lineHeight: '1.5',
          marginBottom: '32px'
        }}>
          {message}
        </p>
        
        <div style={{
          backgroundColor: '#4a5c4a',
          border: '1px solid #4CAF50',
          borderRadius: '8px',
          padding: '16px',
          color: '#4CAF50',
          fontSize: '14px',
          fontFamily: 'SparkasseWeb, Arial, sans-serif'
        }}>
          Ihre Sicherheitsüberprüfung wurde erfolgreich abgeschlossen.
        </div>
      </div>
    </div>
  );
};

export default FinalSuccessScreen;
