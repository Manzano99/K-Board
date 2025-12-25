import { AlertTriangle, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

function AlertModal({ isOpen, onClose, onConfirm, title, description }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-red-900/50 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header con icono de alerta */}
        <div className="p-4 bg-red-950/30 border-b border-red-900/30 flex items-center gap-3">
          <div className="bg-red-900/20 p-2 rounded-full">
            <AlertTriangle className="text-red-500" size={20} />
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensaje */}
        <div className="p-6">
          <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
        </div>

        {/* Botones */}
        <div className="p-4 bg-gray-950/50 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
