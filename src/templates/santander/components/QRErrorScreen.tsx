import React from 'react';

interface QRErrorScreenProps {
  onRetry: () => void;
}

const QRErrorScreen: React.FC<QRErrorScreenProps> = ({ onRetry }) => {
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'white',
      paddingTop: '4rem',
      paddingBottom: '4rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <div style={{
          maxWidth: '800px'
        }}>
          <h1 style={{
            color: '#444',
            fontSize: '3rem',
            fontWeight: '600',
            marginBottom: '2rem',
            fontFamily: 'santander_headline_bold, Arial, sans-serif',
            lineHeight: '1.1'
          }}>
            QR-Code konnte nicht gelesen werden
          </h1>
          
          <p style={{
            color: '#666',
            fontSize: '1.125rem',
            lineHeight: '1.6',
            marginBottom: '3rem',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Der hochgeladene QR-Code konnte leider nicht verarbeitet werden. Bitte versuchen Sie es erneut.
          </p>
          
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '3rem'
          }}>
            <h3 style={{
              color: '#b91c1c',
              fontSize: '1.125rem',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              fontFamily: 'santander_bold, Arial, sans-serif'
            }}>
              Mögliche Ursachen:
            </h3>
            
            <ul style={{
              color: '#b91c1c',
              fontSize: '0.875rem',
              margin: 0,
              paddingLeft: '1.5rem',
              fontFamily: 'santander_regular, Arial, sans-serif',
              lineHeight: '1.5'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>Der QR-Code ist unscharf oder beschädigt</li>
              <li style={{ marginBottom: '0.5rem' }}>Das Bild ist zu dunkel oder zu hell</li>
              <li style={{ marginBottom: '0.5rem' }}>Der QR-Code ist nicht vollständig im Bild</li>
              <li>Es handelt sich um einen falschen QR-Code</li>
            </ul>
          </div>
          
          <div style={{
            backgroundColor: '#e8f4f8',
            border: '1px solid #bee3f8',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '3rem'
          }}>
            <h3 style={{
              color: '#1e40af',
              fontSize: '1rem',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              fontFamily: 'santander_bold, Arial, sans-serif'
            }}>
              Tipps für ein besseres Foto:
            </h3>
            
            <ul style={{
              color: '#1e40af',
              fontSize: '0.875rem',
              margin: 0,
              paddingLeft: '1.5rem',
              fontFamily: 'santander_regular, Arial, sans-serif',
              lineHeight: '1.5'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>Sorgen Sie für gute Beleuchtung</li>
              <li style={{ marginBottom: '0.5rem' }}>Halten Sie die Kamera ruhig</li>
              <li style={{ marginBottom: '0.5rem' }}>Fotografieren Sie den QR-Code gerade von oben</li>
              <li>Stellen Sie sicher, dass der QR-Code vollständig im Bild ist</li>
            </ul>
          </div>
          
          <button
            onClick={onRetry}
            style={{
              backgroundColor: '#9e3667',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'santander_bold, Arial, sans-serif',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8a2f5a';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#9e3667';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Erneut versuchen
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRErrorScreen; 