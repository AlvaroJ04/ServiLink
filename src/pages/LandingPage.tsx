import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      {/* Navbar */}
      <nav className="w-full px-8 py-4 flex justify-between items-center bg-[#0f1f3d]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#e8a020] text-[#0f1f3d]">
            SL
          </div>
          <span className="text-xl font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>
            ServiLink
          </span>
        </div>
        <div className="hidden md:flex gap-6 text-sm text-[#a8bdda]">
          <button className="hover:text-white transition-all">Buscar servicios</button>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="text-sm font-medium text-white hover:text-[#e8a020] transition-all">
            Iniciar sesión
          </button>
          <button onClick={() => navigate('/registro')} className="px-4 py-2 rounded-lg text-sm font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90 transition-all">
            Registrarse
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-[#0f1f3d] text-white py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block px-3 py-1 mb-6 text-xs font-bold border border-[#e8a020] text-[#e8a020] rounded-full">
            • MVP · Servicios técnicos independientes
          </span>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
            Contrata servicios <br /> técnicos <span className="text-[#e8a020]">con confianza.</span>
          </h1>
          <p className="text-[#a8bdda] max-w-2xl text-lg mb-10 leading-relaxed">
            Conectamos clientes con trabajadores independientes verificados. Perfiles reales, contratos digitales, calificaciones transparentes y comunicación directa en una sola plataforma.
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-xl font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90 transition-all">
              Buscar un técnico
            </button>
            <button onClick={() => navigate('/registro')} className="px-6 py-3 rounded-xl font-bold border border-[#a8bdda] text-white hover:bg-white/10 transition-all">
              Ofrecer mis servicios
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-[#080f1e] py-8 border-t border-[#1a3a6b]">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between px-8 text-center gap-4">
          <div><p className="text-2xl font-bold text-[#e8a020]">2,400+</p><p className="text-xs text-[#a8bdda]">Trabajadores verificados</p></div>
          <div><p className="text-2xl font-bold text-[#e8a020]">18,000+</p><p className="text-xs text-[#a8bdda]">Servicios completados</p></div>
          <div><p className="text-2xl font-bold text-[#e8a020]">4.8★</p><p className="text-xs text-[#a8bdda]">Calificación promedio</p></div>
          <div><p className="text-2xl font-bold text-[#e8a020]">47</p><p className="text-xs text-[#a8bdda]">Ciudades activas</p></div>
        </div>
      </div>

      {/* Categorías */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <h3 className="text-xs font-bold text-[#e8a020] uppercase tracking-wider mb-2">Categorías</h3>
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-4xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'Fraunces', serif" }}>¿Qué necesitas hoy?</h2>
          <button className="text-sm font-medium text-[#1a3a6b] hover:underline">Ver todos →</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { icon: "⚡", name: "Electricidad", count: "142 técnicos" },
            { icon: "🔧", name: "Plomería", count: "98 técnicos" },
            { icon: "❄️", name: "Aires acondicionados", count: "75 técnicos" },
            { icon: "💻", name: "Soporte técnico", count: "203 técnicos" },
            { icon: "🏗️", name: "Construcción", count: "61 técnicos" },
            { icon: "🎨", name: "Pintura", count: "89 técnicos" },
          ].map((cat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-[#d0daea] shadow-sm text-center hover:shadow-md transition-all cursor-pointer">
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h4 className="font-bold text-[#0f1f3d] text-sm mb-1">{cat.name}</h4>
              <p className="text-xs text-[#6b82a0]">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Proceso (Así funciona) */}
      <section className="bg-[#0f1f3d] py-20 px-8 text-white mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xs font-bold text-[#e8a020] uppercase tracking-wider mb-2">Proceso</h3>
          <h2 className="text-4xl font-bold mb-12" style={{ fontFamily: "'Fraunces', serif" }}>Así funciona ServiLink</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {[
              { step: "01", title: "Busca por zona y servicio", desc: "Filtra trabajadores por tipo de servicio, distancia y disponibilidad. Ve perfiles, calificaciones y referencias verificadas." },
              { step: "02", title: "Envía una solicitud", desc: "Describe tu necesidad, propone fecha y horario. El trabajador recibe la notificación y puede aceptar o negociar." },
              { step: "03", title: "Formaliza con contrato", desc: "Al aceptar, el sistema genera automáticamente un contrato en PDF con los términos acordados entre ambas partes." },
              { step: "04", title: "Califica y paga", desc: "Tras el servicio, selecciona tu método de pago y deja una calificación que ayuda a la comunidad." }
            ].map(p => (
              <div key={p.step}>
                <div className="text-4xl font-bold text-[#e8a020] mb-4 border-b border-[#1a3a6b] pb-4">{p.step}</div>
                <h4 className="text-xl font-bold mb-2">{p.title}</h4>
                <p className="text-[#a8bdda] text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 px-8 bg-[#faf8f4]">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xs font-bold text-[#e8a020] uppercase tracking-wider mb-2">Testimonios</h3>
          <h2 className="text-4xl font-bold text-[#0f1f3d] mb-12" style={{ fontFamily: "'Fraunces', serif" }}>Lo que dice nuestra comunidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { role: "Cliente · Bogotá", initials: "MG", name: "María González", review: '"Contraté un electricista en menos de 2 horas. El proceso fue transparente y el contrato digital me dio mucha confianza."' },
              { role: "Técnico en HVAC · Medellín", initials: "RS", name: "Roberto Silva", review: '"ServiLink me permitió formalizar mi trabajo. Tengo contrato, calificaciones visibles y clientes recurrentes cada semana."' },
              { role: "Cliente · Cali", initials: "LP", name: "Laura Pérez", review: '"La búsqueda por zona es increíble. Encontré un plomero a 3 cuadras de mi casa con excelentes referencias."' }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-[#d0daea] shadow-sm">
                <div className="text-[#e8a020] text-lg mb-4">★★★★★</div>
                <p className="text-[#4a5f80] text-sm italic mb-6 leading-relaxed">{t.review}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e8a020] flex items-center justify-center font-bold text-[#0f1f3d] text-xs">{t.initials}</div>
                  <div><p className="font-bold text-[#0f1f3d] text-sm">{t.name}</p><p className="text-xs text-[#6b82a0]">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Llamado a la Acción (CTA) */}
      <section className="pb-20 px-8 bg-[#faf8f4]">
        <div className="max-w-5xl mx-auto bg-[#0f1f3d] rounded-3xl p-12 text-center text-white shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>¿Eres técnico independiente?</h2>
          <p className="text-[#a8bdda] mb-8 max-w-xl mx-auto">Crea tu perfil, define tus zonas de trabajo, sube tu documentación y empieza a recibir solicitudes verificadas.</p>
          <button onClick={() => navigate('/registro')} className="px-8 py-4 rounded-xl font-bold bg-[#e8a020] text-[#0f1f3d] hover:opacity-90 transition-all">
            Crear mi perfil gratuito
          </button>
        </div>
      </section>
    </div>
  );
};