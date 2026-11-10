"""
Endpoints del trabajador: HU-03 (perfil), HU-04 (documentos) y HU-05 (estado).
Todos exigen rol "trabajador" (HU-02).
"""
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import require_role
from app.models.perfil_trabajador import DocumentoVerificacion, PerfilTrabajador
from app.models.usuario import Usuario
from app.schemas.perfil import TIPOS_DOCUMENTO, DocumentoOut, PerfilIn, PerfilOut
from app.services import verificacion
from app.services.archivos import leer_y_validar
from app.services.perfiles import aplicar_perfil, exigir_perfil, perfil_de_usuario, perfil_out
from app.services.storage import StorageError, get_storage

router = APIRouter(prefix="/trabajador", tags=["Trabajador (HU-03, HU-04, HU-05)"])
solo_trabajador = require_role("trabajador")


# ---------------------------------------------------------------- HU-03: perfil
@router.get("/perfil", response_model=PerfilOut)
def ver_perfil(usuario: Usuario = Depends(solo_trabajador), db: Session = Depends(get_db)):
    """Perfil del trabajador autenticado, incluido su estado de verificación (HU-05)."""
    return perfil_out(db, exigir_perfil(db, usuario), usuario)


@router.post("/perfil", response_model=PerfilOut, status_code=status.HTTP_201_CREATED)
def crear_perfil(data: PerfilIn, usuario: Usuario = Depends(solo_trabajador), db: Session = Depends(get_db)):
    if perfil_de_usuario(db, usuario) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya tienes un perfil; usa PUT para modificarlo")
    perfil = PerfilTrabajador(id_usuario=usuario.id_usuario, estado_verificacion=verificacion.PENDIENTE)
    db.add(perfil)
    aplicar_perfil(db, perfil, data)
    db.commit()
    db.refresh(perfil)
    return perfil_out(db, perfil, usuario)


@router.put("/perfil", response_model=PerfilOut)
def actualizar_perfil(data: PerfilIn, usuario: Usuario = Depends(solo_trabajador), db: Session = Depends(get_db)):
    perfil = exigir_perfil(db, usuario)
    aplicar_perfil(db, perfil, data)
    db.commit()
    db.refresh(perfil)
    return perfil_out(db, perfil, usuario)


@router.delete("/perfil", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_perfil(usuario: Usuario = Depends(solo_trabajador), db: Session = Depends(get_db)):
    perfil = exigir_perfil(db, usuario)
    rutas = list(
        db.scalars(select(DocumentoVerificacion.ruta_archivo_azure).where(DocumentoVerificacion.id_perfil == perfil.id_perfil))
    )
    try:
        db.delete(perfil)  # la base borra en cascada servicios, zonas, disponibilidad y documentos
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT, "No se puede eliminar el perfil porque tiene solicitudes de servicio asociadas"
        )
    for ruta in rutas:  # los documentos de identidad no deben quedar huérfanos en el almacenamiento
        try:
            get_storage().delete(ruta)
        except Exception:
            pass
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ------------------------------------------------------------ HU-04: documentos
@router.get("/documentos", response_model=list[DocumentoOut])
def listar_documentos(usuario: Usuario = Depends(solo_trabajador), db: Session = Depends(get_db)):
    perfil = exigir_perfil(db, usuario)
    docs = db.scalars(
        select(DocumentoVerificacion)
        .where(DocumentoVerificacion.id_perfil == perfil.id_perfil)
        .order_by(DocumentoVerificacion.id_documento)
    )
    return [DocumentoOut.model_validate(d, from_attributes=True) for d in docs]


@router.post("/documentos", response_model=DocumentoOut, status_code=status.HTTP_201_CREATED)
async def subir_documento(
    tipo_documento: str = Form(...),
    archivo: UploadFile = File(...),
    usuario: Usuario = Depends(solo_trabajador),
    db: Session = Depends(get_db),
):
    """
    Sube un documento de verificación (PDF, JPG/JPEG o PNG, máx. 5 MB).
    Se valida extensión, tipo de contenido, tamaño y firma real del archivo
    antes de guardarlo en el almacenamiento privado. Al subirlo, el perfil
    pasa de PENDIENTE (o RECHAZADO) a EN_REVISION (HU-05).
    """
    perfil = exigir_perfil(db, usuario)
    if tipo_documento not in TIPOS_DOCUMENTO:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            f"Tipo de documento inválido. Opciones: {', '.join(TIPOS_DOCUMENTO)}",
        )

    datos, extension, content_type = await leer_y_validar(archivo)

    nombre_blob = f"perfil-{perfil.id_perfil}/{uuid.uuid4().hex}{extension}"  # nunca se usa el nombre que envía el usuario
    try:
        ruta = get_storage().save(nombre_blob, datos, content_type)
    except Exception:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "No se pudo guardar el archivo. Intenta de nuevo.")

    doc = DocumentoVerificacion(
        id_perfil=perfil.id_perfil,
        tipo_documento=tipo_documento,
        ruta_archivo_azure=ruta,
        estado_documento="PENDIENTE",
    )
    db.add(doc)
    if perfil.estado_verificacion in (verificacion.PENDIENTE, verificacion.RECHAZADO):
        verificacion.cambiar_estado(perfil, verificacion.EN_REVISION)
    db.commit()
    db.refresh(doc)
    return DocumentoOut.model_validate(doc, from_attributes=True)
