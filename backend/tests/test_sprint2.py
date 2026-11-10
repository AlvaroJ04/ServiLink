"""
Pruebas del Sprint 2 (HU-03 a HU-06) contra la base PostgreSQL configurada en .env.
Uso:  pip install pytest httpx   y luego   pytest -q
Cada prueba crea sus propios datos con nombres únicos, sin borrar nada existente.
IMPORTANTE: deja usuarios y catálogos de prueba en la base. Córrelas contra una COPIA de
desarrollo (otra base con el mismo esquema), no contra la base compartida del equipo.
"""
import uuid
from datetime import date, time

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.security import hash_password
from app.db.database import SessionLocal
from app.main import app
from app.models.perfil_trabajador import PerfilTrabajador, Servicio, ZonaAtencion
from app.models.rol import Rol
from app.models.solicitud import Calificacion, SolicitudServicio
from app.models.usuario import Usuario
from sqlalchemy import func

client = TestClient(app)
CLAVE = "claveSegura123"
PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32


def uid() -> str:
    return uuid.uuid4().hex[:10]


@pytest.fixture()
def cat():
    """Un servicio y dos zonas exclusivos de la prueba (aislados del resto de datos)."""
    db = SessionLocal()
    s, z1, z2 = Servicio(nombre_servicio=f"Svc-{uid()}"), ZonaAtencion(nombre_zona=f"Z1-{uid()}"), ZonaAtencion(nombre_zona=f"Z2-{uid()}")
    db.add_all([s, z1, z2])
    db.commit()
    datos = {"servicio": (s.id_servicio, s.nombre_servicio), "z1": z1.id_zona, "z2": z2.id_zona}
    db.close()
    return datos


def registrar(rol, servicio_id=None, nombre="Persona Prueba"):
    email = f"{rol}.{uid()}@example.com"
    cuerpo = {"nombre_completo": nombre, "email": email, "password": CLAVE, "rol": rol}
    if servicio_id is not None:
        cuerpo["id_servicio_principal"] = servicio_id
    r = client.post("/auth/register", json=cuerpo)
    assert r.status_code == 201, r.text
    return email


def login(email):
    r = client.post("/auth/login", json={"email": email, "password": CLAVE})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def crear_admin():
    db = SessionLocal()
    rol = db.query(Rol).filter(func.lower(Rol.nombre) == "admin").first()
    email = f"admin.{uid()}@example.com"
    db.add(Usuario(id_rol=rol.id_rol, nombre_completo="Admin Prueba", email=email, password_hash=hash_password(CLAVE)))
    db.commit()
    db.close()
    return email


def trabajador(cat, nombre="Luis Técnico"):
    email = registrar("trabajador", cat["servicio"][0], nombre)
    return email, login(email)


def subir(h, nombre="cedula.pdf", datos=PDF, tipo="application/pdf", tipo_doc="Cédula de ciudadanía"):
    return client.post("/trabajador/documentos", headers=h, data={"tipo_documento": tipo_doc}, files={"archivo": (nombre, datos, tipo)})


# ------------------------------------------------------------------ catálogos
def test_catalogos_publico_y_cerrado(cat):
    r = client.get("/catalogos")
    assert r.status_code == 200
    j = r.json()
    assert cat["servicio"][1] in [s["nombre"] for s in j["servicios"]]
    assert "Cédula de ciudadanía" in j["tipos_documento"] and "Lunes" in j["dias_semana"]


# ------------------------------------------------- registro con especialidad
def test_registro_trabajador_especialidad_valida_crea_perfil_pendiente(cat):
    email, h = trabajador(cat)
    p = client.get("/trabajador/perfil", headers=h).json()
    assert p["oficio"] == cat["servicio"][1]
    assert p["estado_verificacion"] == "PENDIENTE"
    assert [s["id"] for s in p["servicios"]] == [cat["servicio"][0]]


