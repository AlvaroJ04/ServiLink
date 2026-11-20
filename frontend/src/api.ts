// Conexión con el backend (FastAPI). Si el backend corre en otra dirección,
// se cambia con la variable VITE_API_URL en un archivo .env (ver .env.example).
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

const CLAVE_SESION = 'servilink_sesion';

// ---------- Tipos (reflejan los esquemas del backend) ----------
export type RolBackend = 'cliente' | 'trabajador' | 'admin';
export type EstadoVerificacion = 'PENDIENTE' | 'EN_REVISION' | 'VERIFICADO' | 'RECHAZADO';

export interface Item { id: number; nombre: string }
export interface Catalogos { servicios: Item[]; zonas: Item[]; tipos_documento: string[]; dias_semana: string[] }
export interface Franja { dia_semana: string; hora_inicio: string; hora_fin: string }
export interface Usuario {
  id_usuario: number; nombre_completo: string; email: string; is_active: boolean; created_at: string; rol: RolBackend;
}
export interface LoginResponse { access_token: string; token_type: string; rol: RolBackend; id_usuario: number }

export interface PerfilTrabajador {
  id_perfil: number; nombre: string; id_servicio_principal: number | null; oficio: string | null;
  experiencia_descripcion: string | null; tarifa_base: number | null; estado_verificacion: EstadoVerificacion;
  servicios: Item[]; zonas: Item[]; disponibilidad: Franja[];
}
export interface PerfilIn {
  id_servicio_principal: number; servicios_ids: number[]; zonas_ids: number[]; disponibilidad: Franja[];
  experiencia_descripcion: string | null; tarifa_base: number | null;
}
export interface Documento { id_documento: number; tipo_documento: string; estado_documento: string }
export interface TrabajadorCard {
  id_perfil: number; nombre: string; oficio: string | null; experiencia_descripcion: string | null;
  tarifa_base: number | null; promedio_estrellas: number; total_resenas: number;
  estado_verificacion: EstadoVerificacion; servicios: Item[]; zonas: Item[];
}
export interface TrabajadorPublico extends TrabajadorCard { disponibilidad: Franja[] }
export interface Verificacion { id_perfil: number; nombre: string; oficio: string | null; estado_verificacion: EstadoVerificacion; documentos: Documento[] }

// ---------- Sesión (sessionStorage: se borra al cerrar la pestaña) ----------
export interface Sesion { token: string; rol: RolBackend; id_usuario: number; nombre: string; email: string }

export function leerSesion(): Sesion | null {
  try {
    const t = sessionStorage.getItem(CLAVE_SESION);
    return t ? (JSON.parse(t) as Sesion) : null;
  } catch { return null; }
}
export function guardarSesion(s: Sesion | null) {
  try {
    if (s) sessionStorage.setItem(CLAVE_SESION, JSON.stringify(s));
    else sessionStorage.removeItem(CLAVE_SESION);
  } catch { /* sin almacenamiento: la sesión vive solo en memoria */ }
}

// Si el token vence o es inválido, la app se entera y cierra sesión.
let alExpirarSesion: (() => void) | null = null;
export const registrarExpiracion = (fn: (() => void) | null) => { alExpirarSesion = fn; };

// ---------- Utilidades HTTP ----------
async function mensajeDeError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      const d = data.detail[0];
      const msg = String(d.msg ?? 'Dato inválido').replace(/^Value error, /, '');
      const campo = String(d.loc?.slice(-1)[0] ?? '');
      return campo && !/^\d+$/.test(campo) && campo !== 'body' ? `${campo}: ${msg}` : msg;
    }
  } catch { /* no era JSON */ }
  return `Error del servidor (${res.status})`;
}

export class ApiError extends Error {
  status: number;
  constructor(mensaje: string, status: number) { super(mensaje); this.status = status; }
}

