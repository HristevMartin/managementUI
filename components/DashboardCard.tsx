import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  contentClassName?: string;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  children, 
  contentClassName,
  className 
}) => {
  return (
    <div className={`animate-fade-in-up bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden ${className || ''}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-800">{title}</h2>
      </div>
      <div className={`p-6 ${contentClassName || ''}`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
