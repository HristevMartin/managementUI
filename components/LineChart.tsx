
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

const LineChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="monthly"
          name="Monthly Sign Ups"
          stroke="#4587F4"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="Total Sign Ups"
          stroke="#37C785"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;