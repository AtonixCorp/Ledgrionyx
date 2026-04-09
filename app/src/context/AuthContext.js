import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');

  const apiUrl = useCallback(
    (path) => {
      if (!path) return API_BASE_URL;
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    },
    [API_BASE_URL]
  );

  const buildAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const parseApiError = useCallback(async (response, fallbackMessage) => {
    try {
      const data = await response.json();
      if (typeof data?.detail === 'string' && data.detail) {
        return data.detail;
      }
      if (typeof data?.error?.message === 'string' && data.error.message) {
        return data.error.message;
      }
      if (data?.error?.details && typeof data.error.details === 'object') {
        const detailMessage = Object.entries(data.error.details)
          .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(' | ');
        if (detailMessage) {
          return detailMessage;
        }
      }
      if (data && typeof data === 'object') {
        const flatMessage = Object.entries(data)
          .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(' | ');
        if (flatMessage) {
          return flatMessage;
        }
      }
    } catch {
      // ignore parse failures and fall back below
    }
    return fallbackMessage;
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(apiUrl('/api/auth/me/'), {
          headers: {
            ...buildAuthHeaders(),
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load user');
        }

        const me = await response.json();
        const derivedUser = {
          id: me.id,
          name: me.username || me.email?.split('@')[0] || 'User',
          email: me.email,
          avatar: (me.username || me.email || 'U').charAt(0).toUpperCase(),
          account_type: me.account_type || 'enterprise',
          country: me.country || '',
          phone: me.phone || '',
        };

        setUser(derivedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(derivedUser));
      } catch (error) {
        console.error('Auth initialize error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [apiUrl, buildAuthHeaders]);

  const login = async (email, password) => {
    try {
      const tokenRes = await fetch(apiUrl('/api/auth/token/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      if (!tokenRes.ok) {
        const details = await parseApiError(tokenRes, 'Invalid credentials');
        return { success: false, error: details };
      }

      const tokenData = await tokenRes.json();
      localStorage.setItem('token', tokenData.access);
      localStorage.setItem('refreshToken', tokenData.refresh);

      const meRes = await fetch(apiUrl('/api/auth/me/'), {
        headers: {
          ...buildAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (!meRes.ok) {
        return { success: false, error: 'Failed to load user profile' };
      }

      const me = await meRes.json();
      const derivedUser = {
        id: me.id,
        name: me.username || me.email?.split('@')[0] || 'User',
        email: me.email,
        avatar: (me.username || me.email || 'U').charAt(0).toUpperCase(),
        account_type: me.account_type || 'enterprise',
        country: me.country || '',
        phone: me.phone || '',
      };

      setUser(derivedUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(derivedUser));
      return { success: true, user: derivedUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (name, email, password, country, phone, account_type, org_name) => {
    try {
      const response = await fetch(apiUrl('/api/auth/register/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username: email,
          account_type,
          country,
          phone,
          org_name,
        }),
      });

      if (!response.ok) {
        const details = await parseApiError(response, 'Registration failed');
        return { success: false, error: details };
      }

      const data = await response.json();
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      const derivedUser = {
        id: data.user?.id,
        name: name || data.user?.username || email?.split('@')[0] || 'User',
        email: data.user?.email || email,
        avatar: ((name || data.user?.username || email || 'U').charAt(0) || 'U').toUpperCase(),
        account_type: data.user?.account_type || account_type || 'enterprise',
        country: data.user?.country || country,
        phone: data.user?.phone || phone,
      };

      setUser(derivedUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(derivedUser));
      return { success: true, user: derivedUser };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
