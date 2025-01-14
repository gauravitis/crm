import { create } from 'zustand';
import { Task, Status, Priority } from '../types/task';
import { taskService } from '../services/taskService';

interface TaskStats {
  total: number;
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
  overdue: number;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  stats: TaskStats;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: Status) => Promise<void>;
  calculateStats: () => void;
}

const calculateTaskStats = (tasks: Task[]): TaskStats => {
  const now = new Date();
  return {
    total: tasks.length,
    byStatus: {
      todo: tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length,
    },
    byPriority: {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
    },
    overdue: tasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < now && 
      t.status !== 'done'
    ).length,
  };
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  stats: {
    total: 0,
    byStatus: { todo: 0, 'in-progress': 0, review: 0, done: 0 },
    byPriority: { low: 0, medium: 0, high: 0 },
    overdue: 0,
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getAllTasks();
      set({ 
        tasks,
        isLoading: false,
        stats: calculateTaskStats(tasks)
      });
    } catch (error) {
      set({ error: 'Failed to fetch tasks', isLoading: false });
    }
  },

  addTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const newTask: Omit<Task, 'id'> = {
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const taskId = await taskService.createTask(newTask);
      const tasks = [...get().tasks, { ...newTask, id: taskId }];
      set({ 
        tasks,
        isLoading: false,
        stats: calculateTaskStats(tasks)
      });
    } catch (error) {
      set({ error: 'Failed to add task', isLoading: false });
    }
  },

  updateTask: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await taskService.updateTask(id, updatedTask);
      const tasks = get().tasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      );
      set({ 
        tasks,
        isLoading: false,
        stats: calculateTaskStats(tasks)
      });
    } catch (error) {
      set({ error: 'Failed to update task', isLoading: false });
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await taskService.deleteTask(id);
      const tasks = get().tasks.filter((task) => task.id !== id);
      set({ 
        tasks,
        isLoading: false,
        stats: calculateTaskStats(tasks)
      });
    } catch (error) {
      set({ error: 'Failed to delete task', isLoading: false });
    }
  },

  moveTask: async (taskId, newStatus) => {
    await get().updateTask(taskId, { status: newStatus });
  },

  calculateStats: () => {
    set({ stats: calculateTaskStats(get().tasks) });
  },
}));
