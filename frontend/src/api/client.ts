import axios from 'axios';

const baseURL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api`;

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

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
