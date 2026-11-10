from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Body esperado por POST /auth/login (HU-01)."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """
    Respuesta de login. El frontend debe guardar access_token y usarlo
    en el header 'Authorization: Bearer <token>' en cada petición.
    """
    access_token: str
    token_type: str = "bearer"
    rol: str
    id_usuario: int
