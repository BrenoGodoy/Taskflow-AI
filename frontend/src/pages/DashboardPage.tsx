import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListTodo,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { dashboardApi } from '../api/dashboard';
import { getErrorMessage } from '../api/client';
import type { DashboardStats } from '../types';
import { Spinner } from '../components/Spinner';
import { PriorityBadge } from '../components/Badge';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatDate,
  isOverdue,
} from '../lib/format';

const STATUS_COLORS = ['#94a3b8', '#3b82f6', '#10b981'];
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
};

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .stats()
      .then(setStats)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Carregando dashboard..." />;
  if (error)
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  if (!stats) return null;

  const statusData = (['TODO', 'DOING', 'DONE'] as const).map((s) => ({
    name: STATUS_LABELS[s],
    value: stats.tasksByStatus[s],
  }));

  const priorityData = (['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => ({
    name: PRIORITY_LABELS[p],
    key: p,
    value: stats.tasksByPriority[p],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Visão geral das suas tarefas e projetos.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de tarefas"
          value={stats.totalTasks}
          icon={<ListTodo className="h-6 w-6 text-brand-600" />}
          accent="bg-brand-50"
        />
        <StatCard
          label="Tarefas atrasadas"
          value={stats.overdueTasks}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          accent="bg-red-50"
        />
        <StatCard
          label="Projetos"
          value={stats.totalProjects}
          icon={<FolderKanban className="h-6 w-6 text-amber-600" />}
          accent="bg-amber-50"
        />
        <StatCard
          label="Conclusão"
          value={`${stats.completionRate}%`}
          icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />}
          accent="bg-emerald-50"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Tarefas por status
          </h2>
          {stats.totalTasks === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              Sem dados ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Tarefas por prioridade
          </h2>
          {stats.totalTasks === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              Sem dados ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.key} fill={PRIORITY_COLORS[entry.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Próximos prazos */}
      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <CalendarClock className="h-4 w-4 text-brand-600" />
          Próximos prazos
        </h2>
        {stats.upcomingDeadlines.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Nenhum prazo pendente.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {stats.upcomingDeadlines.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500">{task.projectName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <PriorityBadge priority={task.priority} />
                  <span
                    className={`text-xs font-medium ${
                      isOverdue(task.deadline, task.status)
                        ? 'text-red-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {formatDate(task.deadline)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-center">
        <Link to="/projects" className="btn-secondary">
          Ver todos os projetos
        </Link>
      </div>
    </div>
  );
}
