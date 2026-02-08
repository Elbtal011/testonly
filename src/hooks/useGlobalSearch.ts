import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

interface SearchResponse {
  results: SearchResult[];
  grouped: {
    leads: SearchResult[];
    templates: SearchResult[];
    domains: SearchResult[];
    campaigns: SearchResult[];
    sessions: SearchResult[];
  };
  total: number;
  query: string;
  types: string[];
}

interface SearchSuggestions {
  suggestions: string[];
  query: string;
}

export const useGlobalSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [groupedResults, setGroupedResults] = useState<SearchResponse['grouped']>({
    leads: [],
    templates: [],
    domains: [],
    campaigns: [],
    sessions: []
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounce search queries
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string, types?: string[]) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setGroupedResults({
        leads: [],
        templates: [],
        domains: [],
        campaigns: [],
        sessions: []
      });
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20'
      });

      if (types && types.length > 0) {
        params.append('types', types.join(','));
      }

      const response = await fetch(`/api/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
      setGroupedResults(data.grouped);
      setIsOpen(data.results.length > 0);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
      setGroupedResults({
        leads: [],
        templates: [],
        domains: [],
        campaigns: [],
        sessions: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Get search suggestions
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: SearchSuggestions = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, types?: string[]) => {
      performSearch(searchQuery, types);
    }, 300),
    [performSearch]
  );

  // Debounced suggestions
  const debouncedSuggestions = useCallback(
    debounce((searchQuery: string) => {
      getSuggestions(searchQuery);
    }, 150),
    [getSuggestions]
  );

  // Handle query change
  const handleQueryChange = useCallback((newQuery: string, types?: string[]) => {
    setQuery(newQuery);
    setSelectedIndex(-1);
    
    if (newQuery.trim()) {
      debouncedSearch(newQuery, types);
      debouncedSuggestions(newQuery);
    } else {
      setResults([]);
      setGroupedResults({
        leads: [],
        templates: [],
        domains: [],
        campaigns: [],
        sessions: []
      });
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [debouncedSearch, debouncedSuggestions]);

  // Navigate to result
  const navigateToResult = useCallback((result: SearchResult) => {
    if (result.url) {
      navigate(result.url);
      setIsOpen(false);
      setQuery('');
    }
  }, [navigate]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, results, selectedIndex, navigateToResult]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setGroupedResults({
      leads: [],
      templates: [],
      domains: [],
      campaigns: [],
      sessions: []
    });
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    setError(null);
  }, []);

  return {
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
  };
};
