// Eliminado: import React from 'react'
// Solo mantenemos los imports específicos que necesitamos
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * Authentication context for managing user state
 * Provides login, logout, and registration functionality
 */
const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ CORREGIDO: useEffect con función async/await correcta
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // ✅ Usamos una función async interna para manejar la promesa
      const initAuth = async () => {
        await fetchCurrentUser();
        // No llamamos setLoading aquí porque ya se maneja en fetchCurrentUser
      };
      initAuth();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ CORREGIDO: fetchCurrentUser maneja correctamente el estado de loading
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      setLoading(false); // ✅ Éxito: loading false
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setLoading(false); // ✅ Error: también loading false
    }
    // No necesitamos finally porque ya setLoading está en ambos casos
  };

  const login = async (email, password) => {
    // Validaciones básicas
    if (!email || !password) {
      toast.error('Please provide both email and password');
      return { success: false, error: 'Missing credentials' };
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success(`Welcome back, ${user.firstName}!`);
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login error:', error);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    // Validaciones básicas
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      toast.error('Please fill in all required fields');
      return { success: false, error: 'Missing required fields' };
    }

    if (userData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return { success: false, error: 'Password too short' };
    }

    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success(`Welcome to the restaurant, ${user.firstName}!`);
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      console.error('Registration error:', error);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully. See you soon!');
  };

  const updateUser = async (userData) => {
    try {
      const response = await api.put('/auth/me', userData);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return { success: true, user: response.data.user };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};