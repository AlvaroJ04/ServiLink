import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/worker/StatusBadge";
import { ProfileForm } from "../../components/worker/ProfileForm";
import { DragDropUpload } from "../../components/worker/DragDropUpload";

export const WorkerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      {/* Barra de Navegación Superior */}
      <nav className="w-full px-8 py-4 flex justify-between items-center shadow-md" style={{ background: "#0f1f3d" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#e8a020", color: "#0f1f3d" }}>
            SL
          </div>
          <span className="text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: "white" }}>
            ServiLink
          </span>
        </div>
        <div className="text-sm font-medium" style={{ color: "#a8bdda" }}>
          Portal de Técnicos
        </div>
      </nav>

      {/* Contenido del Dashboard */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'Fraunces', serif" }}>
                Panel de Técnico
              </h1>
              <p className="text-sm text-[#6b82a0] mt-1">Bienvenido, {user?.name || "Técnico"}</p>
            </div>
            <div className="flex items-center gap-6">
              <StatusBadge status="Pendiente" />
              <button onClick={logout} className="text-sm font-medium hover:underline transition-all" style={{ color: "#c0392b" }}>
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <ProfileForm />
            </div>
            <div className="md:col-span-1 space-y-6">
              <DragDropUpload />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};