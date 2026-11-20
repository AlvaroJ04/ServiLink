import { useState, type FormEvent } from 'react';
import { apiCrearCalificacion, type Solicitud } from '../../api';
import { MensajeError, MensajeOk } from '../ui/Mensajes';
//HU-11
interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitud: Solicitud;
  onCalificado?: () => void;
}

export const RatingModal = ({ isOpen, onClose, solicitud, onCalificado }: Props) => {
  const [estrellas, setEstrellas] = useState<number>(5);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  if (!isOpen) return null;

  const habilitado = solicitud.estado_solicitud === 'FINALIZADA';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!habilitado) {
      setError('Solo puedes calificar servicios marcados como FINALIZADA.');
      return;
    }
    setEnviando(true);
    try {
      await apiCrearCalificacion({
        id_solicitud: solicitud.id_solicitud,
        estrellas,
        comentario: comentario.trim(),
      });
      setOk('¡Gracias! Tu calificación actualizó el promedio del técnico.');
      onCalificado?.();
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la calificación.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f1f3d]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#d0daea]">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'Fraunces', serif" }}>
            Calificar Servicio
          </h2>
          <button onClick={onClose} className="text-sm text-[#6b82a0] hover:text-[#0f1f3d]">✕</button>
        </div>
        <p className="text-xs text-[#6b82a0] mb-6">
          Evalúa el trabajo realizado en la solicitud #{solicitud.id_solicitud}.
        </p>

        <MensajeError texto={error} />
        <MensajeOk texto={ok} />

        <form onSubmit={handleSubmit} className="space-y-5 mt-3">
          <div>
            <label className="block text-xs font-medium text-[#2d3f5e] mb-2">Puntuación (1 a 5 estrellas)</label>
            <div className="flex gap-2 justify-center bg-[#faf8f4] py-4 rounded-2xl border border-[#e4eaf2]">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setEstrellas(num)}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    num <= estrellas ? 'text-[#e8a020]' : 'text-[#d0daea]'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2d3f5e] mb-1.5">Comentario sobre el servicio</label>
            <textarea
              rows={3}
              required
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos sobre la puntualidad, calidad y trato del técnico..."
              className="w-full px-4 py-3 rounded-xl border border-[#d0daea] text-sm text-[#0f1f3d] outline-none resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-sm border border-[#d0daea] text-[#0f1f3d] hover:bg-[#f0f3f8]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || !habilitado}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#0f1f3d] text-white hover:opacity-90 disabled:opacity-40"
            >
              {enviando ? 'Guardando...' : 'Publicar calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};