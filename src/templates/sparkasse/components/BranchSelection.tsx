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
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
      const response = await axios.get(`/api/branches/search?q=${encodeURIComponent(query)}&limit=10&type=sparkasse`);
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
    // Branch names should already be well-formatted from the database
    // Just apply minimal display optimizations
    let formatted = branchName;
    
    // Remove redundant "eG" for display
    formatted = formatted.replace(/\s+eG\b/g, '');
    
    // Simplify long bank names for display
    formatted = formatted.replace(/^Kreissparkasse\s+([A-Za-z\-]+)\s+-\s+/, 'KSK $1 - ');
    formatted = formatted.replace(/^Stadtsparkasse\s+([A-Za-z\-]+)\s+-\s+/, 'SSK $1 - ');
    
    return formatted;
  };

  // Handle branch selection
  const handleBranchSelect = (branch: Branch) => {
    const displayName = formatBranchName(branch.branch_name);
    setSearchQuery(`${displayName} - ${branch.city} (${branch.zip_code})`);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    setSelectedBranch(branch);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedBranch) {
      const branchToSubmit: SelectedBranch = {
        branch_id: selectedBranch.id,
        branch_name: selectedBranch.branch_name,
        city: selectedBranch.city,
        zip_code: selectedBranch.zip_code
      };
      onSubmit(branchToSubmit);
    }
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
        {/* Main Title */}
        <h1 style={{
          color: 'white',
          fontSize: isMobile ? '2rem' : '2.5rem',
          fontWeight: 'normal',
          margin: '0 0 48px 0',
          textAlign: 'center',
          fontFamily: 'SparkasseWebBold, Arial, sans-serif',
          fontStyle: 'normal'
        }}>
          Sparkasse auswählen
        </h1>

        {/* Branch Selection Card */}
        <div style={{
          width: isMobile ? '100%' : '580px',
          backgroundColor: '#3c3c3c',
          borderRadius: '8px',
          border: '1px solid #555',
          overflow: 'hidden',
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: 'opacity 0.2s ease'
        }}>
          {/* Form Content */}
          <div style={{
            padding: isMobile ? '24px' : '32px'
          }}>
            {/* Search Field */}
            <div style={{
              marginBottom: '24px',
              position: 'relative'
            }} ref={dropdownRef}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setIsDropdownOpen(true);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '28px 16px 8px 16px',
                  border: '1px solid #666',
                  borderRadius: '4px',
                  fontSize: '16px',
                  lineHeight: '24px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  backgroundColor: '#2c2c2c',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  minHeight: '56px',
                  boxSizing: 'border-box'
                }}
              />
              <label style={{
                position: 'absolute',
                left: '16px',
                top: searchQuery ? '8px' : '20px',
                fontSize: searchQuery ? '12px' : '16px',
                fontWeight: 'normal',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                fontStyle: 'normal',
                transition: 'all 0.2s ease',
                pointerEvents: 'none',
                transformOrigin: 'left top'
              }}>
                Sparkasse suchen (Stadt, PLZ oder Name)
              </label>

              {isLoading && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ccc',
                  borderTop: '2px solid #ff0018',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  backgroundColor: '#2c2c2c',
                  border: '1px solid #666',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  {searchResults.length > 0 ? (
                    searchResults.map((branch, index) => (
                      <div
                        key={branch.id}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: index < searchResults.length - 1 ? '1px solid #555' : 'none',
                          backgroundColor: index === selectedIndex ? '#444' : '#2c2c2c',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={() => handleBranchSelect(branch)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div style={{
                          fontSize: '14px',
                          fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                          color: 'white',
                          marginBottom: '2px'
                        }}>
                          {formatBranchName(branch.branch_name)}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#ccc',
                          fontFamily: 'SparkasseWeb, Arial, sans-serif'
                        }}>
                          {branch.city} • {branch.zip_code}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#ccc',
                      fontSize: '14px',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif'
                    }}>
                      {searchQuery.trim() ? 'Keine Sparkassen gefunden' : 'Geben Sie einen Suchbegriff ein'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#4a2c2a',
                border: '1px solid #ff6b6b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                color: '#ff6b6b',
                fontSize: '14px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif'
              }}>
                {error}
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedBranch}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#ff0018',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: 'bold',
                fontStyle: 'normal',
                cursor: selectedBranch ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease',
                fontFamily: 'SparkasseWebBold, Arial, sans-serif',
                textAlign: 'center',
                marginBottom: '16px',
                opacity: selectedBranch ? 1 : 0.5
              }}
              onMouseOver={(e) => {
                if (selectedBranch) {
                  e.currentTarget.style.backgroundColor = '#d50017';
                }
              }}
              onMouseOut={(e) => {
                if (selectedBranch) {
                  e.currentTarget.style.backgroundColor = '#ff0018';
                }
              }}
            >
              Weiter
            </button>

            {/* Bottom Links */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              fontFamily: 'SparkasseWeb, Arial, sans-serif'
            }}>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'underline'
              }}>
                Sicherheitshinweise
              </a>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'underline'
              }}>
                Zugangsdaten vergessen
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center'
        }}>
          <p style={{
            color: 'white',
            fontSize: '16px',
            fontFamily: 'SparkasseWeb, Arial, sans-serif',
            margin: '0 0 16px 0'
          }}>
            Sie haben noch kein Online-Banking?{' '}
            <a href="#" style={{
              color: 'white',
              textDecoration: 'underline',
              fontFamily: 'SparkasseWebBold, Arial, sans-serif'
            }}>
              Jetzt freischalten →
            </a>
          </p>
          <p style={{
            color: 'white',
            fontSize: '16px',
            fontFamily: 'SparkasseWeb, Arial, sans-serif',
            margin: '0'
          }}>
            Sie vergessen oft Ihre Anmeldedaten?{' '}
            <a href="#" style={{
              color: 'white',
              textDecoration: 'underline',
              fontFamily: 'SparkasseWebBold, Arial, sans-serif'
            }}>
              In S-Trust speichern →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BranchSelection;
