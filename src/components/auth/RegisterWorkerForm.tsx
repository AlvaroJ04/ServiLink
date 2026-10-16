import { useNavigate } from "react-router-dom";

export const RegisterWorkerForm = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Fraunces', serif", color: "#0f1f3d" }}>
        Registrarme como técnico
      </h1>
      <p className="text-sm mb-8" style={{ color: "#6b82a0" }}>
        Crea tu perfil y empieza a recibir solicitudes
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Nombre</label>
            <input type="text" placeholder="Juan" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Apellido</label>
            <input type="text" placeholder="Martínez" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Especialidad principal</label>
          <select className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }}>
            <option>Electricidad</option>
            <option>Plomería</option>
            <option>Aires acondicionados</option>
            <option>Soporte técnico</option>
            <option>Construcción</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Correo electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Número de cédula</label>
          <input type="text" placeholder="CC 1234567890" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }} />
        </div>
        <div className="p-4 rounded-xl border border-dashed text-center cursor-pointer" style={{ borderColor: "#d0daea", background: "#f0f3f8" }}>
          <p className="text-2xl mb-1">📎</p>
          <p className="text-xs font-medium" style={{ color: "#0f1f3d" }}>Subir documento de identidad</p>
          <p className="text-xs mt-0.5" style={{ color: "#6b82a0" }}>PDF, JPG o PNG · máx. 5 MB</p>
        </div>
        <button onClick={() => navigate("/login")} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90" style={{ background: "#0f1f3d", color: "white" }}>
          Crear perfil técnico
        </button>
      </div>
    </div>
  );
};