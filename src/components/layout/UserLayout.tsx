import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Store, LogOut, Menu, X, ChevronDown, User } from 'lucide-react';

interface UserLayoutProps {
  children: React.ReactNode;
  title: string;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-primary-600 focus:outline-none"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`bg-white shadow-md fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-primary-700">Store Rating App</h2>
            <p className="text-sm text-gray-500 mt-1">User Dashboard</p>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link
              to="/user/dashboard"
              className="flex items-center px-4 py-3 rounded-md transition-colors duration-200 bg-primary-50 text-primary-700"
              onClick={() => setSidebarOpen(false)}
            >
              <Store size={20} className="mr-3" />
              <span>Stores</span>
            </Link>
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/change-password"
              className="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <User size={20} className="mr-3" />
              <span>Change Password</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            
            {/* User menu (desktop) */}
            <div className="relative hidden sm:block">
              <button
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 focus:outline-none"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="bg-primary-100 text-primary-700 rounded-full h-9 w-9 flex items-center justify-center">
                  <span className="font-medium">{user?.name.charAt(0)}</span>
                </div>
                <span className="font-medium">{user?.name}</span>
                <ChevronDown size={16} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;