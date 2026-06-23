export type TaskStatus = 'TODO' | 'DOING' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string | null;
  projectId: string;
  project?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string | null;
  projectId: string;
}

export interface DashboardStats {
  totalTasks: number;
  totalProjects: number;
  overdueTasks: number;
  completionRate: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    deadline: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    projectName: string;
  }>;
}

export interface DemoSession {
  sessionId: string;
  expiresAt: string;
}

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
