import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: number;
    label: string;
  };
  subtitle?: string;
  isLive?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
  subtitle,
  isLive = false
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          
          {/* Trend or Subtitle */}
          {trend && (
            <div className="flex items-center mt-2">
              {trend.value > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                trend.value > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">{trend.label}</span>
            </div>
          )}
          
          {subtitle && !trend && (
            <div className="flex items-center mt-2">
              {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>}
              <span className={`text-sm font-medium ${isLive ? 'text-green-600' : 'text-gray-600'}`}>
                {subtitle}
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 ${iconBgColor} rounded-full`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};
