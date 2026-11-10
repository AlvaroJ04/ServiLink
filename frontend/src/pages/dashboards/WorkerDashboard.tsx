import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/worker/StatusBadge";
import { ProfileForm } from "../../components/worker/ProfileForm";
import { DragDropUpload } from "../../components/worker/DragDropUpload";
import { ApiError, apiDocumentos, apiPerfil, ETIQUETA_ESTADO, type Documento, type PerfilTrabajador } from "../../api";
import { useCatalogos } from "../../hooks";
import { MensajeError } from "../../components/ui/Mensajes";

const MENSAJE_ESTADO: Record<string, string> = {
  PENDIENTE: "Sube tu documento de identidad para que un administrador verifique tu perfil.",
  EN_REVISION: "Tu documento está en revisión. Te avisaremos cuando haya una decisión.",
  VERIFICADO: "¡Tu perfil está verificado! Ya apareces en las búsquedas de los clientes.",
  RECHAZADO: "Tu verificación fue rechazada. Sube un documento corregido para volver a enviarlo.",
};

export const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const { catalogos, error: errorCatalogo } = useCatalogos();
  const [perfil, setPerfil] = useState<PerfilTrabajador | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [cargado, setCargado] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      const [p, d] = await Promise.all([
        apiPerfil().catch((e: Error) => {
          if (e instanceof ApiError && e.status === 404) return null; // aún no tiene perfil
          throw e;
        }),
        apiDocumentos().catch(() => [] as Documento[]),
      ]);
      setPerfil(p);
      setDocumentos(d);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargado(true);
    }
  }, []);

  // Carga inicial de datos desde el backend
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargar(); }, [cargar]);

  const estado = perfil?.estado_verificacion ?? "PENDIENTE";

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      <nav className="w-full px-8 py-4 flex justify-between items-center shadow-md" style={{ background: "#0f1f3d" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#e8a020", color: "#0f1f3d" }}>SL</div>
          <span className="text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: "white" }}>ServiLink</span>
        </div>
        <div className="text-sm font-medium" style={{ color: "#a8bdda" }}>Portal de Técnicos</div>
      </nav>

      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'Fraunces', serif" }}>Panel de Técnico</h1>
              <p className="text-sm text-[#6b82a0] mt-1">Bienvenido, {user?.name || "Técnico"}</p>
              {perfil && <p className="text-xs text-[#6b82a0] mt-2">{MENSAJE_ESTADO[estado]}</p>}
            </div>
            <div className="flex items-center gap-6">
              <StatusBadge status={ETIQUETA_ESTADO[estado]} />
              <button onClick={logout} className="text-sm font-medium hover:underline transition-all" style={{ color: "#c0392b" }}>Cerrar sesión</button>
            </div>
          </div>

          <MensajeError texto={error || errorCatalogo} />

          {!cargado || !catalogos ? (
            <p className="text-sm text-[#6b82a0]">Cargando tu información...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <ProfileForm perfil={perfil} catalogos={catalogos} onGuardado={(p) => setPerfil(p)} />
              </div>
              <div className="md:col-span-1 space-y-6">
                {perfil ? (
                  <DragDropUpload
                    tiposDocumento={catalogos.tipos_documento}
                    documentos={documentos}
                    puedeSubir={estado !== "VERIFICADO" && estado !== "EN_REVISION"}
                    onSubido={cargar}
                  />
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm text-sm text-[#6b82a0]">
                    Guarda primero tu perfil para poder subir tu documento de identidad.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
