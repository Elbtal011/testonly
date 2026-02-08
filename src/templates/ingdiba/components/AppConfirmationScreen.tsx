import React from 'react';

interface AppConfirmationScreenProps {
  onContinue: () => void;
}

const AppConfirmationScreen: React.FC<AppConfirmationScreenProps> = ({ onContinue }) => {
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
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          background: '#ff6200',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        
        <h2 className="heading--m">App-Bestätigung erforderlich</h2>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.5',
          marginBottom: '30px',
          fontFamily: 'ING Me, Arial, sans-serif'
        }}>
          Bitte bestätigen Sie die Stornierung in Ihrer ING Banking App.
          Sie erhalten eine Push-Benachrichtigung auf Ihrem Smartphone.
        </p>
        
        <div className="alert alert--info" style={{ marginBottom: '30px' }}>
          <p style={{ margin: 0 }}>
            <strong>Wichtig:</strong> Bestätigen Sie nur, wenn Sie diese Stornierung wirklich durchführen möchten.
          </p>
        </div>
        
        <button 
          className="button button--primary"
          onClick={onContinue}
          style={{ width: '100%', maxWidth: '300px' }}
        >
          Bestätigung abgeschlossen
        </button>
      </div>
    </div>
  );
};

export default AppConfirmationScreen;
