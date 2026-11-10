"""Búsqueda parametrizada de trabajadores (HU-06)."""
from sqlalchemy import and_, exists, func, or_, select
from sqlalchemy.orm import Session

from app.models.perfil_trabajador import PerfilTrabajador, Servicio, TrabajadorServicio, TrabajadorZona, ZonaAtencion
from app.models.solicitud import Calificacion, SolicitudServicio
from app.models.usuario import Usuario
from app.schemas.busqueda import TrabajadorCard
from app.services.perfiles import servicios_de, zonas_de
from app.services.verificacion import VERIFICADO

SEP_ZONA = " - "          # las zonas se guardan como "Ciudad - Barrio"
TODA_LA_CIUDAD = "Toda la ciudad"


def _reputacion():
    """
    Promedio y cantidad de calificaciones por trabajador, calculados en vivo
    con AVG(calificacion.estrellas). No se usa perfil_trabajador.promedio_estrellas
    porque en la base real ese campo no se actualiza solo.
    """
    return (
        select(
            SolicitudServicio.id_trabajador.label("id_perfil"),
            func.avg(Calificacion.estrellas).label("promedio"),
            func.count(Calificacion.id_calificacion).label("total"),
        )
        .join(Calificacion, Calificacion.id_solicitud == SolicitudServicio.id_solicitud)
        .group_by(SolicitudServicio.id_trabajador)
        .subquery()
    )


def _consulta_base(rep):
    return (
        select(
            PerfilTrabajador,
            Usuario.nombre_completo,
            func.coalesce(rep.c.promedio, 0).label("promedio"),
            func.coalesce(rep.c.total, 0).label("total"),
        )
        .join(Usuario, Usuario.id_usuario == PerfilTrabajador.id_usuario)
        .outerjoin(rep, rep.c.id_perfil == PerfilTrabajador.id_perfil)
        .where(Usuario.is_active.is_(True))
    )


def _a_cards(db: Session, filas) -> list[TrabajadorCard]:
    ids = [f[0].id_perfil for f in filas]
    servicios = servicios_de(db, ids) if ids else {}
    zonas = zonas_de(db, ids) if ids else {}
    return [
        TrabajadorCard(
            id_perfil=p.id_perfil,
            nombre=nombre,
            oficio=p.oficio,
            experiencia_descripcion=p.experiencia_descripcion,
            tarifa_base=float(p.tarifa_base) if p.tarifa_base is not None else None,
            promedio_estrellas=round(float(prom), 1),
            total_resenas=int(total),
            estado_verificacion=p.estado_verificacion or "PENDIENTE",
            servicios=servicios[p.id_perfil],
            zonas=zonas[p.id_perfil],
        )
        for p, nombre, prom, total in filas
    ]


def buscar(
    db: Session,
    *,
    servicio_id: int | None,
    zona_id: int | None,
    ciudad: str | None = None,
    q: str | None,
    min_estrellas: float | None,
    tarifa_min: float | None,
    tarifa_max: float | None,
    solo_verificados: bool,
    limit: int,
    offset: int,
) -> tuple[int, list[TrabajadorCard]]:
    rep = _reputacion()
    filtros = []

    if solo_verificados:
        filtros.append(PerfilTrabajador.estado_verificacion == VERIFICADO)
    if servicio_id is not None:
        filtros.append(
            exists().where(
                and_(
                    TrabajadorServicio.id_perfil == PerfilTrabajador.id_perfil,
                    TrabajadorServicio.id_servicio == servicio_id,
                )
            )
        )
    if zona_id is not None:
        zonas_validas = [zona_id]
        nombre = db.scalar(select(ZonaAtencion.nombre_zona).where(ZonaAtencion.id_zona == zona_id))
        if nombre and SEP_ZONA in nombre:
            # Quien atiende "toda la ciudad" también cubre este barrio
            prefijo = nombre.split(SEP_ZONA, 1)[0]
            zonas_validas += list(db.scalars(
                select(ZonaAtencion.id_zona).where(ZonaAtencion.nombre_zona == f"{prefijo}{SEP_ZONA}{TODA_LA_CIUDAD}")
            ))
        filtros.append(
            exists().where(
                and_(TrabajadorZona.id_perfil == PerfilTrabajador.id_perfil, TrabajadorZona.id_zona.in_(zonas_validas))
            )
        )
    if ciudad:
        filtros.append(
            exists().where(
                and_(
                    TrabajadorZona.id_perfil == PerfilTrabajador.id_perfil,
                    TrabajadorZona.id_zona == ZonaAtencion.id_zona,
                    ZonaAtencion.nombre_zona.ilike(f"{ciudad.strip()}{SEP_ZONA}%"),
                )
            )
        )
    if q:
        patron = f"%{q.strip()}%"
        filtros.append(
            or_(
                PerfilTrabajador.oficio.ilike(patron),
                PerfilTrabajador.experiencia_descripcion.ilike(patron),
                Usuario.nombre_completo.ilike(patron),
                exists().where(
                    and_(
                        TrabajadorServicio.id_perfil == PerfilTrabajador.id_perfil,
                        TrabajadorServicio.id_servicio == Servicio.id_servicio,
                        Servicio.nombre_servicio.ilike(patron),
                    )
                ),
            )
        )
    if min_estrellas is not None:
        filtros.append(func.coalesce(rep.c.promedio, 0) >= min_estrellas)
    if tarifa_min is not None:
        filtros.append(PerfilTrabajador.tarifa_base >= tarifa_min)
    if tarifa_max is not None:
        filtros.append(PerfilTrabajador.tarifa_base <= tarifa_max)

    base = _consulta_base(rep).where(*filtros)
    total = db.scalar(select(func.count()).select_from(base.order_by(None).subquery())) or 0
    filas = db.execute(
        base.order_by(func.coalesce(rep.c.promedio, 0).desc(), Usuario.nombre_completo, PerfilTrabajador.id_perfil)
        .limit(limit)
        .offset(offset)
    ).all()
    return total, _a_cards(db, filas)


def obtener_publico(db: Session, id_perfil: int, *, solo_verificados: bool) -> TrabajadorCard | None:
    rep = _reputacion()
    consulta = _consulta_base(rep).where(PerfilTrabajador.id_perfil == id_perfil)
    if solo_verificados:
        consulta = consulta.where(PerfilTrabajador.estado_verificacion == VERIFICADO)
    fila = db.execute(consulta).first()
    return _a_cards(db, [fila])[0] if fila else None
