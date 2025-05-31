
import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Jan', organic: 400, paid: 240 },
  { name: 'Feb', organic: 300, paid: 139 },
  { name: 'Mar', organic: 200, paid: 980 },
  { name: 'Apr', organic: 278, paid: 390 },
  { name: 'May', organic: 189, paid: 480 },
  { name: 'Jun', organic: 239, paid: 380 },
  { name: 'Jul', organic: 349, paid: 430 },
];

const BarChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            borderRadius: '6px', 
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend iconType="circle" />
        <Bar dataKey="organic" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="paid" fill="#60A5FA" radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
