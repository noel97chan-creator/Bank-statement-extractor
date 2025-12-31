'use client';

import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/api';
import { Analytics } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const COLORS = [
  '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#6366f1', '#14b8a6', '#f97316', '#06b6d4', '#a855f7'
];

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsAPI.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-400">
        No data available. Upload a statement to get started.
      </div>
    );
  }

  const categoryData = Object.entries(analytics.category_breakdown)
    .map(([name, data]) => ({
      name,
      value: data.total,
      count: data.count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(analytics.total_income)}
          icon={<TrendingUp className="h-6 w-6" />}
          trend="positive"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(analytics.total_expenses)}
          icon={<TrendingDown className="h-6 w-6" />}
          trend="negative"
        />
        <StatCard
          title="Net Amount"
          value={formatCurrency(analytics.net_amount)}
          icon={<Wallet className="h-6 w-6" />}
          trend={analytics.net_amount >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Transactions"
          value={analytics.total_transactions.toString()}
          icon={<Activity className="h-6 w-6" />}
          trend="neutral"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown - Pie Chart */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <PieChartIcon className="h-5 w-5 mr-2 text-primary-500" />
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#161A1E',
                  border: '1px solid #2B3139',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown - Bar Chart */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Top Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#161A1E',
                  border: '1px solid #2B3139',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Transaction Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusItem
            label="Pending"
            count={analytics.status_breakdown.pending}
            color="bg-yellow-500"
          />
          <StatusItem
            label="Approved"
            count={analytics.status_breakdown.approved}
            color="bg-green-500"
          />
          <StatusItem
            label="Edited"
            count={analytics.status_breakdown.edited}
            color="bg-blue-500"
          />
          <StatusItem
            label="Rejected"
            count={analytics.status_breakdown.rejected}
            color="bg-red-500"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'positive' | 'negative' | 'neutral';
}) {
  const trendColors = {
    positive: 'text-green-500 bg-green-500/10',
    negative: 'text-red-500 bg-red-500/10',
    neutral: 'text-blue-500 bg-blue-500/10',
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">{title}</p>
        <div className={`p-2 rounded-lg ${trendColors[trend]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusItem({
  label,
  count,
  color
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center space-x-3">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-semibold text-white">{count}</p>
      </div>
    </div>
  );
}
