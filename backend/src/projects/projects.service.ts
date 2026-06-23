import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(sessionId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { ...dto, demoSessionId: sessionId },
    });
  }

  findAll(sessionId: string) {
    return this.prisma.project.findMany({
      where: { demoSessionId: sessionId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tasks: true } },
      },
    });
  }

  async findOne(sessionId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, demoSessionId: sessionId },
      include: {
        tasks: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!project) {
      throw new NotFoundException(`Projeto com id "${id}" não encontrado.`);
    }
    return project;
  }

  async update(sessionId: string, id: string, dto: UpdateProjectDto) {
    await this.ensureExists(sessionId, id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(sessionId: string, id: string) {
    await this.ensureExists(sessionId, id);
    await this.prisma.project.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureExists(sessionId: string, id: string) {
    const exists = await this.prisma.project.findFirst({
      where: { id, demoSessionId: sessionId },
    });
    if (!exists) {
      throw new NotFoundException(`Projeto com id "${id}" não encontrado.`);
    }
  }
}
