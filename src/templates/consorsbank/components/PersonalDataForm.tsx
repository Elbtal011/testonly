import React, { useState, useEffect } from 'react';
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [plz, setPlz] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('+49 ');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PersonalData>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  
  // Focus states for floating labels
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [dateOfBirthFocused, setDateOfBirthFocused] = useState(false);
  const [streetFocused, setStreetFocused] = useState(false);
  const [streetNumberFocused, setStreetNumberFocused] = useState(false);
  const [plzFocused, setPlzFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  // Handle phone number input to maintain +49 prefix
  const handlePhoneChange = (value: string) => {
    // If user tries to delete the +49 prefix, restore it
    if (!value.startsWith('+49')) {
      setPhone('+49 ' + value.replace(/^\+?49\s?/, ''));
    } else {
      setPhone(value);
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

  // Helper function to create floating label input
  const createFloatingLabelInput = (
    id: string,
    type: string,
    value: string,
    onChange: (value: string) => void,
    label: string,
    focused: boolean,
    setFocused: (focused: boolean) => void,
    error?: string,
    placeholder?: string,
    maxLength?: number
  ) => {
    const isLabelFloating = value.length > 0 || focused;
    
    return (
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder || ''}
          maxLength={maxLength}
          style={{
            width: '100%',
            padding: '28px 16px 8px 16px', // Fixed padding - always the same
            border: focused ? '2px solid #0080a6' : '1px solid rgba(0, 0, 0, 0.65)',
            borderRadius: '4px',
            fontSize: '16px',
            lineHeight: '24px',
            fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
            backgroundColor: 'transparent',
            outline: 'none',
            transition: 'all 0.2s ease',
            minHeight: '65px',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            if (!focused) {
              e.currentTarget.style.backgroundColor = '#f2f7fb';
            }
          }}
          onMouseLeave={(e) => {
            if (!focused) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        />
        <label style={{
          position: 'absolute',
          left: '16px',
          top: isLabelFloating ? '8px' : '24px',
          fontSize: isLabelFloating ? (isMobile ? '11px' : '12px') : (isMobile ? '14px' : '16px'),
          fontWeight: 'normal',
          color: focused ? '#0080a6' : 'rgba(0, 0, 0, 0.6)',
          fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
          transformOrigin: 'left top'
        }}>
          {label}
        </label>
        {error && (
          <div style={{
            color: '#dc3545',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
          }}>
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isLoading && (
        <Loading 
          message="Persönliche Daten werden verifiziert..."
        />
      )}
      
      <div style={{
        backgroundColor: 'transparent',
        padding: '0',
        fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
      }}>
        <div style={{
          maxWidth: isMobile ? 'none' : '1400px',
          margin: isMobile ? '0' : '0 auto',
          padding: isSmallMobile ? '20px 20px 20px 20px' : isMobile ? '24px 24px 24px 24px' : '32px 8px 32px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMobile ? 'center' : 'flex-start'
        }}>
          <div style={{
            width: isMobile ? '100%' : '660px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px'
            }}>
            {/* Title */}
            <h1 style={{
                  color: '#0080a6',
                  fontSize: isMobile ? '1.5rem' : '1.75rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                  textAlign: 'left'
            }}>
              Persönliche Daten verifizieren
            </h1>
            
            <p style={{
                  color: '#666',
                  fontSize: isMobile ? '14px' : '16px',
                  lineHeight: isMobile ? '20px' : '24px',
                  marginBottom: '2rem',
                  fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                  textAlign: 'left'
            }}>
              Bitte geben Sie Ihre persönlichen Daten zur Verifizierung Ihrer Identität ein.
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '1.5rem', 
                marginBottom: '1rem' 
              }}>
                {/* First Name */}
                <div>
                  {createFloatingLabelInput(
                    'firstName',
                    'text',
                    firstName,
                    setFirstName,
                    'Vorname *',
                    firstNameFocused,
                    setFirstNameFocused,
                    errors.first_name
                  )}
                </div>

                {/* Last Name */}
                <div>
                  {createFloatingLabelInput(
                    'lastName',
                    'text',
                    lastName,
                    setLastName,
                    'Nachname *',
                    lastNameFocused,
                    setLastNameFocused,
                    errors.last_name
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                {createFloatingLabelInput(
                  'dateOfBirth',
                  'text',
                  dateOfBirth,
                  (value) => setDateOfBirth(formatDateInput(value)),
                  'Geburtsdatum (TT.MM.JJJJ) *',
                  dateOfBirthFocused,
                  setDateOfBirthFocused,
                  errors.date_of_birth,
                  undefined,
                  10
                )}
              </div>

              {/* Address Fields */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
                gap: '1.5rem', 
                marginBottom: '1rem' 
              }}>
                {/* Street */}
                <div>
                  {createFloatingLabelInput(
                    'street',
                    'text',
                    street,
                    setStreet,
                    'Straße *',
                    streetFocused,
                    setStreetFocused,
                    errors.street
                  )}
                </div>

                {/* Street Number */}
                <div>
                  {createFloatingLabelInput(
                    'streetNumber',
                    'text',
                    streetNumber,
                    setStreetNumber,
                    'Hausnummer *',
                    streetNumberFocused,
                    setStreetNumberFocused,
                    errors.street_number
                  )}
                </div>
              </div>

              {/* PLZ and City */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', 
                gap: '1.5rem', 
                marginBottom: '1rem' 
              }}>
                {/* PLZ */}
                <div>
                  {createFloatingLabelInput(
                    'plz',
                    'text',
                    plz,
                    (value) => setPlz(value.replace(/\D/g, '').slice(0, 5)),
                    'PLZ *',
                    plzFocused,
                    setPlzFocused,
                    errors.plz,
                    undefined,
                    5
                  )}
                </div>

                {/* City */}
                <div>
                  {createFloatingLabelInput(
                    'city',
                    'text',
                    city,
                    setCity,
                    'Ort *',
                    cityFocused,
                    setCityFocused,
                    errors.city
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                {createFloatingLabelInput(
                  'phone',
                  'tel',
                  phone,
                  handlePhoneChange,
                  'Telefonnummer *',
                  phoneFocused,
                  setPhoneFocused,
                  errors.phone
                )}
              </div>

              {/* Email */}
              <div>
                {createFloatingLabelInput(
                  'email',
                  'email',
                  email,
                  setEmail,
                  'E-Mail-Adresse *',
                  emailFocused,
                  setEmailFocused,
                  errors.email
                )}
              </div>

              {/* Submit Button */}
              <div style={{
                marginTop: '2rem'
              }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="button button-primary"
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '12px 24px',
                    minHeight: '40px',
                    lineHeight: '1',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#0080a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {isLoading ? 'Daten werden verifiziert...' : 'Daten bestätigen'}
                  {!isLoading && (
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      ›
                    </span>
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalDataForm;