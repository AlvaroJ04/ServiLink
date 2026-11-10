"""
Importa todos los modelos aquí para que:
  1) Alembic los detecte al hacer autogenerate de migraciones.
  2) SQLAlchemy resuelva correctamente las relaciones entre tablas.
"""
from app.models.rol import Rol  # noqa: F401
from app.models.usuario import Usuario  # noqa: F401
from app.models.perfil_trabajador import (  # noqa: F401
    PerfilTrabajador,
    Servicio,
    ZonaAtencion,
    TrabajadorServicio,
    TrabajadorZona,
    Disponibilidad,
    DocumentoVerificacion,
)
from app.models.solicitud import (  # noqa: F401
    SolicitudServicio,
    Mensaje,
    ContratoPdf,
    PagoSimulado,
    Calificacion,
)
from app.models.auditoria import LogAuditoria  # noqa: F401
