import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { login as apiLogin, register as apiRegister, getMe } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'inventrack_token';
const USER_KEY = 'inventrack_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    const initializeUser = async () => {
      if (!token) return;

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          return;
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      try {
        const me = await getMe();
        localStorage.setItem(USER_KEY, JSON.stringify(me));
        setUser(me);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    };

    initializeUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const res = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    const me = await getMe();
    localStorage.setItem(USER_KEY, JSON.stringify(me));
    setUser(me);
    return true;
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    await apiRegister(email, password, name);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
