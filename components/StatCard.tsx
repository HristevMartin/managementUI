import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  prefix = '',
  className
}) => {
  return (
    <div className={`animate-fade-in-up bg-white border border-gray-200 shadow-sm rounded-lg p-6 ${className || ''}`}>
      <h3 className="text-sm font-medium text-gray-500 mb-2">{label}</h3>
      <p className="text-4xl font-semibold text-gray-900">
        {prefix}{value.toLocaleString()}
      </p>
    </div>
  );
};

export default StatCard;
