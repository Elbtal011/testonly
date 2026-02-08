import React from 'react';

const TransactionCancellingScreen: React.FC = () => {
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
        
        <h2 className="heading--m">Transaktion wird storniert</h2>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.5',
          marginBottom: '20px',
          fontFamily: 'ING Me, Arial, sans-serif'
        }}>
          Ihre Transaktion wird gerade storniert. Bitte warten Sie einen Moment.
        </p>
        
        <div className="alert alert--info">
          <p style={{ margin: 0 }}>
            Dieser Vorgang kann bis zu 30 Sekunden dauern.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionCancellingScreen;
