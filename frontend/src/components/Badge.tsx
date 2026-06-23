import type { TaskPriority } from '../types';
import { PRIORITY_BADGE, PRIORITY_LABELS } from '../lib/format';

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`badge ${PRIORITY_BADGE[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
