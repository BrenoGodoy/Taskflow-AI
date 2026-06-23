import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { DashboardService } from './dashboard.service';
import { DemoSessionGuard } from '../common/guards/demo-session.guard';
import { SessionId } from '../common/decorators/session-id.decorator';

class DashboardQueryDto {
  @ApiPropertyOptional({ description: 'Filtra as métricas por projeto' })
  @IsUUID()
  @IsOptional()
  projectId?: string;
}

@ApiTags('dashboard')
@ApiHeader({ name: 'X-Demo-Session-Id', required: true })
@UseGuards(DemoSessionGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Retorna métricas agregadas (total, atrasadas, por status/prioridade)',
  })
  getStats(@SessionId() sessionId: string, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getStats(sessionId, query.projectId);
  }
}
