import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SuggestPriorityDto {
  @ApiProperty({ example: 'Corrigir bug crítico de login' })
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório para sugerir prioridade.' })
  @MaxLength(160)
  title: string;

  @ApiProperty({
    example: 'Usuários não conseguem autenticar no iOS.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    example: '2026-06-25T23:59:00.000Z',
    required: false,
    description: 'Data limite (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  deadline?: string;
}
