import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type Role } from '../context/AuthContext';

interface PrivateRouteProps {
  allowedRoles?: Role[];
}

export const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  // Si no está autenticado, lo enviamos a la pagina de inicio
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si la ruta exige un rol específico y el usuario no lo tiene, lo bloqueamos
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // Si todo está bien, le permitimos ver la pantalla solicitada
  return <Outlet />;
};