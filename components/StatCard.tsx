import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  prefix?: string;
}

const StatCard = ({ label, value, className, prefix }: StatCardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 animate-fade-in-up ${className}`}>
      <span className="text-gray-600 text-sm font-medium">{label}</span>
      <div className="mt-2 animate-number-count">
        <div className="text-4xl font-bold text-gray-900">
          {prefix && <span className="text-gray-800">{prefix}</span>}
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default StatCard;