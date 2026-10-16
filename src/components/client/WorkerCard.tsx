export const WorkerCard = ({ name, specialty, zone, rating, experience }: any) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: "#e8edf5", color: "#0f1f3d" }}>
            {name.charAt(0)}
          </div>
          <div className="flex items-center gap-1 bg-[#fff8e1] px-2 py-1 rounded-lg border border-[#ffecb3]">
            <span className="text-sm text-[#e8a020]">★</span>
            <span className="text-xs font-bold text-[#0f1f3d]">{rating}</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-[#0f1f3d] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>{name}</h3>
        <p className="text-sm font-medium text-[#1a3a6b] mb-3">{specialty}</p>
        
        <div className="space-y-2 mb-6">
          <p className="text-xs text-[#6b82a0] flex items-center gap-2">
            <span>📍</span> Zona: {zone}
          </p>
          <p className="text-xs text-[#6b82a0] flex items-center gap-2">
            <span>💼</span> Experiencia: {experience} años
          </p>
        </div>
      </div>
      
      <button className="w-full py-2.5 rounded-lg font-semibold text-xs border border-[#0f1f3d] text-[#0f1f3d] hover:bg-[#0f1f3d] hover:text-white transition-all">
        Ver perfil completo
      </button>
    </div>
  );
};