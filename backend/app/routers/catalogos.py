from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.perfil_trabajador import PerfilTrabajador, Servicio, TrabajadorServicio, TrabajadorZona, ZonaAtencion
from app.models.solicitud import Calificacion
from app.services.verificacion import VERIFICADO
from app.schemas.perfil import DIAS_SEMANA, TIPOS_DOCUMENTO, ItemCatalogo

router = APIRouter(prefix="/catalogos", tags=["Catálogos"])


class Catalogos(BaseModel):
    servicios: list[ItemCatalogo]
    zonas: list[ItemCatalogo]
    tipos_documento: list[str]
    dias_semana: list[str]


@router.get("", response_model=Catalogos)
def listar_catalogos(db: Session = Depends(get_db)):
    """
    Listas cerradas que usa el frontend en los desplegables (especialidad,
    servicios, zonas, tipos de documento, días). Salen de la base de datos,
    así nadie puede escribir un valor que no exista.
    Es público porque el formulario de registro lo necesita antes de iniciar sesión.
    """
    servicios = db.execute(select(Servicio.id_servicio, Servicio.nombre_servicio).order_by(Servicio.nombre_servicio))
    zonas = db.execute(select(ZonaAtencion.id_zona, ZonaAtencion.nombre_zona).order_by(ZonaAtencion.nombre_zona))
    return Catalogos(
        servicios=[ItemCatalogo(id=i, nombre=n) for i, n in servicios],
        zonas=[ItemCatalogo(id=i, nombre=n) for i, n in zonas],
        tipos_documento=list(TIPOS_DOCUMENTO),
        dias_semana=list(DIAS_SEMANA),
    )


class CategoriaResumen(BaseModel):
    id: int
    nombre: str
    descripcion: str | None
    tecnicos: int


class Resumen(BaseModel):
    categorias: list[CategoriaResumen]
    tecnicos_verificados: int
    ciudades: int
    promedio_estrellas: float | None
    total_resenas: int


@router.get("/resumen", response_model=Resumen)
def resumen(db: Session = Depends(get_db)):
    """
    Datos REALES para la página de inicio (público): categorías con cuántos técnicos
    verificados hay en cada una, y cifras generales. No expone datos personales.
    """
    por_servicio = dict(
        db.execute(
            select(TrabajadorServicio.id_servicio, func.count(func.distinct(PerfilTrabajador.id_perfil)))
            .join(PerfilTrabajador, PerfilTrabajador.id_perfil == TrabajadorServicio.id_perfil)
            .where(PerfilTrabajador.estado_verificacion == VERIFICADO)
            .group_by(TrabajadorServicio.id_servicio)
        ).all()
    )
    categorias = [
        CategoriaResumen(id=i, nombre=n, descripcion=d, tecnicos=int(por_servicio.get(i, 0)))
        for i, n, d in db.execute(
            select(Servicio.id_servicio, Servicio.nombre_servicio, Servicio.descripcion).order_by(Servicio.nombre_servicio)
        )
    ]
    verificados = db.scalar(select(func.count()).select_from(PerfilTrabajador).where(PerfilTrabajador.estado_verificacion == VERIFICADO)) or 0
    # Ciudades donde hay técnicos verificados atendiendo (parte de la zona antes de " - ")
    nombres_zona = db.scalars(
        select(ZonaAtencion.nombre_zona)
        .join(TrabajadorZona, TrabajadorZona.id_zona == ZonaAtencion.id_zona)
        .join(PerfilTrabajador, PerfilTrabajador.id_perfil == TrabajadorZona.id_perfil)
        .where(PerfilTrabajador.estado_verificacion == VERIFICADO)
    )
    ciudades = {n.split(" - ", 1)[0] for n in nombres_zona}
    prom, total = db.execute(select(func.avg(Calificacion.estrellas), func.count(Calificacion.id_calificacion))).one()
    return Resumen(
        categorias=categorias,
        tecnicos_verificados=int(verificados),
        ciudades=len(ciudades),
        promedio_estrellas=round(float(prom), 1) if prom is not None else None,
        total_resenas=int(total or 0),
    )
