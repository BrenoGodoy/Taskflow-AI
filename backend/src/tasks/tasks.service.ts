import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { SuggestPriorityDto } from './dto/suggest-priority.dto';
import { suggestPriority, PrioritySuggestion } from './ai/priority-suggester';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(sessionId: string, dto: CreateTaskDto) {
    await this.ensureProjectInSession(sessionId, dto.projectId);

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        projectId: dto.projectId,
        demoSessionId: sessionId,
      },
    });
  }

  findAll(sessionId: string, query: QueryTasksDto) {
    const where: Prisma.TaskWhereInput = {
      demoSessionId: sessionId,
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
    };

    return this.prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        project: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(sessionId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, demoSessionId: sessionId },
      include: { project: { select: { id: true, name: true } } },
    });

    if (!task) {
      throw new NotFoundException(`Tarefa com id "${id}" não encontrada.`);
    }
    return task;
  }

  async update(sessionId: string, id: string, dto: UpdateTaskDto) {
    await this.ensureExists(sessionId, id);

    if (dto.projectId) {
      await this.ensureProjectInSession(sessionId, dto.projectId);
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async remove(sessionId: string, id: string) {
    await this.ensureExists(sessionId, id);
    await this.prisma.task.delete({ where: { id } });
    return { deleted: true, id };
  }

  /**
   * Sugere a prioridade de uma tarefa usando a heurística local explicável.
   * Não persiste nada — apenas retorna a recomendação.
   */
  suggestPriority(dto: SuggestPriorityDto): PrioritySuggestion {
    return suggestPriority(dto);
  }

  private async ensureExists(sessionId: string, id: string) {
    const exists = await this.prisma.task.findFirst({
      where: { id, demoSessionId: sessionId },
    });
    if (!exists) {
      throw new NotFoundException(`Tarefa com id "${id}" não encontrada.`);
    }
  }

  private async ensureProjectInSession(sessionId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, demoSessionId: sessionId },
    });
    if (!project) {
      throw new NotFoundException(
        `Projeto com id "${projectId}" não encontrado.`,
      );
    }
  }
}
