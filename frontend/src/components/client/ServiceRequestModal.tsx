import { useState, type FormEvent } from 'react';
import { apiCrearSolicitud, type Item, type Solicitud } from '../../api';
import { inputClass, inputStyle, labelClass, labelStyle } from '../ui/estilos';
import { MensajeError } from '../ui/Mensajes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idPerfilTrabajador: number;
  nombreTrabajador: string;
  servicios: Item[];
  tarifaBase: number | null;
  onCreada?: (solicitud: Solicitud) => void;
}

export const ServiceRequestModal = ({
  isOpen,
  onClose,
  idPerfilTrabajador,
  nombreTrabajador,
  servicios,
  tarifaBase,
  onCreada,
}: Props) => {
  const [idServicio, setIdServicio] = useState<number>(servicios[0]?.id ?? 1);
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('09:00');
  const [duracion, setDuracion] = useState<number>(2);
  const [valor, setValor] = useState<number>((tarifaBase ?? 70000) * 2);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDuracionChange = (horas: number) => {
    setDuracion(horas);
    if (tarifaBase && horas > 0) {
      setValor(tarifaBase * horas);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fecha || !hora) {
      setError('Selecciona la fecha y hora programada del servicio.');
      return;
    }
    if (valor <= 0) {
      setError('El valor acordado debe ser mayor a $0.');
      return;
    }

    setEnviando(true);
    try {
      const creada = await apiCrearSolicitud({
        id_trabajador: idPerfilTrabajador,
        id_servicio: idServicio,
        descripcion_problema: descripcion.trim(),
        fecha_programada: fecha,
        hora_programado: hora,
        duracion_estimada_horas: duracion,
        valor_acordado: valor,
      });
      onCreada?.(creada);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f1f3d]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-[#d0daea] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'Fraunces', serif" }}>
            Solicitar Servicio
          </h2>
          <button onClick={onClose} className="text-sm text-[#6b82a0] hover:text-[#0f1f3d]">✕</button>
        </div>
        <p className="text-sm text-[#6b82a0] mb-6">
          Propón las condiciones del trabajo a <span className="font-bold text-[#0f1f3d]">{nombreTrabajador}</span>.
        </p>

        <MensajeError texto={error} />

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          <div>
            <label className={labelClass} style={labelStyle}>Servicio requerido</label>
            <select
              value={idServicio}
              onChange={(e) => setIdServicio(Number(e.target.value))}
              className={inputClass}
              style={inputStyle}
            >
              {servicios.length > 0 ? (
                servicios.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))
              ) : (
                <option value={1}>Servicio técnico general</option>
              )}
            </select>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Descripción del trabajo</label>
            <textarea
              rows={3}
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalla qué necesitas reparar, instalar o revisar..."
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Fecha programada</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Hora programada</label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Duración estimada (hrs)</label>
              <input
                type="number"
                min={1}
                max={24}
                required
                value={duracion}
                onChange={(e) => handleDuracionChange(Number(e.target.value))}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Valor propuesto (COP)</label>
              <input
                type="number"
                min={10000}
                step={5000}
                required
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-sm border border-[#d0daea] text-[#0f1f3d] hover:bg-[#f0f3f8] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#e8a020] text-[#0f1f3d] hover:opacity-90 transition-all disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};