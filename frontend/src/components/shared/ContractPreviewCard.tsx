import { useState } from 'react';
import { apiDescargarContratoPdf, type Solicitud } from '../../api';
import { MensajeError } from '../ui/Mensajes';

export const ContractPreviewCard = ({ solicitud }: { solicitud: Solicitud }) => {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');

  const habilitado = ['ACEPTADA', 'EN_CURSO', 'FINALIZADA'].includes(solicitud.estado_solicitud);

  const handleDescargar = async () => {
    setError('');
    setDescargando(true);
    try {
      await apiDescargarContratoPdf(solicitud.id_solicitud);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'El contrato PDF aún no está disponible en el servidor.');
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#d0daea] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#1a7a4a] mb-2">
            Formalización Contractual · HU-09
          </span>
          <h3 className="text-lg font-bold text-[#0f1f3d]" style={{ fontFamily: "'Fraunces', serif" }}>
            Contrato Digital de Prestación de Servicios #{solicitud.id_solicitud}
          </h3>
          <p className="text-xs text-[#6b82a0] mt-1">
            Fecha: {solicitud.fecha_programada} · Hora: {solicitud.hora_programado} · Valor acordado:{' '}
            <strong className="text-[#0f1f3d]">
              ${Number(solicitud.valor_acordado ?? 0).toLocaleString('es-CO')}
            </strong>
          </p>
        </div>

        <button
          type="button"
          disabled={!habilitado || descargando}
          onClick={handleDescargar}
          className="px-5 py-3 rounded-xl text-xs font-bold bg-[#0f1f3d] text-white hover:opacity-90 transition-all disabled:opacity-40 whitespace-nowrap"
        >
          {descargando ? 'Generando PDF...' : '📄 Ver / Descargar Contrato PDF'}
        </button>
      </div>

      {!habilitado && (
        <p className="text-xs text-[#6b82a0] mt-3 bg-[#faf8f4] p-3 rounded-xl border border-[#e4eaf2]">
          El contrato PDF se genera automáticamente una vez que el trabajador acepte la solicitud.
        </p>
      )}

      <div className="mt-3">
        <MensajeError texto={error} />
      </div>
    </div>
  );
};