import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  apiAbrirDocumento,
  apiLogsAuditoria,
  apiMetricasAdmin,
  apiResolver,
  apiVerificaciones,
  type LogAuditoria,
  type MetricasAdmin,
  type Verificacion,
} from "../../api";
import { MensajeError, MensajeOk } from "../../components/ui/Mensajes";

export const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [lista, setLista] = useState<Verificacion[]>([]);
  const [metricas, setMetricas] = useState<MetricasAdmin | null>(null);
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [tab, setTab] = useState<"verificaciones" | "auditoria">("verificaciones");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [ocupado, setOcupado] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [resVerif, resMet, resLogs] = await Promise.allSettled([
        apiVerificaciones(),
        apiMetricasAdmin(),
        apiLogsAuditoria(),
      ]);

      if (resVerif.status === "fulfilled") setLista(resVerif.value);
      else setError((resVerif.reason as Error).message);

      if (resMet.status === "fulfilled") setMetricas(resMet.value);
      if (resLogs.status === "fulfilled") setLogs(resLogs.value);
    } finally {
      setCargando(false);
    }
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

      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm">
          <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'Fraunces', serif" }}>Panel de Administración</h1>
          <p className="text-sm text-[#6b82a0] mt-1">Métricas de plataforma, incidencias de verificación y auditoría del sistema.</p>
        </div>

        {/* Tarjetas de métricas (HU-12) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#d0daea] shadow-sm">
            <p className="text-xs text-[#6b82a0]">Usuarios registrados</p>
            <p className="text-2xl font-bold text-[#0f1f3d] mt-1">{metricas?.total_usuarios ?? "—"}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#d0daea] shadow-sm">
            <p className="text-xs text-[#6b82a0]">Solicitudes registradas</p>
            <p className="text-2xl font-bold text-[#0f1f3d] mt-1">{metricas?.total_solicitudes ?? "—"}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#d0daea] shadow-sm">
            <p className="text-xs text-[#6b82a0]">Servicios completados</p>
            <p className="text-2xl font-bold text-[#1a7a4a] mt-1">{metricas?.solicitudes_completadas ?? "—"}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#d0daea] shadow-sm">
            <p className="text-xs text-[#6b82a0]">Comisiones generadas (10%)</p>
            <p className="text-2xl font-bold text-[#e8a020] mt-1">
              {metricas ? `$${Number(metricas.comisiones_generadas).toLocaleString("es-CO")}` : "—"}
            </p>
          </div>
        </div>

        <MensajeError texto={error} />
        <MensajeOk texto={ok} />

        {/* Pestañas de navegación (HU-05 / HU-12) */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTab("verificaciones")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === "verificaciones"
                ? "bg-[#0f1f3d] text-white"
                : "bg-white text-[#6b82a0] border border-[#d0daea] hover:text-[#0f1f3d]"
            }`}
          >
            Verificaciones pendientes ({lista.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("auditoria")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === "auditoria"
                ? "bg-[#0f1f3d] text-white"
                : "bg-white text-[#6b82a0] border border-[#d0daea] hover:text-[#0f1f3d]"
            }`}
          >
            Logs de Auditoría ({logs.length})
          </button>
        </div>

        {tab === "verificaciones" ? (
          <>
            {cargando && <p className="text-sm text-[#6b82a0]">Cargando...</p>}
            {!cargando && lista.length === 0 && (
              <div className="bg-white p-8 rounded-xl border border-[#d0daea] text-center text-sm text-[#6b82a0]">
                No hay verificaciones pendientes.
              </div>
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
                          <button
                            onClick={() => apiAbrirDocumento(d.id_documento).catch((e: Error) => setError(e.message))}
                            className="text-xs font-semibold hover:underline"
                            style={{ color: "#1a3a6b" }}
                          >
                            Ver documento
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <button
                      disabled={ocupado === v.id_perfil}
                      onClick={() => resolver(v, "VERIFICADO")}
                      className="px-5 py-2 rounded-xl font-semibold text-sm bg-[#1a7a4a] text-white hover:opacity-90 disabled:opacity-60"
                    >
                      Aprobar
                    </button>
                    <button
                      disabled={ocupado === v.id_perfil}
                      onClick={() => resolver(v, "RECHAZADO")}
                      className="px-5 py-2 rounded-xl font-semibold text-sm bg-white border border-[#c0392b] text-[#c0392b] hover:bg-[#fde0dc] disabled:opacity-60"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm overflow-x-auto">
            <h2 className="text-lg font-bold text-[#0f1f3d] mb-4">Registro de Auditoría del Sistema</h2>
            {logs.length === 0 ? (
              <p className="text-sm text-[#6b82a0]">No hay eventos de auditoría registrados todavía.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#d0daea] text-[#6b82a0]">
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Usuario</th>
                    <th className="py-2 pr-4">Acción</th>
                    <th className="py-2">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4eaf2]">
                  {logs.map((l, idx) => (
                    <tr key={l.id_log ?? l.id_auditoria ?? idx}>
                      <td className="py-2.5 pr-4 text-[#6b82a0]">
                        {l.created_at || l.fecha ? new Date(l.created_at || l.fecha!).toLocaleString() : "—"}
                      </td>
                      <td className="py-2.5 pr-4 font-medium text-[#0f1f3d]">
                        {l.usuario_email || (l.id_usuario ? `Usuario #${l.id_usuario}` : "Sistema")}
                      </td>
                      <td className="py-2.5 pr-4 font-bold text-[#1a3a6b]">{l.accion}</td>
                      <td className="py-2.5 text-[#4a5f80]">{l.detalle || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
