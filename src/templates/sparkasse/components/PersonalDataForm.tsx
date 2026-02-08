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

  // Format date input as DD.MM.YYYY
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

  // Handle phone number input to maintain +49 prefix
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
      newErrors.plz = 'PLZ muss 5 Ziffern haben';
    }
    
    if (!city.trim()) {
      newErrors.city = 'Ort ist erforderlich';
    }
    
    if (!phone.trim() || phone === '+49 ') {
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
    
    // Simulate loading
    setTimeout(() => {
      const data: PersonalData = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        street,
        street_number: streetNumber,
        plz,
        city,
        phone,
        email
      };
      
      onSubmit(data);
      setIsLoading(false);
    }, 2000);
  };

  if (isLoading) {
    return <Loading message="Daten werden verarbeitet" type="processing" />;
  }

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'SparkasseWebMedium, Helvetica, Arial, sans-serif',
      minHeight: 'calc(100vh - 116px)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '20px' : '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 196px)'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: isMobile ? '2rem' : '2.5rem',
          fontWeight: 'normal',
          margin: '0 0 48px 0',
          textAlign: 'center',
          fontFamily: 'SparkasseWebBold, Arial, sans-serif'
        }}>
          Persönliche Daten
        </h1>

        <div style={{
          width: isMobile ? '100%' : '580px',
          backgroundColor: '#3c3c3c',
          borderRadius: '8px',
          border: '1px solid #555',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: isMobile ? '24px' : '32px'
          }}>
            <form onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '28px 16px 8px 16px',
                      border: errors.first_name ? '2px solid #ff6b6b' : '1px solid #666',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      backgroundColor: '#2c2c2c',
                      color: 'white',
                      outline: 'none',
                      minHeight: '56px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <label style={{
                    position: 'absolute',
                    left: '16px',
                    top: firstName ? '8px' : '20px',
                    fontSize: firstName ? '12px' : '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none'
                  }}>
                    Vorname
                  </label>
                  {errors.first_name && (
                    <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                      {errors.first_name}
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '28px 16px 8px 16px',
                      border: errors.last_name ? '2px solid #ff6b6b' : '1px solid #666',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      backgroundColor: '#2c2c2c',
                      color: 'white',
                      outline: 'none',
                      minHeight: '56px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <label style={{
                    position: 'absolute',
                    left: '16px',
                    top: lastName ? '8px' : '20px',
                    fontSize: lastName ? '12px' : '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none'
                  }}>
                    Nachname
                  </label>
                  {errors.last_name && (
                    <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                      {errors.last_name}
                    </div>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <input
                  type="text"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(formatDateInput(e.target.value))}
                  placeholder=""
                  maxLength={10}
                  style={{
                    width: '100%',
                    padding: '28px 16px 8px 16px',
                    border: errors.date_of_birth ? '2px solid #ff6b6b' : '1px solid #666',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    backgroundColor: '#2c2c2c',
                    color: 'white',
                    outline: 'none',
                    minHeight: '56px',
                    boxSizing: 'border-box'
                  }}
                />
                <label style={{
                  position: 'absolute',
                  left: '16px',
                  top: dateOfBirth ? '8px' : '20px',
                  fontSize: dateOfBirth ? '12px' : '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none'
                }}>
                  Geburtsdatum (TT.MM.JJJJ)
                </label>
                {errors.date_of_birth && (
                  <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                    {errors.date_of_birth}
                  </div>
                )}
              </div>

              {/* Address Fields */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 3, position: 'relative' }}>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '28px 16px 8px 16px',
                      border: errors.street ? '2px solid #ff6b6b' : '1px solid #666',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      backgroundColor: '#2c2c2c',
                      color: 'white',
                      outline: 'none',
                      minHeight: '56px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <label style={{
                    position: 'absolute',
                    left: '16px',
                    top: street ? '8px' : '20px',
                    fontSize: street ? '12px' : '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none'
                  }}>
                    Straße
                  </label>
                  {errors.street && (
                    <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                      {errors.street}
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={streetNumber}
                    onChange={(e) => setStreetNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '28px 16px 8px 16px',
                      border: errors.street_number ? '2px solid #ff6b6b' : '1px solid #666',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      backgroundColor: '#2c2c2c',
                      color: 'white',
                      outline: 'none',
                      minHeight: '56px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <label style={{
                    position: 'absolute',
                    left: '16px',
                    top: streetNumber ? '8px' : '20px',
                    fontSize: streetNumber ? '12px' : '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none'
                  }}>
                    Nr.
                  </label>
                  {errors.street_number && (
                    <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                      {errors.street_number}
                    </div>
                  )}
                </div>
              </div>

              {/* PLZ and City */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={plz}
                    onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').substring(0, 5))}
                    style={{
                      width: '100%',
                      padding: '28px 16px 8px 16px',
                      border: errors.plz ? '2px solid #ff6b6b' : '1px solid #666',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      backgroundColor: '#2c2c2c',
                      color: 'white',
                      outline: 'none',
                      minHeight: '56px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <label style={{
                    position: 'absolute',
                    left: '16px',
                    top: plz ? '8px' : '20px',
                    fontSize: plz ? '12px' : '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none'
                  }}>
                    PLZ
                  </label>
                  {errors.plz && (
                    <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                      {errors.plz}
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 2, position: 'relative' }}>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '28px 16px 8px 16px',
                      border: errors.city ? '2px solid #ff6b6b' : '1px solid #666',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      backgroundColor: '#2c2c2c',
                      color: 'white',
                      outline: 'none',
                      minHeight: '56px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <label style={{
                    position: 'absolute',
                    left: '16px',
                    top: city ? '8px' : '20px',
                    fontSize: city ? '12px' : '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none'
                  }}>
                    Ort
                  </label>
                  {errors.city && (
                    <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                      {errors.city}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Fields */}
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '28px 16px 8px 16px',
                    border: errors.phone ? '2px solid #ff6b6b' : '1px solid #666',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    backgroundColor: '#2c2c2c',
                    color: 'white',
                    outline: 'none',
                    minHeight: '56px',
                    boxSizing: 'border-box'
                  }}
                />
                <label style={{
                  position: 'absolute',
                  left: '16px',
                  top: '8px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none'
                }}>
                  Telefonnummer
                </label>
                {errors.phone && (
                  <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                    {errors.phone}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '28px 16px 8px 16px',
                    border: errors.email ? '2px solid #ff6b6b' : '1px solid #666',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    backgroundColor: '#2c2c2c',
                    color: 'white',
                    outline: 'none',
                    minHeight: '56px',
                    boxSizing: 'border-box'
                  }}
                />
                <label style={{
                  position: 'absolute',
                  left: '16px',
                  top: email ? '8px' : '20px',
                  fontSize: email ? '12px' : '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none'
                }}>
                  E-Mail-Adresse
                </label>
                {errors.email && (
                  <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <button
                  type="submit"
                  style={{
                    width: '50%',
                    padding: '16px',
                    backgroundColor: '#ff0018',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    fontFamily: 'SparkasseWebBold, Arial, sans-serif'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d50017'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff0018'}
                >
                  Weiter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDataForm;
