import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const mockWorkers = [
    { id: 1, name: "Juan Martínez", role: "Electricista certificado", rating: 4.9, reviews: 87, price: "80.000", tags: ["Instalaciones", "Mantenimiento", "Urgencias"] },
    { id: 2, name: "Andrea Ríos", role: "Plomera y gasfiterista", rating: 4.8, reviews: 54, price: "70.000", tags: ["Tuberías", "Sanitarios", "Filtraciones"] },
  ];

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

      {/* Cabecera de Búsqueda */}
      <div className="bg-[#0f1f3d] px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Fraunces', serif" }}>Encuentra tu técnico</h1>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Se agregó bg-white y text-[#0f1f3d] a los inputs */}
            <input type="text" placeholder="¿Que necesitas? (Electricista, plomero...)" className="flex-2 px-6 py-4 rounded-xl text-sm outline-none w-full bg-white text-[#0f1f3d]" />
            <input type="text" placeholder="Ciudad" className="flex-1 px-6 py-4 rounded-xl text-sm outline-none w-full bg-white text-[#0f1f3d]" />
            <button className="px-8 py-4 rounded-xl font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90">Buscar</button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* Pills de Categorías */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {["Todos", "Electricidad", "Plomería", "Aire Ac.", "TI", "Construcción", "Pintura"].map((cat, i) => (
            <button key={cat} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${i === 0 ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]' : 'bg-white text-[#6b82a0] border-[#d0daea] hover:border-[#0f1f3d]'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filtros */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-[#d0daea] shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-[#0f1f3d] mb-3">Filtros</h3>
                <label className="flex items-center gap-2 text-sm text-[#6b82a0] mb-2"><input type="checkbox" className="rounded" /> Solo disponibles ahora</label>
                <label className="flex items-center gap-2 text-sm text-[#6b82a0]"><input type="checkbox" className="rounded" /> Solo verificados</label>
              </div>
              <div>
                <h3 className="font-bold text-[#0f1f3d] mb-3">Calificación mínima</h3>
                <label className="flex items-center gap-2 text-sm text-[#6b82a0] mb-2"><input type="checkbox" className="rounded" /> <span className="text-[#e8a020]">★★★★★</span> 4.5+ estrellas</label>
                <label className="flex items-center gap-2 text-sm text-[#6b82a0] mb-2"><input type="checkbox" className="rounded" /> <span className="text-[#e8a020]">★★★★</span> 4+ estrellas</label>
                <label className="flex items-center gap-2 text-sm text-[#6b82a0]"><input type="checkbox" className="rounded" /> <span className="text-[#e8a020]">★★★</span> 3.5+ estrellas</label>
              </div>
              <div>
                <h3 className="font-bold text-[#0f1f3d] mb-3">Tarifa por hora</h3>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" className="w-1/2 px-3 py-2 rounded-lg border border-[#d0daea] text-sm outline-none" />
                  <input type="number" placeholder="Max" className="w-1/2 px-3 py-2 rounded-lg border border-[#d0daea] text-sm outline-none" />
                </div>
              </div>
            </div>
          </aside>

          {/* Lista de Resultados */}
          <main className="flex-1 space-y-4">
            <p className="text-sm font-medium text-[#6b82a0] mb-2">2 técnicos encontrados</p>
            {mockWorkers.map(worker => (
              <div key={worker.id} className="bg-white p-6 rounded-2xl border border-[#d0daea] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#e8a020] flex items-center justify-center text-2xl font-bold text-[#0f1f3d]">👥</div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-[#0f1f3d]">{worker.name}</h3>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#e8f5e9] text-[#1a7a4a] border border-[#c8e6c9]">Verificado</span>
                    </div>
                    <p className="text-sm text-[#6b82a0] mb-1">{worker.role}</p>
                    <p className="text-sm"><span className="text-[#e8a020] font-bold">★ {worker.rating}</span> <span className="text-[#a8bdda]">({worker.reviews} reseñas)</span></p>
                    <div className="flex gap-2 mt-3">
                      {worker.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full border border-[#d0daea] text-xs font-medium text-[#2d3f5e]">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-[#d0daea] pt-4 md:pt-0 md:pl-6">
                  <p className="text-sm text-[#6b82a0] mb-0 md:mb-3">Desde <span className="font-bold text-[#0f1f3d]">${worker.price}/hr</span></p>
                  <button onClick={() => navigate(`/perfil/${worker.id}`)} className="px-6 py-2 rounded-xl font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90 transition-all">Solicitar</button>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
};