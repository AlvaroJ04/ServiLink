"""
Script de siembra (seed) de datos iniciales.

Uso (desde la raíz del proyecto, con el entorno virtual activo):
    python -m app.seed

Crea los 3 roles base del sistema si no existen y agrega los servicios y zonas
que falten (se puede correr varias veces sin duplicar nada).
Sin esto, /auth/register fallará porque no hay id_rol al cual apuntar.
"""
from sqlalchemy import func

from app.db.database import SessionLocal
from app.models.perfil_trabajador import Servicio, ZonaAtencion
from app.models.rol import Rol

ROLES_BASE = ["cliente", "trabajador", "admin"]

# Catálogos iniciales (HU-03/HU-06). Se AGREGAN solo los que falten (comparando el nombre sin
# distinguir mayúsculas), así no se duplica ni se pisa lo que el compañero de base de datos ya cargó.
SERVICIOS_BASE = [
    ("Electricidad", "Instalaciones, reparaciones y mantenimiento eléctrico"),
    ("Plomería", "Tuberías, sanitarios, filtraciones y gasfitería"),
    ("Aires acondicionados", "Instalación, mantenimiento y reparación de aires acondicionados"),
    ("Soporte técnico", "Computadores, redes y dispositivos"),
    ("Construcción", "Obra civil, remodelaciones y acabados"),
    ("Pintura", "Pintura de interiores y exteriores"),
    ("Carpintería", "Muebles a medida, puertas, closets y reparaciones en madera"),
    ("Cerrajería", "Apertura de puertas, cambio de guardas y chapas de seguridad"),
    ("Jardinería", "Mantenimiento de jardines, poda y paisajismo"),
    ("Limpieza y aseo", "Aseo del hogar, oficinas y limpieza profunda"),
    ("Reparación de electrodomésticos", "Lavadoras, neveras, estufas y otros electrodomésticos"),
    ("Mudanzas y acarreos", "Traslado de muebles y enseres"),
    ("Instalación de gas", "Instalación y revisión de redes de gas domiciliario"),
    ("Vidriería", "Ventanas, espejos, divisiones y reposición de vidrios"),
    ("Soldadura y herrería", "Rejas, estructuras metálicas y soldadura en general"),
    ("Fumigación", "Control de plagas en hogares y negocios"),
]

# Zonas: "Ciudad - Barrio". El frontend las agrupa por ciudad (lo que va antes de " - ").
# "Toda la ciudad" es para quien atiende cualquier barrio. Para agregar más municipios o
# barrios basta con añadir filas aquí (o en la tabla zona_atencion) y volver a correr el seed.
SEP_ZONA = " - "
TODA_LA_CIUDAD = "Toda la ciudad"
ZONAS_BASE = {
    "Bogotá": ["Chapinero", "Usaquén", "Suba", "Kennedy", "Teusaquillo", "Fontibón", "Engativá", "Centro"],
    "Medellín": ["El Poblado", "Laureles", "Belén", "Robledo", "Buenos Aires", "Castilla", "Centro"],
    "Cali": ["Granada", "San Fernando", "Ciudad Jardín", "Tequendama", "El Peñón", "Centro"],
    "Barranquilla": ["El Prado", "Alto Prado", "Riomar", "Boston", "Ciudad Jardín", "Barrio Abajo"],
    "Cartagena": ["Bocagrande", "Manga", "Centro Histórico", "Getsemaní", "El Laguito", "Crespo"],
    "Bucaramanga": ["Cabecera", "García Rovira", "Provenza", "Cañaveral", "Centro"],
}


def nombres_zonas_base() -> list[str]:
    nombres = []
    for ciudad, barrios in ZONAS_BASE.items():
        nombres.append(f"{ciudad}{SEP_ZONA}{TODA_LA_CIUDAD}")
        nombres.extend(f"{ciudad}{SEP_ZONA}{b}" for b in barrios)
    return nombres


def seed_roles():
    db = SessionLocal()
    try:
        for nombre_rol in ROLES_BASE:
            # Sin distinguir mayúsculas: no duplicar 'CLIENTE' si ya existe 'cliente'
            existe = db.query(Rol).filter(func.lower(Rol.nombre) == nombre_rol).first()
            if not existe:
                db.add(Rol(nombre=nombre_rol))
                print(f"Rol creado: {nombre_rol}")
            else:
                print(f"Rol ya existe: {nombre_rol}")
        db.commit()
    finally:
        db.close()


def seed_catalogos():
    db = SessionLocal()
    try:
        existentes = {n.lower() for (n,) in db.query(Servicio.nombre_servicio)}
        nuevos = [(n, d) for n, d in SERVICIOS_BASE if n.lower() not in existentes]
        db.add_all(Servicio(nombre_servicio=n, descripcion=d) for n, d in nuevos)
        print(f"Servicios agregados: {len(nuevos)} (ya existían {len(SERVICIOS_BASE) - len(nuevos)})")

        zonas_exist = {n.lower() for (n,) in db.query(ZonaAtencion.nombre_zona)}
        nuevas = [n for n in nombres_zonas_base() if n.lower() not in zonas_exist]
        db.add_all(ZonaAtencion(nombre_zona=n) for n in nuevas)
        print(f"Zonas agregadas: {len(nuevas)}")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_roles()
    seed_catalogos()
    print("Seed completado.")
