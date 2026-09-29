import { useAuth } from '../../context/AuthContext';

export const ClientDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Panel de Cliente</h1>
      <p>Bienvenido, {user?.name}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
};