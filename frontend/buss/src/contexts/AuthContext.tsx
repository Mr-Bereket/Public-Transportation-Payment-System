import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService, User } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (name?: string, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from storage on app start
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        apiService.setToken(storedToken);
        // Optionally fetch user data
        const userData = await apiService.getUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load token:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      const { token: newToken, user: userData } = response;

      setToken(newToken);
      setUser(userData);
      apiService.setToken(newToken);

      await AsyncStorage.setItem('authToken', newToken);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.signup(name, email, phone, password);
      const { token: newToken, user: userData } = response;

      setToken(newToken);
      setUser(userData);
      apiService.setToken(newToken);

      await AsyncStorage.setItem('authToken', newToken);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setToken(null);
      setUser(null);
      apiService.clearToken();
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (name?: string, phone?: string) => {
    try {
      const response = await apiService.updateUser(name, phone);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: !!token,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
