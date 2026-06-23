import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { DashboardService } from './dashboard.service';

class DashboardQueryDto {
  @ApiPropertyOptional({ description: 'Filtra as métricas por projeto' })
  @IsUUID()
  @IsOptional()
  projectId?: string;
}

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Retorna métricas agregadas (total, atrasadas, por status/prioridade)',
  })
  getStats(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getStats(query.projectId);
  }
}
