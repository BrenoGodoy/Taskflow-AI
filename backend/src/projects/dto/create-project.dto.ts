import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Institucional', description: 'Nome do projeto' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do projeto é obrigatório.' })
  @MaxLength(120)
  name: string;

  @ApiProperty({
    example: 'Novo site da empresa com blog e contato.',
    description: 'Descrição do projeto',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