def test_registro_rechaza_especialidad_inexistente_o_en_cliente():
    base = {"nombre_completo": "Alguien Más", "password": CLAVE}
    r = client.post("/auth/register", json={**base, "email": f"x{uid()}@example.com", "rol": "trabajador", "id_servicio_principal": 999999})
    assert r.status_code == 422
    r = client.post("/auth/register", json={**base, "email": f"y{uid()}@example.com", "rol": "cliente", "id_servicio_principal": 1})
    assert r.status_code == 422


def test_la_clave_se_guarda_cifrada(cat):
    email, _ = trabajador(cat)
    db = SessionLocal()
    h = db.query(Usuario.password_hash).filter(Usuario.email == email).scalar()
    db.close()
    assert h.startswith("$2b$") and CLAVE not in h


# --------------------------------------------------------------- HU-03 perfil
def perfil_valido(cat, **extra):
    return {
        "id_servicio_principal": cat["servicio"][0],
        "servicios_ids": [],
        "zonas_ids": [cat["z1"]],
        "disponibilidad": [{"dia_semana": "Lunes", "hora_inicio": "08:00", "hora_fin": "12:00"}],
        "experiencia_descripcion": "Ocho años en instalaciones residenciales.",
        "tarifa_base": 80000,
        **extra,
    }


def test_crud_perfil(cat):
    _, h = trabajador(cat)
    r = client.put("/trabajador/perfil", headers=h, json=perfil_valido(cat, zonas_ids=[cat["z1"], cat["z2"]]))
    assert r.status_code == 200, r.text
    p = r.json()
    assert len(p["zonas"]) == 2 and p["tarifa_base"] == 80000 and p["disponibilidad"][0]["dia_semana"] == "Lunes"
    # reemplaza (no acumula)
    p = client.put("/trabajador/perfil", headers=h, json=perfil_valido(cat, disponibilidad=[])).json()
    assert len(p["zonas"]) == 1 and p["disponibilidad"] == []
    # POST cuando ya existe -> 409
    assert client.post("/trabajador/perfil", headers=h, json=perfil_valido(cat)).status_code == 409
    # DELETE y luego GET -> 404
    assert client.delete("/trabajador/perfil", headers=h).status_code == 204
    assert client.get("/trabajador/perfil", headers=h).status_code == 404
    # POST crea de nuevo
    assert client.post("/trabajador/perfil", headers=h, json=perfil_valido(cat)).status_code == 201


@pytest.mark.parametrize(
    "cambio",
    [
        {"id_servicio_principal": 999999},
        {"servicios_ids": [999999]},
        {"zonas_ids": [999999]},
        {"disponibilidad": [{"dia_semana": "Lunes", "hora_inicio": "12:00", "hora_fin": "08:00"}]},
        {"disponibilidad": [{"dia_semana": "Funday", "hora_inicio": "08:00", "hora_fin": "09:00"}]},
        {"disponibilidad": [
            {"dia_semana": "Martes", "hora_inicio": "08:00", "hora_fin": "12:00"},
            {"dia_semana": "Martes", "hora_inicio": "11:00", "hora_fin": "14:00"}]},
        {"tarifa_base": -5},
        {"experiencia_descripcion": "Escríbeme a juan@correo.com"},
        {"experiencia_descripcion": "Llámame al 300 123 4567"},
    ],
)
def test_perfil_rechaza_datos_invalidos(cat, cambio):
    _, h = trabajador(cat)
    r = client.put("/trabajador/perfil", headers=h, json=perfil_valido(cat, **cambio))
    assert r.status_code == 422, r.text


# ----------------------------------------------------------------- permisos
def test_permisos_por_rol(cat):
    _, ht = trabajador(cat)
    hc = login(registrar("cliente"))
    assert client.get("/trabajador/perfil", headers=hc).status_code == 403
    assert client.get("/busqueda/trabajadores", headers=ht).status_code == 403
    assert client.get("/admin/verificaciones", headers=ht).status_code == 403
    assert client.get("/admin/verificaciones", headers=hc).status_code == 403
    assert client.get("/trabajador/perfil").status_code in (401, 403)


