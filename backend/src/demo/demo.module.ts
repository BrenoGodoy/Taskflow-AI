import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { DemoSessionGuard } from '../common/guards/demo-session.guard';

@Module({
  controllers: [DemoController],
  providers: [DemoService, DemoSessionGuard],
  exports: [DemoService],
})
export class DemoModule {}
