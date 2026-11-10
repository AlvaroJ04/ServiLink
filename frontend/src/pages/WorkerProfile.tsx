import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiTrabajadorPublico, type TrabajadorPublico } from "../api";
import { Reputacion } from "../components/ui/Estrellas";
import { formatoCOP } from "../formato";
import { MensajeError } from "../components/ui/Mensajes";

export const WorkerProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [w, setW] = useState<TrabajadorPublico | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiTrabajadorPublico(Number(id)).then(setW).catch((e: Error) => setError(e.message));
  }, [id]);

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <nav className="w-full px-8 py-4 flex justify-between items-center bg-[#0f1f3d]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/cliente")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#e8a020] text-[#0f1f3d]">SL</div>
          <span className="text-xl font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>ServiLink</span>
        </div>
        <button className="text-sm font-medium text-white hover:underline" onClick={() => navigate("/cliente")}>Volver al buscador</button>
      </nav>

      {error && <div className="max-w-5xl mx-auto px-8 py-8"><MensajeError texto={error} /></div>}
      {!w && !error && <p className="max-w-5xl mx-auto px-8 py-8 text-sm text-[#6b82a0]">Cargando perfil...</p>}

      {w && (
        <>
          <div className="bg-[#0f1f3d] px-8 py-10 border-t border-[#1a3a6b]">
            <div className="max-w-5xl mx-auto flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[#e8a020] flex items-center justify-center text-4xl font-bold text-[#0f1f3d]">{w.nombre.charAt(0).toUpperCase()}</div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Fraunces', serif" }}>{w.nombre}</h1>
                  <span className="px-2 py-1 rounded text-xs font-bold bg-white text-[#0f1f3d]">Verificado</span>
                </div>
                <p className="text-[#a8bdda] mb-2">{w.oficio}</p>
                <p className="text-white"><Reputacion promedio={w.promedio_estrellas} resenas={w.total_resenas} /></p>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-8 py-8 flex flex-col md:flex-row gap-8">
            <main className="flex-1 space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-[#d0daea] shadow-sm">
                <h2 className="text-xl font-bold text-[#0f1f3d] mb-4">Sobre mí</h2>
                <p className="text-[#4a5f80] text-sm leading-relaxed mb-6">{w.experiencia_descripcion || "Este técnico aún no ha agregado una descripción."}</p>

                <h3 className="font-bold text-[#0f1f3d] mb-3">Servicios que ofrece</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {w.servicios.map((s) => <span key={s.id} className="px-3 py-1 rounded-full border border-[#d0daea] text-sm font-medium text-[#2d3f5e]">{s.nombre}</span>)}
                </div>

                <h3 className="font-bold text-[#0f1f3d] mb-3">Zonas de atención</h3>
                <div className="flex flex-wrap gap-2">
                  {w.zonas.length === 0 && <span className="text-sm text-[#6b82a0]">No especificadas</span>}
                  {w.zonas.map((z) => <span key={z.id} className="px-3 py-1 rounded-full bg-[#f0f3f8] text-sm font-medium text-[#6b82a0]">📍 {z.nombre}</span>)}
                </div>
              </div>
            </main>

            <aside className="w-full md:w-72 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#d0daea] shadow-sm">
                <h3 className="font-bold text-[#0f1f3d] mb-4">Disponibilidad</h3>
                {w.disponibilidad.length === 0 ? (
                  <p className="text-sm text-[#6b82a0]">No especificada</p>
                ) : (
                  <ul className="space-y-2 text-sm text-[#4a5f80]">
                    {w.disponibilidad.map((f, i) => (
                      <li key={i} className="flex justify-between"><span>{f.dia_semana}</span><span className="font-medium">{f.hora_inicio.slice(0, 5)} - {f.hora_fin.slice(0, 5)}</span></li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e8a020] shadow-sm">
                <h3 className="font-bold text-[#0f1f3d] mb-2">Tarifa base</h3>
                <p className="text-2xl font-bold text-[#0f1f3d] mb-1">{formatoCOP(w.tarifa_base)}</p>
                {w.tarifa_base != null && <p className="text-xs text-[#6b82a0] mb-4">por hora • más materiales</p>}
                <button disabled title="La solicitud de servicios llega en el siguiente sprint" className="w-full py-3 rounded-xl font-bold bg-[#e8a020] text-[#0f1f3d] opacity-50 cursor-not-allowed">
                  Solicitar (próximamente)
                </button>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
};
