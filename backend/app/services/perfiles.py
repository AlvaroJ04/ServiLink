"""Lógica compartida de perfiles de trabajador (HU-03)."""
from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.perfil_trabajador import (
    Disponibilidad,
    PerfilTrabajador,
    Servicio,
    TrabajadorServicio,
    TrabajadorZona,
    ZonaAtencion,
)
from app.models.usuario import Usuario
from app.schemas.perfil import FranjaDisponibilidad, ItemCatalogo, PerfilIn, PerfilOut


def perfil_de_usuario(db: Session, usuario: Usuario) -> PerfilTrabajador | None:
    return db.scalar(select(PerfilTrabajador).where(PerfilTrabajador.id_usuario == usuario.id_usuario))


def exigir_perfil(db: Session, usuario: Usuario) -> PerfilTrabajador:
    perfil = perfil_de_usuario(db, usuario)
    if perfil is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Aún no has creado tu perfil profesional")
    return perfil


def _error_catalogo(detalle: str) -> HTTPException:
    return HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detalle)


def validar_servicio_principal(db: Session, id_servicio: int) -> Servicio:
    servicio = db.get(Servicio, id_servicio)
    if servicio is None:
        raise _error_catalogo("La especialidad elegida no existe en el catálogo de servicios")
    return servicio


def aplicar_perfil(db: Session, perfil: PerfilTrabajador, data: PerfilIn) -> None:
    """Copia los datos de PerfilIn al perfil y reemplaza servicios, zonas y disponibilidad."""
    principal = validar_servicio_principal(db, data.id_servicio_principal)

    servicios_ids = list(dict.fromkeys([principal.id_servicio, *data.servicios_ids]))  # sin repetidos
    zonas_ids = list(dict.fromkeys(data.zonas_ids))

    existentes = set(db.scalars(select(Servicio.id_servicio).where(Servicio.id_servicio.in_(servicios_ids))))
    if existentes != set(servicios_ids):
        raise _error_catalogo("Alguno de los servicios elegidos no existe en el catálogo")
    if zonas_ids:
        zonas_ok = set(db.scalars(select(ZonaAtencion.id_zona).where(ZonaAtencion.id_zona.in_(zonas_ids))))
        if zonas_ok != set(zonas_ids):
            raise _error_catalogo("Alguna de las zonas elegidas no existe en el catálogo")

    perfil.oficio = principal.nombre_servicio
    perfil.experiencia_descripcion = data.experiencia_descripcion
    perfil.tarifa_base = data.tarifa_base

    db.flush()  # asegura id_perfil en perfiles nuevos
    for tabla in (TrabajadorServicio, TrabajadorZona, Disponibilidad):
        db.execute(delete(tabla).where(tabla.id_perfil == perfil.id_perfil))
    db.add_all(TrabajadorServicio(id_perfil=perfil.id_perfil, id_servicio=i) for i in servicios_ids)
    db.add_all(TrabajadorZona(id_perfil=perfil.id_perfil, id_zona=i) for i in zonas_ids)
    db.add_all(
        Disponibilidad(
            id_perfil=perfil.id_perfil,
            dia_semana=f.dia_semana,
            hora_inicio=f.hora_inicio,
            hora_fin=f.hora_fin,
        )
        for f in data.disponibilidad
    )


def servicios_de(db: Session, ids_perfil: list[int]) -> dict[int, list[ItemCatalogo]]:
    filas = db.execute(
        select(TrabajadorServicio.id_perfil, Servicio.id_servicio, Servicio.nombre_servicio)
        .join(Servicio, Servicio.id_servicio == TrabajadorServicio.id_servicio)
        .where(TrabajadorServicio.id_perfil.in_(ids_perfil))
        .order_by(Servicio.nombre_servicio)
    )
    salida: dict[int, list[ItemCatalogo]] = {i: [] for i in ids_perfil}
    for id_perfil, id_s, nombre in filas:
        salida[id_perfil].append(ItemCatalogo(id=id_s, nombre=nombre))
    return salida


def zonas_de(db: Session, ids_perfil: list[int]) -> dict[int, list[ItemCatalogo]]:
    filas = db.execute(
        select(TrabajadorZona.id_perfil, ZonaAtencion.id_zona, ZonaAtencion.nombre_zona)
        .join(ZonaAtencion, ZonaAtencion.id_zona == TrabajadorZona.id_zona)
        .where(TrabajadorZona.id_perfil.in_(ids_perfil))
        .order_by(ZonaAtencion.nombre_zona)
    )
    salida: dict[int, list[ItemCatalogo]] = {i: [] for i in ids_perfil}
    for id_perfil, id_z, nombre in filas:
        salida[id_perfil].append(ItemCatalogo(id=id_z, nombre=nombre))
    return salida


_ORDEN_DIAS = ("Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo")


def disponibilidad_de(db: Session, id_perfil: int) -> list[FranjaDisponibilidad]:
    franjas = db.scalars(select(Disponibilidad).where(Disponibilidad.id_perfil == id_perfil)).all()
    franjas = sorted(
        franjas,
        key=lambda f: (_ORDEN_DIAS.index(f.dia_semana) if f.dia_semana in _ORDEN_DIAS else 99, f.hora_inicio),
    )
    return [
        FranjaDisponibilidad(dia_semana=f.dia_semana, hora_inicio=f.hora_inicio, hora_fin=f.hora_fin)
        for f in franjas
    ]


def perfil_out(db: Session, perfil: PerfilTrabajador, usuario: Usuario) -> PerfilOut:
    principal = None
    if perfil.oficio:
        principal = db.scalar(select(Servicio.id_servicio).where(Servicio.nombre_servicio == perfil.oficio))
    return PerfilOut(
        id_perfil=perfil.id_perfil,
        nombre=usuario.nombre_completo,
        id_servicio_principal=principal,
        oficio=perfil.oficio,
        experiencia_descripcion=perfil.experiencia_descripcion,
        tarifa_base=float(perfil.tarifa_base) if perfil.tarifa_base is not None else None,
        estado_verificacion=perfil.estado_verificacion or "PENDIENTE",
        servicios=servicios_de(db, [perfil.id_perfil])[perfil.id_perfil],
        zonas=zonas_de(db, [perfil.id_perfil])[perfil.id_perfil],
        disponibilidad=disponibilidad_de(db, perfil.id_perfil),
    )
