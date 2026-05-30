import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, AlertTriangle, XCircle, DollarSign, TrendingDown, Warehouse, FolderOpen, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { getDashboardStats } from '../api';
import { DashboardStats } from '../types';

export function DashboardPage() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = () => {
    setLoading(true);
    setError(null);
    getDashboardStats()
      .then((data) => {
        setStatsData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard statistics');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout currentPage="dashboard" pageTitle="Dashboard">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
          <p className="text-slate-400 text-sm">Loading dashboard statistics...</p>
        </div>
      </Layout>
    );
  }

  if (error || !statsData) {
    return (
      <Layout currentPage="dashboard" pageTitle="Dashboard">
        <div className="bg-red-900/50 border border-red-800 rounded-xl p-6 text-center max-w-xl mx-auto my-12">
          <p className="text-red-400 font-medium mb-2">Error Loading Dashboard</p>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      label: 'Total Items',
      value: statsData.total_items,
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/50',
    },
    {
      label: 'In Stock',
      value: statsData.in_stock,
      icon: LayoutDashboard,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-900/50',
    },
    {
      label: 'Low Stock',
      value: statsData.low_stock,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-900/50',
    },
    {
      label: 'Out of Stock',
      value: statsData.out_of_stock,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-900/50',
    },
    {
      label: 'Total Value',
      value: `$${statsData.total_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-900/50',
    },
    {
      label: 'Total Cost',
      value: `$${statsData.total_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/50',
    },
    {
      label: 'Inventories',
      value: statsData.inventory_count,
      icon: Warehouse,
      color: 'text-primary-400',
      bgColor: 'bg-primary-900/50',
    },
    {
      label: 'Categories',
      value: statsData.category_count,
      icon: FolderOpen,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/50',
    },
  ];

  return (
    <Layout currentPage="dashboard" pageTitle="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:shadow-lg hover:shadow-slate-900/50 transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
