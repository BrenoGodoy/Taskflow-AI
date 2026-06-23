import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  clearStoredSessionId,
  getStoredSessionId,
  storeSessionId,
} from '../lib/demo-session';

const baseURL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api`;

/** Instância principal usada por toda a aplicação (com sessão demo automática). */
export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

/** Instância "crua" usada apenas para criar a sessão demo (evita recursão de interceptors). */
const rawApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

const DEMO_HEADER = 'X-Demo-Session-Id';

let sessionPromise: Promise<string> | null = null;

async function createSession(): Promise<string> {
  const { data } = await rawApi.post<{ sessionId: string }>('/demo/session');
  storeSessionId(data.sessionId);
  return data.sessionId;
}

/**
 * Garante que exista um demoSessionId. Cria uma nova sessão no backend caso
 * ainda não exista no localStorage. Chamadas concorrentes compartilham a mesma
 * promessa para criar apenas uma sessão.
 */
export function ensureDemoSession(): Promise<string> {
  const existing = getStoredSessionId();
  if (existing) return Promise.resolve(existing);

  if (!sessionPromise) {
    sessionPromise = createSession().finally(() => {
      sessionPromise = null;
    });
  }
  return sessionPromise;
}

// Anexa o header de sessão demo em toda requisição.
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const sessionId = await ensureDemoSession();
  config.headers.set(DEMO_HEADER, sessionId);
  return config;
});

// Se a sessão expirou/ficou inválida (401), recria e tenta novamente uma vez.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      clearStoredSessionId();
      const sessionId = await ensureDemoSession();
      original.headers.set(DEMO_HEADER, sessionId);
      return api(original);
    }

    return Promise.reject(error);
  },
);

/**
 * Extrai uma mensagem de erro legível das respostas padronizadas do backend.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
    return error.message;
  }
  return 'Ocorreu um erro inesperado.';
}
