from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.perfil_trabajador import PerfilTrabajador, TrabajadorServicio
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, Token
from app.schemas.usuario import UsuarioCreate, UsuarioOut
from app.services.perfiles import validar_servicio_principal
from app.services.verificacion import PENDIENTE

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def register(data: UsuarioCreate, db: Session = Depends(get_db)):
    """
    HU-01: Registro diferenciado para Cliente y Trabajador.
    El rol 'admin' no se puede autoasignar desde aquí (ver schemas/usuario.py).
    """
    existente = db.query(Usuario).filter(Usuario.email == data.email).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya está registrado")

    # Comparación sin distinguir mayúsculas: la base real puede tener
    # los roles como 'cliente' o como 'CLIENTE'.
    rol = db.query(Rol).filter(func.lower(Rol.nombre) == data.rol.lower()).first()
    if rol is None:
        # No debería pasar si seed.py se corrió, pero se valida por seguridad
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rol inválido")

    # Especialidad (solo trabajadores): debe ser un servicio del catálogo, nunca texto libre
    servicio = None
    if data.id_servicio_principal is not None:
        if data.rol != "trabajador":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La especialidad solo aplica para el rol trabajador",
            )
        servicio = validar_servicio_principal(db, data.id_servicio_principal)

    nuevo_usuario = Usuario(
        id_rol=rol.id_rol,
        nombre_completo=data.nombre_completo,
        email=data.email,
        password_hash=hash_password(data.password),  # nunca texto plano
    )
    db.add(nuevo_usuario)
    try:
        db.flush()
        if servicio is not None:
            # El trabajador nace con su perfil en estado PENDIENTE (HU-05) y su especialidad principal
            perfil = PerfilTrabajador(
                id_usuario=nuevo_usuario.id_usuario,
                oficio=servicio.nombre_servicio,
                estado_verificacion=PENDIENTE,
            )
            db.add(perfil)
            db.flush()
            db.add(TrabajadorServicio(id_perfil=perfil.id_perfil, id_servicio=servicio.id_servicio))
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya está registrado")
    db.refresh(nuevo_usuario)

    return UsuarioOut.from_orm_with_rol(nuevo_usuario)


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """
    HU-01: Login + generación de JWT.
    HU-01 (criterio): "Redirección automática según el rol asignado" —
    por eso el token y la respuesta incluyen 'rol', para que el
    frontend (React) decida a qué dashboard redirigir.
    """
    usuario = db.query(Usuario).filter(Usuario.email == data.email).first()

    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email o contraseña incorrectos",
    )

    if usuario is None or not verify_password(data.password, usuario.password_hash):
        raise credenciales_invalidas

    if not usuario.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta inactiva")

    rol_normalizado = usuario.rol.nombre.lower()  # el frontend siempre recibe minúsculas
    access_token = create_access_token(
        data={"sub": str(usuario.id_usuario), "rol": rol_normalizado}
    )

    return Token(access_token=access_token, rol=rol_normalizado, id_usuario=usuario.id_usuario)


@router.get("/me", response_model=UsuarioOut)
def me(usuario: Usuario = Depends(get_current_user)):
    """Devuelve el usuario autenticado a partir del token (útil para el frontend al recargar la página)."""
    return UsuarioOut.from_orm_with_rol(usuario)
