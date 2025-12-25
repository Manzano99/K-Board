import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Column, Task } from "../types";

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  // Acciones
  setTasks: (tasks: Task[]) => void;
  addTask: (columnId: string | number) => void;
  deleteTask: (id: string | number) => void;
  updateTask: (id: string | number, content: string) => void;
}

export const useStore = create<KanbanState>()(
  persist(
    (set) => ({
      // Estado inicial
      columns: [
        { id: "UNVALIDATED", title: "Sin validar" },
        { id: "TODO", title: "Pendiente" },
        { id: "DOING", title: "En Progreso" },
        { id: "DONE", title: "Terminado" },
      ],
      tasks: [],

      // Funciones para modificar el estado
      setTasks: (tasks) => set({ tasks }),

      addTask: (columnId) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: crypto.randomUUID(),
              columnId,
              content: `Nueva tarea ${state.tasks.length + 1}`,
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
    }),
    {
      name: "task-flow-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
