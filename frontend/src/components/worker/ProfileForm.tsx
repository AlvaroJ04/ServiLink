import { useMemo, useState, type FormEvent } from "react";
import { agruparZonas } from "../../zonas";
import { apiCrearPerfil, apiGuardarPerfil, type Catalogos, type Franja, type PerfilTrabajador } from "../../api";
import { inputClass, inputStyle, labelClass, labelStyle } from "../ui/estilos";
import { MensajeError, MensajeOk } from "../ui/Mensajes";

interface Props {
  perfil: PerfilTrabajador | null; // null = el técnico aún no tiene perfil
  catalogos: Catalogos;
  onGuardado: (p: PerfilTrabajador) => void;
}

const hhmm = (h: string) => h.slice(0, 5);

export const ProfileForm = ({ perfil, catalogos, onGuardado }: Props) => {
  const [principal, setPrincipal] = useState(String(perfil?.id_servicio_principal ?? ""));
  const [extras, setExtras] = useState<number[]>(perfil?.servicios.map((s) => s.id) ?? []);
  const [zonas, setZonas] = useState<number[]>(perfil?.zonas.map((z) => z.id) ?? []);
  const [franjas, setFranjas] = useState<Franja[]>(perfil?.disponibilidad.map((f) => ({ ...f, hora_inicio: hhmm(f.hora_inicio), hora_fin: hhmm(f.hora_fin) })) ?? []);
  const [descripcion, setDescripcion] = useState(perfil?.experiencia_descripcion ?? "");
  const [tarifa, setTarifa] = useState(perfil?.tarifa_base != null ? String(perfil.tarifa_base) : "");
  const grupos = useMemo(() => agruparZonas(catalogos.zonas), [catalogos.zonas]);
  const [ciudad, setCiudad] = useState(() => {
    const primera = grupos.find((g) => g.zonas.some((z) => perfil?.zonas.some((pz) => pz.id === z.id)));
    return primera?.ciudad ?? "";
  });
  const nombreZona = (id: number) => catalogos.zonas.find((z) => z.id === id)?.nombre.replace(" - ", " · ") ?? "";
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(false);

  const alternar = (lista: number[], id: number, set: (v: number[]) => void) =>
    set(lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]);

  const cambiarFranja = (i: number, cambio: Partial<Franja>) =>
    setFranjas(franjas.map((f, j) => (j === i ? { ...f, ...cambio } : f)));

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setOk("");
    if (!principal) return setError("Elige tu oficio principal de la lista.");
    setCargando(true);
    try {
      const cuerpo = {
        id_servicio_principal: Number(principal),
        servicios_ids: extras.filter((id) => id !== Number(principal)),
        zonas_ids: zonas,
        disponibilidad: franjas,
        experiencia_descripcion: descripcion.trim() || null,
        tarifa_base: tarifa === "" ? null : Number(tarifa),
      };
      const guardado = perfil ? await apiGuardarPerfil(cuerpo) : await apiCrearPerfil(cuerpo);
      onGuardado(guardado);
      setOk("Perfil guardado correctamente.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm">
      <h2 className="text-xl font-bold text-[#0f1f3d] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
        Configuración de Perfil
      </h2>
      <p className="text-sm text-[#6b82a0] mb-6">
        Completa tu información profesional para aparecer en las búsquedas. Por seguridad, no incluyas correos ni teléfonos en la descripción.
      </p>

      <form className="space-y-4" onSubmit={guardar}>
        <div>
          <label className={labelClass} style={labelStyle}>Oficio principal</label>
          <select required value={principal} onChange={(e) => setPrincipal(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="">Selecciona tu oficio...</option>
            {catalogos.servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        <fieldset>
          <legend className={labelClass} style={labelStyle}>Otros servicios que ofreces</legend>
          <div className="flex flex-wrap gap-2">
            {catalogos.servicios.filter((s) => String(s.id) !== principal).map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border cursor-pointer" style={{ borderColor: "#d0daea", color: "#2d3f5e" }}>
                <input type="checkbox" checked={extras.includes(s.id)} onChange={() => alternar(extras, s.id, setExtras)} /> {s.nombre}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={labelClass} style={labelStyle}>Zonas de atención</legend>
          <select aria-label="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="">Elige una ciudad para ver sus barrios...</option>
            {grupos.map((g) => <option key={g.ciudad} value={g.ciudad}>{g.ciudad}</option>)}
          </select>
          {ciudad && (
            <div className="flex flex-wrap gap-2 mt-3">
              {grupos.find((g) => g.ciudad === ciudad)?.zonas.map((z) => (
                <label key={z.id} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border cursor-pointer" style={{ borderColor: "#d0daea", color: "#2d3f5e" }}>
                  <input type="checkbox" checked={zonas.includes(z.id)} onChange={() => alternar(zonas, z.id, setZonas)} /> {z.barrio}
                </label>
              ))}
            </div>
          )}
          {zonas.length > 0 && (
            <div className="mt-3">
              <p className="text-xs mb-1.5" style={{ color: "#6b82a0" }}>Zonas elegidas:</p>
              <div className="flex flex-wrap gap-2">
                {zonas.map((id) => (
                  <span key={id} className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full" style={{ background: "#e8edf5", color: "#0f1f3d" }}>
                    📍 {nombreZona(id)}
                    <button type="button" aria-label="Quitar zona" onClick={() => alternar(zonas, id, setZonas)} style={{ color: "#c0392b" }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className={labelClass} style={labelStyle}>Disponibilidad semanal</legend>
          <div className="space-y-2">
            {franjas.map((f, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <select aria-label="Día" value={f.dia_semana} onChange={(e) => cambiarFranja(i, { dia_semana: e.target.value })} className="px-3 py-2 rounded-lg border text-sm bg-white" style={inputStyle}>
                  {catalogos.dias_semana.map((d) => <option key={d}>{d}</option>)}
                </select>
                <input aria-label="Desde" type="time" required value={f.hora_inicio} onChange={(e) => cambiarFranja(i, { hora_inicio: e.target.value })} className="px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
                <span className="text-xs text-[#6b82a0]">a</span>
                <input aria-label="Hasta" type="time" required value={f.hora_fin} onChange={(e) => cambiarFranja(i, { hora_fin: e.target.value })} className="px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
                <button type="button" onClick={() => setFranjas(franjas.filter((_, j) => j !== i))} className="text-xs font-medium hover:underline" style={{ color: "#c0392b" }}>Quitar</button>
              </div>
            ))}
            <button type="button" onClick={() => setFranjas([...franjas, { dia_semana: catalogos.dias_semana[0], hora_inicio: "08:00", hora_fin: "17:00" }])} className="text-xs font-semibold hover:underline" style={{ color: "#1a3a6b" }}>
              + Agregar franja horaria
            </button>
          </div>
        </fieldset>

        <div>
          <label className={labelClass} style={labelStyle}>Tarifa base por hora (COP)</label>
          <input type="number" min="0" step="1000" value={tarifa} onChange={(e) => setTarifa(e.target.value)} placeholder="Ej. 80000" className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>Descripción de tu experiencia y servicios</label>
          <textarea rows={4} maxLength={1000} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Describe brevemente en qué te especializas y qué tipo de trabajos realizas..." className={`${inputClass} resize-none`} style={inputStyle}></textarea>
        </div>

        <MensajeError texto={error} />
        <MensajeOk texto={ok} />
        <button type="submit" disabled={cargando} className="px-6 py-3 mt-2 rounded-xl font-semibold text-sm bg-[#0f1f3d] text-white hover:opacity-90 transition-all disabled:opacity-60">
          {cargando ? "Guardando..." : "Guardar perfil"}
        </button>
      </form>
    </div>
  );
};
