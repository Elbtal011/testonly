import React from 'react';

const WaitingConfirmationScreen: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: '40px 20px'
    }}>
      <div className="ing-card" style={{ 
        padding: '40px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div className="loading-spinner" style={{ margin: '0 auto 24px' }}></div>
        
        <h2 className="heading--m">Warten auf Bestätigung</h2>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.5',
          marginBottom: '20px',
          fontFamily: 'ING Me, Arial, sans-serif'
        }}>
          Wir warten auf Ihre Bestätigung in der ING Banking App.
        </p>
        
        <div className="alert alert--info">
          <p style={{ margin: 0 }}>
            Bitte prüfen Sie Ihr Smartphone und bestätigen Sie die Anfrage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingConfirmationScreen;
