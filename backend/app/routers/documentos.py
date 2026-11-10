"""Descarga protegida de documentos (HU-04): los archivos nunca tienen URL pública."""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.perfil_trabajador import DocumentoVerificacion, PerfilTrabajador
from app.models.usuario import Usuario
from app.services.archivos import PERMITIDOS
from app.services.storage import StorageError, get_storage

router = APIRouter(prefix="/documentos", tags=["Documentos (HU-04)"])


@router.get("/{id_documento}/archivo")
def descargar_documento(
    id_documento: int, usuario: Usuario = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Solo el dueño del documento o un administrador pueden verlo."""
    doc = db.get(DocumentoVerificacion, id_documento)
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento no encontrado")
    perfil = db.get(PerfilTrabajador, doc.id_perfil)
    es_admin = usuario.rol.nombre.lower() == "admin"
    if not es_admin and (perfil is None or perfil.id_usuario != usuario.id_usuario):
        # 404 y no 403: no se revela que el documento existe
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento no encontrado")
    try:
        contenido = get_storage().read(doc.ruta_archivo_azure)
    except StorageError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "El archivo no está disponible")
    extension = "." + doc.ruta_archivo_azure.rsplit(".", 1)[-1].lower()
    tipo = PERMITIDOS.get(extension, ("application/octet-stream", ()))[0]
    return Response(
        content=contenido,
        media_type=tipo,
        headers={"Content-Disposition": "inline", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff"},
    )
