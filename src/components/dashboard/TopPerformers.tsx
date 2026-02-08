import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BankIcon } from '../../utils/bankIcons';

interface Performer {
  rank: number;
  template: string; // folder_name for BankIcon
  displayName?: string; // display name for UI
  leads: number;
  change: string;
  trend: 'up' | 'down';
}

interface TopPerformersProps {
  performers: Performer[];
  title?: string;
}

export const TopPerformers: React.FC<TopPerformersProps> = ({ 
  performers, 
  title = "Top-Performer" 
}) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-red-400';
      case 3: return 'bg-red-300';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {performers.map((performer) => (
            <div key={performer.rank} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${getRankColor(performer.rank)}`}>
                  {performer.rank}
                </div>
                <BankIcon templateName={performer.template} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{performer.displayName || performer.template}</p>
                  <p className="text-xs text-gray-500">{performer.leads} Leads</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {performer.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  performer.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {performer.change}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {performers.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Keine Performance-Daten verfügbar</p>
          </div>
        )}
      </div>
    </div>
  );
};
