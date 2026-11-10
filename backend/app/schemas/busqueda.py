from pydantic import BaseModel

from app.schemas.perfil import FranjaDisponibilidad, ItemCatalogo


class TrabajadorCard(BaseModel):
    """Tarjeta del listado de búsqueda (HU-06). Sin email ni teléfono (HU-03)."""
    id_perfil: int
    nombre: str
    oficio: str | None
    experiencia_descripcion: str | None
    tarifa_base: float | None
    promedio_estrellas: float
    total_resenas: int
    estado_verificacion: str
    servicios: list[ItemCatalogo]
    zonas: list[ItemCatalogo]


class TrabajadorPublico(TrabajadorCard):
    """Perfil público completo de un trabajador."""
    disponibilidad: list[FranjaDisponibilidad]


class ResultadoBusqueda(BaseModel):
    total: int
    resultados: list[TrabajadorCard]