# ----------------------------------------------------------- HU-04 documentos
def test_subida_valida_pasa_a_en_revision(cat):
    _, h = trabajador(cat)
    r = subir(h)
    assert r.status_code == 201, r.text
    assert r.json()["estado_documento"] == "PENDIENTE"
    assert client.get("/trabajador/perfil", headers=h).json()["estado_verificacion"] == "EN_REVISION"
    assert len(client.get("/trabajador/documentos", headers=h).json()) == 1
    assert subir(h, "foto.png", PNG, "image/png", "Otro").status_code == 201


def test_subida_validaciones(cat):
    _, h = trabajador(cat)
    assert subir(h, "virus.exe", PDF, "application/octet-stream").status_code == 415      # extensión
    assert subir(h, "doc.pdf", PDF, "image/png").status_code == 415                        # content-type no coincide
    assert subir(h, "falso.pdf", b"esto no es un pdf", "application/pdf").status_code == 415  # firma real
    assert subir(h, "vacio.pdf", b"", "application/pdf").status_code == 400
    grande = PDF + b"\x00" * (settings.MAX_UPLOAD_MB * 1024 * 1024)
    assert subir(h, "grande.pdf", grande, "application/pdf").status_code == 413           # tamaño
    assert subir(h, tipo_doc="Inventado").status_code == 422                               # tipo de documento
    # nada de lo anterior debe haber cambiado el estado ni guardado archivos
    assert client.get("/trabajador/perfil", headers=h).json()["estado_verificacion"] == "PENDIENTE"
    assert client.get("/trabajador/documentos", headers=h).json() == []


def test_descarga_solo_dueno_o_admin(cat):
    _, h1 = trabajador(cat)
    _, h2 = trabajador(cat)
    hc = login(registrar("cliente"))
    ha = login(crear_admin())
    id_doc = subir(h1).json()["id_documento"]
    url = f"/documentos/{id_doc}/archivo"
    r = client.get(url, headers=h1)
    assert r.status_code == 200 and r.content == PDF and r.headers["content-type"] == "application/pdf"
    assert client.get(url, headers=ha).status_code == 200
    assert client.get(url, headers=h2).status_code == 404   # otro trabajador
    assert client.get(url, headers=hc).status_code == 404   # cliente
    assert client.get(url).status_code in (401, 403)         # sin sesión


# ----------------------------------------------------- HU-05 estados y admin
def test_flujo_de_verificacion_y_transiciones(cat):
    _, h = trabajador(cat)
    ha = login(crear_admin())
    id_perfil = client.get("/trabajador/perfil", headers=h).json()["id_perfil"]
    resolver = lambda d: client.post(f"/admin/verificaciones/{id_perfil}/resolver", headers=ha, json={"decision": d})

    assert resolver("VERIFICADO").status_code == 409            # PENDIENTE -> VERIFICADO no se permite
    subir(h)                                                    # -> EN_REVISION
    pend = client.get("/admin/verificaciones", headers=ha).json()
    assert id_perfil in [p["id_perfil"] for p in pend]

    r = resolver("RECHAZADO")
    assert r.status_code == 200 and r.json()["estado_verificacion"] == "RECHAZADO"
    assert r.json()["documentos"][0]["estado_documento"] == "RECHAZADO"
    assert resolver("VERIFICADO").status_code == 409            # RECHAZADO -> VERIFICADO no se permite

    subir(h, "nueva.pdf")                                       # RECHAZADO -> EN_REVISION al reenviar
    assert client.get("/trabajador/perfil", headers=h).json()["estado_verificacion"] == "EN_REVISION"

    r = resolver("VERIFICADO")
    assert r.status_code == 200 and r.json()["estado_verificacion"] == "VERIFICADO"
    assert resolver("RECHAZADO").status_code == 409             # VERIFICADO es final
    assert client.post("/admin/verificaciones/999999/resolver", headers=ha, json={"decision": "VERIFICADO"}).status_code == 404
    assert resolver("PENDIENTE").status_code == 422             # decisión inválida


