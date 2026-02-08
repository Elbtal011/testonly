import React from 'react';
import { 
  Type, 
  Image, 
  Square, 
  AlertTriangle, 
  MousePointer, 
  Table, 
  Minus,
  Building,
  Phone,
  Columns,
  LayoutDashboard
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { BankBranding } from '../../constants/bankEmailBranding';
import { EmailComponent } from './EmailBuilder';

interface ComponentToolbarProps {
  onAddComponent: (type: EmailComponent['type']) => void;
  bankBranding?: BankBranding;
}

export const ComponentToolbar: React.FC<ComponentToolbarProps> = ({
  onAddComponent,
  bankBranding
}) => {
  const layoutComponents = [
    {
      type: 'container' as const,
      label: 'Container',
      icon: Square,
      description: 'Inhalts-Wrapper-Bereich',
      color: 'bg-orange-500'
    },
    {
      type: 'columns' as const,
      label: 'Columns',
      icon: Columns,
      description: 'Mehrspalten-Layout',
      color: 'bg-teal-500'
    }
  ];

  const contentComponents = [
    {
      type: 'header' as const,
      label: 'Bank Header',
      icon: Building,
      description: 'Marken-Header mit Logo',
      color: 'bg-blue-500'
    },
    {
      type: 'alert' as const,
      label: 'Sicherheitsalarm',
      icon: AlertTriangle,
      description: 'Warnung/Sicherheitsmeldung',
      color: 'bg-red-500'
    },
    {
      type: 'text' as const,
      label: 'Textblock',
      icon: Type,
      description: 'Absatz-Textinhalt',
      color: 'bg-gray-500'
    },
    {
      type: 'button' as const,
      label: 'CTA-Button',
      icon: MousePointer,
      description: 'Call-to-Action-Button',
      color: 'bg-green-500'
    },
    {
      type: 'table' as const,
      label: 'Transaktions-Tabelle',
      icon: Table,
      description: 'Transaktionsdetails',
      color: 'bg-purple-500'
    },
    {
      type: 'image' as const,
      label: 'Bild',
      icon: Image,
      description: 'Bildblock',
      color: 'bg-indigo-500'
    },
    {
      type: 'spacer' as const,
      label: 'Abstandshalter',
      icon: Minus,
      description: 'Leerer Raum',
      color: 'bg-gray-400'
    },
    {
      type: 'footer' as const,
      label: 'Bank Footer',
      icon: Phone,
      description: 'Kontaktinformationen',
      color: 'bg-gray-600'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Komponenten</h2>
        {bankBranding && (
          <div className="flex items-center text-sm text-gray-600">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: bankBranding.primaryColor }}
            ></div>
            {bankBranding.displayName} Branding
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Layout Components Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Layout-Komponenten
          </h3>
          <div className="space-y-2">
            {layoutComponents.map((component) => {
              return (
                <DraggableComponent
                  key={component.type}
                  component={component}
                  onAddComponent={onAddComponent}
                />
              );
            })}
          </div>
        </div>

        {/* Content Components Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Type className="w-4 h-4 mr-2" />
            Inhalts-Komponenten
          </h3>
          <div className="space-y-2">
            {contentComponents.map((component) => {
              return (
                <DraggableComponent
                  key={component.type}
                  component={component}
                  onAddComponent={onAddComponent}
                />
              );
            })}
          </div>
        </div>
        
        {bankBranding && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              🎨 {bankBranding.displayName} Komponenten
            </h3>
            <p className="text-xs text-blue-700">
              Alle Komponenten werden automatisch mit {bankBranding.displayName} Branding (Farben, Schriften, Logo) erstellt.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Draggable component wrapper
interface DraggableComponentProps {
  component: {
    type: EmailComponent['type'];
    label: string;
    icon: any;
    description: string;
    color: string;
  };
  onAddComponent: (type: EmailComponent['type']) => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component, onAddComponent }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `toolbar-${component.type}`,
    data: {
      type: component.type,
      isToolbarItem: true
    }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = component.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group cursor-grab active:cursor-grabbing"
      onClick={() => onAddComponent(component.type)}
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${component.color} text-white mr-3 group-hover:scale-110 transition-transform`}>
          <Icon size={18} />
        </div>
        <div className="text-left">
          <div className="font-medium text-gray-900 text-sm">{component.label}</div>
          <div className="text-xs text-gray-500">{component.description}</div>
        </div>
      </div>
    </div>
  );
};

export default ComponentToolbar;
