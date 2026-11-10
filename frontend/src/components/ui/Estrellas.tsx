export const Reputacion = ({ promedio, resenas }: { promedio: number; resenas: number }) =>
  resenas > 0 ? (
    <span>
      <span className="text-[#e8a020] font-bold">★ {promedio.toFixed(1)}</span>{" "}
      <span className="text-[#a8bdda]">({resenas} {resenas === 1 ? "reseña" : "reseñas"})</span>
    </span>
  ) : (
    <span className="text-[#a8bdda]">Sin reseñas todavía</span>
  );

