import { api } from './client';
import type {
  CreateTaskInput,
  PrioritySuggestion,
  Task,
  TaskPriority,
  TaskStatus,
} from '../types';

interface TaskFilters {
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export const tasksApi = {
  list: async (filters: TaskFilters = {}): Promise<Task[]> => {
    const { data } = await api.get<Task[]>('/tasks', { params: filters });
    return data;
  },

  get: async (id: string): Promise<Task> => {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const { data } = await api.post<Task>('/tasks', input);
    return data;
  },

  update: async (id: string, input: Partial<CreateTaskInput>): Promise<Task> => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, input);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  suggestPriority: async (input: {
    title: string;
    description?: string;
    deadline?: string | null;
  }): Promise<PrioritySuggestion> => {
    const { data } = await api.post<PrioritySuggestion>(
      '/tasks/suggest-priority',
      input,
    );
    return data;
  },
};
