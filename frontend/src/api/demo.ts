import { api } from './client';
import type { DemoSession } from '../types';

export const demoApi = {
  current: async (): Promise<DemoSession> => {
    const { data } = await api.get<DemoSession>('/demo/session');
    return data;
  },

  reset: async (): Promise<{ sessionId: string; reset: boolean }> => {
    const { data } = await api.post<{ sessionId: string; reset: boolean }>(
      '/demo/reset',
    );
    return data;
  },
};
