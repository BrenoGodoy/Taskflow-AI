import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { DemoSessionGuard } from '../common/guards/demo-session.guard';
import { SessionId } from '../common/decorators/session-id.decorator';

@ApiTags('projects')
@ApiHeader({ name: 'X-Demo-Session-Id', required: true })
@UseGuards(DemoSessionGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo projeto' })
  create(@SessionId() sessionId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(sessionId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os projetos' })
  findAll(@SessionId() sessionId: string) {
    return this.projectsService.findAll(sessionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um projeto por id (com tarefas)' })
  findOne(@SessionId() sessionId: string, @Param('id') id: string) {
    return this.projectsService.findOne(sessionId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um projeto' })
  update(
    @SessionId() sessionId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(sessionId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um projeto (e suas tarefas)' })
  remove(@SessionId() sessionId: string, @Param('id') id: string) {
    return this.projectsService.remove(sessionId, id);
  }
}
