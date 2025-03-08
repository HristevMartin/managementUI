
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

const BarChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        stackOffset="expand"
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
        <Bar dataKey="google" name="Google" stackId="a" fill="#4587F4" radius={[0, 0, 0, 0]} />
        <Bar dataKey="facebook" name="Facebook" stackId="a" fill="#F9A03F" radius={[0, 0, 0, 0]} />
        <Bar dataKey="linkedin" name="LinkedIn" stackId="a" fill="#37C785" radius={[0, 0, 0, 0]} />
        <Bar dataKey="email" name="Email Marketing" stackId="a" fill="#EA5A5A" radius={[0, 0, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;