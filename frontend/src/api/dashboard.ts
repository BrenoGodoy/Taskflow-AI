import { api } from './client';
import type { DashboardStats } from '../types';

export const dashboardApi = {
  stats: async (projectId?: string): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/dashboard/stats', {
      params: projectId ? { projectId } : {},
    });
    return data;
  },
};
