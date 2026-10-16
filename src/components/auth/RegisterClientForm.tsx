import { useNavigate } from "react-router-dom";

export const RegisterClientForm = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Fraunces', serif", color: "#0f1f3d" }}>
        Crear cuenta de cliente
      </h1>
      <p className="text-sm mb-8" style={{ color: "#6b82a0" }}>
        Accede a cientos de técnicos verificados
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Nombre</label>
            <input type="text" placeholder="Carlos" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Apellido</label>
            <input type="text" placeholder="Aguilar" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Correo electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Teléfono</label>
          <input type="tel" placeholder="+57 300 000 0000" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Ciudad</label>
          <select className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }}>
            <option>Bogotá</option>
            <option>Medellín</option>
            <option>Cali</option>
            <option>Barranquilla</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Contraseña</label>
          <input type="password" placeholder="Mínimo 8 caracteres" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }} />
        </div>
        <label className="flex items-start gap-2 text-xs" style={{ color: "#6b82a0" }}>
          <input type="checkbox" className="mt-0.5" />
          <span>Acepto los <span style={{ color: "#1a3a6b" }}>Términos de uso</span> y la <span style={{ color: "#1a3a6b" }}>Política de privacidad</span></span>
        </label>
        <button onClick={() => navigate("/login")} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90" style={{ background: "#0f1f3d", color: "white" }}>
          Crear cuenta
        </button>
      </div>
    </div>
  );
};