# --------------------------------------------------------------- HU-06 búsqueda
def verificar(h, ha):
    subir(h)
    id_perfil = client.get("/trabajador/perfil", headers=h).json()["id_perfil"]
    client.post(f"/admin/verificaciones/{id_perfil}/resolver", headers=ha, json={"decision": "VERIFICADO"})
    return id_perfil


def test_busqueda_filtros_privacidad_y_reputacion(cat):
    ha = login(crear_admin())
    hc = login(registrar("cliente"))
    e1, h1 = trabajador(cat, "Ana Eléctrica")
    e2, h2 = trabajador(cat, "Beto Eléctrico")
    e3, h3 = trabajador(cat, "Carla Sinverificar")
    client.put("/trabajador/perfil", headers=h1, json=perfil_valido(cat, zonas_ids=[cat["z1"]], tarifa_base=50000))
    client.put("/trabajador/perfil", headers=h2, json=perfil_valido(cat, zonas_ids=[cat["z2"]], tarifa_base=90000))
    client.put("/trabajador/perfil", headers=h3, json=perfil_valido(cat))
    p1, p2 = verificar(h1, ha), verificar(h2, ha)   # h3 queda sin verificar

    buscar = lambda **q: client.get("/busqueda/trabajadores", headers=hc, params={"servicio_id": cat["servicio"][0], **q}).json()
    nombres = lambda r: [x["nombre"] for x in r["resultados"]]

    r = buscar()
    assert r["total"] == 2 and set(nombres(r)) == {"Ana Eléctrica", "Beto Eléctrico"}   # el no verificado no aparece
    assert nombres(buscar(zona_id=cat["z1"])) == ["Ana Eléctrica"]
    assert nombres(buscar(zona_id=cat["z2"])) == ["Beto Eléctrico"]
    assert nombres(buscar(tarifa_max=60000)) == ["Ana Eléctrica"]
    assert nombres(buscar(tarifa_min=60000)) == ["Beto Eléctrico"]
    assert buscar(q="residenciales")["total"] == 2
    assert buscar(q="zzzz-no-existe")["total"] == 0
    assert client.get("/busqueda/trabajadores", headers=hc, params={"servicio_id": cat["servicio"][0], "solo_verificados": False}).json()["total"] == 2  # cliente no puede ver no verificados
    assert client.get("/busqueda/trabajadores", headers=ha, params={"servicio_id": cat["servicio"][0], "solo_verificados": False}).json()["total"] == 3

    # Privacidad (HU-03): ni email ni teléfono en ninguna respuesta pública
    bruto = client.get("/busqueda/trabajadores", headers=hc, params={"servicio_id": cat["servicio"][0]}).text
    det = client.get(f"/busqueda/trabajadores/{p1}", headers=hc)
    for texto in (bruto, det.text):
        assert "@" not in texto and "email" not in texto.lower() and "telefono" not in texto.lower()
    assert det.status_code == 200 and det.json()["disponibilidad"][0]["dia_semana"] == "Lunes"

    # Detalle: el no verificado no es visible para un cliente
    id3 = client.get("/trabajador/perfil", headers=h3).json()["id_perfil"]
    assert client.get(f"/busqueda/trabajadores/{id3}", headers=hc).status_code == 404

    # Reputación: promedio calculado en vivo con AVG(estrellas)
    db = SessionLocal()
    cliente_id = db.query(Usuario.id_usuario).filter(Usuario.email.like("cliente.%")).order_by(Usuario.id_usuario.desc()).first()[0]
    for estrellas in (5, 4):
        s = SolicitudServicio(id_cliente=cliente_id, id_trabajador=p1, id_servicio=cat["servicio"][0],
                              fecha_programada=date(2026, 12, 1), hora_programado=time(9, 0))
        db.add(s)
        db.flush()
        db.add(Calificacion(id_solicitud=s.id_solicitud, estrellas=estrellas))
    db.commit()
    db.close()
    r = buscar()
    assert nombres(r)[0] == "Ana Eléctrica"                       # mejor reputación primero
    ana = r["resultados"][0]
    assert ana["promedio_estrellas"] == 4.5 and ana["total_resenas"] == 2
    assert nombres(buscar(min_estrellas=4.5)) == ["Ana Eléctrica"]
    assert buscar(min_estrellas=4.6)["total"] == 0

    # No se puede borrar un perfil que ya tiene solicitudes
    assert client.delete("/trabajador/perfil", headers=h1).status_code == 409


