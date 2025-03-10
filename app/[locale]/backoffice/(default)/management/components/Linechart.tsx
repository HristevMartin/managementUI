import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Example data for passenger bookings over time
const data = [
  { date: '2024-01-01', bookings: 30 },
  { date: '2024-02-01', bookings: 45 },
  { date: '2024-03-01', bookings: 60 },
  { date: '2024-04-01', bookings: 50 },
  { date: '2024-05-01', bookings: 70 },
  { date: '2024-06-01', bookings: 65 },
  { date: '2024-07-01', bookings: 85 },
  { date: '2024-08-01', bookings: 75 },
];

const MyLineChart = () => (
  <div className="bg-white bg-white border border-gray-300 shadow-inner p-3">
    <h2 className="mb-4 text-xl font-semibold">Passenger Booking Timeline</h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString()} />
        <YAxis />
        <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
        <Line type="monotone" dataKey="bookings" stroke="#82ca9d" dot={true} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default MyLineChart;
