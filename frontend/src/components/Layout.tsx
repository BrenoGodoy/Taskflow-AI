import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projetos', icon: FolderKanban, end: false },
  { to: '/ai', label: 'IA de Prioridade', icon: Sparkles, end: false },
];

export function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold leading-none text-slate-800">
              TaskFlow
            </p>
            <p className="text-xs font-medium text-brand-600">AI</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">TaskFlow AI</p>
          <p className="mt-1">
            Gestão de tarefas com sugestão de prioridade local e explicável.
          </p>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col">
        {/* Top bar mobile */}
        <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-800">TaskFlow AI</span>
        </header>

        {/* Nav mobile */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 md:hidden">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