def test_borrar_perfil_elimina_documentos(cat):
    _, h = trabajador(cat)
    id_doc = subir(h).json()["id_documento"]
    ha = login(crear_admin())
    assert client.get(f"/documentos/{id_doc}/archivo", headers=ha).status_code == 200
    assert client.delete("/trabajador/perfil", headers=h).status_code == 204
    assert client.get(f"/documentos/{id_doc}/archivo", headers=ha).status_code == 404


# ------------------------------------------- ciudades/barrios y resumen público
def test_busqueda_por_ciudad_y_toda_la_ciudad(cat):
    ciudad = f"Ciudad{uid()}"
    db = SessionLocal()
    barrio_a, barrio_b, toda, otra = (
        ZonaAtencion(nombre_zona=f"{ciudad} - Norte"), ZonaAtencion(nombre_zona=f"{ciudad} - Sur"),
        ZonaAtencion(nombre_zona=f"{ciudad} - Toda la ciudad"), ZonaAtencion(nombre_zona=f"Otra{uid()} - Centro"),
    )
    db.add_all([barrio_a, barrio_b, toda, otra])
    db.commit()
    ids = {"a": barrio_a.id_zona, "b": barrio_b.id_zona, "toda": toda.id_zona, "otra": otra.id_zona}
    db.close()

    ha, hc = login(crear_admin()), login(registrar("cliente"))
    _, h1 = trabajador(cat, "Norteño Uno")
    _, h2 = trabajador(cat, "Toda Ciudad")
    _, h3 = trabajador(cat, "Otra Ciudad")
    client.put("/trabajador/perfil", headers=h1, json=perfil_valido(cat, zonas_ids=[ids["a"]]))
    client.put("/trabajador/perfil", headers=h2, json=perfil_valido(cat, zonas_ids=[ids["toda"]]))
    client.put("/trabajador/perfil", headers=h3, json=perfil_valido(cat, zonas_ids=[ids["otra"]]))
    for h in (h1, h2, h3):
        verificar(h, ha)

    buscar = lambda **q: sorted(x["nombre"] for x in client.get(
        "/busqueda/trabajadores", headers=hc, params={"servicio_id": cat["servicio"][0], **q}).json()["resultados"])
    assert buscar(ciudad=ciudad) == ["Norteño Uno", "Toda Ciudad"]                  # cualquier barrio de la ciudad
    assert buscar(zona_id=ids["a"]) == ["Norteño Uno", "Toda Ciudad"]               # barrio + quien cubre toda la ciudad
    assert buscar(zona_id=ids["b"]) == ["Toda Ciudad"]                              # barrio donde solo cubre "toda la ciudad"
    assert buscar(ciudad="NoExiste") == []


def test_resumen_publico_sin_datos_personales(cat):
    ha = login(crear_admin())
    _, h = trabajador(cat, "Resumen Técnico")
    client.put("/trabajador/perfil", headers=h, json=perfil_valido(cat))
    verificar(h, ha)
    r = client.get("/catalogos/resumen")   # público: sin sesión
    assert r.status_code == 200
    j = r.json()
    mia = next(c for c in j["categorias"] if c["id"] == cat["servicio"][0])
    assert mia["tecnicos"] >= 1 and j["tecnicos_verificados"] >= 1
    assert "@" not in r.text and "Resumen Técnico" not in r.text
