import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../../context/AuthContext";
import { AuthLayout } from "../../layouts/AuthLayout";
import { RegisterClientForm } from "../../components/auth/RegisterClientForm";
import { RegisterWorkerForm } from "../../components/auth/RegisterWorkerForm";

type Tab = "login" | "register-client" | "register-worker";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("login");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("carlos.aguilar@email.com");
  const [password, setPassword] = useState("SecurePass123!");

  const handleLogin = (selectedRole: Role) => {
    const mockUser = {
      id: "123",
      name: email.split("@")[0] || "Usuario",
      email: email || "usuario@correo.com",
      role: selectedRole,
    };
    login(mockUser, "fake-jwt-token-12345");

    if (selectedRole === "CLIENTE") navigate("/cliente");
    else if (selectedRole === "TRABAJADOR") navigate("/trabajador");
    else if (selectedRole === "ADMIN") navigate("/admin");
  };

  return (
    <AuthLayout>
      {/* Pestañas de Navegación */}
      <div className="flex rounded-xl p-1 mb-8" style={{ background: "#e8edf5" }}>
        {[
          { id: "login", label: "Iniciar sesión" },
          { id: "register-client", label: "Soy cliente" },
          { id: "register-worker", label: "Soy técnico" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: tab === t.id ? "white" : "transparent",
              color: tab === t.id ? "#0f1f3d" : "#6b82a0",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Renderizado Condicional Limpio */}
      {tab === "login" && (
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Fraunces', serif", color: "#0f1f3d" }}>
            Bienvenido de nuevo
          </h1>
          <p className="text-sm mb-8" style={{ color: "#6b82a0" }}>Ingresa con tu correo y contraseña</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }}
                />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#6b82a0" }}>
                  {showPass ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1 mb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#6b82a0" }}>
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-[#0f1f3d] focus:ring-[#0f1f3d] w-4 h-4 cursor-pointer" 
                />
                Recordarme
              </label>
              <button 
                type="button" 
                className="text-sm font-medium hover:underline transition-all" 
                style={{ color: "#1a3a6b" }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            {/* Botones de simulación de roles (Eliminar al conectar backend) */}
            <div className="p-3 rounded-xl border" style={{ borderColor: "#e4eaf2", background: "#f0f3f8" }}>
              <p className="text-xs mb-2" style={{ color: "#6b82a0" }}>Ingresar como (demo):</p>
              <div className="flex gap-2">
                <button onClick={() => handleLogin('CLIENTE')} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }}>Cliente</button>
                <button onClick={() => handleLogin('TRABAJADOR')} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }}>Técnico</button>
                <button onClick={() => handleLogin('ADMIN')} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }}>Admin</button>
              </div>
            </div>

            <button onClick={() => handleLogin('CLIENTE')} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90" style={{ background: "#0f1f3d", color: "white" }}>
              Iniciar sesión
            </button>
          </div>
        </div>
      )}

      {tab === "register-client" && <RegisterClientForm />}
      {tab === "register-worker" && <RegisterWorkerForm />}
    </AuthLayout>
  );
};