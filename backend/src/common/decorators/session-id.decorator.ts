import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Injeta o id da sessão demo (resolvido pelo {@link DemoSessionGuard}).
 */
export const SessionId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { demoSessionId?: string }>();
    return request.demoSessionId ?? '';
  },
);
