import React, { useState } from 'react';
import Loading from './Loading';

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
  // Individual state variables like LoginForm
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [plz, setPlz] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PersonalData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalData> = {};
    
    if (!firstName.trim()) {
      newErrors.first_name = 'Bitte geben Sie Ihren Vornamen ein.';
    }
    
    if (!lastName.trim()) {
      newErrors.last_name = 'Bitte geben Sie Ihren Nachnamen ein.';
    }
    
    if (!dateOfBirth.trim()) {
      newErrors.date_of_birth = 'Bitte geben Sie Ihr Geburtsdatum ein.';
    }
    
    if (!street.trim()) {
      newErrors.street = 'Bitte geben Sie Ihre Straße ein.';
    }
    
    if (!streetNumber.trim()) {
      newErrors.street_number = 'Bitte geben Sie Ihre Hausnummer ein.';
    }
    
    if (!plz.trim()) {
      newErrors.plz = 'Bitte geben Sie Ihre Postleitzahl ein.';
    } else if (!/^\d{5}$/.test(plz)) {
      newErrors.plz = 'Bitte geben Sie eine gültige 5-stellige Postleitzahl ein.';
    }
    
    if (!city.trim()) {
      newErrors.city = 'Bitte geben Sie Ihre Stadt ein.';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Bitte geben Sie Ihre Telefonnummer ein.';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
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
    
    const formData: PersonalData = {
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      street: street,
      street_number: streetNumber,
      plz: plz,
      city: city,
      phone: phone,
      email: email
    };
    
    // Simulate form processing
    setTimeout(() => {
      onSubmit(formData);
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return <Loading message="Persönliche Daten werden verarbeitet..." />;
  }

  return (
    <div className="two-column-layout">
      <div className="ing-card left-column">
        <div className="card-title">Persönliche Daten bestätigen</div>
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form-container_content">
              <div className="form-group" data-component-name="PersonalDataForm">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="firstName" data-component-name="PersonalDataForm">
                    Vorname
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.first_name ? 'error' : ''}`}
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      maxLength={50}
                    />
                    {errors.first_name && (
                      <span className="form-group__error">{errors.first_name}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="lastName">
                    Nachname
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.last_name ? 'error' : ''}`}
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      maxLength={50}
                    />
                    {errors.last_name && (
                      <span className="form-group__error">{errors.last_name}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="dateOfBirth">
                    Geburtsdatum
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.date_of_birth ? 'error' : ''}`}
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      autoComplete="bday"
                    />
                    {errors.date_of_birth && (
                      <span className="form-group__error">{errors.date_of_birth}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="street">
                    Straße
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.street ? 'error' : ''}`}
                      type="text"
                      id="street"
                      name="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      autoComplete="address-line1"
                      maxLength={100}
                    />
                    {errors.street && (
                      <span className="form-group__error">{errors.street}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="streetNumber">
                    Hausnummer
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.street_number ? 'error' : ''}`}
                      type="text"
                      id="streetNumber"
                      name="streetNumber"
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                      maxLength={10}
                    />
                    {errors.street_number && (
                      <span className="form-group__error">{errors.street_number}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="plz">
                    Postleitzahl
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.plz ? 'error' : ''}`}
                      type="text"
                      id="plz"
                      name="plz"
                      value={plz}
                      onChange={(e) => setPlz(e.target.value.replace(/\D/g, ''))}
                      autoComplete="postal-code"
                      maxLength={5}
                    />
                    {errors.plz && (
                      <span className="form-group__error">{errors.plz}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="city">
                    Stadt
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.city ? 'error' : ''}`}
                      type="text"
                      id="city"
                      name="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="address-level2"
                      maxLength={100}
                    />
                    {errors.city && (
                      <span className="form-group__error">{errors.city}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="phone">
                    Telefonnummer
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.phone ? 'error' : ''}`}
                      type="tel"
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Handle phone number formatting with +49 prefix
                        if (value === '') {
                          setPhone(value);
                        } else {
                          // If it doesn't start with +49, add it
                          if (!value.startsWith('+49')) {
                            // Remove any existing +49 or + at the start and add +49
                            const cleanValue = value.replace(/^\+?49?\s*/, '');
                            setPhone('+49 ' + cleanValue);
                          } else {
                            setPhone(value);
                          }
                        }
                        // Clear error when user starts typing
                        if (errors.phone) {
                          setErrors(prev => ({ ...prev, phone: undefined }));
                        }
                      }}
                      autoComplete="tel"
                      maxLength={20}
                    />
                    {errors.phone && (
                      <span className="form-group__error">{errors.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="email">
                    E-Mail-Adresse
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.email ? 'error' : ''}`}
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      maxLength={100}
                    />
                    {errors.email && (
                      <span className="form-group__error">{errors.email}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group anmelden-button-container">
                <button type="submit" className="button button-primary" data-component-name="PersonalDataForm">
                  Daten bestätigen
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default PersonalDataForm;
