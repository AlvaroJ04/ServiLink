import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { guardarSesion, leerSesion, registrarExpiracion, type Sesion } from '../api';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function desdeSesion(s: Sesion | null): { user: User | null; token: string | null } {
  if (!s) return { user: null, token: null };
  return {
    token: s.token,
    user: { id: String(s.id_usuario), name: s.nombre, email: s.email, role: s.rol.toUpperCase() as Role },
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // La sesión se recupera al recargar la página (sessionStorage), así F5 no la pierde.
  const [estado, setEstado] = useState(() => desdeSesion(leerSesion()));

  const login = (userData: User, newToken: string) => {
    guardarSesion({
      token: newToken,
      rol: userData.role.toLowerCase() as Sesion['rol'],
      id_usuario: Number(userData.id),
      nombre: userData.name,
      email: userData.email,
    });
    setEstado({ user: userData, token: newToken });
  };

  const logout = useCallback(() => {
    guardarSesion(null);
    setEstado({ user: null, token: null });
  }, []);

  // Si el backend responde 401 (token vencido), se cierra la sesión.
  useEffect(() => {
    registrarExpiracion(logout);
    return () => registrarExpiracion(null);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ ...estado, login, logout, isAuthenticated: !!estado.token }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
