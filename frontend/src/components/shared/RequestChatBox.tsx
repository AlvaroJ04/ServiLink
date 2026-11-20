import { useEffect, useState, type FormEvent } from 'react';
import { apiEnviarMensaje, apiMensajesSolicitud, leerSesion, type MensajeChat } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { MensajeError } from '../ui/Mensajes';

export const RequestChatBox = ({ idSolicitud }: { idSolicitud: number }) => {
  //const { user } = useAuth();
  const sesion = leerSesion();
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const cargarHistorial = async () => {
    setError('');
    try {
      const data = await apiMensajesSolicitud(idSolicitud);
      setMensajes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el historial de mensajes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [idSolicitud]);

  const handleEnviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    setError('');
    try {
      const nuevo = await apiEnviarMensaje(idSolicitud, texto.trim());
      setMensajes((prev) => [...prev, nuevo]);
      setTexto('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el mensaje.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#d0daea] p-5 flex flex-col h-[420px]">
      <div className="flex justify-between items-center pb-3 mb-3 border-b border-[#e4eaf2]">
        <div>
          <h3 className="text-sm font-bold text-[#0f1f3d]">Chat de negociación · Solicitud #{idSolicitud}</h3>
          <p className="text-xs text-[#6b82a0]">Acuerda detalles técnicos, materiales y horarios aquí</p>
        </div>
        <button
          type="button"
          onClick={cargarHistorial}
          className="text-xs font-medium text-[#1a3a6b] hover:underline"
        >
          Actualizar
        </button>
      </div>

      <MensajeError texto={error} />

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
        {cargando ? (
          <p className="text-xs text-[#6b82a0] text-center py-8">Cargando conversación...</p>
        ) : mensajes.length === 0 ? (
          <p className="text-xs text-[#6b82a0] text-center py-8">
            Aún no hay mensajes. Inicia la conversación para coordinar el servicio.
          </p>
        ) : (
          mensajes.map((m) => {
            const esMio = m.id_emisor === sesion?.id_usuario;
            return (
              <div key={m.id_mensaje} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    esMio
                      ? 'bg-[#0f1f3d] text-white rounded-br-sm'
                      : 'bg-[#f0f3f8] text-[#0f1f3d] rounded-bl-sm'
                  }`}
                >
                  <p className="leading-relaxed">{m.contenido}</p>
                </div>
                <span className="text-[10px] text-[#6b82a0] mt-1 px-1">
                  {esMio ? 'Tú' : m.nombre_emisor || 'Contraparte'} ·{' '}
                  {m.enviado_at ? new Date(m.enviado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleEnviar} className="flex gap-2 pt-3 border-t border-[#e4eaf2]">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#d0daea] text-sm outline-none focus:border-[#1a3a6b]"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};