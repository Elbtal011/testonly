import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image, X, Loader, AlertCircle, Check } from 'lucide-react';

interface ImageUploadProps {
  currentUrl?: string;
  onImageUpload: (url: string) => void;
  onUrlChange: (url: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentUrl,
  onImageUpload,
  onUrlChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Nur Bilddateien sind erlaubt (JPEG, PNG, GIF, WebP, SVG)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Datei ist zu groß. Maximum: 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload fehlgeschlagen');
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        onImageUpload(data.url);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        throw new Error('Ungültige Server-Antwort');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Bild-URL
        </label>
        <input
          type="url"
          value={currentUrl || ''}
          onChange={(e) => onUrlChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="https://example.com/image.jpg oder /images/mein-bild.png"
        />
      </div>

      {/* Upload Section */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Oder Bild hochladen
        </label>
        
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
            ${dragActive 
              ? 'border-red-400 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <>
                <Loader className="w-8 h-8 text-red-500 animate-spin" />
                <p className="text-sm text-gray-600">Wird hochgeladen...</p>
              </>
            ) : uploadSuccess ? (
              <>
                <Check className="w-8 h-8 text-green-500" />
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <p className="text-sm text-green-600 font-medium">Erfolgreich hochgeladen!</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                  {dragActive ? (
                    <Upload className="w-6 h-6 text-red-500" />
                  ) : (
                    <Image className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {dragActive ? 'Datei hier ablegen' : 'Klicken oder Datei hierher ziehen'}
                  </p>
                  <p className="text-xs text-gray-500">
                    JPEG, PNG, GIF, WebP, SVG (max. 10MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="mt-2 flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">{uploadError}</span>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {currentUrl && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Vorschau
          </label>
          <div className="relative inline-block">
            <img
              src={currentUrl}
              alt="Preview"
              className="max-w-full h-auto max-h-32 rounded-lg border border-gray-200 shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <button
              onClick={() => onUrlChange('')}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Bild entfernen"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>💡 Tipp:</strong> Für beste E-Mail-Kompatibilität:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Verwenden Sie JPEG oder PNG</li>
          <li>Optimale Breite: 600px oder weniger</li>
          <li>Dateigröße unter 1MB für schnelles Laden</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;
