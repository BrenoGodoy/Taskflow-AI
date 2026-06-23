import { TaskPriority } from '@prisma/client';

/**
 * Resultado da sugestão de prioridade.
 * Além da prioridade final, retornamos o score e os motivos
 * para que a decisão seja totalmente explicável (sem "caixa-preta").
 */
export interface PrioritySuggestion {
  priority: TaskPriority;
  score: number;
  confidence: number;
  reasons: string[];
  signals: {
    keywordScore: number;
    deadlineScore: number;
    lengthScore: number;
    daysUntilDeadline: number | null;
  };
}

interface SuggestInput {
  title: string;
  description?: string | null;
  deadline?: string | Date | null;
}

/**
 * Palavras-chave que indicam urgência/alto impacto.
 * Tudo é comparado em minúsculas e sem acentos.
 */
const HIGH_KEYWORDS = [
  'urgente',
  'critico',
  'crítico',
  'bug',
  'falha',
  'erro',
  'producao',
  'produção',
  'seguranca',
  'segurança',
  'quebrado',
  'caiu',
  'fora do ar',
  'imediato',
  'asap',
  'bloqueante',
  'vulnerabilidade',
  'incidente',
  'prazo',
];

const MEDIUM_KEYWORDS = [
  'importante',
  'melhoria',
  'implementar',
  'integrar',
  'refatorar',
  'cliente',
  'revisar',
  'ajustar',
  'corrigir',
  'deploy',
];

const LOW_KEYWORDS = [
  'documentar',
  'documentacao',
  'documentação',
  'estudar',
  'pesquisar',
  'ideia',
  'opcional',
  'futuro',
  'talvez',
  'depois',
  'backlog',
  'limpeza',
];

/**
 * Remove acentos e normaliza para minúsculas, facilitando o match de palavras-chave.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function countMatches(text: string, keywords: string[]): string[] {
  const found: string[] = [];
  for (const kw of keywords) {
    if (text.includes(normalize(kw))) {
      found.push(kw);
    }
  }
  return found;
}

/**
 * Sugere a prioridade de uma tarefa com base em uma heurística local e explicável.
 *
 * O score final (0–100) é a soma ponderada de três sinais:
 *  - Palavras-chave (peso ~45): termos de urgência elevam, termos de baixa urgência reduzem.
 *  - Deadline (peso ~45): quanto mais próximo (ou vencido), maior a urgência.
 *  - Tamanho/contexto (peso ~10): descrições muito curtas reduzem levemente a confiança.
 *
 * Faixas:
 *  - score >= 65  -> HIGH
 *  - score >= 35  -> MEDIUM
 *  - score <  35  -> LOW
 */
export function suggestPriority(input: SuggestInput): PrioritySuggestion {
  const reasons: string[] = [];
  const haystack = normalize(`${input.title} ${input.description ?? ''}`);

  // ===== 1) Sinal de palavras-chave =====
  const highHits = countMatches(haystack, HIGH_KEYWORDS);
  const mediumHits = countMatches(haystack, MEDIUM_KEYWORDS);
  const lowHits = countMatches(haystack, LOW_KEYWORDS);

  let keywordScore = 0;
  keywordScore += Math.min(highHits.length, 3) * 18; // até +54
  keywordScore += Math.min(mediumHits.length, 3) * 8; // até +24
  keywordScore -= Math.min(lowHits.length, 3) * 12; // até -36
  keywordScore = clamp(keywordScore, -36, 45);

  if (highHits.length > 0) {
    reasons.push(
      `Contém ${highHits.length} termo(s) de alta urgência: ${highHits.join(', ')}.`,
    );
  }
  if (mediumHits.length > 0) {
    reasons.push(
      `Contém ${mediumHits.length} termo(s) de média relevância: ${mediumHits.join(', ')}.`,
    );
  }
  if (lowHits.length > 0) {
    reasons.push(
      `Contém ${lowHits.length} termo(s) de baixa urgência: ${lowHits.join(', ')}.`,
    );
  }

  // ===== 2) Sinal de deadline =====
  let deadlineScore = 0;
  let daysUntilDeadline: number | null = null;

  if (input.deadline) {
    const deadlineDate = new Date(input.deadline);
    if (!Number.isNaN(deadlineDate.getTime())) {
      const now = new Date();
      const diffMs = deadlineDate.getTime() - now.getTime();
      daysUntilDeadline = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline < 0) {
        deadlineScore = 45;
        reasons.push(
          `Prazo vencido há ${Math.abs(daysUntilDeadline)} dia(s) — urgência máxima.`,
        );
      } else if (daysUntilDeadline <= 1) {
        deadlineScore = 42;
        reasons.push('Prazo vence em até 1 dia.');
      } else if (daysUntilDeadline <= 3) {
        deadlineScore = 32;
        reasons.push(`Prazo próximo (${daysUntilDeadline} dias).`);
      } else if (daysUntilDeadline <= 7) {
        deadlineScore = 20;
        reasons.push(`Prazo em ${daysUntilDeadline} dias (esta semana).`);
      } else if (daysUntilDeadline <= 14) {
        deadlineScore = 10;
        reasons.push(`Prazo em ${daysUntilDeadline} dias.`);
      } else {
        deadlineScore = 4;
        reasons.push(`Prazo distante (${daysUntilDeadline} dias).`);
      }
    }
  } else {
    reasons.push('Sem prazo definido — sem pressão temporal.');
  }

  // ===== 3) Sinal de contexto/tamanho =====
  const textLength = `${input.title} ${input.description ?? ''}`.trim().length;
  let lengthScore = 0;
  if (textLength >= 60) {
    lengthScore = 10;
    reasons.push('Descrição detalhada sugere uma tarefa de maior escopo.');
  } else if (textLength >= 25) {
    lengthScore = 5;
  } else {
    lengthScore = 0;
    reasons.push('Pouco contexto fornecido; sugestão baseada em poucos sinais.');
  }

  // ===== Score final (0–100) =====
  const base = 30; // ponto de partida neutro
  const rawScore = base + keywordScore + deadlineScore + lengthScore;
  const score = clamp(Math.round(rawScore), 0, 100);

  let priority: TaskPriority;
  if (score >= 65) {
    priority = TaskPriority.HIGH;
  } else if (score >= 35) {
    priority = TaskPriority.MEDIUM;
  } else {
    priority = TaskPriority.LOW;
  }

  // Confiança: aumenta com a quantidade de sinais e com o contexto disponível.
  const signalCount =
    highHits.length + mediumHits.length + lowHits.length + (input.deadline ? 1 : 0);
  const confidence = clamp(0.4 + signalCount * 0.12 + (textLength >= 60 ? 0.1 : 0), 0.4, 0.95);

  return {
    priority,
    score,
    confidence: Number(confidence.toFixed(2)),
    reasons,
    signals: {
      keywordScore,
      deadlineScore,
      lengthScore,
      daysUntilDeadline,
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
