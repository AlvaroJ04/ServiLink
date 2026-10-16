export const SearchFilters = () => {
  return (
    <div className="bg-white p-4 rounded-xl border border-[#d0daea] shadow-sm flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full">
        <label className="block text-xs font-medium text-[#2d3f5e] mb-1.5">Servicio requerido</label>
        <select className="w-full px-4 py-2.5 rounded-lg border border-[#d0daea] text-sm outline-none focus:border-[#1a3a6b] bg-white text-[#0f1f3d]">
          <option value="">Todos los servicios</option>
          <option value="electricidad">Electricidad</option>
          <option value="plomeria">Plomería</option>
          <option value="construccion">Construcción</option>
        </select>
      </div>
      
      <div className="flex-1 w-full">
        <label className="block text-xs font-medium text-[#2d3f5e] mb-1.5">Zona geográfica</label>
        <select className="w-full px-4 py-2.5 rounded-lg border border-[#d0daea] text-sm outline-none focus:border-[#1a3a6b] bg-white text-[#0f1f3d]">
          <option value="">Todas las zonas</option>
          <option value="norte">Norte</option>
          <option value="centro">Centro</option>
          <option value="sur">Sur</option>
        </select>
      </div>

      <button className="w-full md:w-auto px-6 py-2.5 rounded-lg font-semibold text-sm bg-[#0f1f3d] text-white hover:opacity-90 transition-all">
        Buscar
      </button>
    </div>
  );
};