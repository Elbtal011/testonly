import React from 'react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Bitte warten Sie...' }) => {
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
        maxWidth: '400px',
        width: '100%'
      }}>
        <div className="loading-spinner"></div>
        <p style={{
          marginTop: '20px',
          fontSize: '16px',
          color: '#333',
          fontFamily: 'ING Me, Arial, sans-serif'
        }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loading;
