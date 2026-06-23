import { type FormEvent, useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type {
  CreateTaskInput,
  PrioritySuggestion,
  Task,
  TaskPriority,
  TaskStatus,
} from '../types';
import { tasksApi } from '../api/tasks';
import { getErrorMessage } from '../api/client';
import { PRIORITY_LABELS, STATUS_LABELS, toDateInputValue } from '../lib/format';

interface TaskFormProps {
  projectId: string;
  task?: Task | null;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({
  projectId,
  task,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO');
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? 'MEDIUM',
  );
  const [deadline, setDeadline] = useState(toDateInputValue(task?.deadline));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<PrioritySuggestion | null>(null);

  useEffect(() => {
    setSuggestion(null);
  }, [title, description, deadline]);

  const handleSuggest = async () => {
    if (!title.trim()) {
      setError('Informe um título para sugerir a prioridade.');
      return;
    }
    setSuggesting(true);
    setError(null);
    try {
      const result = await tasksApi.suggestPriority({
        title,
        description: description || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      setSuggestion(result);
      setPriority(result.priority);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        projectId,
      });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="label">Título *</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: Corrigir bug crítico de login"
          autoFocus
        />
      </div>

      <div>
        <label className="label">Descrição</label>
        <textarea
          className="input min-h-[80px] resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhe o que precisa ser feito..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Prioridade</label>
          <select
            className="input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Prazo</label>
        <input
          type="date"
          className="input"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      {/* Sugestão de IA */}
      <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
            <Sparkles className="h-4 w-4" />
            Sugestão de prioridade (IA local)
          </div>
          <button
            type="button"
            onClick={handleSuggest}
            disabled={suggesting}
            className="btn-secondary !py-1 !px-3 text-xs"
          >
            {suggesting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Sugerir
          </button>
        </div>

        {suggestion && (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">Recomendado:</span>
              <span className="badge bg-brand-100 text-brand-700">
                {PRIORITY_LABELS[suggestion.priority]}
              </span>
              <span className="text-xs text-slate-500">
                score {suggestion.score}/100 · confiança{' '}
                {Math.round(suggestion.confidence * 100)}%
              </span>
            </div>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-slate-600">
              {suggestion.reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {task ? 'Salvar alterações' : 'Criar tarefa'}
        </button>
      </div>
    </form>
  );
}
