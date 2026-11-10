export const formatoCOP = (n: number | null) =>
  n == null ? "A convenir" : `$${Math.round(n).toLocaleString("es-CO")}`;
