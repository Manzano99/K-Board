export type Id = string | number;

export type Column = {
  id: Id;
  title: string;
};

export type Priority = "Low" | "Medium" | "High";

export type Task = {
  id: Id;
  columnId: Id;
  title: string;
  description: string;
  priority: Priority;
  startDate?: string;
  endDate?: string;
};
