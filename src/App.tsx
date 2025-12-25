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
  type DragEndEvent, // Asegúrate de importar DragEndEvent
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Toaster, toast } from "sonner";
import { Search, Plus } from "lucide-react";

import ColumnContainer from "./components/ColumnContainer";
import TaskCard from "./components/TaskCard";
import TaskModal from "./components/TaskModal";
import AlertModal from "./components/AlertModal";
import { useStore } from "./store/useStore";
import type { Column, Task, Id } from "./types";

function App() {
  const columns = useStore((state) => state.columns);
  // Traemos la nueva acción setColumns
  const setColumns = useStore((state) => state.setColumns);

  const tasks = useStore((state) => state.tasks);
  const setTasks = useStore((state) => state.setTasks);
  const deleteTask = useStore((state) => state.deleteTask);
  const addColumn = useStore((state) => state.addColumn);
  const deleteColumn = useStore((state) => state.deleteColumn);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [deletingTaskId, setDeletingTaskId] = useState<Id | null>(null);
  const [deletingColumnId, setDeletingColumnId] = useState<Id | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    const lowerQuery = searchQuery.toLowerCase();
    return tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(lowerQuery);
      const description = task.description || "";
      const descMatch = description.toLowerCase().includes(lowerQuery);
      return titleMatch || descMatch;
    });
  }, [tasks, searchQuery]);

  const handleConfirmDeleteTask = () => {
    if (!deletingTaskId) return;
    deleteTask(deletingTaskId);
    toast.success("Tarea eliminada correctamente");
    setDeletingTaskId(null);
  };

  const handleConfirmDeleteColumn = () => {
    if (!deletingColumnId) return;
    deleteColumn(deletingColumnId);
    toast.success("Columna eliminada");
    setDeletingColumnId(null);
  };

  return (
    <div className="m-auto flex min-h-screen w-full flex-col items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <div className="flex items-center justify-between w-full max-w-[1500px] py-8 px-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent">
          K-Board
        </h1>

        <div className="flex gap-4">
          <div className="relative group w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500 group-focus-within:text-rose-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-[300px] pl-10 pr-3 py-2 border border-gray-700 rounded-xl leading-5 bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-950 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm transition-all shadow-lg"
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => addColumn()}
            className="h-[38px] px-4 flex items-center gap-2 bg-gray-900 border border-gray-700 hover:border-rose-500 hover:text-rose-500 text-gray-300 rounded-xl transition-all text-sm font-semibold shadow-lg"
          >
            <Plus size={18} />
            Columna
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4 pb-4">
          <SortableContext items={columnsId}>
            {columns.map((col) => (
              <ColumnContainer
                key={col.id}
                column={col}
                tasks={filteredTasks.filter((task) => task.columnId === col.id)}
                onEditTask={setEditingTask}
                onDeleteTask={setDeletingTaskId}
                onDeleteColumn={setDeletingColumnId}
              />
            ))}
          </SortableContext>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                tasks={filteredTasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                onEditTask={setEditingTask}
                onDeleteTask={() => {}}
              />
            )}
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {editingTask && (
        <TaskModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      <AlertModal
        isOpen={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={handleConfirmDeleteTask}
        title="¿Eliminar tarea?"
        description="Esta acción no se puede deshacer."
      />

      <AlertModal
        isOpen={!!deletingColumnId}
        onClose={() => setDeletingColumnId(null)}
        onConfirm={handleConfirmDeleteColumn}
        title="¿Eliminar columna?"
        description="ATENCIÓN: Se eliminarán todas las tareas que contenga esta columna. Esta acción es irreversible."
      />

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

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    // Solo procesamos si algo cambió de posición
    if (active.id === over.id) return;

    const isActiveColumn = active.data.current?.type === "Column";
    if (!isActiveColumn) return;

    // Calculamos los índices usando la variable 'columns' que ya tenemos del store
    const activeIndex = columns.findIndex((col) => col.id === active.id);
    const overIndex = columns.findIndex((col) => col.id === over.id);

    // Pasamos directamente el array resultante, no una función
    setColumns(arrayMove(columns, activeIndex, overIndex));
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

    const currentColumnIds = columns.map((c) => c.id);
    const originalIndex = currentColumnIds.indexOf(activeTask.columnId);
    const targetIndex = currentColumnIds.indexOf(targetColumnId);

    if (originalIndex === -1 || targetIndex === -1) return;

    const isSameColumn = originalIndex === targetIndex;
    const isAdjacent = Math.abs(originalIndex - targetIndex) === 1;

    if (!isSameColumn && !isAdjacent) {
      toast.error("Movimiento no permitido: Solo columnas contiguas", {
        id: "invalid-move",
        description: "El flujo debe ser paso a paso.",
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
