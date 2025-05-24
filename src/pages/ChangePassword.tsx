import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Check, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { VALIDATION } from '../config';
import { api } from '../services/api';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing again
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    // Validate new password
    if (formData.newPassword.length < 8 || formData.newPassword.length > 16) {
      newErrors.newPassword = 'Password must be between 8 and 16 characters';
    } else if (!VALIDATION.PASSWORD.PATTERN.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must include at least one uppercase letter and one special character';
    }
    
    // Validate confirm password
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error and success messages
    setError('');
    setSuccess('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Show success message
      setSuccess('Your password has been updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Password strength indicators
  const hasMinLength = formData.newPassword.length >= 8;
  const hasMaxLength = formData.newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.newPassword);
  const hasSpecialChar = /[!@#$%^&*]/.test(formData.newPassword);
  
  // Determine which dashboard to return to based on user role
  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'owner') return '/owner/dashboard';
    return '/user/dashboard';
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Change Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update your account password
          </p>
        </div>
        
        <Card className="animate-fade-in">
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-success-50 text-success-700 rounded-md flex items-center">
              <Check size={20} className="mr-2" />
              <span>{success}</span>
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Current password"
              label="Current Password"
              fullWidth
              leftIcon={<Lock size={20} className="text-gray-400" />}
              value={formData.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
            />
            
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="New password"
              label="New Password"
              fullWidth
              leftIcon={<Lock size={20} className="text-gray-400" />}
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
            />
            
            {/* Password strength indicators */}
            {formData.newPassword && (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-700">Password requirements:</p>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    {hasMinLength ? (
                      <Check size={16} className="mr-2 text-success-500" />
                    ) : (
                      <Info size={16} className="mr-2 text-gray-400" />
                    )}
                    <span className={hasMinLength ? 'text-success-700' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </li>
                  <li className="flex items-center">
                    {hasMaxLength ? (
                      <Check size={16} className="mr-2 text-success-500" />
                    ) : (
                      <Info size={16} className="mr-2 text-gray-400" />
                    )}
                    <span className={hasMaxLength ? 'text-success-700' : 'text-gray-500'}>
                      Maximum 16 characters
                    </span>
                  </li>
                  <li className="flex items-center">
                    {hasUppercase ? (
                      <Check size={16} className="mr-2 text-success-500" />
                    ) : (
                      <Info size={16} className="mr-2 text-gray-400" />
                    )}
                    <span className={hasUppercase ? 'text-success-700' : 'text-gray-500'}>
                      At least one uppercase letter
                    </span>
                  </li>
                  <li className="flex items-center">
                    {hasSpecialChar ? (
                      <Check size={16} className="mr-2 text-success-500" />
                    ) : (
                      <Info size={16} className="mr-2 text-gray-400" />
                    )}
                    <span className={hasSpecialChar ? 'text-success-700' : 'text-gray-500'}>
                      At least one special character
                    </span>
                  </li>
                </ul>
              </div>
            )}
            
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Confirm new password"
              label="Confirm New Password"
              fullWidth
              leftIcon={<Lock size={20} className="text-gray-400" />}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            
            <div className="pt-2 flex flex-col sm:flex-row sm:justify-between sm:space-x-4 space-y-3 sm:space-y-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(getDashboardLink())}
              >
                Back to Dashboard
              </Button>
              
              <Button
                type="submit"
                isLoading={loading}
                disabled={loading}
              >
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;