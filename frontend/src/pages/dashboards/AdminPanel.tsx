import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiAbrirDocumento, apiResolver, apiVerificaciones, type Verificacion } from "../../api";
import { MensajeError, MensajeOk } from "../../components/ui/Mensajes";

export const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [lista, setLista] = useState<Verificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [ocupado, setOcupado] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    try { setLista(await apiVerificaciones()); }
    catch (e) { setError((e as Error).message); }
    finally { setCargando(false); }
  }, []);
  // Carga inicial de datos desde el backend
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargar(); }, [cargar]);

  const resolver = async (v: Verificacion, decision: "VERIFICADO" | "RECHAZADO") => {
    setError(""); setOk(""); setOcupado(v.id_perfil);
    try {
      await apiResolver(v.id_perfil, decision);
      setOk(`${v.nombre}: ${decision === "VERIFICADO" ? "perfil verificado" : "verificación rechazada"}.`);
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <nav className="w-full px-8 py-4 flex justify-between items-center bg-[#0f1f3d]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#e8a020] text-[#0f1f3d]">SL</div>
          <span className="text-xl font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>ServiLink</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-[#a8bdda]">Admin: {user?.name}</span>
          <button onClick={logout} className="text-sm font-medium hover:underline text-[#e8a020]">Cerrar sesión</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm">
          <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'Fraunces', serif" }}>Panel de Administración</h1>
          <p className="text-sm text-[#6b82a0] mt-1">Verificaciones pendientes de revisión (técnicos que ya enviaron su documento).</p>
        </div>

        <MensajeError texto={error} />
        <MensajeOk texto={ok} />

        {cargando && <p className="text-sm text-[#6b82a0]">Cargando...</p>}
        {!cargando && lista.length === 0 && (
          <div className="bg-white p-8 rounded-xl border border-[#d0daea] text-center text-sm text-[#6b82a0]">No hay verificaciones pendientes.</div>
        )}

        {lista.map((v) => (
          <div key={v.id_perfil} className="bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm" data-testid="verificacion">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0f1f3d]">{v.nombre}</h2>
                <p className="text-sm text-[#6b82a0]">{v.oficio}</p>
                <ul className="mt-3 space-y-1">
                  {v.documentos.map((d) => (
                    <li key={d.id_documento} className="text-sm text-[#2d3f5e] flex items-center gap-3">
                      📄 {d.tipo_documento}
                      <button onClick={() => apiAbrirDocumento(d.id_documento).catch((e: Error) => setError(e.message))} className="text-xs font-semibold hover:underline" style={{ color: "#1a3a6b" }}>Ver documento</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-3">
                <button disabled={ocupado === v.id_perfil} onClick={() => resolver(v, "VERIFICADO")} className="px-5 py-2 rounded-xl font-semibold text-sm bg-[#1a7a4a] text-white hover:opacity-90 disabled:opacity-60">Aprobar</button>
                <button disabled={ocupado === v.id_perfil} onClick={() => resolver(v, "RECHAZADO")} className="px-5 py-2 rounded-xl font-semibold text-sm bg-white border border-[#c0392b] text-[#c0392b] hover:bg-[#fde0dc] disabled:opacity-60">Rechazar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
