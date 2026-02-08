import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { EmailComponent } from './EmailBuilder';

interface DroppableContainerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  acceptTypes?: string[];
  onDrop?: (componentType: string) => void;
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  id,
  children,
  className = '',
  style = {},
  acceptTypes = [],
  onDrop
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      accepts: acceptTypes,
      onDrop
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-blue-50 border-blue-300' : ''}`}
      style={{
        ...style,
        transition: 'all 0.2s ease',
        borderWidth: isOver ? '2px' : '1px',
        borderStyle: 'dashed',
        borderColor: isOver ? '#3b82f6' : '#d1d5db'
      }}
    >
      {children}
    </div>
  );
};

export default DroppableContainer;
