import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Jan', monthly: 1500, total: 1500 },
  { name: 'Feb', monthly: 1800, total: 3300 },
  { name: 'Mar', monthly: 2000, total: 5300 },
  { name: 'Apr', monthly: 2400, total: 7700 },
  { name: 'May', monthly: 2600, total: 10300 },
  { name: 'Jun', monthly: 3000, total: 13300 },
  { name: 'Jul', monthly: 3500, total: 16800 },
  { name: 'Aug', monthly: 4000, total: 20800 },
  { name: 'Sep', monthly: 4500, total: 25300 },
  { name: 'Oct', monthly: 5000, total: 30300 },
  { name: 'Nov', monthly: 5500, total: 35800 },
  { name: 'Dec', monthly: 6000, total: 41800 },
];

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-gray-600 font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
            <span className="text-gray-700 font-medium">{entry.name}: </span>
            <span className="text-gray-900 font-semibold ml-1">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const LineChart = () => {
  return (
    <div  className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="90%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4587F4" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4587F4" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#37C785" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#37C785" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
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
            tickFormatter={(value) => value.toLocaleString()}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Line
            type="monotone"
            dataKey="monthly"
            name="Monthly Sign Ups"
            stroke="#4587F4"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#4587F4' }}
            animationDuration={1500}
            animationEasing="ease-out"
            fillOpacity={1}
            fill="url(#colorMonthly)"
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Total Sign Ups"
            stroke="#37C785"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#37C785' }}
            animationDuration={1500}
            animationEasing="ease-out"
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
      
      {/* Custom legend at the bottom */}
      <div className="flex justify-center items-center mt-1 space-x-8">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#4587F4] mr-2"></div>
          <span className="text-sm text-gray-700">Monthly Sign Ups</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#37C785] mr-2"></div>
          <span className="text-sm text-gray-700">Total Sign Ups</span>
        </div>
      </div>
    </div>
  );
};

export default LineChart;