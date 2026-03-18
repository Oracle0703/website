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

export type IngestCategory = "mr" | "deploy" | "ops" | "content" | "idle" | "cron" | "other";

export type IngestEventType =
  | "task.created"
  | "task.started"
  | "task.progress"
  | "task.completed"
  | "task.failed"
  | "note";

export type IngestEvent = {
  id: string;
  ts: string;
  type: IngestEventType;
  category: IngestCategory;
  title: string;
  summary?: string;
  details?: Record<string, unknown>;
};

export type StateNow = {
  title: string;
  summary?: string;
  category: IngestCategory;
  since: string;
  links?: Array<{ label: string; url: string }>;
};

export type StateRecentDone = {
  title: string;
  ts: string;
  category: IngestCategory;
  commit?: string;
};

export type StateRecentFailed = {
  title: string;
  ts: string;
  category: IngestCategory;
  reason?: string;
};

export type StateDoc = {
  updatedAt: string;
  now: StateNow | null;
  next: Array<{ title: string; summary?: string; category: IngestCategory }>;
  recent: {
    done: StateRecentDone[];
    failed: StateRecentFailed[];
  };
};

export type EventsGetResponse = {
  events: IngestEvent[];
};
