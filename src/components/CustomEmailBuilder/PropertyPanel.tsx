import React from 'react';
import { Settings, Palette, Type, Link, Plus, Minus, Columns, MousePointer, AlertTriangle } from 'lucide-react';
import { EmailComponent } from './EmailBuilder';
import { BankBranding } from '../../constants/bankEmailBranding';
import { ImageUpload } from './ImageUpload';

interface PropertyPanelProps {
  selectedComponent: EmailComponent | null;
  onUpdateComponent: (id: string, updates: Partial<EmailComponent>) => void;
  onAddColumn?: (columnsId: string) => void;
  onRemoveColumn?: (columnsId: string, columnId: string) => void;
  onAddComponent?: (type: EmailComponent['type'], parentId?: string) => void;
  bankBranding?: BankBranding;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedComponent,
  onUpdateComponent,
  onAddColumn,
  onRemoveColumn,
  onAddComponent,
  bankBranding
}) => {
  if (!selectedComponent) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Eigenschaften</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Wählen Sie eine Komponente aus, um deren Eigenschaften zu bearbeiten.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const updateProp = (key: string, value: any) => {
    onUpdateComponent(selectedComponent.id, {
      props: { ...selectedComponent.props, [key]: value }
    });
  };

  const updateContent = (content: string) => {
    onUpdateComponent(selectedComponent.id, { content });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Eigenschaften</h2>
        <p className="text-sm text-gray-600">
          {selectedComponent.type} - {selectedComponent.id}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Component-Specific Content Editors */}
        {selectedComponent.type === 'header' && (
          <div>
            <div className="flex items-center mb-3">
              <Type className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Header-Inhalt</h3>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Header-Text
              </label>
              <input
                type="text"
                value={selectedComponent.content || ''}
                onChange={(e) => updateContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Bank-Name - Wichtige Mitteilung"
              />
            </div>
          </div>
        )}

        {selectedComponent.type === 'text' && (
          <div>
            <div className="flex items-center mb-3">
              <Type className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Text-Inhalt</h3>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Text-Inhalt
              </label>
              <textarea
                value={selectedComponent.content || ''}
                onChange={(e) => updateContent(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Sehr geehrte/r {{firstName}} {{lastName}}..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Verwenden Sie {`{{firstName}}`}, {`{{lastName}}`}, {`{{email}}`}, etc. für Personalisierung
              </p>
            </div>
          </div>
        )}

        {selectedComponent.type === 'button' && (
          <div>
            <div className="flex items-center mb-3">
              <MousePointer className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Button-Inhalt</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Button-Text
                </label>
                <input
                  type="text"
                  value={selectedComponent.content || ''}
                  onChange={(e) => updateContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Jetzt handeln"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Link-URL
                </label>
                <input
                  type="url"
                  value={selectedComponent.props.href || '#'}
                  onChange={(e) => updateProp('href', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="https://example.com/action"
                />
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'alert' && (
          <div>
            <div className="flex items-center mb-3">
              <AlertTriangle className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Alert-Inhalt</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alert-Titel
                </label>
                <input
                  type="text"
                  value={selectedComponent.content?.split('\n')[0] || ''}
                  onChange={(e) => {
                    const lines = selectedComponent.content?.split('\n') || ['', ''];
                    lines[0] = e.target.value;
                    updateContent(lines.join('\n'));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="WICHTIGE SICHERHEITSBENACHRICHTIGUNG"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alert-Nachricht
                </label>
                <textarea
                  value={selectedComponent.content?.split('\n').slice(1).join('\n') || ''}
                  onChange={(e) => {
                    const title = selectedComponent.content?.split('\n')[0] || '';
                    updateContent(`${title}\n${e.target.value}`);
                  }}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Wir haben ungewöhnliche Aktivitäten in Ihrem Konto festgestellt..."
                />
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'table' && (
          <div>
            <div className="flex items-center mb-3">
              <Type className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Transaktions-Tabelle</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tabellen-Titel
                </label>
                <input
                  type="text"
                  value={selectedComponent.props.tableTitle || 'Transaktionsdetails'}
                  onChange={(e) => updateProp('tableTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Transaktionsdetails"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  Tabellen-Felder (verwenden Sie {{}} für Platzhalter):
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Datum Label:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.dateLabel || 'Datum:'}
                      onChange={(e) => updateProp('dateLabel', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="Datum:"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Datum Wert:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.dateValue || '{{date}}'}
                      onChange={(e) => updateProp('dateValue', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="{{date}}"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Betrag Label:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.amountLabel || 'Betrag:'}
                      onChange={(e) => updateProp('amountLabel', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="Betrag:"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Betrag Wert:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.amountValue || '{{amount}}'}
                      onChange={(e) => updateProp('amountValue', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="{{amount}}"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Konto Label:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.accountLabel || 'Konto:'}
                      onChange={(e) => updateProp('accountLabel', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="Konto:"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Konto Wert:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.accountValue || '{{accountNumber}}'}
                      onChange={(e) => updateProp('accountValue', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="{{accountNumber}}"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Referenz Label:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.referenceLabel || 'Referenz:'}
                      onChange={(e) => updateProp('referenceLabel', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="Referenz:"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Referenz Wert:</label>
                    <input
                      type="text"
                      value={selectedComponent.props.referenceValue || '{{transactionId}}'}
                      onChange={(e) => updateProp('referenceValue', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="{{transactionId}}"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'footer' && (
          <div>
            <div className="flex items-center mb-3">
              <Type className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Footer-Inhalt</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Kundenservice-Titel
                </label>
                <input
                  type="text"
                  value={selectedComponent.content?.split('\n')[0] || ''}
                  onChange={(e) => {
                    const lines = selectedComponent.content?.split('\n') || ['', '', ''];
                    lines[0] = e.target.value;
                    updateContent(lines.join('\n'));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Bank Kundenservice"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Kontakt-Informationen
                </label>
                <textarea
                  value={selectedComponent.content?.split('\n').slice(1).join('\n') || ''}
                  onChange={(e) => {
                    const title = selectedComponent.content?.split('\n')[0] || '';
                    updateContent(`${title}\n${e.target.value}`);
                  }}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Telefon: {{supportPhone}}&#10;E-Mail: {{supportEmail}}"
                />
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'image' && (
          <div>
            <div className="flex items-center mb-3">
              <Type className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Bild-Inhalt</h3>
            </div>
            <div className="space-y-4">
              <ImageUpload
                currentUrl={selectedComponent.props.src || selectedComponent.content || ''}
                onImageUpload={(url) => {
                  updateProp('src', url);
                  updateContent(url);
                }}
                onUrlChange={(url) => {
                  updateProp('src', url);
                  updateContent(url);
                }}
              />
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alt-Text (für Screenreader)
                </label>
                <input
                  type="text"
                  value={selectedComponent.props.alt || ''}
                  onChange={(e) => updateProp('alt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Beschreibung des Bildinhalts"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bildunterschrift (optional)
                </label>
                <input
                  type="text"
                  value={selectedComponent.props.caption || ''}
                  onChange={(e) => updateProp('caption', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Text unter dem Bild..."
                />
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'spacer' && (
          <div>
            <div className="flex items-center mb-3">
              <Type className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Spacer-Einstellungen</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Höhe (px)
                </label>
                <input
                  type="number"
                  value={selectedComponent.props.height?.replace('px', '') || '20'}
                  onChange={(e) => updateProp('height', `${e.target.value}px`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  min="1"
                  max="200"
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedComponent.props.showLine || false}
                    onChange={(e) => updateProp('showLine', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-xs text-gray-700">Trennlinie anzeigen</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Columns Management Section */}
        {selectedComponent.type === 'columns' && (
          <div>
            <div className="flex items-center mb-3">
              <Columns className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Spalten verwalten</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Aktuelle Spalten: {selectedComponent.children?.length || 0}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAddColumn?.(selectedComponent.id)}
                    className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    title="Spalte hinzufügen"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {(selectedComponent.children?.length || 0) > 1 && (
                    <button
                      onClick={() => {
                        const lastColumn = selectedComponent.children?.[selectedComponent.children.length - 1];
                        if (lastColumn) {
                          onRemoveColumn?.(selectedComponent.id, lastColumn.id);
                        }
                      }}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      title="Letzte Spalte entfernen"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {selectedComponent.children && selectedComponent.children.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Spalten-Übersicht:
                  </label>
                  {selectedComponent.children.map((column, index) => (
                    <div key={column.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                      <span className="text-xs text-gray-600">
                        Spalte {index + 1} ({column.children?.length || 0} Komponenten)
                      </span>
                      <button
                        onClick={() => onRemoveColumn?.(selectedComponent.id, column.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Diese Spalte entfernen"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (!selectedComponent.children || selectedComponent.children.length === 0) {
                      onAddColumn?.(selectedComponent.id);
                      setTimeout(() => onAddColumn?.(selectedComponent.id), 100);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                >
                      2-Spalten Layout erstellen
                </button>
                <button
                  onClick={() => {
                    if (!selectedComponent.children || selectedComponent.children.length === 0) {
                      onAddColumn?.(selectedComponent.id);
                      setTimeout(() => onAddColumn?.(selectedComponent.id), 100);
                      setTimeout(() => onAddColumn?.(selectedComponent.id), 200);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-colors"
                >
                      3-Spalten Layout erstellen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Styling Section */}
        <div>
          <div className="flex items-center mb-3">
            <Palette className="w-4 h-4 text-gray-500 mr-2" />
            <h3 className="text-sm font-semibold text-gray-700">Styling</h3>
          </div>
          
          <div className="space-y-4">
            {/* Background Color */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Hintergrundfarbe
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedComponent.props.backgroundColor || '#ffffff'}
                  onChange={(e) => updateProp('backgroundColor', e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedComponent.props.backgroundColor || '#ffffff'}
                  onChange={(e) => updateProp('backgroundColor', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Textfarbe
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedComponent.props.color || '#333333'}
                  onChange={(e) => updateProp('color', e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedComponent.props.color || '#333333'}
                  onChange={(e) => updateProp('color', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Schriftgröße
              </label>
              <select
                value={selectedComponent.props.fontSize || '16px'}
                onChange={(e) => updateProp('fontSize', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
                <option value="36px">36px</option>
                <option value="42px">42px</option>
              </select>
            </div>

            {/* Font Weight */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Schriftstärke
              </label>
              <select
                value={selectedComponent.props.fontWeight || 'normal'}
                onChange={(e) => updateProp('fontWeight', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="300">Light (300)</option>
                <option value="normal">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="bold">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
              </select>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Textausrichtung
              </label>
              <select
                value={selectedComponent.props.textAlign || 'left'}
                onChange={(e) => updateProp('textAlign', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="left">Links</option>
                <option value="center">Zentriert</option>
                <option value="right">Rechts</option>
                <option value="justify">Blocksatz</option>
              </select>
            </div>

            {/* Padding */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Innenabstand
              </label>
              <select
                value={selectedComponent.props.padding || '20px'}
                onChange={(e) => updateProp('padding', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="5px">Sehr klein (5px)</option>
                <option value="10px">Klein (10px)</option>
                <option value="15px">Klein-Medium (15px)</option>
                <option value="20px">Normal (20px)</option>
                <option value="25px">Medium (25px)</option>
                <option value="30px">Groß (30px)</option>
                <option value="40px">Sehr groß (40px)</option>
                <option value="50px">Extra groß (50px)</option>
              </select>
            </div>

            {/* Margin */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Außenabstand
              </label>
              <select
                value={selectedComponent.props.margin || '20px 0'}
                onChange={(e) => updateProp('margin', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="0">Kein Abstand (0)</option>
                <option value="10px 0">Klein (10px)</option>
                <option value="20px 0">Normal (20px)</option>
                <option value="30px 0">Groß (30px)</option>
                <option value="40px 0">Sehr groß (40px)</option>
                <option value="20px">Rundherum (20px)</option>
                <option value="30px">Rundherum groß (30px)</option>
              </select>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ecken-Rundung
              </label>
              <select
                value={selectedComponent.props.borderRadius || '8px'}
                onChange={(e) => updateProp('borderRadius', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="0">Eckig (0px)</option>
                <option value="4px">Leicht rund (4px)</option>
                <option value="8px">Normal rund (8px)</option>
                <option value="12px">Rund (12px)</option>
                <option value="16px">Sehr rund (16px)</option>
                <option value="50%">Vollständig rund (50%)</option>
              </select>
            </div>

            {/* Box Shadow */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Schatten
              </label>
              <select
                value={selectedComponent.props.boxShadow || '0 2px 4px rgba(0,0,0,0.1)'}
                onChange={(e) => updateProp('boxShadow', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="none">Kein Schatten</option>
                <option value="0 1px 2px rgba(0,0,0,0.1)">Leicht</option>
                <option value="0 2px 4px rgba(0,0,0,0.1)">Normal</option>
                <option value="0 4px 6px rgba(0,0,0,0.1)">Mittel</option>
                <option value="0 8px 15px rgba(0,0,0,0.1)">Stark</option>
                <option value="0 10px 25px rgba(0,0,0,0.2)">Sehr stark</option>
              </select>
            </div>

            {/* Border */}
            {selectedComponent.type !== 'alert' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rahmen
                </label>
                <select
                  value={selectedComponent.props.border || 'none'}
                  onChange={(e) => updateProp('border', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="none">Kein Rahmen</option>
                  <option value="1px solid #e5e7eb">Dünn grau</option>
                  <option value="2px solid #d1d5db">Normal grau</option>
                  <option value="1px solid #dc2626">Dünn rot</option>
                  <option value="2px solid #dc2626">Normal rot</option>
                  <option value="1px solid #3b82f6">Dünn blau</option>
                  <option value="2px solid #3b82f6">Normal blau</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Button-specific properties */}
        {selectedComponent.type === 'button' && (
          <div>
            <div className="flex items-center mb-3">
              <MousePointer className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Button-Eigenschaften</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Button-Hintergrundfarbe
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedComponent.props.buttonBackgroundColor || selectedComponent.props.color || '#dc2626'}
                    onChange={(e) => updateProp('buttonBackgroundColor', e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedComponent.props.buttonBackgroundColor || selectedComponent.props.color || '#dc2626'}
                    onChange={(e) => updateProp('buttonBackgroundColor', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Button-Textfarbe
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedComponent.props.buttonTextColor || '#ffffff'}
                    onChange={(e) => updateProp('buttonTextColor', e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedComponent.props.buttonTextColor || '#ffffff'}
                    onChange={(e) => updateProp('buttonTextColor', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Button-Innenabstand
                </label>
                <select
                  value={selectedComponent.props.buttonPadding || '16px 32px'}
                  onChange={(e) => updateProp('buttonPadding', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="8px 16px">Klein (8px 16px)</option>
                  <option value="12px 24px">Medium (12px 24px)</option>
                  <option value="16px 32px">Normal (16px 32px)</option>
                  <option value="20px 40px">Groß (20px 40px)</option>
                  <option value="24px 48px">Sehr groß (24px 48px)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Link-URL
                </label>
                <input
                  type="url"
                  value={selectedComponent.props.href || '#'}
                  onChange={(e) => updateProp('href', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Alert-specific properties */}
        {selectedComponent.type === 'alert' && (
          <div>
            <div className="flex items-center mb-3">
              <AlertTriangle className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">Alert-Eigenschaften</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rahmenfarbe
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedComponent.props.borderColor || '#dc2626'}
                    onChange={(e) => updateProp('borderColor', e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedComponent.props.borderColor || '#dc2626'}
                    onChange={(e) => updateProp('borderColor', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rahmenbreite
                </label>
                <select
                  value={selectedComponent.props.borderWidth || '2px'}
                  onChange={(e) => updateProp('borderWidth', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="1px">Dünn (1px)</option>
                  <option value="2px">Normal (2px)</option>
                  <option value="3px">Dick (3px)</option>
                  <option value="4px">Sehr dick (4px)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rahmenart
                </label>
                <select
                  value={selectedComponent.props.borderStyle || 'solid'}
                  onChange={(e) => updateProp('borderStyle', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="solid">Durchgezogen</option>
                  <option value="dashed">Gestrichelt</option>
                  <option value="dotted">Gepunktet</option>
                  <option value="double">Doppelt</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bank Branding Quick Actions */}
        {bankBranding && (
          <div>
            <div className="flex items-center mb-3">
              <Palette className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-semibold text-gray-700">{bankBranding.displayName} Branding</h3>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => {
                  updateProp('backgroundColor', bankBranding.primaryColor);
                  updateProp('color', bankBranding.buttonStyle.textColor);
                }}
                className="w-full px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Primärfarbe anwenden
              </button>
              
              <button
                onClick={() => {
                  updateProp('backgroundColor', bankBranding.headerStyle.backgroundColor);
                  updateProp('color', bankBranding.headerStyle.textColor);
                }}
                className="w-full px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Header-Stil anwenden
              </button>
              
              <button
                onClick={() => {
                  // Reset to bank default styling based on component type
                  if (selectedComponent.type === 'header') {
                    updateProp('backgroundColor', bankBranding.headerStyle.backgroundColor);
                    updateProp('color', bankBranding.headerStyle.textColor);
                    updateProp('fontFamily', bankBranding.fonts[0] + ', Arial, sans-serif');
                    updateProp('fontSize', '28px');
                    updateProp('fontWeight', 'bold');
                    updateProp('textAlign', 'center');
                    updateProp('padding', '40px 30px');
                  } else if (selectedComponent.type === 'button') {
                    updateProp('buttonBackgroundColor', bankBranding.buttonStyle.backgroundColor);
                    updateProp('color', bankBranding.buttonStyle.textColor);
                    updateProp('borderRadius', bankBranding.buttonStyle.borderRadius);
                    updateProp('fontFamily', bankBranding.fonts[0] + ', Arial, sans-serif');
                    updateProp('buttonFontWeight', 'bold');
                    updateProp('textAlign', 'center');
                  } else if (selectedComponent.type === 'text') {
                    updateProp('backgroundColor', bankBranding.backgroundColor || '#ffffff');
                    updateProp('color', bankBranding.textColor);
                    updateProp('fontFamily', bankBranding.fonts[0] + ', Arial, sans-serif');
                    updateProp('fontSize', '16px');
                    updateProp('fontWeight', 'normal');
                    updateProp('lineHeight', '1.6');
                  } else if (selectedComponent.type === 'alert') {
                    updateProp('backgroundColor', bankBranding.name === 'dkb' ? '#1a2633' : '#fff5f5');
                    updateProp('borderColor', bankBranding.primaryColor);
                    updateProp('color', bankBranding.name === 'dkb' ? bankBranding.textColor : bankBranding.primaryColor);
                    updateProp('borderWidth', '2px');
                    updateProp('borderStyle', 'solid');
                    updateProp('borderRadius', '8px');
                    updateProp('textAlign', 'center');
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors font-medium"
              >
                🔄 Auf Bank-Standard zurücksetzen
              </button>
              
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Primärfarbe:</strong> {bankBranding.primaryColor}<br />
                  <strong>Schriftarten:</strong> {bankBranding.fonts.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;