import React from 'react';

interface ErrorScreenProps {
  message: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
  return (
    <div className="content-area">
      <div className="form-container">
        <div className="error-box">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <span 
              className="icon-font-warning"
              style={{
                fontSize: '24px',
                color: '#EF4444'
              }}
            ></span>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '500',
              margin: '0',
              color: '#C53030',
              fontFamily: 'MarkWeb, Arial, sans-serif'
            }}>
              Ein Fehler ist aufgetreten
            </h2>
          </div>
          
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.5',
            margin: '0 0 24px 0',
            color: '#C53030',
            fontFamily: 'MarkWeb, Arial, sans-serif'
          }}>
            {message}
          </p>
          
          <button 
            className="comdirect-button"
            onClick={() => window.location.reload()}
          >
            Seite neu laden
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
