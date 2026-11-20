import { useState } from 'react';
import { apiSimularPago, type PagoSimuladoResp, type Solicitud } from '../../api';
import { MensajeError, MensajeOk } from '../ui/Mensajes';
//HU-10
interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitud: Solicitud;
  onPagoCompletado?: (resp: PagoSimuladoResp) => void;
}

export const SandboxCheckoutModal = ({ isOpen, onClose, solicitud, onPagoCompletado }: Props) => {
  const [metodo, setMetodo] = useState<'PSE_SANDBOX' | 'NEQUI_SANDBOX' | 'TARJETA_TEST'>('PSE_SANDBOX');
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<PagoSimuladoResp | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const total = Number(solicitud.valor_acordado ?? 0);
  const comisionPlataforma = Math.round(total * 0.1);
  const netoTrabajador = total - comisionPlataforma;

  const estadoActual = resultado
    ? 'Liberado'
    : solicitud.estado_pago === 'PAGADO' || solicitud.estado_pago === 'SIMULADO'
    ? 'Pagado'
    : solicitud.estado_pago === 'LIBERADO'
    ? 'Liberado'
    : 'Pendiente';

  const handleSimularPago = async () => {
    setError('');
    setProcesando(true);
    try {
      const resp = await apiSimularPago(solicitud.id_solicitud, metodo);
      setResultado(resp);
      onPagoCompletado?.(resp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar el pago simulado.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f1f3d]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#d0daea]">
        <div className="flex justify-between items-start mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fff8e1] text-[#e8a020] border border-[#ffecb3]">
            Entorno Sandbox · HU-10
          </span>
          <button onClick={onClose} className="text-sm text-[#6b82a0] hover:text-[#0f1f3d]">✕</button>
        </div>

        <h2 className="text-2xl font-bold text-[#0f1f3d] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          Pago del Servicio #{solicitud.id_solicitud}
        </h2>
        <p className="text-xs text-[#6b82a0] mb-5">
          Simulación segura sin almacenamiento de datos financieros reales.
        </p>

        {/* Trazabilidad de estados */}
        <div className="flex items-center justify-between bg-[#faf8f4] p-3 rounded-xl border border-[#e4eaf2] mb-5 text-xs">
          {(['Pendiente', 'Pagado', 'Liberado'] as const).map((paso, idx) => (
            <div key={paso} className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  estadoActual === paso || (estadoActual === 'Liberado' && idx < 2)
                    ? 'bg-[#1a7a4a]'
                    : 'bg-[#d0daea]'
                }`}
              />
              <span className={estadoActual === paso ? 'font-bold text-[#0f1f3d]' : 'text-[#6b82a0]'}>
                {paso}
              </span>
            </div>
          ))}
        </div>

        {/* Desglose de comisión (90% / 10%) */}
        <div className="bg-[#f0f3f8] rounded-2xl p-4 space-y-2 mb-5 text-sm">
          <div className="flex justify-between text-[#2d3f5e]">
            <span>Valor acordado del servicio</span>
            <span className="font-bold text-[#0f1f3d]">${total.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between text-xs text-[#6b82a0]">
            <span>Comisión plataforma ServiLink (10%)</span>
            <span>${comisionPlataforma.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between text-xs text-[#1a7a4a] font-semibold pt-2 border-t border-[#d0daea]">
            <span>Saldo neto para el trabajador (90%)</span>
            <span>${netoTrabajador.toLocaleString('es-CO')}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-[#2d3f5e] mb-1.5">Método simulado (Sandbox)</label>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as typeof metodo)}
            disabled={!!resultado}
            className="w-full px-4 py-3 rounded-xl border border-[#d0daea] text-sm bg-white text-[#0f1f3d] outline-none"
          >
            <option value="PSE_SANDBOX">PSE Simulado (Aprobación inmediata)</option>
            <option value="NEQUI_SANDBOX">Nequi Sandbox</option>
            <option value="TARJETA_TEST">Tarjeta de prueba (Token ficticio)</option>
          </select>
        </div>

        <MensajeError texto={error} />
        {resultado && (
          <MensajeOk
            texto={`Pago #${resultado.id_pago} registrado (${resultado.estado_pago}). Fondos distribuidos correctamente.`}
          />
        )}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border border-[#d0daea] text-[#0f1f3d] hover:bg-[#f0f3f8]"
          >
            Cerrar
          </button>
          {!resultado && (
            <button
              type="button"
              disabled={procesando}
              onClick={handleSimularPago}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#e8a020] text-[#0f1f3d] hover:opacity-90 disabled:opacity-50"
            >
              {procesando ? 'Procesando...' : 'Confirmar pago Sandbox'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};