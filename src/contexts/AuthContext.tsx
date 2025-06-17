import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  UserToken, 
  getToken, 
  decodeToken, 
  setToken as setAuthToken, 
  removeToken, 
  isTokenExpired, 
  refreshToken 
} from '../utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserToken | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isUser: boolean;
  isUserVip: boolean;
  isHuitStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserToken | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const token = getToken();
        
        if (token) {
          if (isTokenExpired(token)) {
            // Try to refresh the token
            const newToken = await refreshToken();
            if (newToken) {
              setAuthToken(newToken);
              const decoded = decodeToken(newToken);
              setUser(decoded);
            } else {
              // If refresh fails, log the user out
              removeToken();
              setUser(null);
            }
          } else {
            // If token is valid, set the user
            const decoded = decodeToken(token);
            setUser(decoded);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string) => {
    setAuthToken(token);
    const decoded = decodeToken(token);
    setUser(decoded);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  // Derived state for roles
  const isAdmin = user?.isAdmin || false;
  const isTeacher = user?.isTeacher || false;
  const isUser = user?.isUser || false;
  const isUserVip = user?.isUserVip || false;
  const isHuitStudent = user?.isHuitStudent || false;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null,
        user,
        loading,
        login,
        logout,
        isAdmin,
        isTeacher, 
        isUser,
        isUserVip,
        isHuitStudent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 