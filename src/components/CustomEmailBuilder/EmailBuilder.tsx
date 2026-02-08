import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ComponentToolbar } from './ComponentToolbar';
import { EmailCanvas } from './EmailCanvas';
import { PropertyPanel } from './PropertyPanel';
import { BankBranding } from '../../constants/bankEmailBranding';
import { generateEmailCSS, getBankFontFamily } from '../../utils/bankFonts';

// Email validation utilities
const validateEmailTemplate = (components: EmailComponent[]): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  if (components.length === 0) {
    warnings.push('Template ist leer - fügen Sie mindestens eine Komponente hinzu');
  }
  
  const hasHeader = components.some(c => c.type === 'header');
  if (!hasHeader) {
    warnings.push('Empfehlung: Fügen Sie einen Header hinzu für professionelle Darstellung');
  }
  
  const hasButton = components.some(c => c.type === 'button');
  if (!hasButton) {
    warnings.push('Empfehlung: Fügen Sie einen Call-to-Action Button hinzu');
  }
  
  // Check for images without alt text
  components.forEach(comp => {
    if (comp.type === 'image' && !comp.props.alt) {
      warnings.push('Barrierefreiheit: Bild ohne Alt-Text gefunden');
    }
  });
  
  // Check for buttons without links
  components.forEach(comp => {
    if (comp.type === 'button' && (!comp.props.href || comp.props.href === '#')) {
      warnings.push('Button ohne gültigen Link gefunden');
    }
  });
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};

export interface EmailComponent {
  id: string;
  type: 'header' | 'text' | 'button' | 'image' | 'alert' | 'table' | 'footer' | 'spacer' | 'container' | 'columns' | 'column';
  props: Record<string, any>;
  content?: string;
  children?: EmailComponent[];
}

interface EmailBuilderProps {
  bankBranding?: BankBranding;
  onSave?: (components: EmailComponent[], html: string) => void;
  initialComponents?: EmailComponent[];
  height?: string;
}

