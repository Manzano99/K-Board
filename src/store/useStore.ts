import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Column, Task, Priority } from "../types";

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (columnId: string | number) => void;
  deleteTask: (id: string | number) => void;
  // CAMBIO IMPORTANTE: Ahora updateTask acepta un objeto parcial
  updateTask: (id: string | number, task: Partial<Task>) => void;
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
        set((state) => {
          const now = new Date();
          const threeDaysLater = new Date();
          threeDaysLater.setDate(now.getDate() + 3);

          return {
            tasks: [
              ...state.tasks,
              {
                id: crypto.randomUUID(),
                columnId,
                title: `Nueva Tarea ${state.tasks.length + 1}`,
                description: "Añade una descripción...",
                priority: "Low",
                startDate: now.toISOString(),
                endDate: threeDaysLater.toISOString(),
              },
            ],
          };
        }),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      updateTask: (id, newAttributes) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...newAttributes } : task
          ),
        })),

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
