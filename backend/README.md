# ServiLink — Backend (FastAPI)

Backend del proyecto integrador **SERVILINK**: plataforma de contratación
de servicios técnicos independientes. Stack: **Python + FastAPI + PostgreSQL**,
pensado para desplegar en **Azure** (ver `Ficha_Tecnica_proyecto_integrador.docx` y `HU_organizado.docx`).

## Estado actual de este entregable

✅ **Modelo de datos completo** (`app/models/`): las 15 tablas del diagrama ER
(`MODELO_ER-_SERVILINK.pdf`) ya están definidas como modelos SQLAlchemy y
**probadas** (se crean sin errores y respetan las llaves foráneas).

✅ **Sprint 1 — Fundaciones y Autenticación (funcional, probado):**
- **HU-01** — Registro e inicio de sesión (`app/routers/auth.py`)
  - `POST /auth/register` — registro diferenciado por rol (`cliente` / `trabajador`)
  - `POST /auth/login` — login con JWT
  - `GET /auth/me` — usuario autenticado actual
  - Contraseñas con hash bcrypt (nunca texto plano)
- **HU-02** — RBAC (`app/dependencies/auth.py`, `app/routers/admin.py`)
  - Dependencia `require_role(...)` reutilizable en cualquier endpoint
  - Ejemplo real: `GET /admin/usuarios` (solo rol `admin`, 403 para los demás)

✅ **Sprint 2 — Perfiles, documentos, verificación y búsqueda (funcional, probado con `pytest`):**
- **Inicio real** — `GET /catalogos/resumen` (público): categorías con cuántos técnicos verificados hay en cada una y cifras generales.
- **Catálogos** — `GET /catalogos` (público): servicios, zonas, tipos de documento y días. Los desplegables del frontend salen de aquí, así nadie puede escribir una especialidad que no exista en la base.
- **HU-03** — Perfil del técnico: `GET/POST/PUT/DELETE /trabajador/perfil` (especialidad, servicios, zonas, disponibilidad, tarifa, descripción). Se rechazan correos y teléfonos en la descripción.
- **HU-04** — Documentos de verificación: `POST/GET /trabajador/documentos`, `GET /documentos/{id}/archivo`. Valida extensión, tipo, firma real del archivo y máx. 5 MB. Se guardan en un contenedor **privado** de Azure Blob (o en `uploads_privados/` si no hay cadena de conexión); solo se descargan con sesión y siendo el dueño o admin.
- **HU-05** — Estados: `PENDIENTE → EN_REVISION` (al subir documento) `→ VERIFICADO / RECHAZADO` (admin: `GET /admin/verificaciones`, `POST /admin/verificaciones/{id}/resolver`). Un rechazado puede reenviar; un verificado es final; transiciones inválidas dan 409.
- **HU-06** — Búsqueda: `GET /busqueda/trabajadores` (filtros: servicio, ciudad, barrio/zona, texto, estrellas, tarifa; quien atiende "Toda la ciudad" aparece en cualquier barrio de esa ciudad) y `GET /busqueda/trabajadores/{id}`. El cliente solo ve técnicos VERIFICADOS; nunca se expone correo ni teléfono. El promedio de estrellas se calcula en vivo.

⏳ **Pendiente (Sprints 3 y 4):** solicitudes, mensajes, contratos, pagos, calificaciones.

## ⚠️ Alineación con la base de datos real (`plataforma_servicios`)

El compañero encargado de la base de datos construyó la base **por su cuenta**,
de forma manual (no con las migraciones de este proyecto), y entregó un
`Diccionario_de_Datos.docx` y un archivo de consultas SQL. Al compararlo con
los modelos de este backend se encontraron diferencias, ya corregidas aquí:

- El nombre real de la base es **`plataforma_servicios`**, no `servilink`
  (ver `.env.example`).
- En `solicitud_servicio` la columna de hora se llama **`hora_programado`**
  (no `hora_programada`).
- En `solicitud_servicio`, `id_trabajador` apunta a
  `perfil_trabajador.id_perfil`, **no directo** a `usuario.id_usuario`.
  Para llegar al usuario del trabajador hay que pasar por
  `perfil_trabajador.id_usuario`.
- Los estados en la base real van en **MAYÚSCULA** (`PENDIENTE`, `SIMULADO`)
  y la base **no** tiene `CHECK` sobre ellos (solo sobre `estrellas` 1–5).
  Los modelos ya reflejan eso (tipos `text`, `varchar(50/100)`, `ON DELETE
  CASCADE`, fechas sin zona horaria).
- Los nombres de rol (`cliente`/`trabajador`/`admin`) se comparan **sin
  distinguir mayúsculas**, y la API siempre responde el rol en minúsculas.
- Se corrigió `verify_password()` (`app/core/security.py`) para que un
  `password_hash` que no sea un hash bcrypt válido (por ejemplo, una
  contraseña de prueba guardada en texto plano) se trate como **credencial
  inválida (401)**, nunca como error del servidor (500) ni como login
  exitoso. Las contraseñas nuevas siguen creándose siempre con
  `hash_password()` (bcrypt) — nunca en texto plano — tal como pide HU-01.

