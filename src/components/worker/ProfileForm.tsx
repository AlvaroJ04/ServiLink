export const ProfileForm = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm">
      <h2 className="text-xl font-bold text-[#0f1f3d] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
        Configuración de Perfil
      </h2>
      <p className="text-sm text-[#6b82a0] mb-6">
        Completa tu información profesional para aparecer en las búsquedas. Por seguridad, no incluyas datos de contacto directos en la descripción.
      </p>
      
      <form className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#2d3f5e] mb-1.5">Oficio principal</label>
          <select className="w-full px-4 py-3 rounded-xl border border-[#d0daea] text-sm outline-none focus:border-[#1a3a6b] bg-white text-[#0f1f3d]">
            <option>Electricidad</option>
            <option>Plomería</option>
            <option>Aires acondicionados</option>
            <option>Construcción</option>
            <option>Soporte técnico</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#2d3f5e] mb-1.5">Años de experiencia</label>
            <input type="number" min="0" placeholder="Ej. 5" className="w-full px-4 py-3 rounded-xl border border-[#d0daea] text-sm outline-none focus:border-[#1a3a6b] text-[#0f1f3d]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2d3f5e] mb-1.5">Disponibilidad</label>
            <select className="w-full px-4 py-3 rounded-xl border border-[#d0daea] text-sm outline-none focus:border-[#1a3a6b] bg-white text-[#0f1f3d]">
              <option>Lunes a Viernes</option>
              <option>Fines de semana</option>
              <option>Tiempo completo</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2d3f5e] mb-1.5">Zonas de atención (Ciudades/Barrios)</label>
          <input type="text" placeholder="Ej. Norte de Bogotá, Chapinero" className="w-full px-4 py-3 rounded-xl border border-[#d0daea] text-sm outline-none focus:border-[#1a3a6b] text-[#0f1f3d]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2d3f5e] mb-1.5">Descripción de tus servicios</label>
          <textarea rows={4} placeholder="Describe brevemente en qué te especializas y qué tipo de trabajos realizas..." className="w-full px-4 py-3 rounded-xl border border-[#d0daea] text-sm outline-none focus:border-[#1a3a6b] text-[#0f1f3d] resize-none"></textarea>
        </div>

        <button type="button" className="px-6 py-3 mt-2 rounded-xl font-semibold text-sm bg-[#0f1f3d] text-white hover:opacity-90 transition-all">
          Guardar perfil
        </button>
      </form>
    </div>
  );
};