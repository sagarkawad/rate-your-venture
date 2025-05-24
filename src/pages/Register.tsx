import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, AlertCircle, Check, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { VALIDATION } from '../config';

interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
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
    
    if (formData.name.length < VALIDATION.NAME.MIN_LENGTH) {
      newErrors.name = `Name must be at least ${VALIDATION.NAME.MIN_LENGTH} characters`;
    } else if (formData.name.length > VALIDATION.NAME.MAX_LENGTH) {
      newErrors.name = `Name cannot exceed ${VALIDATION.NAME.MAX_LENGTH} characters`;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.address.length > VALIDATION.ADDRESS.MAX_LENGTH) {
      newErrors.address = `Address cannot exceed ${VALIDATION.ADDRESS.MAX_LENGTH} characters`;
    }
    
    if (formData.password.length < 8 || formData.password.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters';
    } else if (!VALIDATION.PASSWORD.PATTERN.test(formData.password)) {
      newErrors.password = 'Password must include at least one uppercase letter and one special character';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
      });
      
      navigate('/login', { 
        state: { message: 'Registration successful! Please sign in with your new account.' } 
      });
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const hasMinLength = formData.password.length >= 8;
  const hasMaxLength = formData.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*]/.test(formData.password);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Create an Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to start rating your favorite stores
          </p>
        </div>
        
        <Card className="animate-fade-in">
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Full Name"
              label="Full Name"
              fullWidth
              leftIcon={<User size={20} className="text-gray-400" />}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              label="Email Address"
              fullWidth
              leftIcon={<Mail size={20} className="text-gray-400" />}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            
            <Input
              id="address"
              name="address"
              type="text"
              autoComplete="street-address"
              required
              placeholder="Your address"
              label="Address"
              fullWidth
              leftIcon={<MapPin size={20} className="text-gray-400" />}
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
            />
            
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Create a password"
              label="Password"
              fullWidth
              leftIcon={<Lock size={20} className="text-gray-400" />}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
            
            {formData.password && (
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
              placeholder="Confirm your password"
              label="Confirm Password"
              fullWidth
              leftIcon={<Lock size={20} className="text-gray-400" />}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            
            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                isLoading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;