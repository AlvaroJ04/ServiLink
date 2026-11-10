import { useState, type FormEvent } from "react";
import { apiRegister } from "../../api";
import { inputClass, inputStyle, labelClass, labelStyle } from "../ui/estilos";
import { MensajeError } from "../ui/Mensajes";

export const RegisterClientForm = ({ onRegistrado }: { onRegistrado: (email: string) => void }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== password2) return setError("Las contraseñas no coinciden.");
    if (!acepta) return setError("Debes aceptar los Términos de uso y la Política de privacidad.");
    setCargando(true);
    try {
      await apiRegister({ nombre_completo: `${nombre.trim()} ${apellido.trim()}`, email: email.trim(), password, rol: "cliente" });
      onRegistrado(email.trim());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={enviar}>
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Fraunces', serif", color: "#0f1f3d" }}>
        Crear cuenta de cliente
      </h1>
      <p className="text-sm mb-8" style={{ color: "#6b82a0" }}>Accede a cientos de técnicos verificados</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} style={labelStyle}>Nombre</label>
            <input required minLength={2} value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" placeholder="Carlos" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Apellido</label>
            <input required minLength={1} value={apellido} onChange={(e) => setApellido(e.target.value)} type="text" placeholder="Aguilar" className={inputClass} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Correo electrónico</label>
          <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="correo@ejemplo.com" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Contraseña</label>
          <input required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Mínimo 8 caracteres" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Repetir contraseña</label>
          <input required minLength={8} value={password2} onChange={(e) => setPassword2(e.target.value)} type="password" placeholder="Escríbela de nuevo" className={inputClass} style={inputStyle} />
          {password2 !== "" && password !== password2 && (
            <p className="text-xs mt-1" style={{ color: "#c0392b" }}>Las contraseñas no coinciden.</p>
          )}
          {password2 !== "" && password === password2 && (
            <p className="text-xs mt-1" style={{ color: "#1a7a4a" }}>Las contraseñas coinciden.</p>
          )}
        </div>
        <label className="flex items-start gap-2 text-xs" style={{ color: "#6b82a0" }}>
          <input type="checkbox" className="mt-0.5" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />
          <span>Acepto los <span style={{ color: "#1a3a6b" }}>Términos de uso</span> y la <span style={{ color: "#1a3a6b" }}>Política de privacidad</span></span>
        </label>
        <MensajeError texto={error} />
        <button type="submit" disabled={cargando} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60" style={{ background: "#0f1f3d", color: "white" }}>
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </div>
    </form>
  );
};
