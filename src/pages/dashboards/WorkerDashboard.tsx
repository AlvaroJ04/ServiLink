import { useAuth } from '../../context/AuthContext';

export const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Panel de Trabajador</h1>
      <p>Bienvenido, {user?.name}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
};