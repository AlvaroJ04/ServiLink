"""
Almacenamiento PRIVADO de documentos de verificación (HU-04).

- AzureBlobStorage: contenedor privado de Azure Blob Storage (producción).
  El contenedor se crea SIN acceso público; los archivos solo se leen a
  través de la API (con autenticación), nunca por una URL abierta.
- LocalStorage: carpeta del servidor, solo para desarrollo sin Azure.

En ambos casos lo que se guarda en la columna ruta_archivo_azure es
"<contenedor>/<nombre_del_blob>".
"""
from pathlib import Path
from typing import Protocol

from app.core.config import settings


class StorageError(Exception):
    pass


class Storage(Protocol):
    def save(self, blob_name: str, data: bytes, content_type: str) -> str: ...
    def read(self, ruta: str) -> bytes: ...
    def delete(self, ruta: str) -> None: ...


class AzureBlobStorage:
    def __init__(self, connection_string: str, container: str):
        from azure.core.exceptions import ResourceExistsError
        from azure.storage.blob import BlobServiceClient

        self._container = container
        self._service = BlobServiceClient.from_connection_string(connection_string)
        self._client = self._service.get_container_client(container)
        try:
            # public_access=None -> contenedor privado
            self._client.create_container()
        except ResourceExistsError:
            pass

    def save(self, blob_name: str, data: bytes, content_type: str) -> str:
        from azure.storage.blob import ContentSettings

        self._client.upload_blob(
            name=blob_name,
            data=data,
            overwrite=False,
            content_settings=ContentSettings(content_type=content_type),
        )
        return f"{self._container}/{blob_name}"

    def read(self, ruta: str) -> bytes:
        blob_name = _blob_name(ruta, self._container)
        return self._client.download_blob(blob_name).readall()

    def delete(self, ruta: str) -> None:
        from azure.core.exceptions import ResourceNotFoundError

        try:
            self._client.delete_blob(_blob_name(ruta, self._container))
        except ResourceNotFoundError:
            pass


class LocalStorage:
    def __init__(self, base_dir: str, container: str):
        self._container = container
        self._root = (Path(base_dir) / container).resolve()
        self._root.mkdir(parents=True, exist_ok=True)

    def _path(self, blob_name: str) -> Path:
        destino = (self._root / blob_name).resolve()
        if self._root not in destino.parents:  # evita path traversal
            raise StorageError("Ruta de archivo inválida")
        return destino

    def save(self, blob_name: str, data: bytes, content_type: str) -> str:
        destino = self._path(blob_name)
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_bytes(data)
        return f"{self._container}/{blob_name}"

    def read(self, ruta: str) -> bytes:
        destino = self._path(_blob_name(ruta, self._container))
        if not destino.is_file():
            raise StorageError("Archivo no encontrado")
        return destino.read_bytes()

    def delete(self, ruta: str) -> None:
        self._path(_blob_name(ruta, self._container)).unlink(missing_ok=True)


def _blob_name(ruta: str, container: str) -> str:
    prefijo = container + "/"
    if not ruta.startswith(prefijo):
        raise StorageError("Ruta de archivo inválida")
    return ruta[len(prefijo):]


_storage: Storage | None = None


def get_storage() -> Storage:
    """Devuelve el almacenamiento configurado (se crea una sola vez)."""
    global _storage
    if _storage is None:
        if settings.AZURE_STORAGE_CONNECTION_STRING:
            _storage = AzureBlobStorage(settings.AZURE_STORAGE_CONNECTION_STRING, settings.AZURE_CONTAINER)
        else:
            _storage = LocalStorage(settings.LOCAL_UPLOAD_DIR, settings.AZURE_CONTAINER)
    return _storage
