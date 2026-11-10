"""
Lógica de transiciones del estado de verificación (HU-05).

    PENDIENTE --(sube documento)--> EN_REVISION --(admin)--> VERIFICADO
                                         |                       
                                         +--(admin)--> RECHAZADO --(sube otro documento)--> EN_REVISION

Cualquier otro cambio de estado se rechaza con 409.
"""
from fastapi import HTTPException, status

PENDIENTE = "PENDIENTE"
EN_REVISION = "EN_REVISION"
VERIFICADO = "VERIFICADO"
RECHAZADO = "RECHAZADO"

ESTADOS = (PENDIENTE, EN_REVISION, VERIFICADO, RECHAZADO)

TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_REVISION},
    EN_REVISION: {VERIFICADO, RECHAZADO},
    RECHAZADO: {EN_REVISION},
    VERIFICADO: set(),
}


def cambiar_estado(perfil, nuevo_estado: str) -> None:
    """Aplica una transición válida sobre el perfil o lanza 409."""
    actual = perfil.estado_verificacion or PENDIENTE
    if nuevo_estado not in TRANSICIONES.get(actual, set()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Transición no permitida: {actual} → {nuevo_estado}",
        )
    perfil.estado_verificacion = nuevo_estado
