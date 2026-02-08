import React from 'react';

export const Header: React.FC = () => {
  return (
    <header style={{
      backgroundColor: 'white',
      padding: '0',
      borderBottom: '1px solid #e0e0e0',
      position: 'relative',
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '20px 24px',
        height: '80px'
      }}>
        {/* Apobank Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <img 
            src="/templates/apobank/images/apobank-logo.svg" 
            alt="apoBank" 
            style={{ 
              height: '40px',
              width: 'auto',
              maxWidth: '200px'
            }}
          />
        </div>
      </div>
    </header>
  );
}; 