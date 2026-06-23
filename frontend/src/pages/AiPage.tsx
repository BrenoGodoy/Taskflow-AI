import { type FormEvent, useState } from 'react';
import { Sparkles, Loader2, Brain, Gauge, Tag } from 'lucide-react';
import type { PrioritySuggestion } from '../types';
import { tasksApi } from '../api/tasks';
import { getErrorMessage } from '../api/client';
import { PRIORITY_LABELS } from '../lib/format';

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
};

export function AiPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrioritySuggestion | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Informe ao menos o título.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const suggestion = await tasksApi.suggestPriority({
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      setResult(suggestion);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <Sparkles className="h-6 w-6 text-brand-600" />
          IA de Prioridade
        </h1>
        <p className="text-sm text-slate-500">
          Heurística local e explicável — sem APIs externas. Analisa
          palavras-chave, prazo e contexto para sugerir a prioridade.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Formulário */}
        <div className="card p-6">
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
                placeholder="Ex.: Corrigir bug crítico em produção"
              />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhe o contexto da tarefa..."
              />
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
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Analisar prioridade
            </button>
          </form>
        </div>

        {/* Resultado */}
        <div className="card flex flex-col p-6">
          {!result ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400">
              <Brain className="mb-3 h-10 w-10" />
              <p className="text-sm">
                Preencha o formulário e clique em{' '}
                <span className="font-medium text-slate-500">
                  Analisar prioridade
                </span>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Tag className="h-4 w-4" />
                  Prioridade sugerida
                </div>
                <span
                  className={`badge text-sm ${PRIORITY_COLOR[result.priority]}`}
                >
                  {PRIORITY_LABELS[result.priority]}
                </span>
              </div>

              {/* Score */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5" /> Score de urgência
                  </span>
                  <span>{result.score}/100</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      result.score >= 65
                        ? 'bg-red-500'
                        : result.score >= 35
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-400">
                  Confiança: {Math.round(result.confidence * 100)}%
                </p>
              </div>

              {/* Sinais */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <SignalCell
                  label="Palavras-chave"
                  value={result.signals.keywordScore}
                />
                <SignalCell
                  label="Prazo"
                  value={result.signals.deadlineScore}
                />
                <SignalCell
                  label="Contexto"
                  value={result.signals.lengthScore}
                />
              </div>

              {/* Motivos */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                  Por que essa decisão?
                </h3>
                <ul className="space-y-1.5">
                  {result.reasons.map((reason, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-slate-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Como funciona */}
      <div className="card p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Como a heurística funciona
        </h2>
        <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-1 font-semibold text-slate-700">
              1. Palavras-chave
            </p>
            <p>
              Termos como "crítico", "bug" ou "produção" aumentam o score;
              "documentar" ou "futuro" reduzem.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-1 font-semibold text-slate-700">2. Prazo</p>
            <p>
              Quanto mais próximo (ou vencido) o deadline, maior a urgência
              atribuída.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-1 font-semibold text-slate-700">3. Contexto</p>
            <p>
              Descrições mais detalhadas sugerem maior escopo e ajustam a
              confiança da sugestão.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalCell({ label, value }: { label: string; value: number }) {
  const sign = value > 0 ? '+' : '';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`text-lg font-bold ${
          value > 0
            ? 'text-emerald-600'
            : value < 0
              ? 'text-red-600'
              : 'text-slate-400'
        }`}
      >
        {sign}
        {value}
      </p>
    </div>
  );
}
