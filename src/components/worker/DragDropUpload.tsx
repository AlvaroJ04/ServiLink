import { useState, useRef } from "react";

export const DragDropUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File) => {
    setError("");
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(selectedFile.type)) {
      setError("Formato no válido. Solo se permite PDF, JPG o PNG.");
      return false;
    }
    if (selectedFile.size > maxSize) {
      setError("El archivo supera el límite de 5MB.");
      return false;
    }
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) setFile(droppedFile);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) setFile(selectedFile);
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

      <div 
        className={`relative p-8 rounded-xl border-2 border-dashed text-center transition-all ${dragActive ? 'border-[#1a3a6b] bg-[#e8edf5]' : 'border-[#d0daea] bg-[#f0f3f8]'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleChange}
          className="hidden" 
        />
        
        <p className="text-3xl mb-2">📄</p>
        <p className="text-sm font-medium text-[#0f1f3d] mb-1">
          {file ? file.name : "Arrastra y suelta tu archivo aquí"}
        </p>
        <p className="text-xs text-[#6b82a0] mb-4">
          o haz clic para buscar en tu dispositivo
        </p>
        
        <button 
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-[#d0daea] text-[#0f1f3d] hover:bg-[#faf8f4] transition-all"
        >
          {file ? "Cambiar archivo" : "Seleccionar archivo"}
        </button>
      </div>

      {error && <p className="text-xs text-[#c0392b] mt-3 font-medium">{error}</p>}
      
      {file && !error && (
        <button className="w-full mt-4 py-3 rounded-xl font-semibold text-sm bg-[#1a7a4a] text-white hover:opacity-90 transition-all">
          Enviar para verificación
        </button>
      )}
    </div>
  );
};