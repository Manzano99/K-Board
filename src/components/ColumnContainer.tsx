import { PlusCircle, Trash2 } from "lucide-react";
import type { Column, Task, Id } from "../types";
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
  // Nueva prop opcional para borrar columna
  onDeleteColumn?: (columnId: Id) => void;
}

function ColumnContainer({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
}: Props) {
  const addTask = useStore((state) => state.addTask);
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
    disabled: editMode,
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
      className="bg-gray-900 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col border-2 border-gray-800 group/column" // group/column para hover effects
    >
      {/* HEADER */}
      <div
        {...attributes}
        {...listeners}
        onDoubleClick={() => setEditMode(true)}
        className="bg-gray-950 text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-gray-800 border-4 flex items-center justify-between hover:border-gray-700 transition-colors relative"
      >
        <div className="flex gap-2 items-center flex-grow overflow-hidden">
          <div className="flex justify-center items-center bg-gray-900 px-2 py-1 text-sm rounded-full shrink-0">
            {tasks.length}
          </div>

          {!editMode && (
            <span className="cursor-text select-none ml-2 text-gray-100 truncate">
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

        {/* Botón Borrar Columna: Solo visible si pasamos la función y no estamos editando */}
        {!editMode && onDeleteColumn && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Evita que se active el drag
              onDeleteColumn(column.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-gray-500 hover:text-white hover:bg-red-900/50 p-1.5 rounded-md transition-all opacity-0 group-hover/column:opacity-100 ml-2"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* BODY */}
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

      {/* FOOTER: Botón de añadir tarea */}
      <button
        className="flex gap-2 items-center border-gray-800 border-2 rounded-md p-4 border-x-gray-900 hover:bg-gray-950 hover:text-rose-500 active:bg-black transition-colors"
        onClick={() => addTask(column.id)}
      >
        <PlusCircle />
        Añadir tarea
      </button>
    </div>
  );
}

export default ColumnContainer;
