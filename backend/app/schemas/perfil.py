import re
from datetime import time

from pydantic import BaseModel, Field, field_validator, model_validator

DIAS_SEMANA = ("Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo")
TIPOS_DOCUMENTO = ("Cédula de ciudadanía", "Certificación técnica", "Antecedentes judiciales", "Otro")

# HU-03: "no se deben mostrar ni publicar números de teléfono ni correos
# personales en el perfil público". Se rechazan en el texto libre del perfil.
_RE_EMAIL = re.compile(r"[\w.+-]+@[\w-]+(\.[\w-]+)+")
_RE_TELEFONO = re.compile(r"(?:\+?\d[\s().-]*){7,}")


def _sin_datos_de_contacto(texto: str | None) -> str | None:
    if texto is None:
        return None
    if _RE_EMAIL.search(texto) or _RE_TELEFONO.search(texto):
        raise ValueError(
            "No incluyas correos ni números de teléfono: por seguridad no se publican en el perfil."
        )
    return texto.strip() or None


class FranjaDisponibilidad(BaseModel):
    dia_semana: str
    hora_inicio: time
    hora_fin: time

    @field_validator("dia_semana")
    @classmethod
    def _dia_valido(cls, v: str) -> str:
        if v not in DIAS_SEMANA:
            raise ValueError(f"Día inválido. Opciones: {', '.join(DIAS_SEMANA)}")
        return v

    @model_validator(mode="after")
    def _horas_coherentes(self):
        if self.hora_fin <= self.hora_inicio:
            raise ValueError("La hora de fin debe ser posterior a la hora de inicio")
        return self


class PerfilIn(BaseModel):
    """Cuerpo de POST/PUT /trabajador/perfil (HU-03)."""
    id_servicio_principal: int = Field(description="Especialidad principal: id de un servicio del catálogo")
    servicios_ids: list[int] = Field(default_factory=list, description="Servicios que ofrece (ids del catálogo)")
    zonas_ids: list[int] = Field(default_factory=list, description="Zonas de atención (ids del catálogo)")
    disponibilidad: list[FranjaDisponibilidad] = Field(default_factory=list)
    experiencia_descripcion: str | None = Field(default=None, max_length=1000)
    tarifa_base: float | None = Field(default=None, ge=0, le=99_999_999)

    @field_validator("experiencia_descripcion")
    @classmethod
    def _sin_contacto(cls, v):
        return _sin_datos_de_contacto(v)

    @model_validator(mode="after")
    def _sin_franjas_solapadas(self):
        por_dia: dict[str, list[FranjaDisponibilidad]] = {}
        for f in self.disponibilidad:
            por_dia.setdefault(f.dia_semana, []).append(f)
        for dia, franjas in por_dia.items():
            franjas.sort(key=lambda f: f.hora_inicio)
            for a, b in zip(franjas, franjas[1:]):
                if b.hora_inicio < a.hora_fin:
                    raise ValueError(f"Hay franjas que se solapan el día {dia}")
        return self


class ItemCatalogo(BaseModel):
    id: int
    nombre: str


class PerfilOut(BaseModel):
    """Perfil del propio trabajador (vista privada). Nunca incluye email ni teléfono."""
    id_perfil: int
    nombre: str
    id_servicio_principal: int | None
    oficio: str | None
    experiencia_descripcion: str | None
    tarifa_base: float | None
    estado_verificacion: str
    servicios: list[ItemCatalogo]
    zonas: list[ItemCatalogo]
    disponibilidad: list[FranjaDisponibilidad]


class DocumentoOut(BaseModel):
    id_documento: int
    tipo_documento: str
    estado_documento: str
