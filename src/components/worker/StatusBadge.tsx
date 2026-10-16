export type VerificationStatus = 'Pendiente' | 'En revisión' | 'Verificado' | 'Rechazado';

export const StatusBadge = ({ status }: { status: VerificationStatus }) => {
  const getStyles = () => {
    switch (status) {
      case 'Verificado': return 'bg-[#e8f5e9] text-[#1a7a4a] border-[#c8e6c9]';
      case 'En revisión': return 'bg-[#e3f2fd] text-[#1a3a6b] border-[#bbdefb]';
      case 'Rechazado': return 'bg-[#fde0dc] text-[#c0392b] border-[#f9bdbb]';
      default: return 'bg-[#fff8e1] text-[#e8a020] border-[#ffecb3]'; // Pendiente
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStyles()}`}>
      Estado: {status}
    </span>
  );
};