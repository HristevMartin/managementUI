import React, { PureComponent } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { x: 1, y: 200 }, // Adult
  { x: 2, y: 100 }, // Child
  { x: 3, y: 60 },  // Infant
];

export default class Scatterchart extends PureComponent {
  render() {
    return (
      <div className="bg-white bg-white border border-gray-300 shadow-inner p-3">
        <h2 className="mb-4 text-xl font-semibold">Passenger Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="x"
              name="Category"
              ticks={[1, 2, 3]}
              tickFormatter={(tick) => {
                switch (tick) {
                  case 1: return 'Adult';
                  case 2: return 'Child';
                  case 3: return 'Infant';
                  default: return '';
                }
              }}
            />
            <YAxis type="number" dataKey="y" name="Count" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Passenger Distribution" data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

