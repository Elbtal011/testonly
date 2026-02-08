import React from 'react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  useDroppable,
} from '@dnd-kit/core';
import {
  CSS,
} from '@dnd-kit/utilities';
import { Trash, Edit, GripVertical, Type, Building, AlertTriangle, MousePointer, Phone, Copy } from 'lucide-react';
import { EmailComponent } from './EmailBuilder';
import { BankBranding } from '../../constants/bankEmailBranding';

interface EmailCanvasProps {
  components: EmailComponent[];
  onSelectComponent: (component: EmailComponent) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent?: (id: string) => void;
  bankBranding?: BankBranding;
}

interface SortableComponentProps {
  component: EmailComponent;
  onSelect: (component: EmailComponent) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  bankBranding?: BankBranding;
}

const SortableComponent: React.FC<SortableComponentProps> = ({
  component,
  onSelect,
  onDelete,
  onDuplicate,
  bankBranding
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Helper function to render child components (simplified version without drag/drop)
  const renderChildComponent = (childComponent: EmailComponent) => {
    switch (childComponent.type) {
      case 'header':
        return (
          <div style={{
            background: childComponent.props.backgroundImage || childComponent.props.backgroundColor,
            color: childComponent.props.color,
            padding: childComponent.props.padding,
            textAlign: childComponent.props.textAlign,
            fontSize: childComponent.props.fontSize,
            fontWeight: childComponent.props.fontWeight,
            fontFamily: childComponent.props.fontFamily,
            borderRadius: '8px 8px 0 0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ margin: 0, color: 'inherit', fontSize: 'inherit', lineHeight: 1.2 }}>
              {childComponent.content}
            </h1>
          </div>
        );
      case 'text':
        return (
          <div style={{
            backgroundColor: childComponent.props.backgroundColor,
            color: childComponent.props.color,
            padding: childComponent.props.padding,
            textAlign: childComponent.props.textAlign,
            fontSize: childComponent.props.fontSize
          }}>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              {childComponent.content?.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < (childComponent.content?.split('\n').length || 0) - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>
        );
      case 'button':
        return (
          <div style={{
            backgroundColor: childComponent.props.backgroundColor,
            padding: childComponent.props.padding,
            textAlign: childComponent.props.textAlign
          }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: childComponent.props.buttonBackgroundColor || childComponent.props.backgroundColor,
              color: childComponent.props.color,
              padding: childComponent.props.buttonPadding || '16px 32px',
              textDecoration: 'none',
              borderRadius: childComponent.props.borderRadius,
              fontWeight: childComponent.props.buttonFontWeight || 'bold',
              fontSize: childComponent.props.buttonFontSize || '16px',
              fontFamily: childComponent.props.fontFamily,
              boxShadow: childComponent.props.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer'
            }}>
              {childComponent.content}
            </div>
          </div>
        );
      case 'image':
        return (
          <div style={{
            backgroundColor: childComponent.props.backgroundColor,
            padding: childComponent.props.padding,
            textAlign: childComponent.props.textAlign,
            margin: childComponent.props.margin || '20px 0'
          }}>
            <img
              src={childComponent.props.src || childComponent.content || '/images/placeholder-image.svg'}
              alt={childComponent.props.alt || 'Email Image'}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: childComponent.props.borderRadius || '8px',
                border: childComponent.props.border || 'none',
                boxShadow: childComponent.props.boxShadow || '0 2px 4px rgba(0,0,0,0.1)',
                display: 'block',
                margin: '0 auto'
              }}
            />
            {childComponent.props.caption && (
              <div style={{
                fontSize: '14px',
                color: '#666',
                textAlign: 'center',
                marginTop: '10px',
                fontStyle: 'italic'
              }}>
                {childComponent.props.caption}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px', color: '#6b7280' }}>
            {childComponent.type}: {childComponent.content}
          </div>
        );
    }
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'header':
        return (
          <div 
            style={{
              background: component.props.backgroundImage || component.props.backgroundColor,
              color: component.props.color,
              padding: component.props.padding,
              textAlign: component.props.textAlign,
              fontSize: component.props.fontSize,
              fontWeight: component.props.fontWeight,
              fontFamily: component.props.fontFamily,
              borderRadius: '8px 8px 0 0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h1 style={{ margin: 0, color: 'inherit', fontSize: 'inherit', lineHeight: 1.2 }}>
              {component.content}
            </h1>
          </div>
        );
      
      case 'text':
        return (
          <div 
            style={{
              backgroundColor: component.props.backgroundColor,
              color: component.props.color,
              padding: component.props.padding,
              textAlign: component.props.textAlign,
              fontSize: component.props.fontSize
            }}
          >
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              {component.content?.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < (component.content?.split('\n').length || 0) - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>
        );
      
      case 'button':
        return (
          <div 
            style={{
              backgroundColor: component.props.backgroundColor,
              padding: component.props.padding,
              textAlign: component.props.textAlign
            }}
          >
            <div
              style={{
                display: 'inline-block',
                backgroundColor: component.props.buttonBackgroundColor || component.props.backgroundColor,
                color: component.props.color,
                padding: component.props.buttonPadding || '16px 32px',
                textDecoration: 'none',
                borderRadius: component.props.borderRadius,
                fontWeight: component.props.buttonFontWeight || 'bold',
                fontSize: component.props.buttonFontSize || '16px',
                fontFamily: component.props.fontFamily,
                boxShadow: component.props.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {component.content}
            </div>
          </div>
        );
      
      case 'alert':
        return (
          <div 
            style={{
              backgroundColor: component.props.backgroundColor,
              border: `${component.props.borderWidth} ${component.props.borderStyle} ${component.props.borderColor}`,
              borderRadius: component.props.borderRadius,
              padding: component.props.padding,
              textAlign: component.props.textAlign,
              margin: component.props.margin || '20px 0',
              boxShadow: component.props.boxShadow || '0 2px 4px rgba(239, 68, 68, 0.1)',
              fontFamily: component.props.fontFamily
            }}
          >
            <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>
              {component.content?.split('\n')[0]}
            </div>
            <div style={{ color: '#333', fontSize: '16px', lineHeight: 1.5 }}>
              {component.content?.split('\n').slice(1).map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < (component.content?.split('\n').slice(1).length || 0) - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', margin: '20px 0', borderRadius: '8px', borderLeft: `4px solid ${bankBranding?.primaryColor || '#dc2626'}` }}>
            <h3 style={{ margin: '0 0 15px 0', color: bankBranding?.primaryColor || '#dc2626', fontSize: '18px' }}>Transaktionsdetails</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Datum:</td>
                <td style={{ padding: '8px 0', color: '#dc2626' }}>{'{{date}}'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Betrag:</td>
                <td style={{ padding: '8px 0', color: '#dc2626', fontWeight: 'bold' }}>{'{{amount}}'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Konto:</td>
                <td style={{ padding: '8px 0', color: '#374151' }}>{'{{accountNumber}}'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Referenz:</td>
                <td style={{ padding: '8px 0', color: '#374151' }}>{'{{transactionId}}'}</td>
              </tr>
            </table>
          </div>
        );
      
      case 'footer':
        return (
          <div style={{ backgroundColor: '#f8f9fa', color: '#666666', padding: '30px 20px', textAlign: 'center', fontSize: '14px', borderTop: `3px solid ${bankBranding?.primaryColor || '#dc2626'}` }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{component.content?.split('\n')[0]}</div>
            <div style={{ fontSize: '12px' }}>{component.content?.split('\n').slice(1).join('<br>')}</div>
          </div>
        );
      
      case 'image':
        return (
          <div 
            style={{
              backgroundColor: component.props.backgroundColor,
              padding: component.props.padding,
              textAlign: component.props.textAlign,
              margin: component.props.margin || '20px 0'
            }}
          >
            <img
              src={component.props.src || component.content || '/images/placeholder-image.svg'}
              alt={component.props.alt || 'Email Image'}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: component.props.borderRadius || '8px',
                border: component.props.border || 'none',
                boxShadow: component.props.boxShadow || '0 2px 4px rgba(0,0,0,0.1)',
                display: 'block',
                margin: '0 auto'
              }}
            />
            {component.props.caption && (
              <div style={{
                fontSize: '14px',
                color: '#666',
                textAlign: 'center',
                marginTop: '10px',
                fontStyle: 'italic'
              }}>
                {component.props.caption}
              </div>
            )}
          </div>
        );
      
      case 'spacer':
        return (
          <div 
            style={{
              height: component.props.height || '20px',
              backgroundColor: 'transparent',
              borderTop: component.props.showLine ? '1px solid #e5e7eb' : 'none'
            }}
          />
        );
      
      case 'container':
        return (
          <DroppableZone 
            containerId={component.id} 
            type="container" 
            component={component}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        );
      
      case 'columns':
        return (
          <ColumnsLayout 
            component={component}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        );
      
      case 'column':
        return (
          <div 
            style={{
              backgroundColor: component.props.backgroundColor,
              padding: component.props.padding,
              flex: component.props.flex,
              minWidth: component.props.minWidth,
              position: 'relative'
            }}
          >
            {/* Column content placeholder */}
            {(!component.children || component.children.length === 0) && (
              <div style={{
                padding: '30px 15px',
                textAlign: 'center',
                color: '#9ca3af',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Spalte</div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                  Inhalte hierher ziehen
                </div>
              </div>
            )}
            {/* Render child components */}
            {component.children?.map((child, index) => (
              <div key={child.id} style={{ marginBottom: index < component.children!.length - 1 ? '10px' : '0' }}>
                {renderChildComponent(child)}
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '20px', 
            textAlign: 'center',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            color: '#6b7280'
          }}>
            <div>Unbekannter Komponententyp: {component.type}</div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>{component.content}</div>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border border-transparent hover:border-blue-300 rounded-lg transition-all duration-200"
    >
      {/* Component Content */}
      <div className="min-h-[60px]">
        {renderComponent()}
      </div>
      
      {/* Hover Controls */}
      <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200">
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            {...attributes}
            {...listeners}
            className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            title="Verschieben"
          >
            <GripVertical size={14} className="text-gray-600" />
          </button>
          <button
            onClick={() => onSelect(component)}
            className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            title="Bearbeiten"
          >
            <Edit size={14} className="text-gray-600" />
          </button>
          <button
            onClick={() => onDuplicate?.(component.id)}
            className="p-1 bg-white border border-blue-300 rounded shadow-sm hover:bg-blue-50"
            title="Duplizieren"
          >
            <Copy size={14} className="text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(component.id)}
            className="p-1 bg-white border border-red-300 rounded shadow-sm hover:bg-red-50"
            title="Löschen"
          >
            <Trash size={14} className="text-red-600" />
          </button>
        </div>
      </div>
      
      {/* Component Label */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
          {component.type}
        </span>
      </div>
    </div>
  );
};

export const EmailCanvas: React.FC<EmailCanvasProps> = ({
  components,
  onSelectComponent,
  onDeleteComponent,
  onDuplicateComponent,
  bankBranding
}) => {
  if (components.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Type className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            E-Mail-Template erstellen
          </h3>
          <p className="text-gray-500 mb-4 max-w-sm">
            Ziehen Sie Komponenten aus der linken Toolbar hierher, um Ihr E-Mail-Template zu erstellen.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Building size={16} />
            <span>→</span>
            <AlertTriangle size={16} />
            <span>→</span>
            <MousePointer size={16} />
            <span>→</span>
            <Phone size={16} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              E-Mail Vorschau ({components.length} Komponenten)
            </span>
            <span className="text-xs text-gray-500">
              Max. Breite: 600px
            </span>
          </div>
        </div>
        
        <div className="p-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {components.map((component) => (
            <SortableComponent
              key={component.id}
              component={component}
              onSelect={onSelectComponent}
              onDelete={onDeleteComponent}
              onDuplicate={onDuplicateComponent}
              bankBranding={bankBranding}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Droppable zone for containers
interface DroppableZoneProps {
  containerId: string;
  type: 'container' | 'column';
  component: EmailComponent;
  onSelect?: (component: EmailComponent) => void;
  onDelete?: (id: string) => void;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({ containerId, type, component, onSelect, onDelete }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `${type}-${containerId}`,
    data: {
      accepts: ['header', 'text', 'button', 'image', 'alert', 'table', 'spacer'],
      containerId
    }
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: component.props.backgroundColor,
        padding: component.props.padding,
        margin: component.props.margin,
        borderRadius: component.props.borderRadius,
        border: isOver ? '2px dashed #3b82f6' : component.props.border,
        boxShadow: component.props.boxShadow,
        maxWidth: component.props.maxWidth,
        position: 'relative',
        minHeight: '100px',
        transition: 'all 0.2s ease'
      }}
      className={isOver ? 'bg-blue-50' : ''}
    >
      {/* Container content placeholder */}
      {(!component.children || component.children.length === 0) && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: isOver ? '#3b82f6' : '#9ca3af',
          border: isOver ? 'none' : '2px dashed #d1d5db',
          borderRadius: '8px',
          backgroundColor: isOver ? 'transparent' : '#f9fafb'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '500' }}>
            {isOver ? 'Hier ablegen' : 'Container'}
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            {isOver ? 'Komponente wird hinzugefügt' : 'Ziehen Sie Komponenten hierher'}
          </div>
        </div>
      )}
      {/* Render child components */}
      {component.children?.map((child, index) => (
        <div key={child.id} style={{ marginBottom: index < component.children!.length - 1 ? '10px' : '0' }}>
          <SimpleChildComponent 
            component={child} 
            onSelect={onSelect}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};

// Columns layout with droppable columns
interface ColumnsLayoutProps {
  component: EmailComponent;
  onSelect?: (component: EmailComponent) => void;
  onDelete?: (id: string) => void;
}

const ColumnsLayout: React.FC<ColumnsLayoutProps> = ({ component, onSelect, onDelete }) => {
  return (
    <div 
      style={{
        backgroundColor: component.props.backgroundColor,
        margin: component.props.margin,
        padding: component.props.padding || '0'
      }}
    >
      <div style={{
        display: 'flex',
        gap: component.props.gap || '20px',
        flexWrap: 'wrap'
      }}>
        {/* Render actual columns with drop zones */}
        {component.children && component.children.length > 0 ? (
          component.children.map((column, index) => (
            <DroppableColumn 
              key={column.id} 
              column={column} 
              index={index}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        ) : (
          // Show placeholder when no columns
          <div style={{
            width: '100%',
            padding: '40px 20px',
            textAlign: 'center',
            color: '#9ca3af',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Spalten-Layout</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              Wählen Sie diese Komponente aus und fügen Sie Spalten hinzu
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual droppable column
interface DroppableColumnProps {
  column: EmailComponent;
  index: number;
  onSelect?: (component: EmailComponent) => void;
  onDelete?: (id: string) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, index, onSelect, onDelete }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `column-${column.id}`,
    data: {
      accepts: ['header', 'text', 'button', 'image', 'alert', 'table', 'spacer'],
      columnId: column.id
    }
  });

  const hasContent = column.children && column.children.length > 0;

  return (
    <div 
      style={{
        flex: '1',
        minWidth: '200px',
        position: 'relative'
      }}
    >
      {/* Droppable overlay - only visible when dragging and no content */}
      {isOver && !hasContent && (
        <div
          ref={setNodeRef}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#dbeafe',
            border: '2px dashed #3b82f6',
            borderRadius: '8px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#3b82f6' }}>
                Hier ablegen
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px', color: '#3b82f6' }}>
            Komponente wird hinzugefügt
          </div>
        </div>
      )}

      {/* Column container - always present for drop detection */}
      <div
        ref={!hasContent ? setNodeRef : undefined}
        style={{
          backgroundColor: column.props.backgroundColor || '#f9fafb',
          padding: column.props.padding || '15px',
          borderRadius: '8px',
          border: hasContent ? '1px solid #e5e7eb' : (isOver ? '2px dashed #3b82f6' : '2px dashed #d1d5db'),
          minHeight: '150px',
          position: 'relative',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Column header */}
        <div style={{
          fontSize: '12px',
          fontWeight: '500',
          color: '#6b7280',
          marginBottom: '10px',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
              Spalte {index + 1}
        </div>

        {/* Column content */}
        {!hasContent ? (
          <div style={{
            padding: '30px 15px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px',
            pointerEvents: 'none'
          }}>
            Komponenten hierher ziehen
          </div>
        ) : (
          <div
            ref={hasContent ? setNodeRef : undefined}
            style={{
              position: 'relative',
              zIndex: 1
            }}
          >
            {column.children.map((child, childIndex) => (
              <div 
                key={child.id} 
                style={{ 
                  marginBottom: childIndex < column.children!.length - 1 ? '10px' : '0',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <SimpleChildComponent 
                  component={child} 
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              </div>
            ))}
            
            {/* Drop zone for additional components when column has content */}
            {isOver && (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#3b82f6',
                fontSize: '12px',
                backgroundColor: '#dbeafe',
                border: '2px dashed #3b82f6',
                borderRadius: '8px',
                marginTop: '10px'
              }}>
                Neue Komponente hier hinzufügen
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Simple child component renderer with selection support
interface SimpleChildComponentProps {
  component: EmailComponent;
  onSelect?: (component: EmailComponent) => void;
  onDelete?: (id: string) => void;
}

const SimpleChildComponent: React.FC<SimpleChildComponentProps> = ({ component, onSelect, onDelete }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(component);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(component.id);
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    cursor: 'pointer',
    border: '2px solid transparent',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    zIndex: 10, // Ensure nested components are above column overlays
    backgroundColor: 'transparent'
  };

  const controlsStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    display: 'flex',
    gap: '4px',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    zIndex: 20 // Controls should be above everything
  };

  const componentContent = (() => {
    switch (component.type) {
      case 'header':
      return (
        <div style={{
          background: component.props.backgroundImage || component.props.backgroundColor,
          color: component.props.color,
          padding: component.props.padding,
          textAlign: component.props.textAlign,
          fontSize: component.props.fontSize,
          fontWeight: component.props.fontWeight,
          fontFamily: component.props.fontFamily,
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0, color: 'inherit', fontSize: 'inherit', lineHeight: 1.2 }}>
            {component.content}
          </h1>
        </div>
      );
    case 'text':
      return (
        <div style={{
          backgroundColor: component.props.backgroundColor,
          color: component.props.color,
          padding: component.props.padding,
          textAlign: component.props.textAlign,
          fontSize: component.props.fontSize,
          fontWeight: component.props.fontWeight,
          fontFamily: component.props.fontFamily,
          borderRadius: component.props.borderRadius,
          border: component.props.border,
          margin: component.props.margin
        }}>
          <p style={{ 
            margin: 0, 
            lineHeight: 1.6,
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontFamily: 'inherit',
            color: 'inherit'
          }}>
            {component.content?.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < (component.content?.split('\n').length || 0) - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>
      );
    case 'button':
      return (
        <div style={{
          backgroundColor: component.props.backgroundColor,
          padding: component.props.padding,
          textAlign: component.props.textAlign,
          margin: component.props.margin
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: component.props.buttonBackgroundColor || component.props.color || '#dc2626',
            color: component.props.buttonTextColor || '#ffffff',
            padding: component.props.buttonPadding || component.props.padding || '16px 32px',
            textDecoration: 'none',
            borderRadius: component.props.borderRadius || '8px',
            fontWeight: component.props.buttonFontWeight || component.props.fontWeight || 'bold',
            fontSize: component.props.buttonFontSize || component.props.fontSize || '16px',
            fontFamily: component.props.fontFamily,
            boxShadow: component.props.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: component.props.border || 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            {component.content}
          </div>
        </div>
      );
    case 'image':
      return (
        <div style={{
          backgroundColor: component.props.backgroundColor,
          padding: component.props.padding,
          textAlign: component.props.textAlign,
          margin: component.props.margin || '20px 0',
          borderRadius: component.props.containerBorderRadius
        }}>
          <img
            src={component.props.src || component.content || '/images/placeholder-image.svg'}
            alt={component.props.alt || 'Email Image'}
            style={{
              maxWidth: component.props.maxWidth || '100%',
              width: component.props.width || 'auto',
              height: component.props.height || 'auto',
              borderRadius: component.props.borderRadius || '8px',
              border: component.props.border || 'none',
              boxShadow: component.props.boxShadow || '0 2px 4px rgba(0,0,0,0.1)',
              display: 'block',
              margin: '0 auto'
            }}
          />
          {component.props.caption && (
            <div style={{
              fontSize: component.props.captionFontSize || '14px',
              color: component.props.captionColor || '#666',
              textAlign: component.props.captionAlign || 'center',
              marginTop: '10px',
              fontStyle: 'italic',
              fontFamily: component.props.fontFamily
            }}>
              {component.props.caption}
            </div>
          )}
        </div>
      );
    case 'alert':
      return (
        <div style={{
          backgroundColor: component.props.backgroundColor,
          border: `${component.props.borderWidth || '2px'} ${component.props.borderStyle || 'solid'} ${component.props.borderColor || '#dc2626'}`,
          borderRadius: component.props.borderRadius,
          padding: component.props.padding,
          textAlign: component.props.textAlign,
          margin: component.props.margin || '20px 0',
          boxShadow: component.props.boxShadow || '0 2px 4px rgba(239, 68, 68, 0.1)',
          fontFamily: component.props.fontFamily
        }}>
          <div style={{ 
            color: component.props.titleColor || '#dc2626', 
            fontWeight: component.props.titleFontWeight || 'bold', 
            fontSize: component.props.titleFontSize || component.props.fontSize || '18px',
            marginBottom: '10px',
            fontFamily: 'inherit'
          }}>
            {component.content?.split('\n')[0]}
          </div>
          <div style={{ 
            color: component.props.color || '#333', 
            fontSize: component.props.fontSize || '16px', 
            lineHeight: 1.5,
            fontFamily: 'inherit',
            fontWeight: component.props.fontWeight
          }}>
            {component.content?.split('\n').slice(1).map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < (component.content?.split('\n').slice(1).length || 0) - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    case 'table':
      return (
        <div style={{ 
          backgroundColor: component.props.backgroundColor || '#f8f9fa', 
          padding: component.props.padding || '20px', 
          margin: component.props.margin || '20px 0', 
          borderRadius: component.props.borderRadius || '8px', 
          borderLeft: `4px solid ${component.props.borderColor || '#dc2626'}`,
          fontFamily: component.props.fontFamily
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: component.props.borderColor || '#dc2626', 
            fontSize: component.props.fontSize || '18px',
            fontWeight: 'bold',
            fontFamily: 'inherit'
          }}>
            {component.props.tableTitle || 'Transaktionsdetails'}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontFamily: 'inherit' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 0', fontWeight: '600', color: '#374151' }}>
                  {component.props.dateLabel || 'Datum:'}
                </td>
                <td style={{ padding: '12px 0', color: '#dc2626', fontWeight: 'bold' }}>
                  {component.props.dateValue || '{{date}}'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 0', fontWeight: '600', color: '#374151' }}>
                  {component.props.amountLabel || 'Betrag:'}
                </td>
                <td style={{ padding: '12px 0', color: '#dc2626', fontWeight: 'bold', fontSize: '16px' }}>
                  {component.props.amountValue || '{{amount}}'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 0', fontWeight: '600', color: '#374151' }}>
                  {component.props.accountLabel || 'Konto:'}
                </td>
                <td style={{ padding: '12px 0', color: '#374151', fontFamily: 'monospace' }}>
                  {component.props.accountValue || '{{accountNumber}}'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 0', fontWeight: '600', color: '#374151' }}>
                  {component.props.referenceLabel || 'Referenz:'}
                </td>
                <td style={{ padding: '12px 0', color: '#374151', fontFamily: 'monospace' }}>
                  {component.props.referenceValue || '{{transactionId}}'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    case 'footer':
      return (
        <div style={{ backgroundColor: '#f8f9fa', color: '#666666', padding: '30px 20px', textAlign: 'center', fontSize: '14px', borderTop: `3px solid ${component.props.borderTopColor || '#dc2626'}` }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{component.content?.split('\n')[0]}</div>
          <div style={{ fontSize: '12px' }}>{component.content?.split('\n').slice(1).join('<br>')}</div>
        </div>
      );
    case 'spacer':
      return (
        <div style={{
          height: component.props.height || '20px',
          backgroundColor: 'transparent',
          borderTop: component.props.showLine ? '1px solid #e5e7eb' : 'none'
        }} />
      );
    default:
      return (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '4px', 
          fontSize: '12px', 
          color: '#6b7280',
          border: '1px solid #d1d5db'
        }}>
          {component.type}: {component.content}
        </div>
      );
    }
  })();

  return (
    <div
      style={wrapperStyle}
      onClick={handleClick}
      className="group hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm"
    >
      {/* Component content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {componentContent}
      </div>
      
      {/* Selection and delete controls */}
      <div 
        style={controlsStyle}
        className="group-hover:opacity-100"
      >
        <button
          onClick={handleClick}
          className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 text-xs shadow-lg"
          title="Bearbeiten"
        >
          <Edit className="w-3 h-3" />
        </button>
        <button
          onClick={handleDelete}
          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs shadow-lg"
          title="Löschen"
        >
          <Trash className="w-3 h-3" />
        </button>
      </div>

      {/* Selection indicator */}
      <div 
        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ zIndex: 15 }}
      >
        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium shadow-sm">
          {component.type}
        </span>
      </div>
    </div>
  );
};

export default EmailCanvas;
