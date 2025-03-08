import React, { ReactNode } from 'react';
import { MoreHorizontal } from "lucide-react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

const DashboardCard = ({ title, children, className, contentClassName }: DashboardCardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-md animate-fade-in-up ${className}`}>
      <div className="flex justify-between items-center p-6 pb-0">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <button className="text-gray-400 hover:text-gray-700 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <div className={`p-6 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;