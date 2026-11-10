from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuración central del proyecto.
    Los valores se cargan desde el archivo .env (ver .env.example).
    """

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # --- Almacenamiento de documentos (HU-04) ---
    # Si AZURE_STORAGE_CONNECTION_STRING tiene valor, los archivos se guardan
    # en un contenedor PRIVADO de Azure Blob Storage. Si está vacío (desarrollo
    # local), se guardan en la carpeta LOCAL_UPLOAD_DIR del servidor, que nunca
    # se publica como carpeta estática.
    AZURE_STORAGE_CONNECTION_STRING: str | None = None
    AZURE_CONTAINER: str = "documentos-verificacion"
    LOCAL_UPLOAD_DIR: str = "uploads_privados"
    MAX_UPLOAD_MB: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
