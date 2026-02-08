import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import Loading from './Loading';

interface QRUploadFormProps {
  onUpload: (file: File) => void;
  isRetry?: boolean;
}

const QRUploadForm: React.FC<QRUploadFormProps> = ({ onUpload, isRetry = false }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte wählen Sie eine Bilddatei aus.');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Die Datei ist zu groß. Maximale Größe: 10MB.');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Bitte wählen Sie eine Datei aus.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate upload processing
    setTimeout(() => {
      onUpload(selectedFile);
      setIsLoading(false);
    }, 1000);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <Loading message="QR-Code wird analysiert..." />;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: '20px'
    }}>
      <div className="ing-card" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div className="card-title" style={{ marginBottom: '24px' }}>
          {isRetry ? 'QR-Code erneut hochladen' : 'QR-Code hochladen'}
        </div>
        
        {isRetry && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p style={{
              color: '#856404',
              fontSize: '16px',
              margin: 0,
              fontFamily: 'ING Me, Arial, sans-serif',
              lineHeight: '1.5'
            }}>
              Der QR-Code konnte nicht gelesen werden. Bitte versuchen Sie es mit einem neuen QR-Code aus Ihrer App.
            </p>
          </div>
        )}
        
        <p style={{ 
          color: '#666', 
          fontSize: '16px', 
          lineHeight: '1.5', 
          fontFamily: 'ING Me, Arial, sans-serif',
          marginBottom: '24px'
        }}>
          Laden Sie den QR-Code aus Ihrer ING Banking App hoch.
        </p>

      <form onSubmit={handleSubmit}>
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? '#ff6200' : '#ccc'}`,
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragActive ? '#fff5f0' : '#f9f9f9',
            transition: 'all 0.3s ease',
            marginBottom: '20px'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          
          {selectedFile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <CheckCircle size={24} color="#00a651" />
              <span style={{ color: '#333', fontFamily: 'ING Me, Arial, sans-serif' }}>
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e30613',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div>
              <Upload size={48} color="#ff6200" style={{ marginBottom: '16px' }} />
              <p style={{ color: '#333', fontSize: '16px', marginBottom: '8px', fontFamily: 'ING Me, Arial, sans-serif' }}>
                QR-Code Bild hier ablegen oder klicken zum Auswählen
              </p>
              <p style={{ color: '#666', fontSize: '14px', margin: 0, fontFamily: 'ING Me, Arial, sans-serif' }}>
                Unterstützte Formate: JPG, PNG, GIF (max. 10MB)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            color: '#e30613',
            fontSize: '14px',
            marginBottom: '20px',
            fontFamily: 'ING Me, Arial, sans-serif'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile}
          style={{
            backgroundColor: selectedFile ? '#ff6200' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: selectedFile ? 'pointer' : 'not-allowed',
            fontFamily: 'ING Me, Arial, sans-serif',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: selectedFile ? '2px 2px 4px rgba(0, 0, 0, 0.15)' : 'none',
            width: '100%',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (selectedFile) {
              e.currentTarget.style.backgroundColor = '#e55800';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0, 0, 0, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedFile) {
              e.currentTarget.style.backgroundColor = '#ff6200';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.15)';
            }
          }}
        >
          QR-Code analysieren
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </form>
      </div>
    </div>
  );
};

export default QRUploadForm;
