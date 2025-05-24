import React, { useState, useEffect } from 'react';
import { Users, Store, Star } from 'lucide-react';
import { api } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';

interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await api.get<DashboardStats>('/admin/dashboard-stats');
        setStats(response.data);
      } catch (err: any) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card className="col-span-1">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-error-50 text-error-700 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={<Users size={24} className="text-primary-600" />}
              color="bg-primary-100"
            />
            <StatCard 
              title="Total Stores" 
              value={stats.totalStores} 
              icon={<Store size={24} className="text-secondary-600" />}
              color="bg-secondary-100"
            />
            <StatCard 
              title="Total Ratings" 
              value={stats.totalRatings} 
              icon={<Star size={24} className="text-accent-600" />}
              color="bg-accent-100"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <p className="text-gray-500">No recent activity to display.</p>
            </Card>
            
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <a 
                  href="/admin/stores" 
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Store size={20} className="text-secondary-600" />
                    <span className="font-medium text-gray-700">Manage Stores</span>
                  </div>
                </a>
                <a 
                  href="/admin/users" 
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users size={20} className="text-primary-600" />
                    <span className="font-medium text-gray-700">Manage Users</span>
                  </div>
                </a>
              </div>
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;