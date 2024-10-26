import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatisticsCard } from './StatisticsCard';
import { TransactionTable } from './TransactionTable';
import { BarChart, PieChartDisplay } from './Charts';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Dashboard = () => {
  const [month, setMonth] = useState('March');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    transactions: [],
    statistics: {},
    barChart: [],
    pieChart: [],
    totalPages: 1
  });

  useEffect(() => {
    fetchData();
  }, [month, search, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, combinedRes] = await Promise.all([
        api.getTransactions(month, search, page),
        api.getCombinedData(month)
      ]);

      setData({
        transactions: transactionsRes.data.transactions,
        totalPages: transactionsRes.data.totalPages,
        statistics: combinedRes.data.statistics,
        barChart: combinedRes.data.barChart,
        pieChart: combinedRes.data.pieChart
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Transaction Dashboard</h1>
        
        <div className="flex gap-4 mb-6">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md flex-grow max-w-md"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatisticsCard
                title="Total Sale Amount"
                value={`$${data.statistics.totalSaleAmount?.toFixed(2)}`}
              />
              <StatisticsCard
                title="Total Sold Items"
                value={data.statistics.totalSoldItems}
              />
              <StatisticsCard
                title="Total Not Sold Items"
                value={data.statistics.totalNotSoldItems}
              />
            </div>

            <div className="mb-8">
              <TransactionTable
                transactions={data.transactions}
                page={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BarChart data={data.barChart} />
              <PieChartDisplay data={data.pieChart} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;