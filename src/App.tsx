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
import { Search } from "lucide-react"; // 1. Importamos el icono

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
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 2. Estado para el buscador
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // 3. Lógica de filtrado
  // Filtramos las tareas ANTES de distribuirlas a las columnas.
  // Buscamos coincidencia en Título o Descripción (ignorando mayúsculas/minúsculas)
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;

    const lowerQuery = searchQuery.toLowerCase();

    return tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(lowerQuery);
      // Soporte seguro para descripción o contenido antiguo
      const description = task.description || "";
      const descMatch = description.toLowerCase().includes(lowerQuery);

      return titleMatch || descMatch;
    });
  }, [tasks, searchQuery]);

  return (
    <div className="m-auto flex min-h-screen w-full flex-col items-center overflow-x-auto overflow-y-hidden px-[40px]">
      {/* 4. BARRA DE BÚSQUEDA Y HEADER */}
      <div className="flex items-center justify-between w-full max-w-[1500px] py-8 px-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent">
          K-Board
        </h1>

        <div className="relative group w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-rose-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-xl leading-5 bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-950 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm transition-all shadow-lg"
            placeholder="Buscar tareas por título o contenido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* BODY DEL TABLERO */}
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4 pb-4">
          {" "}
          {/* Añadido pb-4 para espacio extra abajo */}
          <SortableContext items={columnsId}>
            {columns.map((col) => (
              <ColumnContainer
                key={col.id}
                column={col}
                // 5. IMPORTANTE: Pasamos 'filteredTasks' en lugar de 'tasks'
                tasks={filteredTasks.filter((task) => task.columnId === col.id)}
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
                tasks={filteredTasks.filter(
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
