import React, { useState, useEffect } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { api } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

interface UserData {
  id: number;
  name: string;
  email: string;
  address: string;
  role: 'admin' | 'user' | 'owner';
  rating?: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ users: UserData[] }>('/admin/users');
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } catch (err: any) {
        setError('Failed to load users. Please try again later.');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    
    // Filter by role if not 'all'
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    // Filter by search term
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(lowercasedSearch) ||
          user.email.toLowerCase().includes(lowercasedSearch) ||
          user.address.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleAddUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
    
    // Clear error for this field
    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  const validateUserForm = () => {
    const errors: Record<string, string> = {};
    
    if (newUser.name.length < 20) {
      errors.name = 'Name must be at least 20 characters';
    } else if (newUser.name.length > 60) {
      errors.name = 'Name cannot exceed 60 characters';
    }
    
    if (!newUser.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (newUser.address.length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
    }
    
    if (!newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 8 || newUser.password.length > 16) {
      errors.password = 'Password must be between 8 and 16 characters';
    } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(newUser.password)) {
      errors.password = 'Password must include at least one uppercase letter and one special character';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUserForm()) {
      return;
    }
    
    try {
      await api.post('/admin/users', newUser);
      
      // Refresh user list
      const response = await api.get<{ users: UserData[] }>('/admin/users');
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
      
      // Reset form and close modal
      setNewUser({
        name: '',
        email: '',
        address: '',
        password: '',
        role: 'user',
      });
      setShowAddUserModal(false);
    } catch (err: any) {
      setFormErrors({
        submit: err.message || 'Failed to add user. Please try again.',
      });
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary-100 text-primary-800';
      case 'owner':
        return 'bg-secondary-100 text-secondary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      header: 'Name',
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
      header: 'Role',
      accessor: 'role',
      sortable: true,
      cell: (row: UserData) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeClass(row.role)}`}>
          {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: UserData) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // View user details
              console.log('View user:', row);
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Manage Users">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                leftIcon={<Search size={20} className="text-gray-400" />}
                fullWidth
              />
            </div>
            <div className="w-full sm:w-40">
              <select
                value={selectedRole}
                onChange={handleRoleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="owner">Store Owner</option>
              </select>
            </div>
          </div>
          <Button
            onClick={() => setShowAddUserModal(true)}
            leftIcon={<Plus size={20} />}
          >
            Add New User
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
              data={filteredUsers}
              keyField="id"
              emptyMessage="No users found. Try adjusting your search or add a new user."
            />
          )}
        </Card>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                <button
                  onClick={() => setShowAddUserModal(false)}
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

              <form onSubmit={handleAddUser}>
                <div className="space-y-4">
                  <Input
                    id="name"
                    name="name"
                    label="Full Name"
                    placeholder="Enter user's full name"
                    value={newUser.name}
                    onChange={handleAddUserChange}
                    error={formErrors.name}
                    fullWidth
                    leftIcon={<User size={20} className="text-gray-400" />}
                    required
                  />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="Enter user's email"
                    value={newUser.email}
                    onChange={handleAddUserChange}
                    error={formErrors.email}
                    fullWidth
                    required
                  />

                  <Input
                    id="address"
                    name="address"
                    label="Address"
                    placeholder="Enter user's address"
                    value={newUser.address}
                    onChange={handleAddUserChange}
                    error={formErrors.address}
                    fullWidth
                    required
                  />

                  <div className="space-y-1">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      User Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleAddUserChange}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      required
                    >
                      <option value="user">Normal User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="Create user password"
                    value={newUser.password}
                    onChange={handleAddUserChange}
                    error={formErrors.password}
                    fullWidth
                    required
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddUserModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add User
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

export default AdminUsers;