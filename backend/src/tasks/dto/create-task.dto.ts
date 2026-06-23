import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Desenvolver página inicial' })
  @IsString()
  @IsNotEmpty({ message: 'O título da tarefa é obrigatório.' })
  @MaxLength(160)
  title: string;

  @ApiProperty({
    example: 'Implementar hero, seções e responsividade.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
    required: false,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    example: '2026-07-30T23:59:00.000Z',
    required: false,
    description: 'Data limite (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiProperty({ example: 'uuid-do-projeto', description: 'ID do projeto' })
  @IsUUID()
  @IsNotEmpty({ message: 'O projectId é obrigatório.' })
  projectId: string;
}
