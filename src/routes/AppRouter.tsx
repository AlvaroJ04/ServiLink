import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { ClientDashboard } from '../pages/dashboards/ClientDashboard';
import { WorkerDashboard } from '../pages/dashboards/WorkerDashboard';
import { AdminPanel } from '../pages/dashboards/AdminPanel';
import { LoginPage } from '../pages/auth/LoginPage';
import { LandingPage } from '../pages/LandingPage';
import { WorkerProfile } from '../pages/WorkerProfile';
import { BottomNavBar } from '../components/BottomNavBar';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      {/* Wrapper global con padding-bottom para que la barra flotante no tape contenido */}
      <div className="pb-[60px]">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<LoginPage />} />
          
          {/* Rutas Privadas */}
          <Route element={<PrivateRoute allowedRoles={['CLIENTE']} />}>
            <Route path="/cliente/*" element={<ClientDashboard />} />
            <Route path="/perfil/:id" element={<WorkerProfile />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['TRABAJADOR']} />}>
            <Route path="/trabajador/*" element={<WorkerDashboard />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/*" element={<AdminPanel />} />
          </Route>

          {/* Redirección estricta: Si la ruta no existe, envíalo a la Landing Page (Inicio) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      
      {/* Barra de navegación global persistente */}
      <BottomNavBar />
    </BrowserRouter>
  );
};