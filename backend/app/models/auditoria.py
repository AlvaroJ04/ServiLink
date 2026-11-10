from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class LogAuditoria(Base):
    """
    Tabla LOG_AUDITORIA. Registro de acciones críticas (HU-12).

    En la base real la llenan triggers de Postgres (registro de usuario,
    borrado lógico, cambio de estado de solicitud); la app solo la lee.
    """
    __tablename__ = "log_auditoria"

    id_log: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_usuario: Mapped[int | None] = mapped_column(ForeignKey("usuario.id_usuario"))
    accion: Mapped[str] = mapped_column(String(100), nullable=False)
    fecha_hora: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.current_timestamp())
