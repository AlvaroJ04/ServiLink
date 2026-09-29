import { createContext, useState, useContext, type ReactNode } from 'react';

// 1. Definimos los tipos de datos para los roles del Sprint 1
export type Role = 'CLIENTE' | 'TRABAJADOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// 2. Creamos el contexto vacío
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Creamos el Provider que envolverá nuestra aplicación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Estados para guardar el usuario y el token temporalmente en memoria
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Función simulada que llamaremos cuando el backend responda con éxito
  const login = (userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    // Nota: Más adelante guardaremos el token en localStorage aquí
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook personalizado para usar el contexto fácilmente en cualquier componente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};