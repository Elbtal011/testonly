import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  hoverColor: string;
  route?: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const navigate = useNavigate();

  const handleActionClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.route) {
      navigate(action.route);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Schnellaktionen</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:${action.hoverColor} transition-colors group`}
            >
              <action.icon className={`h-8 w-8 text-gray-400 group-hover:${action.color} mb-2 transition-colors`} />
              <span className={`text-sm font-medium text-gray-600 group-hover:${action.color} transition-colors`}>
                {action.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
