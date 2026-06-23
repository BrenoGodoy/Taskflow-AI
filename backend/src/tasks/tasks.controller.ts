import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { SuggestPriorityDto } from './dto/suggest-priority.dto';
import { DemoSessionGuard } from '../common/guards/demo-session.guard';
import { SessionId } from '../common/decorators/session-id.decorator';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(DemoSessionGuard)
  @ApiHeader({ name: 'X-Demo-Session-Id', required: true })
  @ApiOperation({ summary: 'Cria uma nova tarefa' })
  create(@SessionId() sessionId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(sessionId, dto);
  }

  @Post('suggest-priority')
  @ApiOperation({
    summary: 'Sugere a prioridade de uma tarefa (IA local explicável)',
    description:
      'Analisa título, descrição e prazo para recomendar LOW, MEDIUM ou HIGH. ' +
      'Retorna também score, confiança e os motivos da decisão. Não persiste dados.',
  })
  suggestPriority(@Body() dto: SuggestPriorityDto) {
    return this.tasksService.suggestPriority(dto);
  }

  @Get()
  @UseGuards(DemoSessionGuard)
  @ApiHeader({ name: 'X-Demo-Session-Id', required: true })
  @ApiOperation({
    summary: 'Lista tarefas (filtros opcionais: projectId, status, priority)',
  })
  findAll(@SessionId() sessionId: string, @Query() query: QueryTasksDto) {
    return this.tasksService.findAll(sessionId, query);
  }

  @Get(':id')
  @UseGuards(DemoSessionGuard)
  @ApiHeader({ name: 'X-Demo-Session-Id', required: true })
  @ApiOperation({ summary: 'Busca uma tarefa por id' })
  findOne(@SessionId() sessionId: string, @Param('id') id: string) {
    return this.tasksService.findOne(sessionId, id);
  }

  @Patch(':id')
  @UseGuards(DemoSessionGuard)
  @ApiHeader({ name: 'X-Demo-Session-Id', required: true })
  @ApiOperation({ summary: 'Atualiza uma tarefa' })
  update(
    @SessionId() sessionId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(sessionId, id, dto);
  }

  @Delete(':id')
  @UseGuards(DemoSessionGuard)
  @ApiHeader({ name: 'X-Demo-Session-Id', required: true })
  @ApiOperation({ summary: 'Remove uma tarefa' })
  remove(@SessionId() sessionId: string, @Param('id') id: string) {
    return this.tasksService.remove(sessionId, id);
  }
}
