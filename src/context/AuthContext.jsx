import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthMe, loginAuth, logoutAuth } from '../services/adminApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await getAuthMe();
      setUser(response.data?.user || response.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ username, password }) => {
    const response = await loginAuth({ username, password });
    await checkAuth();
    return response.data;
  };

  const logout = async () => {
    try {
      await logoutAuth();
    } catch {
      // Session may already be expired; local admin state still needs clearing.
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
