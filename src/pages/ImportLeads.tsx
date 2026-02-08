import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  Download,
  RefreshCw,
  Users,
  UserPlus,
  UserCheck,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ParsedLead {
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  street?: string;
  street_number?: string;
  plz?: string;
  city?: string;
  email?: string;
  raw_line?: string;
  existing_lead_id?: number | null;
  is_duplicate?: boolean;
  existing_submission_count?: number;
}

interface ParseError {
  line: number;
  error: string;
  raw: string;
}

interface PreviewResponse {
  success: boolean;
  preview: {
    leads: ParsedLead[];
    errors: ParseError[];
    stats: {
      total_lines: number;
      parsed_successfully: number;
      parse_errors: number;
      detected_format: string;
      detected_delimiter: string;
      duplicates_found: number;
      new_leads: number;
    };
  };
  file_info: {
    name: string;
    size: number;
    mimetype: string;
  };
}

interface ImportResponse {
  success: boolean;
  results: {
    total_processed: number;
    created: number;
    updated: number;
    errors: number;
    error_details: Array<{ lead: ParsedLead; error: string }>;
  };
  parse_stats: {
    total_lines: number;
    parsed_successfully: number;
    parse_errors: number;
    detected_format: string;
    detected_delimiter: string;
  };
  file_info: {
    name: string;
    size: number;
  };
}

export const ImportLeads: React.FC = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showPreviewDetails, setShowPreviewDetails] = useState(true);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(null);
    setImportResult(null);
    setError(null);
    
    // Auto-preview
    await previewFile(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const previewFile = async (fileToPreview: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nicht authentifiziert');
        return;
      }

      const formData = new FormData();
      formData.append('file', fileToPreview);
      formData.append('maxRows', '20');

      const response = await fetch('/api/import/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Preview failed');
      }

      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Vorschau');
    } finally {
      setLoading(false);
    }
  };

  const importFile = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nicht authentifiziert');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/leads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Import');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async (format: 'pipe' | 'csv') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/import/template?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'csv' ? 'import_template.csv' : 'import_template.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading template:', err);
    }
  };

  const resetImport = () => {
    setFile(null);
    setPreview(null);
    setImportResult(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Importieren</h1>
          <p className="text-sm text-gray-500 mt-1">
            Importieren Sie Kontaktdaten aus TXT oder CSV Dateien
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => downloadTemplate('pipe')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Vorlage (TXT)
          </button>
          <button
            onClick={() => downloadTemplate('csv')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Vorlage (CSV)
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Unterstützte Formate:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>Pipe-getrennt:</strong> Name | Telefon | Geburtsdatum | Adresse</li>
              <li><strong>CSV:</strong> Mit Spaltenüberschriften (first_name, last_name, phone, etc.)</li>
              <li><strong>Tab-getrennt:</strong> Automatische Erkennung</li>
            </ul>
            <p className="mt-2 text-blue-600">
              <strong>Duplikaterkennung:</strong> Existierende Einträge (gleicher Vor- und Nachname) werden automatisch aktualisiert statt dupliziert.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Import Abgeschlossen</h2>
              <p className="text-sm text-gray-500">{importResult.file_info.name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{importResult.results.total_processed}</div>
              <div className="text-sm text-gray-500">Verarbeitet</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <UserPlus className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{importResult.results.created}</div>
              <div className="text-sm text-gray-500">Neu erstellt</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <UserCheck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{importResult.results.updated}</div>
              <div className="text-sm text-gray-500">Aktualisiert</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{importResult.results.errors}</div>
              <div className="text-sm text-gray-500">Fehler</div>
            </div>
          </div>

          {importResult.results.error_details.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                {showErrors ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                {showErrors ? 'Fehler ausblenden' : 'Fehler anzeigen'}
              </button>
              {showErrors && (
                <div className="mt-2 bg-red-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {importResult.results.error_details.map((err, idx) => (
                    <div key={idx} className="text-sm text-red-800 py-1 border-b border-red-100 last:border-0">
                      <strong>{err.lead.first_name} {err.lead.last_name}:</strong> {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={resetImport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Neuer Import
            </button>
            <button
              onClick={() => navigate('/admin/leads')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Leads anzeigen
            </button>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      {!importResult && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-red-500 bg-red-50'
              : file
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            accept=".txt,.csv,.tsv"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader className="h-12 w-12 text-red-600 animate-spin mb-4" />
              <p className="text-gray-600">Datei wird verarbeitet...</p>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-green-600 mb-4" />
              <p className="text-lg font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetImport();
                }}
                className="mt-3 text-sm text-red-600 hover:text-red-800"
              >
                Andere Datei wählen
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900">
                Datei hierher ziehen oder klicken
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Unterstützt: .txt, .csv, .tsv (max. 10MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview Section */}
      {preview && !importResult && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Vorschau</h2>
              </div>
              <button
                onClick={() => setShowPreviewDetails(!showPreviewDetails)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {showPreviewDetails ? 'Details ausblenden' : 'Details anzeigen'}
              </button>
            </div>
            
            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-gray-50 rounded p-3 text-center">
                <div className="text-xl font-bold text-gray-900">{preview.preview.stats.total_lines}</div>
                <div className="text-xs text-gray-500">Zeilen gesamt</div>
              </div>
              <div className="bg-green-50 rounded p-3 text-center">
                <div className="text-xl font-bold text-green-600">{preview.preview.stats.new_leads}</div>
                <div className="text-xs text-gray-500">Neue Einträge</div>
              </div>
              <div className="bg-blue-50 rounded p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{preview.preview.stats.duplicates_found}</div>
                <div className="text-xs text-gray-500">Duplikate</div>
              </div>
              <div className="bg-red-50 rounded p-3 text-center">
                <div className="text-xl font-bold text-red-600">{preview.preview.stats.parse_errors}</div>
                <div className="text-xs text-gray-500">Fehler</div>
              </div>
              <div className="bg-purple-50 rounded p-3 text-center">
                <div className="text-sm font-medium text-purple-600">{preview.preview.stats.detected_delimiter}</div>
                <div className="text-xs text-gray-500">Trennzeichen</div>
              </div>
            </div>
          </div>

          {showPreviewDetails && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Geburtsdatum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.preview.leads.map((lead, idx) => (
                    <tr key={idx} className={lead.is_duplicate ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {lead.is_duplicate ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Update ({lead.existing_submission_count}x)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Neu
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.first_name} {lead.last_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {lead.phone || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {lead.date_of_birth || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {[lead.street, lead.street_number, lead.plz, lead.city]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Parse Errors */}
          {preview.preview.errors.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                {showErrors ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                {preview.preview.errors.length} Parsing-Fehler
              </button>
              {showErrors && (
                <div className="mt-2 bg-red-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {preview.preview.errors.map((err, idx) => (
                    <div key={idx} className="text-sm text-red-800 py-1 border-b border-red-100 last:border-0">
                      <strong>Zeile {err.line}:</strong> {err.error}
                      <div className="text-xs text-red-600 truncate">{err.raw}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {preview.preview.stats.new_leads} neue Einträge werden erstellt, {preview.preview.stats.duplicates_found} werden aktualisiert
            </p>
            <div className="flex space-x-3">
              <button
                onClick={resetImport}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={importFile}
                disabled={loading || preview.preview.leads.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {preview.preview.stats.total_lines} Einträge importieren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportLeads;

