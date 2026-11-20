import { useEffect, useState } from 'react';
import {
  apiFinalizarSolicitud,
  apiMisSolicitudes,
  apiResponderSolicitud,
  type EstadoSolicitud,
  type Solicitud,
} from '../../api';
import { RequestChatBox } from '../shared/RequestChatBox';
import { ContractPreviewCard } from '../shared/ContractPreviewCard';
import { MensajeError, MensajeOk } from '../ui/Mensajes';


const BADGE_SOLICITUD: Record<EstadoSolicitud, string> = {
  PENDIENTE: 'bg-[#fff8e1] text-[#e8a020] border-[#ffecb3]',
  ACEPTADA: 'bg-[#e8f5e9] text-[#1a7a4a] border-[#c8e6c9]',
  RECHAZADA: 'bg-[#fde0dc] text-[#c0392b] border-[#f9bdbb]',
  EN_CURSO: 'bg-[#e3f2fd] text-[#1a3a6b] border-[#bbdefb]',
  FINALIZADA: 'bg-[#e8edf5] text-[#0f1f3d] border-[#d0daea]',
  CANCELADA: 'bg-[#f0f3f8] text-[#6b82a0] border-[#d0daea]',
};

export const IncomingRequestsPanel = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [seleccionada, setSeleccionada] = useState<Solicitud | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const cargar = async () => {
    setError('');
    try {
      const data = await apiMisSolicitudes();
      setSolicitudes(data);
      if (data.length > 0 && !seleccionada) setSeleccionada(data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las solicitudes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleResponder = async (id: number, accion: 'aceptar' | 'rechazar') => {
    setError('');
    setOk('');
    try {
      const actualizada = await apiResponderSolicitud(id, accion);
      setSolicitudes((prev) => prev.map((s) => (s.id_solicitud === id ? actualizada : s)));
      setSeleccionada(actualizada);
      setOk(accion === 'aceptar' ? 'Solicitud aceptada. Contrato PDF habilitado.' : 'Solicitud rechazada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado.');
    }
  };

  const handleFinalizar = async (id: number) => {
    setError('');
    setOk('');
    try {
      const actualizada = await apiFinalizarSolicitud(id);
      setSolicitudes((prev) => prev.map((s) => (s.id_solicitud === id ? actualizada : s)));
      setSeleccionada(actualizada);
      setOk('Servicio marcado como FINALIZADO. El cliente ya puede calificar.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo finalizar el servicio.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#d0daea] shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'Fraunces', serif" }}>
              Solicitudes de Servicio Entrantes
            </h2>
            <p className="text-xs text-[#6b82a0]">Revisa propuestas de clientes, negocia por chat y gestiona contratos</p>
          </div>
          <button onClick={cargar} className="text-xs font-semibold text-[#1a3a6b] hover:underline">
            Recargar
          </button>
        </div>

        <MensajeError texto={error} />
        <MensajeOk texto={ok} />

        {cargando ? (
          <p className="text-sm text-[#6b82a0] py-6">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p className="text-sm text-[#6b82a0] py-6 bg-[#faf8f4] rounded-xl text-center border border-[#e4eaf2]">
            Aún no tienes solicitudes de clientes. Asegúrate de tener tu perfil completo y verificado.
          </p>
        ) : (
          <div className="space-y-3 mt-4">
            {solicitudes.map((sol) => (
              <div
                key={sol.id_solicitud}
                onClick={() => setSeleccionada(sol)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  seleccionada?.id_solicitud === sol.id_solicitud
                    ? 'border-[#0f1f3d] bg-[#faf8f4]'
                    : 'border-[#d0daea] bg-white hover:bg-[#faf8f4]'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#0f1f3d]">
                        Solicitud #{sol.id_solicitud} · {sol.nombre_servicio || `Servicio #${sol.id_servicio}`}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${BADGE_SOLICITUD[sol.estado_solicitud]}`}>
                        {sol.estado_solicitud}
                      </span>
                    </div>
                    <p className="text-xs text-[#4a5f80] mb-1">{sol.descripcion_problema || 'Sin descripción adicional'}</p>
                    <p className="text-xs text-[#6b82a0]">
                      📅 {sol.fecha_programada} · 🕒 {sol.hora_programado} · ⏱ {sol.duracion_estimada_horas ?? 1}h · 💰{' '}
                      <strong className="text-[#0f1f3d]">${Number(sol.valor_acordado ?? 0).toLocaleString('es-CO')}</strong>
                    </p>
                  </div>

                  {sol.estado_solicitud === 'PENDIENTE' && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleResponder(sol.id_solicitud, 'aceptar')}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1a7a4a] text-white hover:opacity-90"
                      >
                        Aceptar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResponder(sol.id_solicitud, 'rechazar')}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-[#fde0dc] text-[#c0392b] hover:opacity-90"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}

                  {sol.estado_solicitud === 'ACEPTADA' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFinalizar(sol.id_solicitud);
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0f1f3d] text-white hover:opacity-90"
                    >
                      Marcar como finalizado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {seleccionada && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RequestChatBox idSolicitud={seleccionada.id_solicitud} />
          <ContractPreviewCard solicitud={seleccionada} />
        </div>
      )}
    </div>
  );
};