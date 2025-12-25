import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Toaster, toast } from "sonner";

import ColumnContainer from "./components/ColumnContainer";
import TaskCard from "./components/TaskCard";
import TaskModal from "./components/TaskModal";
import { useStore } from "./store/useStore";
import type { Column, Task } from "./types";

function App() {
  const columns = useStore((state) => state.columns);
  const tasks = useStore((state) => state.tasks);
  const setTasks = useStore((state) => state.setTasks);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Estado para saber qué tarea estamos editando
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  return (
    <div className="m-auto flex min-h-screen w-full items-center justify-center overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <SortableContext items={columnsId}>
            {columns.map((col) => (
              <ColumnContainer
                key={col.id}
                column={col}
                tasks={tasks.filter((task) => task.columnId === col.id)}
                onEditTask={setEditingTask}
              />
            ))}
          </SortableContext>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                onEditTask={setEditingTask}
              />
            )}
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {/* 4. Renderizamos el Modal si hay una tarea seleccionada */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      <Toaster position="bottom-center" richColors theme="dark" />
    </div>
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask({ ...event.active.data.current.task });
      return;
    }
  }

  function onDragEnd() {
    setActiveColumn(null);
    setActiveTask(null);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;
    if (!activeTask) return;

    let targetColumnId: string | number = "";

    if (isOverTask) {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;
      targetColumnId = overTask.columnId;
    } else {
      targetColumnId = overId;
    }

    const columnOrder = ["UNVALIDATED", "TODO", "DOING", "DONE"];

    const originalIndex = columnOrder.indexOf(String(activeTask.columnId));
    const targetIndex = columnOrder.indexOf(String(targetColumnId));

    if (originalIndex === -1 || targetIndex === -1) return;

    const isSameColumn = originalIndex === targetIndex;
    const isAdjacent = Math.abs(originalIndex - targetIndex) === 1;

    if (!isSameColumn && !isAdjacent) {
      toast.error("Movimiento no permitido: Solo columnas contiguas", {
        id: "invalid-move",
        description: "Intenta mover la tarea paso a paso.",
      });
      return;
    }

    if (isActiveTask && isOverTask) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
        const newTasks = [...tasks];
        newTasks[activeIndex] = {
          ...newTasks[activeIndex],
          columnId: tasks[overIndex].columnId,
        };
        setTasks(arrayMove(newTasks, activeIndex, overIndex - 1));
      } else {
        setTasks(arrayMove(tasks, activeIndex, overIndex));
      }
    }

    const isOverColumn = over.data.current?.type === "Column";

    if (isActiveTask && isOverColumn) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const newTasks = [...tasks];
      newTasks[activeIndex] = {
        ...newTasks[activeIndex],
        columnId: overId,
      };
      setTasks(arrayMove(newTasks, activeIndex, activeIndex));
    }
  }
}

export default App;
