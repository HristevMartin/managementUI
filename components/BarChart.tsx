import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Jul', google: 2000, facebook: 1000, linkedin: 800, email: 600 },
  { name: 'Aug', google: 2100, facebook: 1100, linkedin: 900, email: 700 },
  { name: 'Sep', google: 2200, facebook: 1200, linkedin: 800, email: 800 },
  { name: 'Oct', google: 2300, facebook: 1300, linkedin: 700, email: 900 },
  { name: 'Nov', google: 2400, facebook: 1400, linkedin: 600, email: 1000 },
  { name: 'Dec', google: 2500, facebook: 1500, linkedin: 800, email: 700 },
];

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-gray-700 font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between mb-1 last:mb-0">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
              <span className="text-gray-700">{entry.name}: </span>
            </div>
            <div className="flex items-center ml-4">
              <span className="text-gray-900 font-medium">{entry.value.toLocaleString()}</span>
              <span className="text-gray-500 text-xs ml-1">({((entry.value / total) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-700">Total:</span>
            <span className="text-gray-900 font-semibold">{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const BarChart = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="90%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
          stackOffset="expand"
          barSize={40}
          barGap={0}
          barCategoryGap={15}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            padding={{ left: 10, right: 10 }}
            dy={10}
          />
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            width={45}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={false}
          />
          <Bar 
            dataKey="google" 
            name="Google" 
            stackId="a" 
            fill="#4587F4" 
            radius={[0, 0, 0, 0]} 
            animationDuration={1500}
            animationEasing="ease-out"
          />
          <Bar 
            dataKey="facebook" 
            name="Facebook" 
            stackId="a" 
            fill="#F9A03F" 
            radius={[0, 0, 0, 0]} 
            animationDuration={1500}
            animationEasing="ease-out"
            animationBegin={100}
          />
          <Bar 
            dataKey="linkedin" 
            name="LinkedIn" 
            stackId="a" 
            fill="#37C785" 
            radius={[0, 0, 0, 0]} 
            animationDuration={1500}
            animationEasing="ease-out"
            animationBegin={200}
          />
          <Bar 
            dataKey="email" 
            name="Email Marketing" 
            stackId="a" 
            fill="#EA5A5A" 
            radius={[0, 0, 0, 0]} 
            animationDuration={1500}
            animationEasing="ease-out"
            animationBegin={300}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
      
      <div className="flex justify-center items-center mt-1 space-x-8">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#4587F4] mr-2"></div>
          <span className="text-sm text-gray-700">Google</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#F9A03F] mr-2"></div>
          <span className="text-sm text-gray-700">Facebook</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#37C785] mr-2"></div>
          <span className="text-sm text-gray-700">LinkedIn</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#EA5A5A] mr-2"></div>
          <span className="text-sm text-gray-700">Email Marketing</span>
        </div>
      </div>
    </div>
  );
};

export default BarChart;