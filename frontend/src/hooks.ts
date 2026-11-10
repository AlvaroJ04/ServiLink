import { useEffect, useState } from 'react';
import { apiCatalogos, type Catalogos } from './api';

// Carga las listas cerradas (especialidades, zonas, etc.) desde la base de datos.
export function useCatalogos() {
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let vivo = true;
    apiCatalogos()
      .then((c) => vivo && setCatalogos(c))
      .catch((e: Error) => vivo && setError(e.message));
    return () => { vivo = false; };
  }, []);
  return { catalogos, error };
}
