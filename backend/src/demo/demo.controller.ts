import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DemoService } from './demo.service';
import { DemoSessionGuard } from '../common/guards/demo-session.guard';
import { SessionId } from '../common/decorators/session-id.decorator';

@ApiTags('demo')
@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post('session')
  @ApiOperation({
    summary: 'Cria uma nova sessão demo isolada (workspace + dados iniciais)',
  })
  createSession() {
    return this.demoService.createSession();
  }

  @Get('session')
  @UseGuards(DemoSessionGuard)
  @ApiHeader({ name: 'X-Demo-Session-Id', required: true })
  @ApiOperation({ summary: 'Retorna os metadados da sessão demo atual' })
  currentSession(@SessionId() sessionId: string) {
    return this.demoService.getSessionInfo(sessionId);
  }

  @Post('reset')
  @HttpCode(200)
  @UseGuards(DemoSessionGuard)
  @ApiHeader({ name: 'X-Demo-Session-Id', required: true })
  @ApiOperation({ summary: 'Reseta os dados apenas da sessão demo atual' })
  resetSession(@SessionId() sessionId: string) {
    return this.demoService.resetSession(sessionId);
  }

  @Delete('cleanup')
  @ApiOperation({
    summary: 'Remove sessões demo expiradas (uso interno / agendado)',
    description:
      'Se ADMIN_RESET_SECRET estiver definido, exige o header X-Admin-Secret.',
  })
  cleanup(@Headers('x-admin-secret') secret?: string) {
    const expected = process.env.ADMIN_RESET_SECRET;
    if (expected && secret !== expected) {
      throw new ForbiddenException('Secret inválido.');
    }
    return this.demoService.cleanupExpired();
  }
}
