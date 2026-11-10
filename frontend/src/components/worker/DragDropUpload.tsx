import { useState, useRef } from "react";
import { apiAbrirDocumento, apiSubirDocumento, type Documento } from "../../api";
import { MensajeError, MensajeOk } from "../ui/Mensajes";

interface Props {
  tiposDocumento: string[];
  documentos: Documento[];
  puedeSubir: boolean; // false si ya está VERIFICADO o hay un documento en revisión
  onSubido: () => void;
}

const TIPOS_VALIDOS = ["application/pdf", "image/jpeg", "image/png"];
const MAX_MB = 5;

export const DragDropUpload = ({ tiposDocumento, documentos, puedeSubir, onSubido }: Props) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState(tiposDocumento[0] ?? "");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validar = (f: File) => {
    setError(""); setOk("");
    if (!TIPOS_VALIDOS.includes(f.type)) { setError("Formato no válido. Solo se permite PDF, JPG o PNG."); return false; }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`El archivo supera el límite de ${MAX_MB} MB.`); return false; }
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f && validar(f)) setFile(f);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validar(f)) setFile(f); else if (f) setFile(null);
  };

  const enviar = async () => {
    if (!file) return;
    setEnviando(true); setError(""); setOk("");
    try {
      await apiSubirDocumento(tipo, file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setOk("Documento enviado. Un administrador lo revisará.");
      onSubido();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#d0daea] shadow-sm">
      <h2 className="text-xl font-bold text-[#0f1f3d] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
        Documentación de Identidad
      </h2>
      <p className="text-sm text-[#6b82a0] mb-6">
        Sube tu documento de identidad (Cédula) para iniciar el proceso de verificación. Este documento es privado y no será visible para los clientes.
      </p>

      {documentos.length > 0 && (
        <ul className="mb-6 space-y-2">
          {documentos.map((d) => (
            <li key={d.id_documento} className="flex justify-between items-center text-sm px-3 py-2 rounded-lg border border-[#d0daea]">
              <span className="text-[#0f1f3d]">{d.tipo_documento}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#6b82a0]">{d.estado_documento}</span>
                <button type="button" onClick={() => apiAbrirDocumento(d.id_documento).catch((e: Error) => setError(e.message))} className="text-xs font-semibold hover:underline" style={{ color: "#1a3a6b" }}>Ver</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {puedeSubir ? (
        <>
          <label className="block text-xs font-medium mb-1.5 text-[#2d3f5e]">Tipo de documento</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full mb-4 px-4 py-3 rounded-xl border border-[#d0daea] text-sm bg-white text-[#0f1f3d]">
            {tiposDocumento.map((t) => <option key={t}>{t}</option>)}
          </select>

          <div
            className={`relative p-8 rounded-xl border-2 border-dashed text-center transition-all ${dragActive ? "border-[#1a3a6b] bg-[#e8edf5]" : "border-[#d0daea] bg-[#f0f3f8]"}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            <input ref={inputRef} data-testid="archivo" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="hidden" />
            <p className="text-3xl mb-2">📄</p>
            <p className="text-sm font-medium text-[#0f1f3d] mb-1">{file ? file.name : "Arrastra y suelta tu archivo aquí"}</p>
            <p className="text-xs text-[#6b82a0] mb-4">o haz clic para buscar en tu dispositivo · PDF, JPG o PNG · máx. {MAX_MB} MB</p>
            <button type="button" onClick={() => inputRef.current?.click()} className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-[#d0daea] text-[#0f1f3d] hover:bg-[#faf8f4] transition-all">
              {file ? "Cambiar archivo" : "Seleccionar archivo"}
            </button>
          </div>

          {file && (
            <button type="button" onClick={enviar} disabled={enviando} className="w-full mt-4 py-3 rounded-xl font-semibold text-sm bg-[#1a7a4a] text-white hover:opacity-90 transition-all disabled:opacity-60">
              {enviando ? "Enviando..." : "Enviar para verificación"}
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-[#6b82a0]">No necesitas subir más documentos por ahora.</p>
      )}

      <div className="mt-3 space-y-2">
        <MensajeError texto={error} />
        <MensajeOk texto={ok} />
      </div>
    </div>
  );
};
