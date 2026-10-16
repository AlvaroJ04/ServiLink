import { useNavigate } from "react-router-dom";

export const WorkerProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <nav className="w-full px-8 py-4 flex justify-between items-center bg-[#0f1f3d]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/cliente')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#e8a020] text-[#0f1f3d]">SL</div>
          <span className="text-xl font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>ServiLink</span>
        </div>
        <button className="text-sm font-medium text-white hover:underline" onClick={() => navigate('/cliente')}>Volver al buscador</button>
      </nav>

      {/* Header Perfil */}
      <div className="bg-[#0f1f3d] px-8 py-10 border-t border-[#1a3a6b]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-[#e8a020] flex items-center justify-center text-4xl font-bold text-[#0f1f3d]">👥</div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Fraunces', serif" }}>Juan Martínez</h1>
                <span className="px-2 py-1 rounded text-xs font-bold bg-white text-[#0f1f3d]">Verificado</span>
              </div>
              <p className="text-[#a8bdda] mb-2">Electricista certificado</p>
              <p className="text-white"><span className="text-[#e8a020] font-bold">★ 4.9</span> <span className="text-[#a8bdda]">({87} reseñas)</span></p>
            </div>
          </div>
          <button className="px-8 py-4 rounded-xl font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90 w-full md:w-auto">
            Solicitar
          </button>
        </div>
      </div>

      {/* Contenido Perfil */}
      <div className="max-w-5xl mx-auto px-8 py-8 flex flex-col md:flex-row gap-8">
        <main className="flex-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-[#d0daea] shadow-sm">
            <h2 className="text-xl font-bold text-[#0f1f3d] mb-4">Sobre mí</h2>
            <p className="text-[#4a5f80] text-sm leading-relaxed mb-6">
              Electricista certificado con más de 8 años de experiencia en instalaciones residenciales y comerciales. Cuento con certificación RETIE vigente y manejo de normativas NTC. Me especializo en instalaciones de baja y media tensión, mantenimiento preventivo y diagnósticos de fallas eléctricas. Trabajo con puntualidad, honestidad y materiales de calidad.
            </p>
            
            {/* Pestañas Perfil */}
            <div className="flex bg-[#f0f3f8] p-1 rounded-xl w-full md:w-fit mx-auto mb-6">
              <button className="px-6 py-2 rounded-lg text-sm font-bold bg-white text-[#0f1f3d] shadow-sm">Servicios</button>
              <button className="px-6 py-2 rounded-lg text-sm font-medium text-[#6b82a0]">Reseñas</button>
              <button className="px-6 py-2 rounded-lg text-sm font-medium text-[#6b82a0]">Documentos</button>
            </div>

            <div className="space-y-4">
              <div className="border border-[#d0daea] rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[#0f1f3d]">Instalaciones eléctricas residenciales</h4>
                  <p className="text-xs text-[#6b82a0]">Duración estimada: 2-4 hrs</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0f1f3d]">$80.000/hr</p>
                  <button className="text-xs font-bold text-[#e8a020] hover:underline">Solicitar →</button>
                </div>
              </div>
              <div className="border border-[#d0daea] rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[#0f1f3d]">Mantenimiento preventivo</h4>
                  <p className="text-xs text-[#6b82a0]">Duración estimada: 1-2 hrs</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0f1f3d]">$70.000/hr</p>
                  <button className="text-xs font-bold text-[#e8a020] hover:underline">Solicitar →</button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="w-full md:w-72 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#d0daea] shadow-sm">
            <h3 className="font-bold text-[#0f1f3d] mb-4">Disponibilidad</h3>
            <ul className="space-y-2 text-sm text-[#4a5f80]">
              <li className="flex justify-between"><span>Lun - Vie</span><span className="font-medium">7:00 - 18:00</span></li>
              <li className="flex justify-between"><span>Sábados</span><span className="font-medium">8:00 - 14:00</span></li>
              <li className="flex justify-between"><span>Domingos</span><span className="font-medium">Solo urgencias</span></li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-[#e8a020] shadow-sm">
            <h3 className="font-bold text-[#0f1f3d] mb-2">Tarifa estimada</h3>
            <p className="text-2xl font-bold text-[#0f1f3d] mb-1">$80.000</p>
            <p className="text-xs text-[#6b82a0] mb-4">por hora • más materiales</p>
            <button className="w-full py-3 rounded-xl font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90">
              Solicitar ahora
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};