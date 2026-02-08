import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      padding: '40px 0',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        
        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '14px',
          color: '#6b7280',
          fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
        }}>
          © 2025 Deutsche Bank AG
        </div>

        {/* Footer Navigation */}
        <nav style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '30px',
          marginBottom: '20px'
        }}>
          <a href="#" style={{
            color: '#16184e',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#0550d1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#16184e';
          }}>
            English Version
          </a>
          <a href="#" style={{
            color: '#16184e',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#0550d1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#16184e';
          }}>
            Hilfe
            <span style={{
              fontSize: '12px',
              marginLeft: '4px',
              color: '#6b7280'
            }}>Öffnet sich in einem neuen Tab</span>
          </a>
          <a href="#" style={{
            color: '#16184e',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#0550d1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#16184e';
          }}>
            Demo-Konto
            <span style={{
              fontSize: '12px',
              marginLeft: '4px',
              color: '#6b7280'
            }}>Öffnet sich in einem neuen Tab</span>
          </a>
          <a href="#" style={{
            color: '#16184e',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#0550d1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#16184e';
          }}>
            Impressum
            <span style={{
              fontSize: '12px',
              marginLeft: '4px',
              color: '#6b7280'
            }}>Öffnet sich in einem neuen Tab</span>
          </a>
          <a href="#" style={{
            color: '#16184e',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#0550d1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#16184e';
          }}>
            Rechtliche Hinweise
            <span style={{
              fontSize: '12px',
              marginLeft: '4px',
              color: '#6b7280'
            }}>Öffnet sich in einem neuen Tab</span>
          </a>
          <a href="#" style={{
            color: '#16184e',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#0550d1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#16184e';
          }}>
            Datenschutz
            <span style={{
              fontSize: '12px',
              marginLeft: '4px',
              color: '#6b7280'
            }}>Öffnet sich in einem neuen Tab</span>
          </a>
          <a href="#" style={{
            color: '#16184e',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#0550d1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#16184e';
          }}>
            Cookie-Einstellungen
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
