import React from 'react';

const Header: React.FC = () => {
  return (
    <header style={{ 
      backgroundColor: 'white',
      borderTop: '5px solid #9e3667',
      borderBottom: '5px solid #cedee7',
      width: '100%',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(206, 222, 231, 0.5)'
    }}>
      <div style={{ 
        padding: '30px 2rem 20px 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        maxWidth: '100%',
        margin: '0',
        minHeight: '60px'
      }}>
        {/* Santander Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/templates/santander/images/santander-logo.svg"
            alt="Santander"
            style={{ 
              height: '45px', 
              width: 'auto'
            }}
          />
        </div>

        {/* Separator */}
        <div style={{
          width: '1px',
          height: '35px',
          backgroundColor: '#e0e0e0'
        }} />

        {/* MySantander Text */}
        <div style={{ 
          color: '#333',
          fontSize: '22px',
          fontWeight: '800',
          fontFamily: 'santander_bold, Arial, sans-serif',
          letterSpacing: '0.01em'
        }}>
          MySantander
        </div>
      </div>
    </header>
  );
};

export default Header; 