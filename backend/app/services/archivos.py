"""
Validación de archivos subidos (HU-04): extensión, tamaño y tipo de contenido.
"""
from pathlib import PurePath

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

# extensión -> (content-type permitido, firma "mágica" con la que debe empezar el archivo)
PERMITIDOS: dict[str, tuple[str, tuple[bytes, ...]]] = {
    ".pdf": ("application/pdf", (b"%PDF-",)),
    ".jpg": ("image/jpeg", (b"\xff\xd8\xff",)),
    ".jpeg": ("image/jpeg", (b"\xff\xd8\xff",)),
    ".png": ("image/png", (b"\x89PNG\r\n\x1a\n",)),
}


async def leer_y_validar(archivo: UploadFile) -> tuple[bytes, str, str]:
    """
    Lee el archivo y valida extensión, tipo declarado, tamaño y contenido real.
    Devuelve (bytes, extensión, content_type). Lanza HTTPException si algo falla.
    """
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024

    extension = PurePath(archivo.filename or "").suffix.lower()
    if extension not in PERMITIDOS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Formato no permitido. Solo se aceptan archivos PDF, JPG/JPEG o PNG.",
        )

    content_type_esperado, firmas = PERMITIDOS[extension]
    if (archivo.content_type or "").lower() != content_type_esperado:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="El tipo de contenido del archivo no coincide con su extensión.",
        )

    # Se lee un byte de más para detectar archivos demasiado grandes sin cargarlos completos
    datos = await archivo.read(max_bytes + 1)
    if len(datos) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"El archivo supera el límite de {settings.MAX_UPLOAD_MB} MB.",
        )
    if len(datos) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo está vacío.")

    if not any(datos.startswith(f) for f in firmas):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="El contenido del archivo no corresponde a un PDF, JPG o PNG válido.",
        )

    return datos, extension, content_type_esperado
