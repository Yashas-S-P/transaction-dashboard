import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const BarChart = ({ data }) => (
  <div className="bg-white rounded-lg shadow p-6 h-96">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Price Range Distribution</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const PieChartDisplay = ({ data }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Category Distribution</h3>
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.category} className="flex justify-between items-center">
          <span className="text-gray-700">{item.category}</span>
          <span className="font-semibold text-gray-900">{item.count} items</span>
        </div>
      ))}
    </div>
  </div>
);