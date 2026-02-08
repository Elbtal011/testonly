import React from 'react';
import { Globe } from 'lucide-react';

interface TemplateGuardProps {
  templateName: string;
  children: React.ReactNode;
  isActive?: boolean;
}

// Neutral blocked page component - shown when template is deactivated
const BlockedTemplatePage: React.FC<{ templateName: string }> = ({ templateName }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Temporarily Unavailable</h1>
          <p className="text-gray-600">
            This service is currently under maintenance. Please try again later.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">What can you do?</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check back in a few minutes</li>
            <li>• Contact our support team</li>
            <li>• Visit our main website</li>
          </ul>
        </div>
        
        <div className="text-xs text-gray-400">
          Error Code: SERVICE_UNAVAILABLE
        </div>
      </div>
    </div>
  );
};

// Simple template guard that uses server-side rendered activation status
export const TemplateGuard: React.FC<TemplateGuardProps> = ({ templateName, children, isActive = true }) => {
  // If template is not active, show blocked page immediately
  if (!isActive) {
    return <BlockedTemplatePage templateName={templateName} />;
  }

  // Template is active, render the actual template immediately
  return <>{children}</>;
};

export default TemplateGuard;
