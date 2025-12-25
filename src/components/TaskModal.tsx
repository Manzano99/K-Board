import { X } from "lucide-react";
import { useState, useEffect } from "react";
import type { Task } from "../types";
import { useStore } from "../store/useStore";

interface Props {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

// Helper para convertir fecha ISO a formato YYYY-MM-DD que requieren los inputs type="date"
const toInputDate = (isoString?: string) => {
  if (!isoString) return "";
  return isoString.split("T")[0];
};

function TaskModal({ task, isOpen, onClose }: Props) {
  const updateTask = useStore((state) => state.updateTask);

  // Estado local del formulario
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [startDate, setStartDate] = useState(toInputDate(task.startDate));
  const [endDate, setEndDate] = useState(toInputDate(task.endDate));

  // Actualizar el formulario si cambia la tarea seleccionada
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStartDate(toInputDate(task.startDate));
    setEndDate(toInputDate(task.endDate));
  }, [task]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateTask(task.id, {
      title,
      description,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-950">
          <h2 className="text-lg font-bold text-white">Editar Tarea</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 flex flex-col gap-4">
          {/* Título */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              placeholder="Nombre de la tarea"
            />
          </div>

          {/* Fechas (Grid de 2 columnas) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase">
                Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-100 scheme-dark focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase">
                Entrega
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-100 scheme-dark focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-100 min-h-[100px] resize-none focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm"
              placeholder="Detalles de la tarea..."
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-md hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/20"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
