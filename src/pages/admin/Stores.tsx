import React, { useState, useEffect } from 'react';
import { Search, Plus, Store, Star } from 'lucide-react';
import { api } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import StarRating from '../../components/common/StarRating';

interface StoreData {
  id: number;
  name: string;
  email: string;
  address: string;
  rating: number;
}

const AdminStores: React.FC = () => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ stores: StoreData[] }>('/admin/stores');
        setStores(response.data.stores);
        setFilteredStores(response.data.stores);
      } catch (err: any) {
        setError('Failed to load stores. Please try again later.');
        console.error('Error fetching stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(lowercasedSearch) ||
          store.email.toLowerCase().includes(lowercasedSearch) ||
          store.address.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }
  }, [searchTerm, stores]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddStoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStore({ ...newStore, [name]: value });
    
    // Clear error for this field
    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  const validateStoreForm = () => {
    const errors: Record<string, string> = {};
    
    if (newStore.name.length < 20) {
      errors.name = 'Name must be at least 20 characters';
    } else if (newStore.name.length > 60) {
      errors.name = 'Name cannot exceed 60 characters';
    }
    
    if (!newStore.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStore.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (newStore.address.length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
    }
    
    if (!newStore.password) {
      errors.password = 'Password is required';
    } else if (newStore.password.length < 8 || newStore.password.length > 16) {
      errors.password = 'Password must be between 8 and 16 characters';
    } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(newStore.password)) {
      errors.password = 'Password must include at least one uppercase letter and one special character';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStoreForm()) {
      return;
    }
    
    try {
      await api.post('/admin/stores', newStore);
      
      // Refresh store list
      const response = await api.get<{ stores: StoreData[] }>('/admin/stores');
      setStores(response.data.stores);
      setFilteredStores(response.data.stores);
      
      // Reset form and close modal
      setNewStore({
        name: '',
        email: '',
        address: '',
        password: '',
      });
      setShowAddStoreModal(false);
    } catch (err: any) {
      setFormErrors({
        submit: err.message || 'Failed to add store. Please try again.',
      });
    }
  };

  const columns = [
    {
      header: 'Store Name',
      accessor: 'name',
      sortable: true,
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
    },
    {
      header: 'Address',
      accessor: 'address',
      sortable: true,
    },
    {
      header: 'Rating',
      accessor: 'rating',
      sortable: true,
      cell: (row: StoreData) => (
        <StarRating value={row.rating} readOnly size="sm" />
      ),
    },
    {
      header: 'Actions',
      accessor: (row: StoreData) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // View store details
              console.log('View store:', row);
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Manage Stores">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="w-full md:w-64">
            <Input
              placeholder="Search stores..."
              value={searchTerm}
              onChange={handleSearchChange}
              leftIcon={<Search size={20} className="text-gray-400" />}
              fullWidth
            />
          </div>
          <Button
            onClick={() => setShowAddStoreModal(true)}
            leftIcon={<Plus size={20} />}
          >
            Add New Store
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="bg-error-50 text-error-700 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredStores}
              keyField="id"
              emptyMessage="No stores found. Try adjusting your search or add a new store."
            />
          )}
        </Card>
      </div>

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Store</h2>
                <button
                  onClick={() => setShowAddStoreModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formErrors.submit && (
                <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md">
                  {formErrors.submit}
                </div>
              )}

              <form onSubmit={handleAddStore}>
                <div className="space-y-4">
                  <Input
                    id="name"
                    name="name"
                    label="Store Name"
                    placeholder="Enter store name"
                    value={newStore.name}
                    onChange={handleAddStoreChange}
                    error={formErrors.name}
                    fullWidth
                    leftIcon={<Store size={20} className="text-gray-400" />}
                    required
                  />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="Enter store email"
                    value={newStore.email}
                    onChange={handleAddStoreChange}
                    error={formErrors.email}
                    fullWidth
                    required
                  />

                  <Input
                    id="address"
                    name="address"
                    label="Address"
                    placeholder="Enter store address"
                    value={newStore.address}
                    onChange={handleAddStoreChange}
                    error={formErrors.address}
                    fullWidth
                    required
                  />

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="Create store owner password"
                    value={newStore.password}
                    onChange={handleAddStoreChange}
                    error={formErrors.password}
                    fullWidth
                    required
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddStoreModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add Store
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminStores;