import React from 'react';

interface LoadingProps {
  message?: string;
  type?: 'default' | 'login' | 'processing';
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Bitte warten Sie...', 
  type = 'default' 
}) => {
  return (
    <div className="dkb-loading-container">
      <div className="dkb-card" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <div className="dkb-spinner-container" style={{ marginBottom: '24px' }}>
          <div className="dkb-spinner"></div>
        </div>
        
        <h3 style={{
          color: 'var(--dkb-text-primary)',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          {type === 'login' && 'Anmeldung läuft...'}
          {type === 'processing' && 'Verarbeitung läuft...'}
          {type === 'default' && 'Laden...'}
        </h3>
        
        <p style={{
          color: 'var(--dkb-text-subdued)',
          fontSize: '14px',
          margin: 0
        }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loading;
