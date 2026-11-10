"""HU-06: búsqueda y filtro de trabajadores por servicio y zona (sin GPS ni mapas)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import require_role
from app.models.usuario import Usuario
from app.schemas.busqueda import ResultadoBusqueda, TrabajadorPublico
from app.services import busqueda
from app.services.perfiles import disponibilidad_de

router = APIRouter(prefix="/busqueda", tags=["Búsqueda (HU-06)"])
puede_buscar = require_role("cliente", "admin")


@router.get("/trabajadores", response_model=ResultadoBusqueda)
def buscar_trabajadores(
    servicio_id: int | None = Query(None, description="Filtra por servicio técnico (id del catálogo)"),
    zona_id: int | None = Query(None, description="Filtra por zona de atención (id del catálogo)"),
    ciudad: str | None = Query(None, max_length=60, description="Filtra por ciudad (cualquiera de sus barrios)"),
    q: str | None = Query(None, max_length=100, description="Texto libre: oficio, servicio, experiencia o nombre"),
    min_estrellas: float | None = Query(None, ge=0, le=5),
    tarifa_min: float | None = Query(None, ge=0),
    tarifa_max: float | None = Query(None, ge=0),
    solo_verificados: bool = Query(True, description="Solo el admin puede poner false"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    usuario: Usuario = Depends(puede_buscar),
    db: Session = Depends(get_db),
):
    """
    Lista perfiles compatibles con experiencia y reputación (estrellas).
    Un cliente solo ve trabajadores VERIFICADOS (HU-05): son los que ya pueden prestar servicios.
    """
    if usuario.rol.nombre.lower() != "admin":
        solo_verificados = True
    total, resultados = busqueda.buscar(
        db,
        servicio_id=servicio_id,
        zona_id=zona_id,
        ciudad=ciudad,
        q=q,
        min_estrellas=min_estrellas,
        tarifa_min=tarifa_min,
        tarifa_max=tarifa_max,
        solo_verificados=solo_verificados,
        limit=limit,
        offset=offset,
    )
    return ResultadoBusqueda(total=total, resultados=resultados)


@router.get("/trabajadores/{id_perfil}", response_model=TrabajadorPublico)
def ver_trabajador(id_perfil: int, usuario: Usuario = Depends(puede_buscar), db: Session = Depends(get_db)):
    """Perfil público de un trabajador. Nunca incluye correo ni teléfono (HU-03)."""
    es_admin = usuario.rol.nombre.lower() == "admin"
    card = busqueda.obtener_publico(db, id_perfil, solo_verificados=not es_admin)
    if card is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Trabajador no encontrado")
    return TrabajadorPublico(**card.model_dump(), disponibilidad=disponibilidad_de(db, id_perfil))
