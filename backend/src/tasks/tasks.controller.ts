import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { SuggestPriorityDto } from './dto/suggest-priority.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova tarefa' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
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
  @ApiOperation({
    summary: 'Lista tarefas (filtros opcionais: projectId, status, priority)',
  })
  findAll(@Query() query: QueryTasksDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma tarefa por id' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma tarefa' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma tarefa' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
