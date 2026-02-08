import React, { useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  Layout, 
  Globe, 
  Mail, 
  Monitor,
  ChevronRight,
  Clock,
  User,
  Building,
  Activity
} from 'lucide-react';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

interface SearchResult {
  id: number | string;
  type: 'lead' | 'template' | 'domain' | 'campaign' | 'session';
  title: string;
  subtitle?: string;
  description?: string;
  status?: string;
  created_at?: string;
  url?: string;
  metadata?: any;
}

const GlobalSearch: React.FC = () => {
  const {
    query,
    results,
    groupedResults,
    suggestions,
    loading,
    error,
    isOpen,
    selectedIndex,
    handleQueryChange,
    navigateToResult,
    handleKeyDown,
    clearSearch,
    setIsOpen,
    setSelectedIndex
  } = useGlobalSearch();

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDownEvent = (e: KeyboardEvent) => {
      // Global search shortcut (Ctrl/Cmd + K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      // Handle navigation only when search is focused
      if (document.activeElement === inputRef.current) {
        handleKeyDown(e);
      }
    };

    document.addEventListener('keydown', handleKeyDownEvent);
    return () => document.removeEventListener('keydown', handleKeyDownEvent);
  }, [handleKeyDown]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen, setSelectedIndex]);

  // Get icon for result type
  const getResultIcon = (type: string, status?: string) => {
    const iconProps = { size: 16, className: "flex-shrink-0" };
    
    switch (type) {
      case 'lead':
        return <User {...iconProps} className={`${iconProps.className} ${
          status === 'completed' ? 'text-green-500' : 
          status === 'partial_immediate' ? 'text-yellow-500' : 
          'text-blue-500'
        }`} />;
      case 'template':
        return <Layout {...iconProps} className={`${iconProps.className} ${
          status === 'active' ? 'text-green-500' : 'text-gray-500'
        }`} />;
      case 'domain':
        return <Globe {...iconProps} className={`${iconProps.className} ${
          status === 'active' ? 'text-green-500' : 'text-gray-500'
        }`} />;
      case 'campaign':
        return <Mail {...iconProps} className={`${iconProps.className} ${
          status === 'sent' ? 'text-green-500' : 
          status === 'scheduled' ? 'text-blue-500' : 
          'text-gray-500'
        }`} />;
      case 'session':
        return <Monitor {...iconProps} className={`${iconProps.className} ${
          status === 'active' ? 'text-green-500' : 'text-gray-500'
        }`} />;
      default:
        return <FileText {...iconProps} className={`${iconProps.className} text-gray-500`} />;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lead': return 'Protokoll';
      case 'template': return 'Template';
      case 'domain': return 'Domain';
      case 'campaign': return 'Kampagne';
      case 'session': return 'Session';
      default: return type;
    }
  };

  // Render search result
  const renderResult = (result: SearchResult, index: number) => (
    <div
      key={`${result.type}-${result.id}`}
      className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
        index === selectedIndex 
          ? 'bg-red-50 border-l-4 border-red-500' 
          : 'hover:bg-gray-50'
      }`}
      onClick={() => navigateToResult(result)}
      onMouseEnter={() => setSelectedIndex(index)}
    >
      <div className="flex items-start gap-3">
        {getResultIcon(result.type, result.status)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">
              {result.title}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {getTypeLabel(result.type)}
            </span>
          </div>
          {result.subtitle && (
            <div className="text-sm text-gray-600 truncate mb-1">
              {result.subtitle}
            </div>
          )}
          {result.description && (
            <div className="text-xs text-gray-500 truncate">
              {result.description}
            </div>
          )}
        </div>
        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
      </div>
    </div>
  );

  // Render grouped results
  const renderGroupedResults = () => {
    const groups = [
      { key: 'leads', label: 'Protokolle', icon: User },
      { key: 'templates', label: 'Templates', icon: Layout },
      { key: 'domains', label: 'Domains', icon: Globe },
      { key: 'campaigns', label: 'Kampagnen', icon: Mail },
      { key: 'sessions', label: 'Sessions', icon: Monitor }
    ];

    return groups.map(group => {
      const groupResults = groupedResults[group.key as keyof typeof groupedResults];
      if (groupResults.length === 0) return null;

      const Icon = group.icon;
      const startIndex = results.findIndex(r => r.type === group.key);

      return (
        <div key={group.key} className="border-t border-gray-100 first:border-t-0">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Icon size={14} />
              <span>{group.label}</span>
              <span className="text-xs text-gray-500">({groupResults.length})</span>
            </div>
          </div>
          {groupResults.map((result, index) => 
            renderResult(result, startIndex + index)
          )}
        </div>
      );
    });
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            navigateToResult(results[selectedIndex]);
          }
        }} 
        className="relative w-full"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${
              isOpen ? 'shadow-lg rounded-b-none' : 'shadow-sm'
            }`}
            placeholder="Suche Protokolle, Templates, Domains... (Strg+K)"
          />
          {(query || loading) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {loading ? (
                <div className="animate-spin">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {error && (
            <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
              <div className="flex items-center gap-2">
                <X size={16} />
                <span>Fehler beim Suchen: {error}</span>
              </div>
            </div>
          )}

          {!loading && !error && results.length === 0 && query.trim() && (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">Keine Ergebnisse gefunden</p>
              <p className="text-xs mt-1">
                Versuchen Sie andere Suchbegriffe oder überprüfen Sie die Schreibweise
              </p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              {renderGroupedResults()}
            </div>
          )}

          {/* Search Tips */}
          {!loading && !error && query.trim() && results.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {results.length} Ergebnis{results.length !== 1 ? 'se' : ''} gefunden
                </span>
                <span className="flex items-center gap-4">
                  <span>↑↓ navigieren</span>
                  <span>↵ öffnen</span>
                  <span>Esc schließen</span>
                </span>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {!loading && !error && suggestions.length > 0 && results.length === 0 && query.trim() && (
            <div className="border-t border-gray-100">
              <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-700">
                Vorschläge
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-700"
                  onClick={() => handleQueryChange(suggestion)}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span>{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
