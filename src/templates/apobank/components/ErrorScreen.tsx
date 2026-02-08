import React from 'react';

interface ErrorScreenProps {
  message: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '0',
      fontFamily: 'Source Sans Pro, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '920px',
          backgroundColor: '#f0f3f5',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          {/* White Header Section */}
          <div style={{
            backgroundColor: 'white',
            padding: '32px 32px 24px 32px'
          }}>
            <h1 style={{
              color: '#012169',
              fontSize: '2rem',
              fontWeight: '600',
              margin: '0',
              lineHeight: '2.5rem',
              fontFamily: 'Source Sans Pro, Arial, sans-serif',
              textAlign: 'left'
            }}>
              Fehler
            </h1>
          </div>

          {/* Content Section */}
          <div style={{
            backgroundColor: '#f0f3f5',
            padding: '32px'
          }}>
            <div style={{
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              color: '#721c24',
              padding: '20px',
              borderRadius: '4px',
              marginBottom: '24px',
              fontSize: '16px',
              textAlign: 'center'
            }}>
              <strong>⚠️ {message}</strong>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '20px 0'
            }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#012169',
                  color: 'white',
                  border: '2px solid #012169',
                  padding: '10px 24px',
                  borderRadius: '50px',
                  fontFamily: 'Source Sans Pro, Arial, sans-serif',
                  fontWeight: '600',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  display: 'inline-block',
                  textAlign: 'center',
                  minHeight: '48px',
                  lineHeight: '20px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                  e.currentTarget.style.borderColor = '#0056b3';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#012169';
                  e.currentTarget.style.borderColor = '#012169';
                }}
              >
                Seite neu laden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 