import React from 'react';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';

// Data for travel packages with passenger counts
const data = [
  { name: 'Paris Summer Trip', value: 400 },
  { name: 'New York Winter Getaway', value: 300 },
  { name: 'Tokyo Cherry Blossom', value: 300 },
  { name: 'Sydney Beach Vacation', value: 200 },
  { name: 'Other Packages', value: 100 }, 
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff6f61', '#d0ed57'];

const SimplePieChart = () => (
  <div style={{ width: '100%', height: 400 }}>
    <h2 className="mb-4 text-xl font-semibold">Travel Packages Distribution</h2>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie 
          data={data} 
          dataKey="value" 
          cx="50%" 
          cy="50%" 
          outerRadius={150} 
          fill="#8884d8" 
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default SimplePieChart;
