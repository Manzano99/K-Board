import { PlusCircle } from "lucide-react";
import type { Column, Task } from "../types";
import { useStore } from "../store/useStore";
import TaskCard from "./TaskCard";
import { useMemo, useState } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  column: Column;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string | number) => void;
}

function ColumnContainer({ column, tasks, onEditTask, onDeleteTask }: Props) {
  const addTask = useStore((state) => state.addTask);
  // Importamos la nueva función
  const updateColumn = useStore((state) => state.updateColumn);

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-800 opacity-40 border-2 border-rose-500 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-900 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col border-2 border-gray-800"
    >
      {/* HEADER DE LA COLUMNA */}
      <div
        {...attributes}
        {...listeners}
        // Activamos edición con DOBLE CLIC
        onDoubleClick={() => setEditMode(true)}
        className="bg-gray-950 text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-gray-800 border-4 flex items-center justify-between hover:border-gray-700 transition-colors"
      >
        <div className="flex gap-2 items-center flex-grow">
          {/* Contador de tareas */}
          <div className="flex justify-center items-center bg-gray-900 px-2 py-1 text-sm rounded-full">
            {tasks.length}
          </div>

          {/* Lógica de Edición vs Visualización */}
          {!editMode && (
            <span className="cursor-text select-none ml-2 text-gray-100">
              {column.title}
            </span>
          )}

          {editMode && (
            <input
              className="bg-black focus:border-rose-500 border rounded outline-none px-2 py-1 ml-2 text-gray-100 w-full border-rose-500"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => setEditMode(false)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>

      {/* BODY DE TAREAS */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>

      {/* FOOTER (Solo visible si es la columna inicial o si quieres que todas tengan botón) */}
      {column.id === "UNVALIDATED" && (
        <button
          className="flex gap-2 items-center border-gray-800 border-2 rounded-md p-4 border-x-gray-900 hover:bg-gray-950 hover:text-rose-500 active:bg-black transition-colors"
          onClick={() => addTask(column.id)}
        >
          <PlusCircle />
          Añadir tarea
        </button>
      )}
    </div>
  );
}

export default ColumnContainer;
