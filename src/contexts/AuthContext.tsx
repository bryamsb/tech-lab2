'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  setRedirectPath: (path: string) => void;
  getRedirectPath: () => string | null;
  clearRedirectPath: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios hardcodeados para desarrollo
const HARDCODED_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@techlab.uni.edu.pe',
    role: 'admin',
    name: 'Administrador TechLab',
  },
  {
    id: '2',
    username: 'eduardo',
    email: 'eduardo@techlab.uni.edu.pe',
    role: 'admin',
    name: 'Eduardo Martínez',
  },
  {
    id: '3',
    username: 'user',
    email: 'user@techlab.uni.edu.pe',
    role: 'user',
    name: 'Usuario Demo',
  },
];

// Credenciales hardcodeadas
const HARDCODED_CREDENTIALS = [
  { username: 'admin', password: 'admin123' },
  { username: 'eduardo', password: 'eduardo123' },
  { username: 'user', password: 'user123' },
];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carga inicial - verificar si hay una sesión guardada
  useEffect(() => {
    const checkStoredSession = () => {
      try {
        const storedUser = localStorage.getItem('techlab_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Verificar que el usuario aún existe en nuestros datos hardcodeados
          const validUser = HARDCODED_USERS.find((u) => u.id === parsedUser.id);
          if (validUser) {
            setUser(validUser);
          } else {
            localStorage.removeItem('techlab_user');
          }
        }
      } catch (error) {
        console.error('Error checking stored session:', error);
        localStorage.removeItem('techlab_user');
      } finally {
        setIsLoading(false);
      }
    };

    // Simular tiempo de carga de autenticación
    setTimeout(checkStoredSession, 500);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simular delay de autenticación
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verificar credenciales hardcodeadas
      const validCredential = HARDCODED_CREDENTIALS.find(
        (cred) => cred.username === username && cred.password === password
      );

      if (!validCredential) {
        setIsLoading(false);
        return false;
      }

      // Buscar el usuario correspondiente
      const authenticatedUser = HARDCODED_USERS.find(
        (user) => user.username === username
      );

      if (!authenticatedUser) {
        setIsLoading(false);
        return false;
      }

      // Guardar sesión en localStorage
      localStorage.setItem('techlab_user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      setIsLoading(false);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('techlab_user');
    localStorage.removeItem('techlab_redirect_path');
    setUser(null);
  };

  // Funciones para manejar la redirección
  const setRedirectPath = (path: string) => {
    localStorage.setItem('techlab_redirect_path', path);
  };

  const getRedirectPath = (): string | null => {
    return localStorage.getItem('techlab_redirect_path');
  };

  const clearRedirectPath = () => {
    localStorage.removeItem('techlab_redirect_path');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    setRedirectPath,
    getRedirectPath,
    clearRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook para verificar permisos de admin
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === 'admin' || false;
}

// Credenciales para desarrollo (se mostrarán en la página de login)
export { HARDCODED_CREDENTIALS };
