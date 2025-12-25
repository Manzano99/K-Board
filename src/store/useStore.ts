import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Column, Task, Priority } from "../types";

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (columnId: string | number) => void;
  deleteTask: (id: string | number) => void;
  updateTask: (id: string | number, content: string) => void;
  // Nueva acción
  updateTaskPriority: (id: string | number, priority: Priority) => void;
}

export const useStore = create<KanbanState>()(
  persist(
    (set) => ({
      columns: [
        { id: "UNVALIDATED", title: "Sin validar" },
        { id: "TODO", title: "Pendiente" },
        { id: "DOING", title: "En Progreso" },
        { id: "DONE", title: "Terminado" },
      ],
      tasks: [],

      setTasks: (tasks) => set({ tasks }),

      addTask: (columnId) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: crypto.randomUUID(),
              columnId,
              content: `Nueva tarea ${state.tasks.length + 1}`,
              priority: "Low", // Valor por defecto
            },
          ],
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      updateTask: (id, content) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, content } : task
          ),
        })),

      // Nueva función para actualizar solo la prioridad
      updateTaskPriority: (id, priority) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, priority } : task
          ),
        })),
    }),
    {
      name: "task-flow-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
