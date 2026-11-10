from datetime import date, datetime, time

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

# Estados de una solicitud. En la base real (plataforma_servicios) el valor
# por defecto es 'PENDIENTE' (MAYÚSCULA) y la base NO tiene un CHECK que
# restrinja los valores: esta lista es solo una convención de la aplicación.
# Confirmar con el compañero de base de datos cuáles son los demás estados.
ESTADOS_SOLICITUD = ("PENDIENTE", "ACEPTADA", "RECHAZADA", "EN_CURSO", "FINALIZADA", "CANCELADA")


class SolicitudServicio(Base):
    """
    Tabla SOLICITUD_SERVICIO. Núcleo de HU-08 (Sprint 3).

    Esta tabla fue creada por el compañero de base de datos (no por las
    migraciones de este proyecto). Diferencias con el diseño original que
    hay que respetar siempre:
      1. La columna de hora se llama "hora_programado" (no "hora_programada").
      2. "id_trabajador" apunta a PERFIL_TRABAJADOR.id_perfil, no directo
         a USUARIO.id_usuario -- para llegar al usuario hay que pasar por
         perfil_trabajador.id_usuario.
      3. Estados en MAYÚSCULA ('PENDIENTE', ...).
    """
    __tablename__ = "solicitud_servicio"

    id_solicitud: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_cliente: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"), nullable=False)
    id_trabajador: Mapped[int] = mapped_column(ForeignKey("perfil_trabajador.id_perfil"), nullable=False)
    id_servicio: Mapped[int] = mapped_column(ForeignKey("servicio.id_servicio"), nullable=False)
    descripcion_problema: Mapped[str | None] = mapped_column(Text)
    fecha_programada: Mapped[date] = mapped_column(Date, nullable=False)
    hora_programado: Mapped[time] = mapped_column(Time, nullable=False)
    duracion_estimada_horas: Mapped[int | None] = mapped_column(Integer)
    valor_acordado: Mapped[float | None] = mapped_column(Numeric(10, 2))
    estado_solicitud: Mapped[str] = mapped_column(String(50), default="PENDIENTE", server_default="PENDIENTE", nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime)


class Mensaje(Base):
    """Tabla MENSAJE. Chat interno asociado a una solicitud (HU-07)."""
    __tablename__ = "mensaje"

    id_mensaje: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_solicitud: Mapped[int] = mapped_column(
        ForeignKey("solicitud_servicio.id_solicitud", ondelete="CASCADE"), nullable=False
    )
    id_emisor: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"), nullable=False)
    contenido: Mapped[str] = mapped_column(Text, nullable=False)
    enviado_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.current_timestamp())


class ContratoPdf(Base):
    """Tabla CONTRATO_PDF. Generado al aceptar una solicitud (HU-09)."""
    __tablename__ = "contrato_pdf"

    id_contrato: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_solicitud: Mapped[int] = mapped_column(
        ForeignKey("solicitud_servicio.id_solicitud", ondelete="CASCADE"), unique=True, nullable=False
    )
    ruta_archivo_azure: Mapped[str] = mapped_column(Text, nullable=False)
    fecha_generacion: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.current_timestamp())


class PagoSimulado(Base):
    """Tabla PAGO_SIMULADO. Comisión y sandbox de pago (HU-10)."""
    __tablename__ = "pago_simulado"

    id_pago: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_solicitud: Mapped[int] = mapped_column(
        ForeignKey("solicitud_servicio.id_solicitud", ondelete="CASCADE"), unique=True, nullable=False
    )
    monto_total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    monto_plataforma: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    monto_trabajador: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    estado_pago: Mapped[str] = mapped_column(String(50), default="SIMULADO", server_default="SIMULADO", nullable=True)
    fecha_pago: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.current_timestamp())


class Calificacion(Base):
    """Tabla CALIFICACION. Reputación del trabajador (HU-11)."""
    __tablename__ = "calificacion"
    __table_args__ = (
        CheckConstraint("estrellas >= 1 AND estrellas <= 5", name="calificacion_estrellas_check"),
    )

    id_calificacion: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_solicitud: Mapped[int] = mapped_column(
        ForeignKey("solicitud_servicio.id_solicitud", ondelete="CASCADE"), unique=True, nullable=False
    )
    estrellas: Mapped[int] = mapped_column(Integer, nullable=False)
    comentario: Mapped[str | None] = mapped_column(Text)
    fecha_creacion: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.current_timestamp())
