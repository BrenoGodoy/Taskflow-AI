import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Pencil, Trash2, ListTodo } from 'lucide-react';
import type { CreateProjectInput, Project } from '../types';
import { projectsApi } from '../api/projects';
import { getErrorMessage } from '../api/client';
import { Spinner } from '../components/Spinner';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const load = () => {
    setLoading(true);
    projectsApi
      .list()
      .then(setProjects)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setModalOpen(true);
  };

  const handleDelete = async (project: Project) => {
    if (
      !window.confirm(
        `Excluir o projeto "${project.name}" e todas as suas tarefas?`,
      )
    )
      return;
    try {
      await projectsApi.remove(project.id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projetos</h1>
          <p className="text-sm text-slate-500">
            Organize suas tarefas em projetos e abra o quadro Kanban.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" />
          Novo projeto
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <Spinner label="Carregando projetos..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-7 w-7" />}
          title="Nenhum projeto ainda"
          description="Crie seu primeiro projeto para começar a organizar tarefas."
          action={
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              Criar projeto
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card group flex flex-col p-5 transition hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <Link
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-2 text-base font-semibold text-slate-800 hover:text-brand-600"
                >
                  <FolderKanban className="h-5 w-5 text-brand-500" />
                  {project.name}
                </Link>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(project)}
                    className="btn-ghost !p-1.5"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    className="btn-ghost !p-1.5 hover:!text-red-600"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-500">
                {project.description || 'Sem descrição.'}
              </p>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <ListTodo className="h-4 w-4" />
                  {project._count?.tasks ?? 0} tarefa(s)
                </span>
                <Link
                  to={`/projects/${project.id}`}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Abrir Kanban →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Editar projeto' : 'Novo projeto'}
        onClose={() => setModalOpen(false)}
      >
        <ProjectForm
          project={editing}
          onCancel={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

function ProjectForm({
  project,
  onCancel,
  onSaved,
}: {
  project: Project | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do projeto é obrigatório.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload: CreateProjectInput = {
      name: name.trim(),
      description: description.trim() || undefined,
    };
    try {
      if (project) {
        await projectsApi.update(project.id, payload);
      } else {
        await projectsApi.create(payload);
      }
      onSaved();
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
        <label className="label">Nome *</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Website Institucional"
          autoFocus
        />
      </div>
      <div>
        <label className="label">Descrição</label>
        <textarea
          className="input min-h-[90px] resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Sobre o que é este projeto?"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {project ? 'Salvar' : 'Criar projeto'}
        </button>
      </div>
    </form>
  );
}
