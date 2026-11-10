"""
Utilidades de seguridad para HU-01 (Registro/Login) y HU-02 (RBAC).

- Hash de contraseñas con bcrypt, nunca texto plano.
- Generación y verificación de tokens JWT.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compara una contraseña contra su hash guardado.

    Devuelve False (en vez de reventar con un error 500) si lo guardado
    en password_hash no es un hash bcrypt válido -- por ejemplo, un
    registro insertado manualmente en la base de datos con la contraseña
    en texto plano, en vez de pasar por hash_password(). Ese caso NUNCA
    debe considerarse como login exitoso: lo correcto es tratarlo como
    credencial inválida y re-registrar ese usuario a través de
    POST /auth/register, que sí aplica el cifrado.
    """
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """
    Crea un JWT firmado. El payload típico incluye:
      - sub: id del usuario
      - rol: nombre del rol (cliente / trabajador / admin)
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
