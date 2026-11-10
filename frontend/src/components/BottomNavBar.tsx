import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Solo se muestran destinos reales, según si hay sesión y qué rol tiene.
  const panel = user?.role === "CLIENTE" ? "/cliente" : user?.role === "TRABAJADOR" ? "/trabajador" : "/admin";
  const navItems = isAuthenticated
    ? [{ path: "/", label: "Inicio" }, { path: panel, label: "Mi panel" }]
    : [{ path: "/", label: "Inicio" }, { path: "/login", label: "Iniciar sesión" }];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#1a3a6b] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center justify-center py-2 px-4 gap-2 md:gap-4 overflow-x-auto z-50">
      {navItems.map((item) => {
        const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              isActive ? "bg-[#0f1f3d] text-white" : "bg-transparent text-[#6b82a0] hover:text-[#0f1f3d] hover:bg-[#f0f3f8]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
