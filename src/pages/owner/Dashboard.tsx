import React, { useState, useEffect } from 'react';
import { Users, Star, BarChart } from 'lucide-react';
import { api } from '../../services/api';
import OwnerLayout from '../../components/layout/OwnerLayout';
import Card from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StarRating from '../../components/common/StarRating';

interface RatingUser {
  id: number;
  name: string;
  email: string;
  rating: number;
  ratedAt: string;
}

interface StoreStats {
  averageRating: number;
  totalRatings: number;
  storeDetails: {
    name: string;
    email: string;
    address: string;
  };
}

const StoreOwnerDashboard: React.FC = () => {
  const [users, setUsers] = useState<RatingUser[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch store stats
        const statsResponse = await api.get<StoreStats>('/owner/stats');
        setStats(statsResponse.data);
        
        // Fetch users who rated the store
        const usersResponse = await api.get<{ users: RatingUser[] }>('/owner/rating-users');
        setUsers(usersResponse.data.users);
      } catch (err: any) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      sortable: true,
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
    },
    {
      header: 'Rating',
      accessor: 'rating',
      sortable: true,
      cell: (row: RatingUser) => <StarRating value={row.rating} readOnly size="sm" />,
    },
    {
      header: 'Date',
      accessor: 'ratedAt',
      sortable: true,
      cell: (row: RatingUser) => {
        const date = new Date(row.ratedAt);
        return date.toLocaleDateString();
      },
    },
  ];

  return (
    <OwnerLayout title="Store Dashboard">
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
          {/* Store Info Card */}
          {stats && (
            <Card className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{stats.storeDetails.name}</h2>
                  <p className="text-gray-600 mb-1">{stats.storeDetails.email}</p>
                  <p className="text-gray-600">{stats.storeDetails.address}</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg">
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <StarRating value={stats.averageRating} readOnly size="md" />
                  <p className="text-gray-500 mt-2">{stats.totalRatings} total ratings</p>
                </div>
              </div>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 mr-4">
                  <Star size={24} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? stats.averageRating.toFixed(1) : '-'}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-secondary-100 mr-4">
                  <Users size={24} className="text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reviewers</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-accent-100 mr-4">
                  <BarChart size={24} className="text-accent-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? stats.totalRatings : '-'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Users who rated table */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reviewers</h2>
            <Card>
              <DataTable
                columns={columns}
                data={users}
                keyField="id"
                emptyMessage="No ratings received yet."
              />
            </Card>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
};

export default StoreOwnerDashboard;