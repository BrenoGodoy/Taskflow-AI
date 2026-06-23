import { api } from './client';
import type { CreateProjectInput, Project } from '../types';

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const { data } = await api.get<Project[]>('/projects');
    return data;
  },

  get: async (id: string): Promise<Project> => {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },

  create: async (input: CreateProjectInput): Promise<Project> => {
    const { data } = await api.post<Project>('/projects', input);
    return data;
  },

  update: async (
    id: string,
    input: Partial<CreateProjectInput>,
  ): Promise<Project> => {
    const { data } = await api.patch<Project>(`/projects/${id}`, input);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