async function pedir(ruta: string, init: RequestInit = {}, conToken = true): Promise<Response> {
  const headers = new Headers(init.headers);
  const s = leerSesion();
  if (conToken && s) headers.set('Authorization', `Bearer ${s.token}`);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${ruta}`, { ...init, headers });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
  }
  if (res.status === 401 && conToken && s) {
    alExpirarSesion?.();
    throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
  }
  if (!res.ok) throw new ApiError(await mensajeDeError(res), res.status);
  return res;
}

async function json<T>(ruta: string, metodo = 'GET', cuerpo?: unknown, conToken = true): Promise<T> {
  const res = await pedir(ruta, {
    method: metodo,
    headers: cuerpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
  }, conToken);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

// ---------- HU-01 ----------
export const apiLogin = (email: string, password: string) =>
  json<LoginResponse>('/auth/login', 'POST', { email, password }, false);
export const apiRegister = (d: {
  nombre_completo: string; email: string; password: string; rol: 'cliente' | 'trabajador'; id_servicio_principal?: number;
}) => json<Usuario>('/auth/register', 'POST', d, false);
export const apiMe = () => json<Usuario>('/auth/me');

// Catálogos (listas cerradas para los desplegables)
export const apiCatalogos = () => json<Catalogos>('/catalogos', 'GET', undefined, false);

// ---------- HU-03 / HU-04 / HU-05: trabajador ----------
export const apiPerfil = () => json<PerfilTrabajador>('/trabajador/perfil');
export const apiGuardarPerfil = (d: PerfilIn) => json<PerfilTrabajador>('/trabajador/perfil', 'PUT', d);
export const apiCrearPerfil = (d: PerfilIn) => json<PerfilTrabajador>('/trabajador/perfil', 'POST', d);
export const apiDocumentos = () => json<Documento[]>('/trabajador/documentos');
export async function apiSubirDocumento(tipo: string, archivo: File): Promise<Documento> {
  const f = new FormData();
  f.append('tipo_documento', tipo);
  f.append('archivo', archivo);
  const res = await pedir('/trabajador/documentos', { method: 'POST', body: f });
  return res.json();
}

// El archivo es privado: se descarga con el token y se abre desde memoria.
export async function apiAbrirDocumento(id: number): Promise<void> {
  const res = await pedir(`/documentos/${id}/archivo`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ---------- HU-06: búsqueda (cliente) ----------
export interface FiltrosBusqueda {
  servicio_id?: number; zona_id?: number; ciudad?: string; q?: string; min_estrellas?: number; tarifa_min?: number; tarifa_max?: number;
}
export function apiBuscar(f: FiltrosBusqueda) {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => { if (v !== undefined && v !== '' && !Number.isNaN(v)) p.set(k, String(v)); });
  return json<{ total: number; resultados: TrabajadorCard[] }>(`/busqueda/trabajadores?${p}`);
}
export const apiTrabajadorPublico = (id: number) => json<TrabajadorPublico>(`/busqueda/trabajadores/${id}`);

// ---------- HU-05: administración ----------
export const apiVerificaciones = () => json<Verificacion[]>('/admin/verificaciones');
export const apiResolver = (id: number, decision: 'VERIFICADO' | 'RECHAZADO') =>
  json<Verificacion>(`/admin/verificaciones/${id}/resolver`, 'POST', { decision });

// Etiquetas legibles para los estados
export const ETIQUETA_ESTADO: Record<EstadoVerificacion, 'Pendiente' | 'En revisión' | 'Verificado' | 'Rechazado'> = {
  PENDIENTE: 'Pendiente', EN_REVISION: 'En revisión', VERIFICADO: 'Verificado', RECHAZADO: 'Rechazado',
};

// ---------- Inicio: datos reales ----------
export interface Resumen {
  categorias: { id: number; nombre: string; descripcion: string | null; tecnicos: number }[];
  tecnicos_verificados: number; ciudades: number; promedio_estrellas: number | null; total_resenas: number;
}
export const apiResumen = () => json<Resumen>('/catalogos/resumen', 'GET', undefined, false);


// ============================================================================
// SPRINT 3: Solicitudes (HU-08), Mensajería (HU-07) y Contratos PDF (HU-09)
// ============================================================================
export type EstadoSolicitud = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';

export interface SolicitudIn {
  id_trabajador: number; // perfil_trabajador.id_perfil
  id_servicio: number;
  descripcion_problema: string;
  fecha_programada: string; // YYYY-MM-DD
  hora_programado: string;  // HH:MM
  duracion_estimada_horas: number;
  valor_acordado: number;
}

export interface Solicitud {
  id_solicitud: number;
  id_cliente: number;
  id_trabajador: number;
  id_servicio: number;
  nombre_servicio?: string;
  nombre_cliente?: string;
  nombre_trabajador?: string;
  descripcion_problema: string | null;
  fecha_programada: string;
  hora_programado: string;
  duracion_estimada_horas: number | null;
  valor_acordado: number | null;
  estado_solicitud: EstadoSolicitud;
  tiene_contrato?: boolean;
  estado_pago?: 'PENDIENTE' | 'SIMULADO' | 'PAGADO' | 'LIBERADO';
  ya_calificado?: boolean;
}

export interface MensajeChat {
  id_mensaje: number;
  id_solicitud: number;
  id_emisor: number;
  nombre_emisor?: string;
  contenido: string;
  enviado_at: string;
}

export const apiCrearSolicitud = (d: SolicitudIn) =>
  json<Solicitud>('/solicitudes', 'POST', d);

export const apiMisSolicitudes = () =>
  json<Solicitud[]>('/solicitudes/mis-solicitudes');

export const apiDetalleSolicitud = (id: number) =>
  json<Solicitud>(`/solicitudes/${id}`);

export const apiResponderSolicitud = (id: number, accion: 'aceptar' | 'rechazar') =>
  json<Solicitud>(`/solicitudes/${id}/${accion}`, 'PATCH');

export const apiFinalizarSolicitud = (id: number) =>
  json<Solicitud>(`/solicitudes/${id}/finalizar`, 'PATCH');

export const apiMensajesSolicitud = (idSolicitud: number) =>
  json<MensajeChat[]>(`/solicitudes/${idSolicitud}/mensajes`);

export const apiEnviarMensaje = (idSolicitud: number, contenido: string) =>
  json<MensajeChat>(`/solicitudes/${idSolicitud}/mensajes`, 'POST', { contenido });

export async function apiDescargarContratoPdf(idSolicitud: number): Promise<void> {
  const res = await pedir(`/solicitudes/${idSolicitud}/contrato`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ============================================================================
// SPRINT 4: Pagos Sandbox (HU-10), Calificaciones (HU-11) y Auditoría (HU-12)
// ============================================================================
export interface PagoSimuladoResp {
  id_pago: number;
  id_solicitud: number;
  monto_total: number;
  monto_plataforma: number;
  monto_trabajador: number;
  estado_pago: string;
  fecha_pago: string;
}

export interface CalificacionIn {
  id_solicitud: number;
  estrellas: number;
  comentario: string;
}

export interface LogAuditoria {
  id_log?: number;
  id_auditoria?: number;
  id_usuario?: number | null;
  usuario_email?: string;
  accion: string;
  entidad?: string;
  detalle?: string | null;
  created_at?: string;
  fecha?: string;
}

export interface MetricasAdmin {
  total_usuarios: number;
  total_clientes: number;
  total_trabajadores: number;
  total_solicitudes: number;
  solicitudes_completadas: number;
  comisiones_generadas: number;
  volumen_transaccionado: number;
}

export const apiSimularPago = (idSolicitud: number, metodo_sandbox: string) =>
  json<PagoSimuladoResp>('/pagos/simular', 'POST', { id_solicitud: idSolicitud, metodo_sandbox });

export const apiCrearCalificacion = (d: CalificacionIn) =>
  json('/calificaciones', 'POST', d);

export const apiMetricasAdmin = () =>
  json<MetricasAdmin>('/admin/metricas');

export const apiLogsAuditoria = () =>
  json<LogAuditoria[]>('/admin/auditoria');