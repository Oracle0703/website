export type TaskStatus = "todo" | "doing" | "done";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  updatedAt: string;
};

export type TasksDoc = {
  tasks: Task[];
};

export type TasksGetResponse = {
  value: TasksDoc;
  etag?: string;
};

export type LogEntry = {
  ts: string;
  message: string;
  subtitle?: string;
  meta?: Record<string, unknown>;
};

export type LogsGetResponse = {
  entries: LogEntry[];
};

export type StatusDoc = {
  updatedAt: string;
  text: string;
};
