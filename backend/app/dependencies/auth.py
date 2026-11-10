"""
Dependencias de FastAPI para HU-02 (RBAC).

- get_current_user: extrae y valida el JWT del header Authorization,
  y carga el Usuario correspondiente desde la BD.
- require_role(...): fábrica de dependencias que solo deja pasar
  a usuarios con alguno de los roles indicados. Esto es lo que
  "el backend valida los permisos en cada petición a la API"
  (criterio de aceptación de HU-02) significa en código real.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.usuario import Usuario

# Esquema simple: Swagger mostrará un solo campo "Value" donde pegar el token
# (sin necesidad de un formulario de usuario/contraseña, que no aplica aquí
# porque /auth/login recibe JSON, no el formato estándar de OAuth2).
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la credencial",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    usuario = db.get(Usuario, int(user_id))
    if usuario is None or not usuario.is_active:
        raise credentials_exception

    return usuario


def require_role(*roles_permitidos: str):
    """
    Uso en un router:

        @router.get("/admin/reportes")
        def reportes(usuario: Usuario = Depends(require_role("admin"))):
            ...

    Si el usuario autenticado no tiene uno de los roles permitidos,
    responde 403 Forbidden antes de ejecutar la lógica del endpoint.
    """

    def dependency(usuario: Usuario = Depends(get_current_user)) -> Usuario:
        permitidos = {r.lower() for r in roles_permitidos}
        if usuario.rol.nombre.lower() not in permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para acceder a este recurso",
            )
        return usuario

    return dependency
