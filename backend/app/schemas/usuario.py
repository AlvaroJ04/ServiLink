from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# El registro público solo permite estos dos roles.
# El rol "admin" se crea aparte (seed / gestión interna), nunca vía /auth/register.
RolRegistrable = Literal["cliente", "trabajador"]


class UsuarioCreate(BaseModel):
    """Body esperado por POST /auth/register (HU-01)."""
    nombre_completo: str = Field(min_length=3, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    rol: RolRegistrable
    # Solo para rol "trabajador": id de la especialidad principal, tomada del
    # catálogo (GET /catalogos). Así no se puede registrar una especialidad
    # que no exista en la base de datos.
    id_servicio_principal: int | None = None


class UsuarioOut(BaseModel):
    """Lo que se devuelve al frontend: nunca incluye password_hash."""
    model_config = ConfigDict(from_attributes=True)

    id_usuario: int
    nombre_completo: str
    email: EmailStr
    is_active: bool
    created_at: datetime
    rol: str

    @classmethod
    def from_orm_with_rol(cls, usuario) -> "UsuarioOut":
        return cls(
            id_usuario=usuario.id_usuario,
            nombre_completo=usuario.nombre_completo,
            email=usuario.email,
            is_active=usuario.is_active,
            created_at=usuario.created_at,
            rol=usuario.rol.nombre.lower(),
        )
