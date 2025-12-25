import { PlusCircle } from "lucide-react";
import type { Column, Task } from "../types";
import { useStore } from "../store/useStore";
import TaskCard from "./TaskCard";
import { useMemo } from "react";
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
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const { setNodeRef, transform, transition } = useSortable({
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-900 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col border-2 border-gray-800"
    >
      <div className="bg-gray-950 text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-gray-800 border-4 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-gray-900 px-2 py-1 text-sm rounded-full">
            {tasks.length}
          </div>
          {column.title}
        </div>
      </div>

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

      {column.id === "UNVALIDATED" && (
        <button
          className="flex gap-2 items-center border-gray-800 border-2 rounded-md p-4 border-x-gray-900 hover:bg-gray-950 hover:text-rose-500 active:bg-black"
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
