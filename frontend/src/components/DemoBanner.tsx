import { useState } from 'react';
import { Info, Loader2, RotateCcw } from 'lucide-react';
import { demoApi } from '../api/demo';
import { getErrorMessage } from '../api/client';

export function DemoBanner() {
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (
      !window.confirm(
        'Resetar sua demo? Seus projetos e tarefas voltarão aos dados iniciais.',
      )
    ) {
      return;
    }
    setResetting(true);
    setError(null);
    try {
      await demoApi.reset();
      // Recarrega para refletir os dados restaurados em todas as telas.
      window.location.reload();
    } catch (err) {
      setError(getErrorMessage(err));
      setResetting(false);
    }
  };

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-sm leading-relaxed text-amber-950">
            Ambiente demo: seus dados são temporários e isolados neste navegador.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" />
          )}
          Resetar minha demo
        </button>
      </div>
      {error && (
        <p className="mx-auto mt-1 max-w-6xl text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
