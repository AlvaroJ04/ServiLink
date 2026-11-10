export const MensajeError = ({ texto }: { texto: string }) =>
  texto ? (
    <p role="alert" className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: "#fde0dc", color: "#c0392b" }}>
      {texto}
    </p>
  ) : null;

export const MensajeOk = ({ texto }: { texto: string }) =>
  texto ? (
    <p role="status" className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: "#e8f5e9", color: "#1a7a4a" }}>
      {texto}
    </p>
  ) : null;
