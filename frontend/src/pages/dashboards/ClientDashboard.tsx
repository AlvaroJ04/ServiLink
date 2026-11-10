import { useCallback, useEffect, useMemo, useState } from "react";
import { agruparZonas, ciudadMasCercana, obtenerUbicacion } from "../../zonas";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiBuscar, type TrabajadorCard } from "../../api";
import { useCatalogos } from "../../hooks";
import { Reputacion } from "../../components/ui/Estrellas";
import { formatoCOP } from "../../formato";
import { MensajeError } from "../../components/ui/Mensajes";

export const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { catalogos } = useCatalogos();

  // Categoría elegida en la página de inicio (se lee una vez; React en desarrollo ejecuta efectos dos veces).
  const [categoriaInicial] = useState(() => {
    try { return sessionStorage.getItem("servilink_categoria") ?? ""; } catch { return ""; }
  });
  const [servicio, setServicio] = useState(categoriaInicial);
  const [ciudad, setCiudad] = useState("");
  const [zona, setZona] = useState("");
  const [avisoUbicacion, setAvisoUbicacion] = useState("");
  const [ubicando, setUbicando] = useState(false);
  const [texto, setTexto] = useState("");
  const [estrellas, setEstrellas] = useState("");
  const [tarifaMin, setTarifaMin] = useState("");
  const [tarifaMax, setTarifaMax] = useState("");
  const [resultados, setResultados] = useState<TrabajadorCard[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const buscar = useCallback(async (f: { servicio: string; ciudad: string; zona: string; texto: string; estrellas: string; tarifaMin: string; tarifaMax: string }) => {
    setCargando(true); setError("");
    try {
      const r = await apiBuscar({
        servicio_id: f.servicio ? Number(f.servicio) : undefined,
        zona_id: f.zona ? Number(f.zona) : undefined,
        ciudad: !f.zona && f.ciudad ? f.ciudad : undefined,
        q: f.texto.trim() || undefined,
        min_estrellas: f.estrellas ? Number(f.estrellas) : undefined,
        tarifa_min: f.tarifaMin ? Number(f.tarifaMin) : undefined,
        tarifa_max: f.tarifaMax ? Number(f.tarifaMax) : undefined,
      });
      setResultados(r.resultados); setTotal(r.total);
    } catch (e) {
      setError((e as Error).message); setResultados([]); setTotal(0);
    } finally {
      setCargando(false);
    }
  }, []);

  const filtros = { servicio, ciudad, zona, texto, estrellas, tarifaMin, tarifaMax };
  // Primera carga: todos los técnicos verificados.
  // Carga inicial: aplica la categoría elegida en el inicio (si la hubo) y la olvida.
  useEffect(() => {
    try { sessionStorage.removeItem("servilink_categoria"); } catch { /* sin almacenamiento */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    buscar({ servicio: categoriaInicial, ciudad: "", zona: "", texto: "", estrellas: "", tarifaMin: "", tarifaMax: "" });
  }, [buscar, categoriaInicial]);

  const grupos = useMemo(() => agruparZonas(catalogos?.zonas ?? []), [catalogos]);
  const barrios = grupos.find((g) => g.ciudad === ciudad)?.zonas ?? [];

  const elegirCiudad = (c: string) => { setCiudad(c); setZona(""); setAvisoUbicacion(""); buscar({ ...filtros, ciudad: c, zona: "" }); };
  const elegirBarrio = (z: string) => { setZona(z); buscar({ ...filtros, zona: z }); };
  const usarMiUbicacion = async () => {
    setAvisoUbicacion(""); setUbicando(true);
    try {
      const { lat, lng } = await obtenerUbicacion();
      const c = ciudadMasCercana(lat, lng, grupos.map((g) => g.ciudad));
      if (!c) { setAvisoUbicacion("Aún no tenemos técnicos cerca de tu ubicación. Elige una ciudad de la lista."); return; }
      setAvisoUbicacion(`Detectamos que estás cerca de ${c}.`);
      setCiudad(c); setZona(""); buscar({ ...filtros, ciudad: c, zona: "" });
    } catch (e) {
      setAvisoUbicacion((e as Error).message);
    } finally {
      setUbicando(false);
    }
  };

  const elegirCategoria = (id: string) => { setServicio(id); buscar({ ...filtros, servicio: id }); };
  const elegirEstrellas = (v: string) => { const n = estrellas === v ? "" : v; setEstrellas(n); buscar({ ...filtros, estrellas: n }); };

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <nav className="w-full px-8 py-4 flex justify-between items-center bg-[#0f1f3d] border-b border-[#1a3a6b]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#e8a020] text-[#0f1f3d]">SL</div>
          <span className="text-xl font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>ServiLink</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-[#a8bdda]">Cliente: {user?.name || "Usuario"}</span>
          <button onClick={logout} className="text-sm font-medium hover:underline text-[#e8a020]">Cerrar sesión</button>
        </div>
      </nav>

      <form
        className="bg-[#0f1f3d] px-8 py-10"
        onSubmit={(e) => { e.preventDefault(); buscar(filtros); }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Fraunces', serif" }}>Encuentra tu técnico</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <input value={texto} onChange={(e) => setTexto(e.target.value)} type="text" placeholder="¿Qué necesitas? (palabra clave o nombre)" className="flex-[2] px-6 py-4 rounded-xl text-sm outline-none w-full bg-white text-[#0f1f3d]" />
<select aria-label="Ciudad" value={ciudad} onChange={(e) => elegirCiudad(e.target.value)} className="flex-1 px-6 py-4 rounded-xl text-sm outline-none w-full bg-white text-[#0f1f3d]">
              <option value="">Todas las ciudades</option>
              {grupos.map((g) => <option key={g.ciudad} value={g.ciudad}>{g.ciudad}</option>)}
            </select>
            <select aria-label="Barrio" value={zona} onChange={(e) => elegirBarrio(e.target.value)} disabled={!ciudad} className="flex-1 px-6 py-4 rounded-xl text-sm outline-none w-full bg-white text-[#0f1f3d] disabled:opacity-60">
              <option value="">{ciudad ? "Todos los barrios" : "Barrio (elige ciudad)"}</option>
              {barrios.map((z) => <option key={z.id} value={z.id}>{z.barrio}</option>)}
            </select>
            <button type="submit" className="px-8 py-4 rounded-xl font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90">Buscar</button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button type="button" onClick={usarMiUbicacion} disabled={ubicando} className="text-sm font-semibold text-[#e8a020] hover:underline disabled:opacity-60">
              📍 {ubicando ? "Buscando tu ubicación..." : "Usar mi ubicación"}
            </button>
            {avisoUbicacion && <span role="status" className="text-sm text-[#a8bdda]">{avisoUbicacion}</span>}
          </div>
        </div>
      </form>

      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[{ id: "", nombre: "Todos" }, ...(catalogos?.servicios.map((s) => ({ id: String(s.id), nombre: s.nombre })) ?? [])].map((c) => (
            <button key={c.id} type="button" onClick={() => elegirCategoria(c.id)} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${servicio === c.id ? "bg-[#0f1f3d] text-white border-[#0f1f3d]" : "bg-white text-[#6b82a0] border-[#d0daea] hover:border-[#0f1f3d]"}`}>
              {c.nombre}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-[#d0daea] shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-[#0f1f3d] mb-3">Calificación mínima</h3>
                {[["4.5", "★★★★★", "4.5+ estrellas"], ["4", "★★★★", "4+ estrellas"], ["3.5", "★★★", "3.5+ estrellas"]].map(([v, st, tx]) => (
                  <label key={v} className="flex items-center gap-2 text-sm text-[#6b82a0] mb-2">
                    <input type="checkbox" className="rounded" checked={estrellas === v} onChange={() => elegirEstrellas(v)} />
                    <span className="text-[#e8a020]">{st}</span> {tx}
                  </label>
                ))}
              </div>
              <div>
                <h3 className="font-bold text-[#0f1f3d] mb-3">Tarifa por hora</h3>
                <div className="flex gap-2">
                  <input aria-label="Tarifa mínima" type="number" min="0" value={tarifaMin} onChange={(e) => setTarifaMin(e.target.value)} placeholder="Min" className="w-1/2 px-3 py-2 rounded-lg border border-[#d0daea] text-sm outline-none" />
                  <input aria-label="Tarifa máxima" type="number" min="0" value={tarifaMax} onChange={(e) => setTarifaMax(e.target.value)} placeholder="Max" className="w-1/2 px-3 py-2 rounded-lg border border-[#d0daea] text-sm outline-none" />
                </div>
                <button type="button" onClick={() => buscar(filtros)} className="w-full mt-3 py-2 rounded-lg text-sm font-semibold border border-[#0f1f3d] text-[#0f1f3d] hover:bg-[#0f1f3d] hover:text-white transition-all">Aplicar filtros</button>
              </div>
              <p className="text-xs text-[#6b82a0]">Solo se muestran técnicos con perfil verificado.</p>
            </div>
          </aside>

          <main className="flex-1 space-y-4">
            <MensajeError texto={error} />
            <p className="text-sm font-medium text-[#6b82a0] mb-2">
              {cargando ? "Buscando..." : `${total} ${total === 1 ? "técnico encontrado" : "técnicos encontrados"}`}
            </p>
            {!cargando && !error && total === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-[#d0daea] text-center text-sm text-[#6b82a0]">
                No hay técnicos que coincidan con tu búsqueda. Prueba quitando algún filtro.
              </div>
            )}
            {resultados.map((w) => (
              <div key={w.id_perfil} className="bg-white p-6 rounded-2xl border border-[#d0daea] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#e8a020] flex items-center justify-center text-2xl font-bold text-[#0f1f3d] flex-shrink-0">{w.nombre.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-[#0f1f3d]">{w.nombre}</h3>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#e8f5e9] text-[#1a7a4a] border border-[#c8e6c9]">Verificado</span>
                    </div>
                    <p className="text-sm text-[#6b82a0] mb-1">{w.oficio}</p>
                    <p className="text-sm"><Reputacion promedio={w.promedio_estrellas} resenas={w.total_resenas} /></p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {w.servicios.map((s) => <span key={s.id} className="px-3 py-1 rounded-full border border-[#d0daea] text-xs font-medium text-[#2d3f5e]">{s.nombre}</span>)}
                      {w.zonas.map((z) => <span key={z.id} className="px-3 py-1 rounded-full bg-[#f0f3f8] text-xs font-medium text-[#6b82a0]">📍 {z.nombre}</span>)}
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-[#d0daea] pt-4 md:pt-0 md:pl-6">
                  <p className="text-sm text-[#6b82a0] mb-0 md:mb-3">Desde <span className="font-bold text-[#0f1f3d]">{formatoCOP(w.tarifa_base)}{w.tarifa_base != null && "/hr"}</span></p>
                  <button onClick={() => navigate(`/perfil/${w.id_perfil}`)} className="px-6 py-2 rounded-xl font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90 transition-all">Ver perfil</button>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
};
