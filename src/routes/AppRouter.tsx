import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { ClientDashboard } from '../pages/dashboards/ClientDashboard';
import { WorkerDashboard } from '../pages/dashboards/WorkerDashboard';
import { AdminPanel } from '../pages/dashboards/AdminPanel';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
// Importaremos el Login en el siguiente paso

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        
        {/* Rutas Privadas protegidas por Rol (HU-02) */}
        <Route element={<PrivateRoute allowedRoles={['CLIENTE']} />}>
          <Route path="/cliente/*" element={<ClientDashboard />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['TRABAJADOR']} />}>
          <Route path="/trabajador/*" element={<WorkerDashboard />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/*" element={<AdminPanel />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};