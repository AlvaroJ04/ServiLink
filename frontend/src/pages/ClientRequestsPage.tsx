import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiMisSolicitudes, type Solicitud } from '../api';
import { RequestChatBox } from '../components/shared/RequestChatBox';
import { ContractPreviewCard } from '../components/shared/ContractPreviewCard';
import { SandboxCheckoutModal } from '../components/client/SandboxCheckoutModal';
import { RatingModal } from '../components/client/RatingModal';
import { MensajeError } from '../components/ui/Mensajes';
//HU-07, 10, 11
export const ClientRequestsPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [seleccionada, setSeleccionada] = useState<Solicitud | null>(null);
  const [modalPago, setModalPago] = useState(false);
  const [modalCalificar, setModalCalificar] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = async () => {
    setError('');
    try {
      const data = await apiMisSolicitudes();
      setSolicitudes(data);
      if (data.length > 0 && !seleccionada) setSeleccionada(data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus solicitudes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <nav className="w-full px-8 py-4 flex justify-between items-center bg-[#0f1f3d]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/cliente')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#e8a020] text-[#0f1f3d]">
            SL
          </div>
          <span className="text-xl font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>
            ServiLink
          </span>
        </div>
        <button onClick={() => navigate('/cliente')} className="text-sm font-medium text-[#e8a020] hover:underline">
          ← Volver al buscador
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'Fraunces', serif" }}>
              Mis Solicitudes y Contrataciones
            </h1>
            <p className="text-sm text-[#6b82a0]">
              Negocia detalles, descarga tu contrato PDF, simula el pago y califica el servicio.
            </p>
          </div>
          <button onClick={cargar} className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-[#d0daea] text-[#0f1f3d]">
            Actualizar
          </button>
        </div>

        <MensajeError texto={error} />

        {cargando ? (
          <p className="text-sm text-[#6b82a0]">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-[#d0daea] text-center">
            <p className="text-sm text-[#6b82a0] mb-4">Aún no has enviado solicitudes de servicio.</p>
            <button
              onClick={() => navigate('/cliente')}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-[#e8a020] text-[#0f1f3d]"
            >
              Buscar un técnico
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista izquierda */}
            <div className="space-y-3">
              {solicitudes.map((sol) => (
                <div
                  key={sol.id_solicitud}
                  onClick={() => setSeleccionada(sol)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    seleccionada?.id_solicitud === sol.id_solicitud
                      ? 'bg-white border-[#0f1f3d] shadow-md'
                      : 'bg-white border-[#d0daea] hover:border-[#1a3a6b]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#1a3a6b]">Solicitud #{sol.id_solicitud}</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#f0f3f8] text-[#0f1f3d]">
                      {sol.estado_solicitud}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#0f1f3d]">
                    {sol.nombre_servicio || `Servicio #${sol.id_servicio}`}
                  </p>
                  <p className="text-xs text-[#6b82a0] mt-1">
                    {sol.fecha_programada} · ${Number(sol.valor_acordado ?? 0).toLocaleString('es-CO')}
                  </p>
                </div>
              ))}
            </div>

            {/* Detalle derecho */}
            {seleccionada && (
              <div className="lg:col-span-2 space-y-6">
                {/* Acciones de Sprint 4 (HU-10 Pago y HU-11 Calificación) */}
                <div className="bg-white p-6 rounded-2xl border border-[#d0daea] shadow-sm flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-[#0f1f3d]">Acciones del Servicio #{seleccionada.id_solicitud}</h3>
                    <p className="text-xs text-[#6b82a0]">
                      Estado actual: <strong>{seleccionada.estado_solicitud}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {['ACEPTADA', 'EN_CURSO', 'FINALIZADA'].includes(seleccionada.estado_solicitud) && (
                      <button
                        type="button"
                        onClick={() => setModalPago(true)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90"
                      >
                        💳 Pagar servicio (Sandbox)
                      </button>
                    )}

                    {seleccionada.estado_solicitud === 'FINALIZADA' && !seleccionada.ya_calificado && (
                      <button
                        type="button"
                        onClick={() => setModalCalificar(true)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0f1f3d] text-white hover:opacity-90"
                      >
                        ★ Calificar trabajador
                      </button>
                    )}
                  </div>
                </div>

                <ContractPreviewCard solicitud={seleccionada} />
                <RequestChatBox idSolicitud={seleccionada.id_solicitud} />
              </div>
            )}
          </div>
        )}
      </div>

      {seleccionada && (
        <>
          <SandboxCheckoutModal
            isOpen={modalPago}
            onClose={() => setModalPago(false)}
            solicitud={seleccionada}
            onPagoCompletado={() => cargar()}
          />
          <RatingModal
            isOpen={modalCalificar}
            onClose={() => setModalCalificar(false)}
            solicitud={seleccionada}
            onCalificado={() => cargar()}
          />
        </>
      )}
    </div>
  );
};