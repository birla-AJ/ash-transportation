import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { winstonLoggerOptions } from './config/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });

  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('apiPrefix') || 'api/v1';
  const port = config.get<number>('port') || 3000;
  const corsOrigin = config.get<string[]>('corsOrigin') || '*';

  app.setGlobalPrefix(apiPrefix);
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ash Transportation Management System API')
    .setDescription(
      'REST API for challan creation, printing, reports, exports and administration.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Ash TMS backend running on http://localhost:${port}/${apiPrefix}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs available at http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
