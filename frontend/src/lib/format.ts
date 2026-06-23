import type { TaskPriority, TaskStatus } from '../types';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'A fazer',
  DOING: 'Em andamento',
  DONE: 'Concluído',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

export const PRIORITY_BADGE: Record<TaskPriority, string> = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
};

export const STATUS_ACCENT: Record<TaskStatus, string> = {
  TODO: 'border-slate-300',
  DOING: 'border-blue-400',
  DONE: 'border-emerald-400',
};

export function formatDate(value?: string | null): string {
  if (!value) return 'Sem prazo';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sem prazo';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function isOverdue(
  deadline?: string | null,
  status?: TaskStatus,
): boolean {
  if (!deadline || status === 'DONE') return false;
  return new Date(deadline).getTime() < Date.now();
}
