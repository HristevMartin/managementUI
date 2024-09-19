import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Economy', uv: 400, pv: 2400, amt: 2400 },
  { name: 'Premium ', uv: 300, pv: 2000, amt: 2200 },
  { name: 'Business', uv: 200, pv: 1800, amt: 2600 },
];

const MyBarChart = () => (
  <div>
    <h2 className="mb-4 text-xl font-semibold">Passenger Count by Flight Class</h2>
    <BarChart width={600} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="uv" fill="#8884d8" />
    </BarChart>
  </div>
);

export default MyBarChart;