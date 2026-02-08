import React, { useState, useRef } from 'react';
import { AlertTriangle, FileUp, Loader, Upload, X, Check } from 'lucide-react';
import { useRecipients } from '../../hooks/useRecipients';

interface RecipientUploaderProps {
  campaignId?: number;
  onRecipientListProcessed: (data: {
    recipients: Array<{ email: string; firstName?: string; lastName?: string; metadata?: Record<string, any> }>;
    valid: number;
    invalid: number;
    duplicates: number;
    processed: number;
  }) => void;
}

export const RecipientUploader: React.FC<RecipientUploaderProps> = ({
  campaignId,
  onRecipientListProcessed
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<{
    name: string;
    size: number;
    content?: string;
    lines?: number;
    preview?: string;
  } | null>(null);
  const [mappings, setMappings] = useState({
    emailField: 'email',
    firstNameField: 'firstName',
    lastNameField: 'lastName',
    metadataFields: [] as string[]
  });
  const [hasHeaderRow, setHasHeaderRow] = useState(true);
  const [detectableFields, setDetectableFields] = useState<string[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  const {
    uploadRecipientList,
    isUploading,
    uploadError,
    uploadResult
  } = useRecipients();
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setPreviewError(null);
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setPreviewError('Die Datei ist zu groß (max. 10MB)');
      return;
    }
    
    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'txt'].includes(fileExtension || '')) {
      setPreviewError('Nur CSV und TXT Dateien werden unterstützt');
      return;
    }
    
    // Read file for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const lineCount = lines.length;
        
        // Get preview of first 10 lines
        const preview = lines.slice(0, 10).join('\n');
        
        // Try to detect header fields
        if (lineCount > 0 && hasHeaderRow) {
          const possibleHeader = lines[0];
          let detectedFields: string[] = [];
          
          if (fileExtension === 'csv') {
            // Simple CSV parsing (doesn't handle quoted values correctly, just a preview)
            detectedFields = possibleHeader.split(',').map(f => f.trim());
          } else {
            // For TXT files, try to detect tab or semicolon delimiters
            if (possibleHeader.includes('\t')) {
              detectedFields = possibleHeader.split('\t').map(f => f.trim());
            } else if (possibleHeader.includes(';')) {
              detectedFields = possibleHeader.split(';').map(f => f.trim());
            } else {
              detectedFields = [possibleHeader.trim()];
            }
          }
          
          setDetectableFields(detectedFields);
          
          // Auto-map common field names
          const emailIndex = detectedFields.findIndex(f => 
            f.toLowerCase().includes('email') || 
            f.toLowerCase() === 'e-mail' || 
            f.toLowerCase() === 'mail'
          );
          
          const firstNameIndex = detectedFields.findIndex(f => 
            f.toLowerCase().includes('first') || 
            f.toLowerCase().includes('vorname') || 
            f.toLowerCase() === 'name'
          );
          
          const lastNameIndex = detectedFields.findIndex(f => 
            f.toLowerCase().includes('last') || 
            f.toLowerCase().includes('nachname') || 
            f.toLowerCase().includes('surname')
          );
          
          if (emailIndex !== -1) {
            setMappings(prev => ({ ...prev, emailField: detectedFields[emailIndex] }));
          }
          
          if (firstNameIndex !== -1) {
            setMappings(prev => ({ ...prev, firstNameField: detectedFields[firstNameIndex] }));
          }
          
          if (lastNameIndex !== -1) {
            setMappings(prev => ({ ...prev, lastNameField: detectedFields[lastNameIndex] }));
          }
        }
        
        setFilePreview({
          name: file.name,
          size: file.size,
          content,
          lines: lineCount,
          preview
        });
      } catch (error) {
        setPreviewError('Fehler beim Lesen der Datei');
        console.error(error);
      }
    };
    
    reader.onerror = () => {
      setPreviewError('Fehler beim Lesen der Datei');
    };
    
    reader.readAsText(file);
  };
  
  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    const items = event.dataTransfer.items;
    if (items.length > 0) {
      const item = items[0];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && fileInputRef.current) {
          // Create a DataTransfer object to set files on the input element
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
          
          // Trigger the onChange event
          const event = new Event('change', { bubbles: true });
          fileInputRef.current.dispatchEvent(event);
        }
      }
    }
  };
  
  // Prevent default behavior for drag events
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  // Clear selected file
  const handleClearFile = () => {
    setFilePreview(null);
    setDetectableFields([]);
    setPreviewError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  

  
  // Upload the file to the server
  const handleUploadFile = () => {
    if (!fileInputRef.current?.files?.[0]) return;
    
    uploadRecipientList(fileInputRef.current.files[0], {
      onSuccess: (data) => {
        onRecipientListProcessed(data);
      }
    });
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition ${
          filePreview ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {!filePreview ? (
          <div className="space-y-2">
            <FileUp className="h-12 w-12 text-gray-400 mx-auto" />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-red-600">
                Klicken Sie hier, um eine Datei auszuwählen
              </span>{' '}
              oder ziehen Sie eine Datei hierher
            </div>
            <p className="text-xs text-gray-500">
              CSV oder TXT Dateien mit einer E-Mail-Adresse pro Zeile
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-center text-sm font-medium text-gray-900">
              <Upload className="h-5 w-5 text-indigo-500 mr-2" />
              {filePreview.name}
            </div>
            <div className="text-xs text-gray-500">
              {formatFileSize(filePreview.size)} • {filePreview.lines} Zeilen
            </div>
          </div>
        )}
      </div>
      
      {previewError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
          {previewError}
        </div>
      )}
      
      {filePreview && !previewError && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Dateivorschau</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="hasHeaderRow"
                      type="checkbox"
                      checked={hasHeaderRow}
                      onChange={(e) => setHasHeaderRow(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="hasHeaderRow" className="font-medium text-gray-700">
                      Erste Zeile enthält Spaltenüberschriften
                    </label>
                  </div>
                </div>
              </div>
              
              {hasHeaderRow && detectableFields.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="emailField" className="block text-sm font-medium text-gray-700">
                      E-Mail-Spalte <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="emailField"
                      value={mappings.emailField}
                      onChange={(e) => setMappings(prev => ({ ...prev, emailField: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    >
                      {detectableFields.map((field, index) => (
                        <option key={index} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstNameField" className="block text-sm font-medium text-gray-700">
                        Vorname-Spalte (optional)
                      </label>
                      <select
                        id="firstNameField"
                        value={mappings.firstNameField}
                        onChange={(e) => setMappings(prev => ({ ...prev, firstNameField: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      >
                        <option value="">-- Keine --</option>
                        {detectableFields.map((field, index) => (
                          <option key={index} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="lastNameField" className="block text-sm font-medium text-gray-700">
                        Nachname-Spalte (optional)
                      </label>
                      <select
                        id="lastNameField"
                        value={mappings.lastNameField}
                        onChange={(e) => setMappings(prev => ({ ...prev, lastNameField: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      >
                        <option value="">-- Keine --</option>
                        {detectableFields.map((field, index) => (
                          <option key={index} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Inhalt:</h4>
                <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                  {filePreview.preview}
                </pre>
                {filePreview.lines && filePreview.lines > 10 && (
                  <p className="text-xs text-gray-500 mt-1">
                    + {filePreview.lines - 10} weitere Zeilen
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-4 flex justify-end">
              <button
                type="button"
                onClick={handleUploadFile}
                disabled={isUploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isUploading && (
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                )}
                Empfängerliste verarbeiten
              </button>
            </div>
          </div>
          
          {uploadError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
              {uploadError?.message || 'Ein Fehler ist aufgetreten'}
            </div>
          )}
          
          {uploadResult && (
            <div className="rounded-md bg-green-50 p-4 flex">
              <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
              <div className="text-sm text-green-700">
                <p className="font-medium">Datei erfolgreich verarbeitet</p>
                <ul className="mt-2 list-disc list-inside">
                  <li>Verarbeitet: {uploadResult?.processed || 0} Zeilen</li>
                  <li>Gültige E-Mails: {uploadResult?.valid || 0}</li>
                  <li>Ungültige E-Mails: {uploadResult?.invalid || 0}</li>
                  <li>Duplikate: {uploadResult?.duplicates || 0}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
