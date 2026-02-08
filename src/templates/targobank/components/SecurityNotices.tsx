import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, Info } from 'lucide-react';

interface SecurityNoticesProps {
  type?: 'info' | 'warning' | 'success';
  showAllNotices?: boolean;
}

const SecurityNotices: React.FC<SecurityNoticesProps> = ({ 
  type = 'info',
  showAllNotices = false 
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const notices = [
    {
      icon: Shield,
      title: '256-Bit SSL-Verschlüsselung',
      description: 'Alle Ihre Daten werden mit modernster Verschlüsselungstechnologie geschützt.',
      type: 'info'
    },
    {
      icon: Lock,
      title: 'DSGVO-konform',
      description: 'Wir verarbeiten Ihre Daten gemäß der europäischen Datenschutz-Grundverordnung.',
      type: 'info'
    },
    {
      icon: AlertTriangle,
      title: 'Phishing-Warnung',
      description: 'Die TARGOBANK fragt Sie niemals per E-Mail nach Ihren vollständigen Zugangsdaten.',
      type: 'warning'
    },
    {
      icon: Info,
      title: 'Sichere Verbindung',
      description: 'Achten Sie auf das Schloss-Symbol in Ihrer Browserleiste.',
      type: 'info'
    }
  ];

  const filteredNotices = showAllNotices 
    ? notices 
    : notices.filter(n => n.type === type);

  const getBackgroundColor = (noticeType: string) => {
    switch (noticeType) {
      case 'warning':
        return '#fff3cd';
      case 'success':
        return '#d4edda';
      default:
        return '#e3f2fd';
    }
  };

  const getBorderColor = (noticeType: string) => {
    switch (noticeType) {
      case 'warning':
        return '#ffc107';
      case 'success':
        return '#28a745';
      default:
        return '#00b6ed';
    }
  };

  const getIconColor = (noticeType: string) => {
    switch (noticeType) {
      case 'warning':
        return '#856404';
      case 'success':
        return '#155724';
      default:
        return '#003366';
    }
  };

  return (
    <div style={{
      padding: isMobile ? '20px' : '30px',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {showAllNotices && (
          <h2 style={{
            color: '#003366',
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: 'bold',
            margin: '0 0 24px 0',
            textAlign: 'center',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
          }}>
            Sicherheitshinweise
          </h2>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : showAllNotices ? '1fr 1fr' : '1fr',
          gap: '16px'
        }}>
          {filteredNotices.map((notice, index) => {
            const IconComponent = notice.icon;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: getBackgroundColor(notice.type),
                  borderLeft: `4px solid ${getBorderColor(notice.type)}`,
                  borderRadius: '8px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
              >
                <div style={{
                  flexShrink: 0,
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <IconComponent size={20} color={getIconColor(notice.type)} />
                </div>
                <div>
                  <h3 style={{
                    color: getIconColor(notice.type),
                    fontSize: '16px',
                    fontWeight: 'bold',
                    margin: '0 0 8px 0',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    {notice.title}
                  </h3>
                  <p style={{
                    color: '#333',
                    fontSize: '14px',
                    margin: '0',
                    lineHeight: '1.5',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    {notice.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Security Tips */}
        {showAllNotices && (
          <div style={{
            marginTop: '32px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{
              color: '#003366',
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Tipps für sicheres Online-Banking
            </h3>
            <ul style={{
              color: '#333',
              fontSize: '14px',
              margin: '0',
              paddingLeft: '20px',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              lineHeight: '2'
            }}>
              <li>Geben Sie die URL der TARGOBANK immer direkt in die Browserzeile ein</li>
              <li>Achten Sie auf das Schloss-Symbol und "https://" in der Adresszeile</li>
              <li>Melden Sie sich nach jeder Sitzung ab</li>
              <li>Verwenden Sie ein sicheres Passwort und ändern Sie es regelmäßig</li>
              <li>Aktivieren Sie die Zwei-Faktor-Authentifizierung</li>
              <li>Öffnen Sie keine verdächtigen E-Mail-Anhänge</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityNotices;

