from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Rol(Base):
    """
    Tabla ROL del modelo ER.
    Valores esperados (ver seed.py): 'cliente', 'trabajador', 'admin'.
    """
    __tablename__ = "rol"

    id_rol: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    usuarios: Mapped[list["Usuario"]] = relationship(back_populates="rol")
