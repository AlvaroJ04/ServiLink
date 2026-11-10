import { type ReactNode } from "react";

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex" style={{ background: "#faf8f4" }}>
      {/* Panel Izquierdo (Propuesta de valor) */}
      <div className="hidden lg:flex flex-col justify-between w-96 p-10 flex-shrink-0" style={{ background: "#0f1f3d" }}>
        <button className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#e8a020", color: "#0f1f3d" }}>
            SL
          </div>
          <span className="text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: "white" }}>
            ServiLink
          </span>
        </button>

        <div>
          <h2 className="text-3xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Fraunces', serif", color: "white" }}>
            Conectamos trabajo con confianza.
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#6b82a0" }}>
            Perfiles verificados, contratos digitales y comunicación directa entre clientes y técnicos independientes.
          </p>
          <div className="space-y-3">
            {[
              "✓ Perfiles profesionales verificados",
              "✓ Contratos PDF automáticos",
              "✓ Búsqueda por zona y servicio",
              "✓ Sistema de reputación transparente",
              "✓ Comunicación interna segura",
            ].map((f) => (
              <p key={f} className="text-xs" style={{ color: "#a8bdda" }}>{f}</p>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "#3a5070" }}>
          © 2024 ServiLink MVP · Todos los derechos reservados
        </p>
      </div>

      {/* Contenedor Derecho (Dinámico) */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};