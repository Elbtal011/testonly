import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { preloadCriticalImages } from '../utils/imagePreloader';

interface LoadingWithPreloadProps {
  onComplete?: () => void;
  showProgress?: boolean;
}

export const LoadingWithPreload: React.FC<LoadingWithPreloadProps> = ({ 
  onComplete, 
  showProgress = true 
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startPreloading = async () => {
      try {
        await preloadCriticalImages((loaded, total) => {
          const percentage = Math.round((loaded / total) * 100);
          setProgress(percentage);
        });
        
        setIsComplete(true);
        setTimeout(() => {
          onComplete?.();
        }, 500); // Small delay to show completion
        
      } catch (error) {
        console.error('Preloading error:', error);
        setIsComplete(true);
        onComplete?.();
      }
    };

    startPreloading();
  }, [onComplete]);

  if (!showProgress) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Loader className="h-12 w-12 text-pink-600 animate-spin mx-auto mb-4" />
          {isComplete && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isComplete ? 'Bereit!' : 'Lädt Ressourcen...'}
        </h2>
        
        {showProgress && !isComplete && (
          <div className="w-64 mx-auto">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-pink-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{progress}% geladen</p>
          </div>
        )}
        
        {isComplete && (
          <p className="text-sm text-green-600">Alle Ressourcen geladen ✓</p>
        )}
      </div>
    </div>
  );
};

export default LoadingWithPreload;
