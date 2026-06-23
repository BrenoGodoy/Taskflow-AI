import { Injectable } from '@nestjs/common';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
    deadline: Date | null;
    priority: TaskPriority;
    status: TaskStatus;
    projectName: string;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(sessionId: string, projectId?: string): Promise<DashboardStats> {
    const where = {
      demoSessionId: sessionId,
      ...(projectId ? { projectId } : {}),
    };
    const now = new Date();

    const [
      totalTasks,
      totalProjects,
      overdueTasks,
      statusGroups,
      priorityGroups,
      upcoming,
    ] = await Promise.all([
      this.prisma.task.count({ where }),
      projectId
        ? Promise.resolve(1)
        : this.prisma.project.count({ where: { demoSessionId: sessionId } }),
      this.prisma.task.count({
        where: {
          ...where,
          deadline: { lt: now },
          status: { not: TaskStatus.DONE },
        },
      }),
      this.prisma.task.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['priority'],
        where,
        _count: { _all: true },
      }),
      this.prisma.task.findMany({
        where: {
          ...where,
          deadline: { gte: now },
          status: { not: TaskStatus.DONE },
        },
        orderBy: { deadline: 'asc' },
        take: 5,
        include: { project: { select: { name: true } } },
      }),
    ]);

    const tasksByStatus: Record<TaskStatus, number> = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.DOING]: 0,
      [TaskStatus.DONE]: 0,
    };
    for (const group of statusGroups) {
      tasksByStatus[group.status] = group._count._all;
    }

    const tasksByPriority: Record<TaskPriority, number> = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
    };
    for (const group of priorityGroups) {
      tasksByPriority[group.priority] = group._count._all;
    }

    const completionRate =
      totalTasks > 0
        ? Math.round((tasksByStatus[TaskStatus.DONE] / totalTasks) * 100)
        : 0;

    return {
      totalTasks,
      totalProjects,
      overdueTasks,
      completionRate,
      tasksByStatus,
      tasksByPriority,
      upcomingDeadlines: upcoming.map((t) => ({
        id: t.id,
        title: t.title,
        deadline: t.deadline,
        priority: t.priority,
        status: t.status,
        projectName: t.project.name,
      })),
    };
  }
}
