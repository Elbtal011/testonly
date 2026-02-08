import { useEffect, useState } from 'react';

interface TemplateStatus {
  isActive: boolean;
  isChecking: boolean;
  error: string | null;
}

export const useTemplateAccess = (templateName: string): TemplateStatus => {
  const [status, setStatus] = useState<TemplateStatus>({
    isActive: true, // Assume active by default for immediate rendering
    isChecking: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const checkTemplateStatus = async () => {
      try {
        const response = await fetch(`/api/templates/check/${templateName}`, {
          method: 'GET',
          cache: 'no-cache'
        });
        
        if (!isMounted) return;

        if (!response.ok) {
          if (response.status === 404) {
            setStatus({ isActive: false, isChecking: false, error: null });
          } else {
            setStatus({ isActive: false, isChecking: false, error: `HTTP ${response.status}` });
          }
          return;
        }

        const data = await response.json();
        setStatus({
          isActive: data.template.is_active && data.template.exists,
          isChecking: false,
          error: null
        });

      } catch (err) {
        if (!isMounted) return;
        console.error('Template access check failed:', err);
        setStatus({
          isActive: false,
          isChecking: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    };

    // Check immediately but don't block rendering
    checkTemplateStatus();

    return () => {
      isMounted = false;
    };
  }, [templateName]);

  return status;
};