export const EmailBuilder: React.FC<EmailBuilderProps> = ({
  bankBranding,
  onSave,
  initialComponents = [],
  height = '700px'
}) => {
  const [components, setComponents] = useState<EmailComponent[]>(initialComponents);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<EmailComponent | null>(null);

  // ✅ Sync internal components state with initialComponents prop changes (no flickering)
  useEffect(() => {
    setComponents(initialComponents);
  }, [initialComponents]);


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const addComponent = useCallback((type: EmailComponent['type'], parentId?: string) => {
    const newComponent: EmailComponent = {
      id: `${type}-${Date.now()}`,
      type,
      props: getDefaultProps(type, bankBranding),
      content: getDefaultContent(type, bankBranding),
      children: type === 'columns' ? [] : undefined
    };

    if (parentId) {
      // Add to parent component's children
      setComponents(prev => 
        prev.map(comp => {
          if (comp.id === parentId) {
            return {
              ...comp,
              children: [...(comp.children || []), newComponent]
            };
          }
          // Check nested children
          if (comp.children) {
            return {
              ...comp,
              children: comp.children.map(child => 
                child.id === parentId 
                  ? { ...child, children: [...(child.children || []), newComponent] }
                  : child
              )
            };
          }
          return comp;
        })
      );
    } else {
      // Add to top level
      setComponents(prev => [...prev, newComponent]);
    }
  }, [bankBranding]);

  const updateComponent = useCallback((id: string, updates: Partial<EmailComponent>) => {
    let updatedSelectedComponent: EmailComponent | null = null;

    const updateNestedComponent = (components: EmailComponent[]): EmailComponent[] => {
      return components.map(comp => {
        if (comp.id === id) {
          const updatedComp = { 
            ...comp, 
            ...updates,
            props: {
              ...comp.props,           // ✅ Preserve existing props
              ...(updates.props || {}) // ✅ Apply new props on top
            }
          };
          
          // ✅ Store updated component for selectedComponent sync
          if (selectedComponent?.id === id) {
            updatedSelectedComponent = updatedComp;
          }
          
          return updatedComp;
        }
        if (comp.children) {
          return {
            ...comp,
            children: updateNestedComponent(comp.children)
          };
        }
        return comp;
      });
    };

    setComponents(prev => {
      const updated = updateNestedComponent(prev);
      
      // ✅ Update selectedComponent after state update
      if (updatedSelectedComponent) {
        setTimeout(() => setSelectedComponent(updatedSelectedComponent), 0);
      }
      
      return updated;
    });
  }, [selectedComponent]);

  const deleteComponent = useCallback((id: string) => {
    const removeNestedComponent = (components: EmailComponent[]): EmailComponent[] => {
      return components
        .filter(comp => comp.id !== id)
        .map(comp => ({
          ...comp,
          children: comp.children ? removeNestedComponent(comp.children) : undefined
        }));
    };

    setComponents(prev => removeNestedComponent(prev));
    setSelectedComponent(null);
  }, []);

  const duplicateComponent = useCallback((id: string) => {
    const findAndDuplicateComponent = (components: EmailComponent[]): EmailComponent[] => {
      const result: EmailComponent[] = [];
      
      for (const comp of components) {
        result.push(comp);
        
        if (comp.id === id) {
          // Create duplicate with new ID
          const duplicate: EmailComponent = {
            ...comp,
            id: `${comp.type}-${Date.now()}`,
            children: comp.children ? duplicateChildren(comp.children) : undefined
          };
          result.push(duplicate);
        } else if (comp.children) {
          // Check nested children
          const updatedComp = {
            ...comp,
            children: findAndDuplicateComponent(comp.children)
          };
          result[result.length - 1] = updatedComp;
        }
      }
      
      return result;
    };

    const duplicateChildren = (children: EmailComponent[]): EmailComponent[] => {
      return children.map(child => ({
        ...child,
        id: `${child.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        children: child.children ? duplicateChildren(child.children) : undefined
      }));
    };

    setComponents(prev => findAndDuplicateComponent(prev));
  }, []);

  // Add column to columns component
  const addColumn = useCallback((columnsId: string) => {
    const newColumn: EmailComponent = {
      id: `column-${Date.now()}`,
      type: 'column',
      props: getDefaultProps('column', bankBranding),
      content: getDefaultContent('column', bankBranding),
      children: []
    };

    setComponents(prev => 
      prev.map(comp => {
        if (comp.id === columnsId && comp.type === 'columns') {
          return {
            ...comp,
            children: [...(comp.children || []), newColumn]
          };
        }
        return comp;
      })
    );
  }, [bankBranding]);

  // Remove column from columns component
  const removeColumn = useCallback((columnsId: string, columnId: string) => {
    setComponents(prev => 
      prev.map(comp => {
        if (comp.id === columnsId && comp.type === 'columns') {
          return {
            ...comp,
            children: (comp.children || []).filter(child => child.id !== columnId)
          };
        }
        return comp;
      })
    );
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle dropping new components from toolbar
    if (activeId.startsWith('toolbar-')) {
      const componentType = activeId.replace('toolbar-', '') as EmailComponent['type'];
      
      // Check if dropping into a container/column
      if (overId.startsWith('container-') || overId.startsWith('column-')) {
        const parentId = overId.replace('container-', '').replace('column-', '');
        addComponent(componentType, parentId);
      } else {
        // Add to top level
        addComponent(componentType);
      }
    } else {
      // Handle reordering existing components
      if (activeId !== overId) {
        setComponents((items) => {
          const oldIndex = items.findIndex((item) => item.id === activeId);
          const newIndex = items.findIndex((item) => item.id === overId);

          if (oldIndex !== -1 && newIndex !== -1) {
            return arrayMove(items, oldIndex, newIndex);
          }
          return items;
        });
      }
    }

    setActiveId(null);
  }, [addComponent]);

  const generateHtml = useCallback(() => {
    const emailCSS = generateEmailCSS(bankBranding?.name);
    
    const emailHtml = `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>{{subject}}</title>
    
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    
    <style>
        ${emailCSS}
    </style>
</head>
<body>
    <div class="email-container">
        ${components.map(comp => renderComponentToHtml(comp, bankBranding)).join('')}
    </div>
</body>
</html>`;

    return emailHtml;
  }, [components, bankBranding]);

  const handleSave = useCallback(() => {
    const html = generateHtml();
    onSave?.(components, html);
  }, [components, generateHtml, onSave]);

  return (
    <div className="flex h-full bg-gray-50" style={{ height }}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Component Toolbar */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <ComponentToolbar 
            onAddComponent={addComponent}
            bankBranding={bankBranding}
          />
        </div>

        {/* Email Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  Custom Email Builder - {bankBranding?.displayName || 'Universal'}
                </span>
              </div>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                HTML generieren
              </button>
            </div>
            
            {/* Validation Status */}
            {(() => {
              const validation = validateEmailTemplate(components);
              if (validation.warnings.length > 0) {
                return (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="font-medium text-yellow-800 mb-1">⚠️ Qualitätshinweise:</div>
                    <ul className="text-yellow-700 space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                );
              }
              return null;
            })()}
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <EmailCanvas
                components={components}
                onSelectComponent={setSelectedComponent}
                onDeleteComponent={deleteComponent}
                onDuplicateComponent={duplicateComponent}
                bankBranding={bankBranding}
              />
            </SortableContext>
          </div>
        </div>

        {/* Property Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0">
          <PropertyPanel
            selectedComponent={selectedComponent}
            onUpdateComponent={updateComponent}
            onAddColumn={addColumn}
            onRemoveColumn={removeColumn}
            onAddComponent={addComponent}
            bankBranding={bankBranding}
          />
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
              Dragging component...
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

// Helper functions
const getDefaultProps = (type: EmailComponent['type'], branding?: BankBranding) => {
  const baseProps = {
    backgroundColor: '#ffffff',
    padding: '20px',
    textAlign: 'left' as const,
    fontSize: '16px',
    color: branding?.textColor || '#333333',
    fontFamily: branding ? getBankFontFamily(branding.name) : 'Arial, sans-serif'
  };

  switch (type) {
    case 'header':
      return {
        ...baseProps,
        backgroundColor: branding?.headerStyle.backgroundColor || '#dc2626',
        color: branding?.headerStyle.textColor || '#ffffff',
        textAlign: 'center' as const,
        fontSize: '32px',
        fontWeight: 'bold',
        padding: '40px 30px',
        fontFamily: branding ? getBankFontFamily(branding.name) : 'Arial, sans-serif'
      };
    case 'button':
      return {
        ...baseProps,
        backgroundColor: '#ffffff',
        color: branding?.buttonStyle.textColor || '#ffffff',
        textAlign: 'center' as const,
        borderRadius: branding?.buttonStyle.borderRadius || '6px',
        padding: '20px 30px',
        href: '#action',
        // Button-specific styling
        buttonBackgroundColor: branding?.buttonStyle.backgroundColor || '#dc2626',
        buttonPadding: '16px 32px',
        buttonFontWeight: 'bold',
        buttonFontSize: '16px',
        // Add shadow for professional look
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      };
    case 'alert':
      return {
        ...baseProps,
        backgroundColor: '#fff5f5',
        borderColor: '#ef4444',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '8px',
        textAlign: 'center' as const,
        padding: '25px',
        margin: '25px 0',
        // Add subtle shadow
        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)'
      };
    case 'table':
      return {
        ...baseProps,
        backgroundColor: '#f8f9fa',
        padding: '20px',
        margin: '20px 0',
        borderRadius: '8px',
        borderLeft: `4px solid ${branding?.primaryColor || '#dc2626'}`,
        // Professional table styling
        borderColor: branding?.primaryColor || '#dc2626'
      };
    case 'image':
      return {
        ...baseProps,
        backgroundColor: '#ffffff',
        padding: '20px',
        textAlign: 'center' as const,
        margin: '20px 0',
        src: '/images/placeholder-image.svg',
        alt: 'Email Image',
        borderRadius: '8px',
        border: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        caption: ''
      };
    case 'spacer':
      return {
        height: '20px',
        showLine: false
      };
    case 'container':
      return {
        ...baseProps,
        backgroundColor: '#ffffff',
        padding: '30px 20px',
        margin: '20px 0',
        borderRadius: '8px',
        border: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '600px'
      };
    case 'columns':
      return {
        ...baseProps,
        backgroundColor: 'transparent',
        padding: '0',
        margin: '20px 0',
        gap: '20px',
        columnCount: 2,
        distribution: 'equal' // 'equal', 'custom'
      };
    case 'column':
      return {
        ...baseProps,
        backgroundColor: '#ffffff',
        padding: '20px',
        flex: '1',
        minWidth: '200px'
      };
    case 'footer':
      return {
        ...baseProps,
        backgroundColor: '#f8f9fa',
        color: '#666666',
        textAlign: 'center' as const,
        fontSize: '14px',
        padding: '30px 20px',
        borderTop: `3px solid ${branding?.primaryColor || '#dc2626'}`,
        // Footer styling
        borderTopColor: branding?.primaryColor || '#dc2626'
      };
    default:
      return baseProps;
  }
};

const getDefaultContent = (type: EmailComponent['type'], branding?: BankBranding) => {
  switch (type) {
    case 'header':
      return `${branding?.displayName || 'Bank'} - Wichtige Mitteilung`;
    case 'text':
      return 'Sehr geehrte/r {{firstName}} {{lastName}},\n\nDies ist eine wichtige Mitteilung bezüglich Ihres Kontos.';
    case 'button':
      return 'Jetzt handeln';
    case 'alert':
      return 'WICHTIGE SICHERHEITSBENACHRICHTIGUNG\n\nWir haben ungewöhnliche Aktivitäten in Ihrem Konto festgestellt.';
    case 'image':
      return '/images/placeholder-image.svg';
    case 'spacer':
      return '';
    case 'container':
      return 'Container-Bereich';
    case 'columns':
      return 'Spalten-Layout';
    case 'column':
      return 'Spalte';
    case 'footer':
      return `${branding?.displayName || 'Bank'} Kundenservice\nTelefon: ${branding?.supportPhone || 'N/A'}\nE-Mail: ${branding?.supportEmail || 'N/A'}`;
    default:
      return 'Neuer Inhalt';
  }
};

const renderComponentToHtml = (component: EmailComponent, branding?: BankBranding): string => {
  const { type, props, content } = component;
  
  switch (type) {
    case 'header':
      return `
        <div class="component bank-header" style="
          background: ${props.backgroundImage || props.backgroundColor}; 
          color: ${props.color}; 
          padding: ${props.padding}; 
          text-align: ${props.textAlign}; 
          font-family: ${props.fontFamily};
          border-radius: 8px 8px 0 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          <h1 style="margin: 0; color: inherit; font-size: ${props.fontSize}; font-weight: ${props.fontWeight}; line-height: 1.2;">
            ${content}
          </h1>
        </div>
      `;
    case 'text':
      return `
        <div class="component text-block" style="
          background-color: ${props.backgroundColor}; 
          color: ${props.color}; 
          padding: ${props.padding}; 
          text-align: ${props.textAlign}; 
          font-size: ${props.fontSize};
          font-weight: ${props.fontWeight};
          font-family: ${props.fontFamily};
          line-height: 1.6;
          margin: ${props.margin};
          border-radius: ${props.borderRadius};
          border: ${props.border};
          box-shadow: ${props.boxShadow};
        ">
          <p style="margin: 0; line-height: 1.6; color: inherit; font-size: inherit; font-weight: inherit; font-family: inherit;">
            ${content?.replace(/\n/g, '<br>')}
          </p>
        </div>
      `;
    case 'button':
      return `
        <div class="component button-container" style="
          background-color: ${props.backgroundColor}; 
          padding: ${props.padding}; 
          text-align: ${props.textAlign};
          margin: ${props.margin};
        ">
          <a href="${props.href || '#'}" class="cta-button" style="
            display: inline-block; 
            background-color: ${props.buttonBackgroundColor || props.color || '#dc2626'}; 
            color: ${props.buttonTextColor || '#ffffff'}; 
            padding: ${props.buttonPadding || props.padding || '16px 32px'}; 
            text-decoration: none; 
            border-radius: ${props.borderRadius || '8px'}; 
            font-weight: ${props.buttonFontWeight || props.fontWeight || 'bold'};
            font-size: ${props.buttonFontSize || props.fontSize || '16px'};
            font-family: ${props.fontFamily};
            box-shadow: ${props.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)'};
            border: ${props.border || 'none'};
            transition: all 0.3s ease;
            cursor: pointer;
          ">
            ${content}
          </a>
        </div>
      `;
    case 'alert':
      return `
        <div class="component security-alert" style="
          background-color: ${props.backgroundColor}; 
          border: ${props.borderWidth} ${props.borderStyle} ${props.borderColor}; 
          border-radius: ${props.borderRadius}; 
          padding: ${props.padding}; 
          text-align: ${props.textAlign}; 
          margin: ${props.margin};
          box-shadow: ${props.boxShadow};
          font-family: ${props.fontFamily};
        ">
          <div style="color: #dc2626; font-weight: bold; font-size: 18px; margin-bottom: 10px;">
            ${content?.split('\n')[0]}
          </div>
          <div style="color: #333; font-size: 16px; line-height: 1.5;">
            ${content?.split('\n').slice(1).join('<br>')}
          </div>
        </div>
      `;
    case 'table':
      return `
        <div class="component transaction-table" style="
          background-color: ${props.backgroundColor || '#f8f9fa'}; 
          padding: ${props.padding || '20px'}; 
          margin: ${props.margin || '20px 0'}; 
          border-radius: ${props.borderRadius || '8px'}; 
          border-left: 4px solid ${props.borderColor || '#dc2626'};
          font-family: ${props.fontFamily};
          box-shadow: ${props.boxShadow || '0 1px 3px rgba(0,0,0,0.1)'};
        ">
          <h3 style="margin: 0 0 15px 0; color: ${props.borderColor || '#dc2626'}; font-size: ${props.fontSize || '18px'}; font-weight: bold; font-family: inherit;">
            ${props.tableTitle || 'Transaktionsdetails'}
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; font-family: inherit;">
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">${props.dateLabel || 'Datum:'}</td>
                <td style="padding: 12px 0; color: #dc2626; font-weight: bold;">${props.dateValue || '{{date}}'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">${props.amountLabel || 'Betrag:'}</td>
                <td style="padding: 12px 0; color: #dc2626; font-weight: bold; font-size: 16px;">${props.amountValue || '{{amount}}'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">${props.accountLabel || 'Konto:'}</td>
                <td style="padding: 12px 0; color: #374151; font-family: monospace;">${props.accountValue || '{{accountNumber}}'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">${props.referenceLabel || 'Referenz:'}</td>
                <td style="padding: 12px 0; color: #374151; font-family: monospace;">${props.referenceValue || '{{transactionId}}'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    case 'footer':
      return `
        <div class="component bank-footer" style="
          background-color: ${props.backgroundColor}; 
          color: ${props.color}; 
          padding: ${props.padding}; 
          text-align: ${props.textAlign}; 
          font-size: ${props.fontSize};
          border-top: ${props.borderTop};
          font-family: ${props.fontFamily};
        ">
          <div style="font-weight: bold; margin-bottom: 15px; color: ${branding?.primaryColor || '#333'}; font-size: 16px;">
            ${content?.split('\n')[0]}
          </div>
          <div style="font-size: 12px; line-height: 1.4; color: #666;">
            ${content?.split('\n').slice(1).join('<br>')}
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999;">
            Diese E-Mail wurde an {{email}} gesendet.
          </div>
        </div>
      `;
    case 'image':
      return `
        <div class="component image-block" style="
          background-color: ${props.backgroundColor}; 
          padding: ${props.padding}; 
          text-align: ${props.textAlign}; 
          margin: ${props.margin || '20px 0'};
        ">
          <img 
            src="${props.src || content || '/images/placeholder-image.svg'}" 
            alt="${props.alt || 'Email Image'}"
            style="
              max-width: 100%; 
              height: auto; 
              border-radius: ${props.borderRadius || '8px'}; 
              border: ${props.border || 'none'}; 
              box-shadow: ${props.boxShadow || '0 2px 4px rgba(0,0,0,0.1)'}; 
              display: block; 
              margin: 0 auto;
            "
          />
          ${props.caption ? `
            <div style="
              font-size: 14px; 
              color: #666; 
              text-align: center; 
              margin-top: 10px; 
              font-style: italic;
              font-family: ${props.fontFamily};
            ">
              ${props.caption}
            </div>
          ` : ''}
        </div>
      `;
    case 'spacer':
      return `
        <div class="component spacer" style="
          height: ${props.height || '20px'}; 
          line-height: 1; 
          background-color: transparent;
          ${props.showLine ? 'border-top: 1px solid #e5e7eb;' : ''}
        "></div>
      `;
    case 'container':
      const containerChildren = component.children?.map(child => renderComponentToHtml(child, branding)).join('') || '';
      return `
        <div class="component email-container" style="
          background-color: ${props.backgroundColor}; 
          padding: ${props.padding}; 
          margin: ${props.margin}; 
          border-radius: ${props.borderRadius}; 
          border: ${props.border}; 
          box-shadow: ${props.boxShadow}; 
          max-width: ${props.maxWidth};
          font-family: ${props.fontFamily};
        ">
          ${containerChildren}
        </div>
      `;
    case 'columns':
      const columnsChildren = component.children?.map(child => renderComponentToHtml(child, branding)).join('') || '';
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="component columns-layout" style="
          background-color: ${props.backgroundColor}; 
          margin: ${props.margin};
        ">
          <tbody>
            <tr>
              ${columnsChildren}
            </tr>
          </tbody>
        </table>
      `;
    case 'column':
      const columnChildren = component.children?.map(child => renderComponentToHtml(child, branding)).join('') || '';
      return `
        <td class="component column" style="
          background-color: ${props.backgroundColor}; 
          padding: ${props.padding}; 
          vertical-align: top;
          width: ${props.width || 'auto'};
          min-width: ${props.minWidth};
          font-family: ${props.fontFamily};
        ">
          ${columnChildren}
        </td>
      `;
    default:
      return `
        <div class="component unknown-component" style="
          background-color: #f3f4f6; 
          padding: 20px; 
          text-align: center;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          color: #6b7280;
          margin: 10px 0;
        ">
          <div style="font-weight: bold;">Unbekannter Komponententyp: ${type}</div>
          <div style="font-size: 14px; margin-top: 5px;">${content}</div>
        </div>
      `;
  }
};

export default EmailBuilder;
