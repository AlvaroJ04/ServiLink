from typing import Literal

from pydantic import BaseModel

from app.schemas.perfil import DocumentoOut


class ResolverVerificacion(BaseModel):
    decision: Literal["VERIFICADO", "RECHAZADO"]


class VerificacionPendiente(BaseModel):
    id_perfil: int
    nombre: str
    oficio: str | None
    estado_verificacion: str
    documentos: list[DocumentoOut]
