"""
Crea (o promueve) un usuario administrador. El rol 'admin' no se puede
autoasignar desde /auth/register, así que se crea con este script.

Uso (desde la raíz del proyecto, con el entorno virtual activo):
    python -m app.crear_admin correo@ejemplo.com "Nombre Apellido" "ClaveSegura123"

Si el correo ya existe, se le cambia el rol a admin y se le pone esa contraseña
(cifrada con bcrypt, como cualquier otra).
"""
import sys

from sqlalchemy import func

from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.rol import Rol
from app.models.usuario import Usuario


def main() -> None:
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)
    email, nombre, clave = sys.argv[1], sys.argv[2], sys.argv[3]
    if len(clave) < 8:
        print("La contraseña debe tener al menos 8 caracteres.")
        sys.exit(1)

    db = SessionLocal()
    try:
        rol = db.query(Rol).filter(func.lower(Rol.nombre) == "admin").first()
        if rol is None:
            print("No existe el rol admin. Corre primero: python -m app.seed")
            sys.exit(1)
        usuario = db.query(Usuario).filter(Usuario.email == email).first()
        if usuario is None:
            usuario = Usuario(id_rol=rol.id_rol, nombre_completo=nombre, email=email, password_hash=hash_password(clave))
            db.add(usuario)
            print(f"Administrador creado: {email}")
        else:
            usuario.id_rol = rol.id_rol
            usuario.password_hash = hash_password(clave)
            usuario.is_active = True
            print(f"Usuario existente promovido a administrador: {email}")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
