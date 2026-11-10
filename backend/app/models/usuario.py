from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Usuario(Base):
    """
    Tabla USUARIO del modelo ER. Cubre HU-01 (registro/login) y
    es la base para HU-02 (RBAC), ya que cada usuario tiene un id_rol.
    """
    __tablename__ = "usuario"

    id_usuario: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_rol: Mapped[int] = mapped_column(ForeignKey("rol.id_rol"), nullable=False)
    nombre_completo: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("true"), nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.current_timestamp())

    rol: Mapped["Rol"] = relationship(back_populates="usuarios")

    # Relaciones que se usarán a partir del Sprint 2 en adelante
    perfil_trabajador: Mapped["PerfilTrabajador"] = relationship(
        back_populates="usuario", uselist=False
    )
