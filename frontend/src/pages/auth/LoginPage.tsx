import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../../context/AuthContext";
import { apiLogin, apiMe } from "../../api";
import { MensajeError, MensajeOk } from "../../components/ui/Mensajes";
import { AuthLayout } from "../../layouts/AuthLayout";
import { RegisterClientForm } from "../../components/auth/RegisterClientForm";
import { RegisterWorkerForm } from "../../components/auth/RegisterWorkerForm";

type Tab = "login" | "register-client" | "register-worker";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  // /login abre "Iniciar sesión"; /registro abre "Soy cliente"; /registro?tipo=tecnico abre "Soy técnico".
  const [tab, setTab] = useState<Tab>(() =>
    location.pathname === "/registro"
      ? new URLSearchParams(location.search).get("tipo") === "tecnico" ? "register-worker" : "register-client"
      : "login",
  );
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setAviso("");
    setCargando(true);
    try {
      const r = await apiLogin(email.trim(), password);
      // Guardamos el token primero para que /auth/me lo use; luego completamos el nombre.
      sessionStorage.setItem("servilink_sesion", JSON.stringify({ token: r.access_token, rol: r.rol, id_usuario: r.id_usuario, nombre: "", email: email.trim() }));
      const yo = await apiMe();
      const role = r.rol.toUpperCase() as Role;
      login({ id: String(yo.id_usuario), name: yo.nombre_completo, email: yo.email, role }, r.access_token);
      navigate(role === "CLIENTE" ? "/cliente" : role === "TRABAJADOR" ? "/trabajador" : "/admin");
    } catch (err) {
      sessionStorage.removeItem("servilink_sesion");
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  };

  // Tras registrarse, se lleva a la pestaña de inicio de sesión con el correo ya escrito.
  const alRegistrarse = (correo: string) => {
    setEmail(correo);
    setPassword("");
    setError("");
    setAviso("¡Cuenta creada! Ahora inicia sesión con tu correo y contraseña.");
    setTab("login");
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
            type="button"
            onClick={() => { setTab(t.id as Tab); setError(""); }}
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
          <form onSubmit={handleLogin} className="space-y-4">
            <MensajeOk texto={aviso} />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#2d3f5e" }}>Correo electrónico</label>
              <input
                type="email"
                required
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#d0daea", background: "white", color: "#0f1f3d" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#6b82a0" }}>
                  {showPass ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <MensajeError texto={error} />
            <button type="submit" disabled={cargando} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60" style={{ background: "#0f1f3d", color: "white" }}>
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      )}

      {tab === "register-client" && <RegisterClientForm onRegistrado={alRegistrarse} />}
      {tab === "register-worker" && <RegisterWorkerForm onRegistrado={alRegistrarse} />}
    </AuthLayout>
  );
};