import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Demo-Session-Id'],
    credentials: true,
  });

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // Validação global com class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtro global de exceções
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('TaskFlow AI API')
    .setDescription(
      'API de gerenciamento de tarefas com sugestão de prioridade por IA local.',
    )
    .setVersion('1.0')
    .addTag('projects', 'Gerenciamento de projetos')
    .addTag('tasks', 'Gerenciamento de tarefas')
    .addTag('dashboard', 'Métricas e estatísticas')
    .addTag('demo', 'Sessões demo isoladas por visitante')
    .addTag('health', 'Health check')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  // eslint-disable-next-line no-console
  console.log(`🚀 TaskFlow AI API rodando em http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`📚 Swagger disponível em http://localhost:${port}/docs`);
}
bootstrap();
