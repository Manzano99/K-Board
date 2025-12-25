import { Trash2, Calendar, Clock, Timer } from "lucide-react";
import type { Task, Priority } from "../types";
import { useStore } from "../store/useStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task & { content?: string };
  onEditTask?: (task: Task) => void;
}

const badgeColors: Record<Priority, string> = {
  Low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30",
  Medium:
    "bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30",
  High: "bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30",
};

const cardBorderColors: Record<Priority, { base: string; hover: string }> = {
  Low: { base: "border-emerald-500", hover: "hover:border-emerald-500" },
  Medium: { base: "border-amber-500", hover: "hover:border-amber-500" },
  High: { base: "border-rose-500", hover: "hover:border-rose-500" },
};

const formatDate = (isoString?: string) => {
  if (!isoString) return "--/--";
  const date = new Date(isoString);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

const getDaysDisplay = (startDateString?: string, endDateString?: string) => {
  if (!startDateString || !endDateString) return null;

  const start = new Date(startDateString);
  const end = new Date(endDateString);
  const now = new Date();

  // Reseteamos horas
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  // Validación: La fecha no puede ser anterior a la de inicio
  if (end < start) return null;

  if (now < start) {
    const totalDuration = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      text: `${totalDuration} días`,
      style: "text-gray-500",
      iconColor: "stroke-gray-500",
    };
  }

  if (now > end) {
    const overdue = Math.ceil(
      (now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      text: `${overdue}d de retraso`,
      style: "text-rose-400 font-bold bg-rose-950/30 px-2 py-0.5 rounded",
      iconColor: "stroke-rose-400",
    };
  }

  const remaining = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (remaining === 0) {
    return {
      text: "Entrega hoy",
      style: "text-amber-400 font-bold bg-amber-950/30 px-2 py-0.5 rounded",
      iconColor: "stroke-amber-400",
    };
  }

  if (remaining <= 2) {
    return {
      text: `${remaining} días restantes`,
      style: "text-amber-400 font-bold",
      iconColor: "stroke-amber-400",
    };
  }

  return {
    text: `${remaining} días restantes`,
    style: "text-sky-400 font-medium",
    iconColor: "stroke-sky-400",
  };
};

function TaskCard({ task, onEditTask }: Props) {
  const deleteTask = useStore((state) => state.deleteTask);
  const updateTaskPriority = useStore((state) => state.updateTaskPriority);

  const currentPriority: Priority = task.priority || "Low";
  const content = task.description || task.content || "";

  // Calcula el estado visual usando ambas fechas
  const daysStatus = getDaysDisplay(task.startDate, task.endDate);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
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
  const baseClasses =
    "bg-gray-800 p-4 min-h-[160px] flex flex-col text-left rounded-xl border-2 cursor-grab relative group task justify-between gap-2";

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`${baseClasses} ${borderClass.base} opacity-30`}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEditTask?.(task)}
      className={`${baseClasses} border-transparent ${borderClass.hover} transition-colors duration-200 hover:cursor-pointer`}
    >
      <div className="flex w-full justify-between items-start">
        <span className="font-bold text-gray-100 text-sm truncate mr-2">
          {task.title || "Sin título"}
        </span>

        <button
          onClick={cyclePriority}
          onPointerDown={(e) => e.stopPropagation()}
          className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide transition-colors cursor-pointer select-none ${badgeClass}`}
        >
          {currentPriority}
        </button>
      </div>

      <div className="flex-grow w-full overflow-hidden">
        <p className="text-xs text-gray-400 whitespace-pre-wrap line-clamp-3">
          {content}
        </p>
      </div>

      <div className="flex items-center gap-3 text-gray-500 text-[10px] font-medium pt-2 border-t border-gray-700/50 w-full">
        <div className="flex items-center gap-1.5" title="Fecha de inicio">
          <Calendar size={12} className="stroke-gray-400" />
          <span>{formatDate(task.startDate)}</span>
        </div>

        <div className="flex items-center gap-1.5" title="Fecha de entrega">
          <Clock size={12} className="stroke-gray-400" />
          <span>{formatDate(task.endDate)}</span>
        </div>

        {/* --- CONTADOR DINÁMICO --- */}
        {daysStatus && (
          <div
            className={`flex items-center gap-1.5 ml-auto ${daysStatus.style}`}
            title="Estado de entrega"
          >
            <Timer size={12} className={daysStatus.iconColor} />
            <span>{daysStatus.text}</span>
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteTask(task.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="stroke-gray-500 absolute -right-2 -top-2 bg-gray-900 p-2 rounded-full border border-gray-700 opacity-0 group-hover:opacity-100 hover:stroke-red-500 hover:border-red-500 hover:bg-gray-950 transition-all shadow-lg z-10"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default TaskCard;
