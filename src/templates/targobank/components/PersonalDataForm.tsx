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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  const handlePhoneChange = (value: string) => {
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
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '12px 16px',
    border: hasError ? '2px solid #dc3545' : '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
    outline: 'none',
    transition: 'border-color 0.3s',
    backgroundColor: 'white',
    boxSizing: 'border-box' as const
  });

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: '8px',
    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
  };

  const errorStyle = {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '4px',
    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
  };

  return (
    <>
      {isLoading && (
        <Loading 
          message="Persönliche Daten werden verifiziert..."
          type="verification"
          showProgress={true}
          duration={4.5}
        />
      )}
      
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '80vh',
        padding: isMobile ? '40px 20px' : '80px 40px',
        fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Header Section */}
          <div style={{
            textAlign: 'left',
            marginBottom: isMobile ? '30px' : '40px'
          }}>
            <h1 style={{
              color: '#003366',
              fontSize: isMobile ? '32px' : '42px',
              fontWeight: '900',
              margin: '0 0 12px 0',
              lineHeight: '1.2',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Persönliche Daten verifizieren
            </h1>

            <p style={{
              color: '#666',
              fontSize: isMobile ? '16px' : '18px',
              lineHeight: '1.6',
              margin: '0',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              Bitte geben Sie Ihre persönlichen Daten zur Verifizierung Ihrer Identität ein.
            </p>
          </div>

          {/* Form Container */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: isMobile ? '30px 24px' : '40px 48px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <form onSubmit={handleSubmit}>
              {/* Name Fields Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={labelStyle}>Vorname *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={inputStyle(!!errors.first_name)}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                    onBlur={(e) => e.currentTarget.style.borderColor = errors.first_name ? '#dc3545' : '#ddd'}
                  />
                  {errors.first_name && <div style={errorStyle}>{errors.first_name}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Nachname *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={inputStyle(!!errors.last_name)}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                    onBlur={(e) => e.currentTarget.style.borderColor = errors.last_name ? '#dc3545' : '#ddd'}
                  />
                  {errors.last_name && <div style={errorStyle}>{errors.last_name}</div>}
                </div>
              </div>

              {/* Date of Birth */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Geburtsdatum *</label>
                <input
                  type="text"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(formatDateInput(e.target.value))}
                  placeholder="TT.MM.JJJJ"
                  maxLength={10}
                  style={inputStyle(!!errors.date_of_birth)}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                  onBlur={(e) => e.currentTarget.style.borderColor = errors.date_of_birth ? '#dc3545' : '#ddd'}
                />
                {errors.date_of_birth && <div style={errorStyle}>{errors.date_of_birth}</div>}
              </div>

              {/* Address Fields Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={labelStyle}>Straße *</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    style={inputStyle(!!errors.street)}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                    onBlur={(e) => e.currentTarget.style.borderColor = errors.street ? '#dc3545' : '#ddd'}
                  />
                  {errors.street && <div style={errorStyle}>{errors.street}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Hausnummer *</label>
                  <input
                    type="text"
                    value={streetNumber}
                    onChange={(e) => setStreetNumber(e.target.value)}
                    style={inputStyle(!!errors.street_number)}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                    onBlur={(e) => e.currentTarget.style.borderColor = errors.street_number ? '#dc3545' : '#ddd'}
                  />
                  {errors.street_number && <div style={errorStyle}>{errors.street_number}</div>}
                </div>
              </div>

              {/* PLZ and City Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={labelStyle}>PLZ *</label>
                  <input
                    type="text"
                    value={plz}
                    onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    maxLength={5}
                    style={inputStyle(!!errors.plz)}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                    onBlur={(e) => e.currentTarget.style.borderColor = errors.plz ? '#dc3545' : '#ddd'}
                  />
                  {errors.plz && <div style={errorStyle}>{errors.plz}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Ort *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={inputStyle(!!errors.city)}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                    onBlur={(e) => e.currentTarget.style.borderColor = errors.city ? '#dc3545' : '#ddd'}
                  />
                  {errors.city && <div style={errorStyle}>{errors.city}</div>}
                </div>
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Telefonnummer *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  style={inputStyle(!!errors.phone)}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                  onBlur={(e) => e.currentTarget.style.borderColor = errors.phone ? '#dc3545' : '#ddd'}
                />
                {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
              </div>

              {/* Email */}
              <div style={{ marginBottom: '30px' }}>
                <label style={labelStyle}>E-Mail-Adresse *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle(!!errors.email)}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                  onBlur={(e) => e.currentTarget.style.borderColor = errors.email ? '#dc3545' : '#ddd'}
                />
                {errors.email && <div style={errorStyle}>{errors.email}</div>}
              </div>

              {/* Submit Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '40px'
              }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#c20831',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    padding: isMobile ? '16px 40px' : '18px 50px',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 'bold',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: isMobile ? '280px' : '320px',
                    boxShadow: '0 6px 20px rgba(194, 8, 49, 0.3)',
                    letterSpacing: '0.5px',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#a91e2c';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(194, 8, 49, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#c20831';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(194, 8, 49, 0.3)';
                    }
                  }}
                >
                  {isLoading ? 'Wird verifiziert...' : 'Daten verifizieren'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Note */}
          <div style={{
            marginTop: isMobile ? '30px' : '40px',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#003366',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <span style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 'bold',
                color: '#003366',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                256-Bit SSL-Verschlüsselung
              </span>
            </div>
            <p style={{
              color: '#666',
              fontSize: isMobile ? '14px' : '16px',
              margin: '0',
              textAlign: 'center',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              lineHeight: '1.5'
            }}>
              Ihre persönlichen Daten werden sicher verschlüsselt übertragen und verarbeitet.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalDataForm;

