import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService, User } from '../services/api';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<void>;
  signup: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (name?: string, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = 'authToken';

  const isSecureStoreAvailable = async () => {
    try {
      return await SecureStore.isAvailableAsync();
    } catch (error) {
      console.warn('SecureStore availability check failed:', error);
      return false;
    }
  };

  const getStoredToken = async () => {
    if (!(await isSecureStoreAvailable())) return null;
    return await SecureStore.getItemAsync(STORAGE_KEY);
  };

  const saveStoredToken = async (value: string) => {
    if (!(await isSecureStoreAvailable())) {
      console.warn('SecureStore is unavailable; token will not be persisted');
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, value);
  };

  const deleteStoredToken = async () => {
    if (!(await isSecureStoreAvailable())) return;
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  };

  // Load token from storage on app start
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await getStoredToken();
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

  const login = async (phone: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.login(phone, password);
      const { token: newToken, user: userData } = response;

      setToken(newToken);
      setUser(userData);
      apiService.setToken(newToken);

      await saveStoredToken(newToken);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, phone: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.signup(name, phone, password);
      const { token: newToken, user: userData } = response;

      setToken(newToken);
      setUser(userData);
      apiService.setToken(newToken);

      await saveStoredToken(newToken);
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
      await deleteStoredToken();
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
