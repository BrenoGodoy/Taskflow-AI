import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  CalendarClock,
  AlertTriangle,
} from 'lucide-react';
import type {
  CreateTaskInput,
  Project,
  Task,
  TaskStatus,
} from '../types';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { getErrorMessage } from '../api/client';
import { Spinner } from '../components/Spinner';
import { Modal } from '../components/Modal';
import { TaskForm } from '../components/TaskForm';
import { PriorityBadge } from '../components/Badge';
import { STATUS_LABELS, formatDate, isOverdue } from '../lib/format';

const COLUMNS: { status: TaskStatus; accent: string; dot: string }[] = [
  { status: 'TODO', accent: 'border-t-slate-400', dot: 'bg-slate-400' },
  { status: 'DOING', accent: 'border-t-blue-500', dot: 'bg-blue-500' },
  { status: 'DONE', accent: 'border-t-emerald-500', dot: 'bg-emerald-500' },
];

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      projectsApi.get(projectId),
      tasksApi.list({ projectId }),
    ])
      .then(([proj, taskList]) => {
        setProject(proj);
        setTasks(taskList);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(load, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleSubmit = async (input: CreateTaskInput) => {
    if (editing) {
      await tasksApi.update(editing.id, input);
    } else {
      await tasksApi.create(input);
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (task: Task) => {
    if (!window.confirm(`Excluir a tarefa "${task.title}"?`)) return;
    try {
      await tasksApi.remove(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const moveTask = async (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    const previous = tasks;
    // Atualização otimista
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status } : t)),
    );
    try {
      await tasksApi.update(task.id, { status });
    } catch (err) {
      setError(getErrorMessage(err));
      setTasks(previous);
    }
  };

  if (loading) return <Spinner label="Carregando quadro..." />;
  if (error)
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  if (!project || !projectId) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/projects"
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Projetos
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-slate-500">{project.description}</p>
            )}
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" />
            Nova tarefa
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.status);
          return (
            <div
              key={column.status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                const task = tasks.find((t) => t.id === dragId);
                if (task) moveTask(task, column.status);
                setDragId(null);
              }}
              className={`flex flex-col rounded-xl border border-t-4 ${column.accent} border-slate-200 bg-slate-100/60`}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
                  <h2 className="text-sm font-semibold text-slate-700">
                    {STATUS_LABELS[column.status]}
                  </h2>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
                  {columnTasks.length}
                </span>
              </div>

              <div className="flex min-h-[120px] flex-1 flex-col gap-3 px-3 pb-4">
                {columnTasks.length === 0 ? (
                  <p className="px-2 py-8 text-center text-xs text-slate-400">
                    Arraste tarefas para cá
                  </p>
                ) : (
                  columnTasks.map((task) => {
                    const overdue = isOverdue(task.deadline, task.status);
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => setDragId(task.id)}
                        onDragEnd={() => setDragId(null)}
                        className="group cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800">
                            {task.title}
                          </p>
                          <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
                            <button
                              onClick={() => openEdit(task)}
                              className="btn-ghost !p-1"
                              aria-label="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(task)}
                              className="btn-ghost !p-1 hover:!text-red-600"
                              aria-label="Excluir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {task.description && (
                          <p className="mb-2 line-clamp-2 text-xs text-slate-500">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <PriorityBadge priority={task.priority} />
                          {task.deadline && (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium ${
                                overdue ? 'text-red-600' : 'text-slate-400'
                              }`}
                            >
                              {overdue ? (
                                <AlertTriangle className="h-3.5 w-3.5" />
                              ) : (
                                <CalendarClock className="h-3.5 w-3.5" />
                              )}
                              {formatDate(task.deadline)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Editar tarefa' : 'Nova tarefa'}
        onClose={() => setModalOpen(false)}
      >
        <TaskForm
          projectId={projectId}
          task={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
