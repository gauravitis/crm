export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: Status;
  title: string;
  tasks: Task[];
}

export interface Board {
  columns: Column[];
}
