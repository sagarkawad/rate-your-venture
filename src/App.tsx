import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStores from './pages/admin/Stores';
import AdminUsers from './pages/admin/Users';
import NormalUserDashboard from './pages/user/Dashboard';
import StoreOwnerDashboard from './pages/owner/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected admin routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/stores" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStores />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected normal user routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <NormalUserDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected store owner routes */}
            <Route 
              path="/owner/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <StoreOwnerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Change password route (accessible by all logged in users) */}
            <Route 
              path="/change-password" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'user', 'owner']}>
                  <ChangePassword />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;