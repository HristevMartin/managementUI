import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Google', value: 45 },
  { name: 'Facebook', value: 25 },
  { name: 'LinkedIn', value: 15 },
  { name: 'Email Marketing', value: 15 },
];

// Enhanced color palette for better visual appeal
const COLORS = ['#4587F4', '#F9A03F', '#37C785', '#EA5A5A'];

// Custom label renderer to display percentages
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip component to show both label and percentage
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: payload[0].color }}
          ></div>
          <span className="text-gray-800 font-medium">{payload[0].name}</span>
        </div>
        <div className="mt-2 flex justify-between">
          <span className="text-gray-600">Value:</span>
          <span className="text-gray-900 font-semibold">{payload[0].value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const PieChart = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient 
                key={`gradient-${index}`} 
                id={`gradient-${index}`} 
                x1="0" 
                y1="0" 
                x2="0" 
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.8} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={4}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
            blendStroke
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#gradient-${index})`}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />}
            wrapperStyle={{ zIndex: 100 }}
            cursor={false}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ 
              bottom: 0,
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '20px'
            }}
            formatter={(value, entry, index) => (
              <span style={{ color: '#333', marginLeft: '5px' }}>
                {value} ({data[index].value}%)
              </span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;