**Cómo usar la base del compañero:** restaura su respaldo en pgAdmin
(clic derecho en la base `plataforma_servicios` → Restore) y apunta el
`.env` a ella. **No** uses `alembic upgrade head` sobre esa base (ya tiene las
tablas); si quieres registrar a Alembic en ella, usa `alembic stamp head`.
La migración incluida solo sirve para una base vacía y no crea los índices
ni triggers del compañero: para una copia completa, restaura su respaldo.

**Pendiente de confirmar con el compañero:** los datos de su respaldo (roles
y usuarios de prueba) no se pudieron leer; en particular, cómo están
escritos los nombres en la tabla `rol` y la lista final de estados de una
solicitud.

## Estructura del proyecto

```
servilink-backend/
├── app/
│   ├── core/
│   │   ├── config.py        # Configuración (.env)
│   │   └── security.py      # Hash de contraseñas + JWT
│   ├── db/
│   │   └── database.py      # Engine, SessionLocal, Base, get_db()
│   ├── models/               # 1 archivo por grupo de tablas del ER
│   │   ├── rol.py
│   │   ├── usuario.py
│   │   ├── perfil_trabajador.py   # + Servicio, Zona, Disponibilidad, Documentos
│   │   ├── solicitud.py           # + Mensaje, Contrato, Pago, Calificación
│   │   └── auditoria.py
│   ├── schemas/               # Pydantic (entrada/salida de la API)
│   │   ├── usuario.py
│   │   └── auth.py
│   ├── dependencies/
│   │   └── auth.py           # get_current_user, require_role
│   ├── routers/
│   │   ├── auth.py           # HU-01
│   │   └── admin.py          # HU-02 (ejemplo RBAC)
│   ├── seed.py                # Crea los roles base
│   └── main.py                # App FastAPI, CORS, routers
├── alembic/                   # Migraciones de base de datos
├── requirements.txt
├── .env.example
└── alembic.ini
```

## Cómo correrlo localmente

### 1. Crear entorno virtual e instalar dependencias

```bash
python3 -m venv venv
source venv/bin/activate        # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con los datos de tu PostgreSQL local (o el de Azure más adelante,
según HU-13). Si aún no tienes PostgreSQL instalado, para probar rápido puedes
usar SQLite temporalmente cambiando la línea en `.env` a:

```
DATABASE_URL=sqlite:///./servilink.db
```

(Para el entregable final sí debe ser PostgreSQL — es requisito de la ficha
técnica y de HU-13 — pero para desarrollar el día a día en tu máquina, SQLite
es más simple).

### 3. Crear las tablas

Con Alembic (recomendado, ya versiona los cambios de esquema):

```bash
alembic revision --autogenerate -m "Modelo inicial ServiLink"
alembic upgrade head
```

O, para una primera prueba rápida sin migraciones:

```bash
python -c "from app.db.database import Base, engine; import app.models; Base.metadata.create_all(bind=engine)"
```

### 4. Sembrar datos base

```bash
python -m app.seed
```

Crea los 3 roles si faltan y **agrega los servicios y zonas que falten** (16 especialidades y 6 ciudades con sus barrios más "Toda la ciudad").
Compara por nombre sin distinguir mayúsculas, así que se puede correr varias veces sin duplicar y sin tocar lo que ya tiene la base de tu compañero.
Las zonas se guardan como `Ciudad - Barrio` (p. ej. `Medellín - Laureles`); para agregar más municipios o barrios basta añadir filas en
`app/seed.py` (diccionario `ZONAS_BASE`) o directamente en la tabla `zona_atencion`, y el frontend las agrupa solo.

Crear un administrador (no se puede registrar desde la API):

```bash
python -m app.crear_admin admin@ejemplo.com "Nombre Apellido" "ClaveSegura123"
```

### Almacenamiento de documentos (Azure)

En `.env`, `AZURE_STORAGE_CONNECTION_STRING=` con la cadena de tu cuenta de Azure Storage
(el contenedor `documentos-verificacion` se crea privado). Si la dejas vacía, los archivos se guardan
en la carpeta local `uploads_privados/` (desarrollo). La ruta de Azure se probó con el emulador Azurite (contenedor privado, subida, descarga y borrado), no contra una cuenta real;
la local también.

### Pruebas

```bash
pip install pytest httpx
pytest -q
```

Dejan datos de prueba en la base: córrelas contra una copia de desarrollo, no contra la base compartida.

### 5. Levantar el servidor

```bash
uvicorn app.main:app --reload
```

Abre `http://localhost:8000/docs` — ahí tienes Swagger UI para probar
`/auth/register`, `/auth/login` y `/admin/usuarios` interactivamente.

## Conectar con el frontend

El frontend (React + Vite) corre en `http://localhost:5173`, ya habilitado en CORS
(`FRONTEND_ORIGIN` en `.env`; también se acepta `127.0.0.1`).

## Cómo continuar (Sprints 3 y 4)

- **Sprint 3** (HU-07, 08, 09): `app/routers/mensajes.py`,
  `app/routers/solicitudes.py`. Para HU-09 (PDF del contrato), usar
  `reportlab` o `weasyprint` (ya sugeridas en tus HU).
- **Sprint 4** (HU-10, 11, 12, 13): `app/routers/pagos.py`,
  `app/routers/calificaciones.py`, `app/routers/panel_admin.py`, y
  despliegue del proyecto en Azure App Service / Container Apps.

