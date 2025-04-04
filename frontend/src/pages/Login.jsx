import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Input from '../components/Input';
import Button from '../components/Button';
import FormContainer from '../components/FormContainer';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title="Sign in to your account"
      subtitle="Or create a new account"
      onSubmit={handleSubmit}
    >
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Important: First time here?</h3>
        <p className="text-sm text-yellow-700 mb-2">
          You need to accept our backend certificate before logging in.
        </p>
        <ol className="list-decimal text-sm text-yellow-700 pl-5">
          <li>Visit <a href="https://13.60.82.211/api/health" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://13.60.82.211/api/health</a></li>
          <li>Click "Advanced"</li>
          <li>Click "Proceed" to accept the certificate warning</li>
        </ol>
      </div>

      <Input
        label="Email address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        placeholder="Enter your email"
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
        placeholder="Enter your password"
      />

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={loading}
        fullWidth
      >
        Sign in
      </Button>
    </FormContainer>
  );
} 