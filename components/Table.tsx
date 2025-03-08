import React from 'react';

interface TableData {
  agent: string;
  totalCalls: number;
  callsAnswered: number;
  resolved: number;
}

const data: TableData[] = [
  { agent: 'Alex', totalCalls: 95, callsAnswered: 90, resolved: 80 },
  { agent: 'Bob', totalCalls: 104, callsAnswered: 100, resolved: 79 },
  { agent: 'Cindy', totalCalls: 112, callsAnswered: 110, resolved: 100 },
  { agent: 'Dana', totalCalls: 91, callsAnswered: 90, resolved: 89 },
  { agent: 'Eric', totalCalls: 100, callsAnswered: 90, resolved: 80 },
  { agent: 'Janet', totalCalls: 109, callsAnswered: 90, resolved: 89 },
];

const Table = () => {
  return (
    <div className="w-full h-full overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Agent
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Total Calls
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Calls Answered
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Resolved
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.agent}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.totalCalls}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.callsAnswered}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.resolved}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;