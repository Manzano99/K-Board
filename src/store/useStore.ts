import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Column, Task, Priority, Id } from "../types"; // Asegúrate de importar Id

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (columnId: string | number) => void;
  deleteTask: (id: string | number) => void;
  updateTask: (id: string | number, task: Partial<Task>) => void;
  updateTaskPriority: (id: string | number, priority: Priority) => void;
  updateColumn: (id: Id, title: string) => void;
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

      updateColumn: (id, title) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, title } : col
          ),
        })),
    }),
    {
      name: "task-flow-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
