import type { Item } from "./api";

// Las zonas vienen de la base como "Ciudad - Barrio". Aquí se agrupan por ciudad.
export const SEP_ZONA = " - ";
export const TODA_LA_CIUDAD = "Toda la ciudad";

export interface GrupoCiudad { ciudad: string; zonas: { id: number; barrio: string }[] }

export function agruparZonas(zonas: Item[]): GrupoCiudad[] {
  const mapa = new Map<string, GrupoCiudad>();
  for (const z of zonas) {
    const i = z.nombre.indexOf(SEP_ZONA);
    const ciudad = i >= 0 ? z.nombre.slice(0, i) : "Otras zonas";
    const barrio = i >= 0 ? z.nombre.slice(i + SEP_ZONA.length) : z.nombre;
    if (!mapa.has(ciudad)) mapa.set(ciudad, { ciudad, zonas: [] });
    mapa.get(ciudad)!.zonas.push({ id: z.id, barrio });
  }
  const grupos = [...mapa.values()];
  grupos.forEach((g) =>
    g.zonas.sort((a, b) =>
      a.barrio === TODA_LA_CIUDAD ? -1 : b.barrio === TODA_LA_CIUDAD ? 1 : a.barrio.localeCompare(b.barrio, "es")),
  );
  return grupos.sort((a, b) => (a.ciudad === "Otras zonas" ? 1 : b.ciudad === "Otras zonas" ? -1 : a.ciudad.localeCompare(b.ciudad, "es")));
}

// Centro aproximado de cada ciudad, para el botón "Usar mi ubicación" (no se envía a ningún servicio externo).
const CENTROS: Record<string, [number, number]> = {
  "Bogotá": [4.711, -74.0721],
  "Medellín": [6.2442, -75.5812],
  "Cali": [3.4516, -76.532],
  "Barranquilla": [10.9639, -74.7964],
  "Cartagena": [10.391, -75.4794],
  "Bucaramanga": [7.1193, -73.1227],
};

function km(a: [number, number], b: [number, number]) {
  const r = (g: number) => (g * Math.PI) / 180;
  const h = Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// Ciudad disponible más cercana (máx. 80 km); null si no hay cobertura cerca.
export function ciudadMasCercana(lat: number, lng: number, disponibles: string[]): string | null {
  let mejor: string | null = null;
  let menor = Infinity;
  for (const c of disponibles) {
    const centro = CENTROS[c];
    if (!centro) continue;
    const d = km([lat, lng], centro);
    if (d < menor) { menor = d; mejor = c; }
  }
  return menor <= 80 ? mejor : null;
}

export function obtenerUbicacion(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("Tu navegador no permite obtener la ubicación."));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject(new Error(e.code === 1 ? "Permiso de ubicación denegado. Elige la ciudad manualmente." : "No se pudo obtener tu ubicación.")),
      { timeout: 10000 },
    );
  });
}
