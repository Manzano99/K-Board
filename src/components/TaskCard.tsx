import { Trash2 } from "lucide-react";
import type { Task, Priority } from "../types";
import { useStore } from "../store/useStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
}

const badgeColors: Record<Priority, string> = {
  Low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30",
  Medium:
    "bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30",
  High: "bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30",
};

// CAMBIO 1: Simplificamos el mapa de colores.
// Ahora definimos el color del borde "base" (para dragging) y el color "hover" (para idle).
// Ya no usamos 'ring', solo 'border'.
const cardBorderColors: Record<Priority, { base: string; hover: string }> = {
  Low: {
    base: "border-emerald-500",
    hover: "hover:border-emerald-500",
  },
  Medium: {
    base: "border-amber-500",
    hover: "hover:border-amber-500",
  },
  High: {
    base: "border-rose-500",
    hover: "hover:border-rose-500",
  },
};

function TaskCard({ task }: Props) {
  const deleteTask = useStore((state) => state.deleteTask);
  const updateTaskPriority = useStore((state) => state.updateTaskPriority);

  const currentPriority: Priority = task.priority || "Low";

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const cyclePriority = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const nextPriority: Record<Priority, Priority> = {
      Low: "Medium",
      Medium: "High",
      High: "Low",
    };

    updateTaskPriority(task.id, nextPriority[currentPriority]);
  };

  const badgeClass = badgeColors[currentPriority];
  const borderClass = cardBorderColors[currentPriority];

  // --- ESTADO DE ARRASTRE (DRAGGING) ---
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        // Usamos borderClass.base directamente
        className={`bg-gray-800 p-3 h-[120px] min-h-[120px] items-start flex flex-col text-left rounded-xl border-2 ${borderClass.base} opacity-30 cursor-grab relative`}
      />
    );
  }

  // --- ESTADO NORMAL (IDLE / HOVER) ---
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // CAMBIO 2: Lógica visual corregida
      // - Eliminamos 'ring' por completo.
      // - Mantenemos 'border-2' siempre fijo.
      // - Usamos 'border-transparent' por defecto y cambiamos a 'hover:border-COLOR' al pasar el ratón.
      // - Corregimos 'transitions-all' a 'transition-colors' para un efecto suave y sin bugs.
      className={`bg-gray-800 p-3 h-[120px] min-h-[120px] flex flex-col text-left rounded-xl border-2 border-transparent ${borderClass.hover} transition-colors duration-200 cursor-grab relative group task justify-between`}
    >
      <div className="flex w-full justify-between items-start mb-2">
        <button
          onClick={cyclePriority}
          onPointerDown={(e) => e.stopPropagation()}
          className={`text-xs px-2 py-0.5 rounded-md border font-medium transition-colors cursor-pointer select-none ${badgeClass}`}
        >
          {currentPriority}
        </button>
      </div>

      <p className="w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap text-sm text-gray-200">
        {task.content}
      </p>

      <button
        onClick={() => deleteTask(task.id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="stroke-gray-500 absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900 p-2 rounded opacity-0 group-hover:opacity-100 hover:stroke-white transition-opacity"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default TaskCard;
