export type Id = string | number;

export type Column = {
  id: Id;
  title: string;
};

export type Priority = "Low" | "Medium" | "High";

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
  priority: Priority;
};
