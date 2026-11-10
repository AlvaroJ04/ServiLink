from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import require_role
from app.models.perfil_trabajador import DocumentoVerificacion, PerfilTrabajador
from app.models.usuario import Usuario
from app.schemas.perfil import DocumentoOut
from app.schemas.usuario import UsuarioOut
from app.schemas.verificacion import ResolverVerificacion, VerificacionPendiente
from app.services import verificacion

router = APIRouter(prefix="/admin", tags=["Administración (solo admin)"])
solo_admin = require_role("admin")


@router.get("/usuarios", response_model=list[UsuarioOut])
def listar_usuarios(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(solo_admin),
):
    """
    HU-02: ejemplo concreto de RBAC.
    Esta ruta representa el 'panel de administración' (HU-12, Sprint 4):
    solo un usuario con rol 'admin' puede listar todos los usuarios.
    Un cliente o trabajador que intente entrar aquí recibe 403 Forbidden,
    que es exactamente el criterio de aceptación de HU-02.
    """
    usuarios = db.query(Usuario).all()
    return [UsuarioOut.from_orm_with_rol(u) for u in usuarios]


def _armar(db: Session, perfil: PerfilTrabajador, nombre: str) -> VerificacionPendiente:
    docs = db.scalars(
        select(DocumentoVerificacion)
        .where(DocumentoVerificacion.id_perfil == perfil.id_perfil)
        .order_by(DocumentoVerificacion.id_documento)
    )
    return VerificacionPendiente(
        id_perfil=perfil.id_perfil,
        nombre=nombre,
        oficio=perfil.oficio,
        estado_verificacion=perfil.estado_verificacion,
        documentos=[DocumentoOut.model_validate(d, from_attributes=True) for d in docs],
    )


@router.get("/verificaciones", response_model=list[VerificacionPendiente])
def listar_verificaciones(
    estado: str = verificacion.EN_REVISION,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(solo_admin),
):
    """HU-05: perfiles en el estado indicado (por defecto, los que esperan revisión)."""
    if estado not in verificacion.ESTADOS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"Estado inválido. Opciones: {', '.join(verificacion.ESTADOS)}")
    filas = db.execute(
        select(PerfilTrabajador, Usuario.nombre_completo)
        .join(Usuario, Usuario.id_usuario == PerfilTrabajador.id_usuario)
        .where(PerfilTrabajador.estado_verificacion == estado)
        .order_by(PerfilTrabajador.id_perfil)
    ).all()
    return [_armar(db, p, nombre) for p, nombre in filas]


@router.post("/verificaciones/{id_perfil}/resolver", response_model=VerificacionPendiente)
def resolver_verificacion(
    id_perfil: int,
    cuerpo: ResolverVerificacion,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(solo_admin),
):
    """
    HU-05: el admin aprueba (VERIFICADO) o rechaza (RECHAZADO) un perfil que está EN_REVISION.
    Cualquier otra transición responde 409.
    """
    perfil = db.get(PerfilTrabajador, id_perfil)
    if perfil is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Perfil no encontrado")
    verificacion.cambiar_estado(perfil, cuerpo.decision)
    estado_doc = "APROBADO" if cuerpo.decision == verificacion.VERIFICADO else "RECHAZADO"
    for doc in db.scalars(
        select(DocumentoVerificacion).where(
            DocumentoVerificacion.id_perfil == id_perfil, DocumentoVerificacion.estado_documento == "PENDIENTE"
        )
    ):
        doc.estado_documento = estado_doc
    db.commit()
    nombre = db.scalar(select(Usuario.nombre_completo).where(Usuario.id_usuario == perfil.id_usuario))
    return _armar(db, perfil, nombre)
