import { Trash2 } from "lucide-react";
import type { Task } from "../types";
import { useStore } from "../store/useStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
}

function TaskCard({ task }: Props) {
  const deleteTask = useStore((state) => state.deleteTask);

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

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-800 p-3 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-rose-500 opacity-30 cursor-grab relative"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-800 p-3 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-rose-500 cursor-grab relative group task"
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content}
      </p>

      <button
        onClick={() => deleteTask(task.id)}
        className="stroke-gray-500 absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900 p-2 rounded opacity-0 group-hover:opacity-100 hover:stroke-white transition-opacity"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default TaskCard;
