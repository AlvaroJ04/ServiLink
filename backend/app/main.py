from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import admin, auth, busqueda, catalogos, documentos, trabajador

app = FastAPI(
    title="ServiLink API",
    description="Backend de ServiLink: plataforma de contratación de servicios técnicos.",
    version="0.1.0",
)

# Permite que el frontend (React + Vite) consuma la API en desarrollo.
app.add_middleware(
    CORSMiddleware,
    # localhost y 127.0.0.1 son direcciones distintas para el navegador:
    # se permiten ambas variantes del origen configurado.
    allow_origins=sorted({
        settings.FRONTEND_ORIGIN,
        settings.FRONTEND_ORIGIN.replace("localhost", "127.0.0.1"),
        settings.FRONTEND_ORIGIN.replace("127.0.0.1", "localhost"),
    }),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(catalogos.router)
app.include_router(trabajador.router)
app.include_router(documentos.router)
app.include_router(busqueda.router)


@app.get("/health", tags=["Salud"])
def health_check():
    """Endpoint simple para verificar que la API está viva (útil en Azure/CI-CD, HU-13)."""
    return {"status": "ok"}
