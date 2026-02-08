import React from 'react';

const SuccessScreen: React.FC = () => {
  return (
    <div className="ing-card" data-component-name="SuccessScreen">
      <div className="success-container" data-component-name="SuccessScreen">
        <div className="success-icon" data-component-name="SuccessScreen">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h2 className="success-title" data-component-name="SuccessScreen">Verifizierung erfolgreich abgeschlossen</h2>
        <div className="success-confirmation" data-component-name="SuccessScreen">
          <div className="confirmation-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="confirmation-text">
            Identität bestätigt
          </div>
        </div>
        <p className="success-message" data-component-name="SuccessScreen">
          Ihre Identität wurde erfolgreich verifiziert. Alle Sicherheitsmaßnahmen wurden aktiviert
          und Ihr Konto ist jetzt vollständig geschützt.
        </p>
        <div className="success-info" data-component-name="SuccessScreen">
          <p>
            Vielen Dank für Ihre Kooperation. Falls Sie Fragen haben, kontaktieren Sie bitte
            unseren Kundenservice unter <strong>069 / 34 22 24</strong>.
          </p>
        </div>
        <div className="button-container" data-component-name="SuccessScreen">
          <a href="https://ing.de" className="button button-primary" data-component-name="SuccessScreen">
            Zurück zum Banking
          </a>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
