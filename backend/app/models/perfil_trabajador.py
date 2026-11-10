from sqlalchemy import ForeignKey, Numeric, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class PerfilTrabajador(Base):
    """Tabla PERFIL_TRABAJADOR. Se implementa a fondo en Sprint 2 (HU-03/04/05).

    NOTA sobre promedio_estrellas: en la base real este campo NO se
    actualiza solo. Para mostrar el promedio vivo hay que calcularlo con
    AVG(calificacion.estrellas) (ver HU-11, Sprint 4).
    Los estados van en MAYÚSCULA ('PENDIENTE', ...), como en la base real.
    """
    __tablename__ = "perfil_trabajador"

    id_perfil: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario", ondelete="CASCADE"), unique=True, nullable=False
    )
    oficio: Mapped[str | None] = mapped_column(String(100))
    experiencia_descripcion: Mapped[str | None] = mapped_column(Text)
    tarifa_base: Mapped[float | None] = mapped_column(Numeric(10, 2))
    estado_verificacion: Mapped[str] = mapped_column(String(50), default="PENDIENTE", server_default="PENDIENTE", nullable=True)  # HU-05
    promedio_estrellas: Mapped[float] = mapped_column(Numeric(3, 2), default=0, server_default="0.00", nullable=True)  # HU-11

    usuario: Mapped["Usuario"] = relationship(back_populates="perfil_trabajador")


class Servicio(Base):
    """Catálogo de tipos de servicio técnico (HU-06)."""
    __tablename__ = "servicio"

    id_servicio: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_servicio: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)


class ZonaAtencion(Base):
    """Catálogo de zonas geográficas (HU-06, sin GPS/mapas)."""
    __tablename__ = "zona_atencion"

    id_zona: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_zona: Mapped[str] = mapped_column(String(100), nullable=False)


class TrabajadorServicio(Base):
    """Relación N:M entre trabajador y servicios que ofrece."""
    __tablename__ = "trabajador_servicio"

    id_trabajador_servicio: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_perfil: Mapped[int] = mapped_column(
        ForeignKey("perfil_trabajador.id_perfil", ondelete="CASCADE"), nullable=False
    )
    id_servicio: Mapped[int] = mapped_column(ForeignKey("servicio.id_servicio", ondelete="CASCADE"), nullable=False)


class TrabajadorZona(Base):
    """Relación N:M entre trabajador y zonas de atención."""
    __tablename__ = "trabajador_zona"

    id_trabajador_zona: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_perfil: Mapped[int] = mapped_column(
        ForeignKey("perfil_trabajador.id_perfil", ondelete="CASCADE"), nullable=False
    )
    id_zona: Mapped[int] = mapped_column(ForeignKey("zona_atencion.id_zona", ondelete="CASCADE"), nullable=False)


class Disponibilidad(Base):
    """Franjas horarias de disponibilidad del trabajador."""
    __tablename__ = "disponibilidad"

    id_disponibilidad: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_perfil: Mapped[int] = mapped_column(
        ForeignKey("perfil_trabajador.id_perfil", ondelete="CASCADE"), nullable=False
    )
    dia_semana: Mapped[str] = mapped_column(String(20), nullable=False)
    hora_inicio: Mapped[Time] = mapped_column(Time, nullable=False)
    hora_fin: Mapped[Time] = mapped_column(Time, nullable=False)


class DocumentoVerificacion(Base):
    """Documentos subidos a Azure Blob Storage para verificación (HU-04)."""
    __tablename__ = "documento_verificacion"

    id_documento: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_perfil: Mapped[int] = mapped_column(
        ForeignKey("perfil_trabajador.id_perfil", ondelete="CASCADE"), nullable=False
    )
    tipo_documento: Mapped[str] = mapped_column(String(100), nullable=False)
    ruta_archivo_azure: Mapped[str] = mapped_column(Text, nullable=False)
    estado_documento: Mapped[str] = mapped_column(String(50), default="PENDIENTE", server_default="PENDIENTE", nullable=True)
