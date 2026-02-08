import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: 'white',
      padding: '40px 0',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <img 
          src="/templates/apobank/images/apobank-logo.svg" 
          alt="apoBank - Bank der Gesundheit" 
          style={{ 
            height: '40px',
            width: 'auto',
            maxWidth: '200px'
          }}
        />
      </div>
    </footer>
  );
}; 