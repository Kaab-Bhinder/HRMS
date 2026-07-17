import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  app.useLogger(app.get(Logger));

  const prefix = config.get<string>('apiPrefix')!;
  app.setGlobalPrefix(prefix);

  app.use(helmet());
  app.use(cookieParser(config.get<string>('cookie.secret')));
  app.enableCors({ origin: config.get<string[]>('corsOrigins'), credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
  );

  const swagger = new DocumentBuilder()
    .setTitle('Workforce Management API')
    .setDescription('Admin + mobile REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(`${prefix}/docs`, app, SwaggerModule.createDocument(app, swagger));

  const port = config.get<number>('port')!;
  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(`API ready → http://localhost:${port}/${prefix}  (docs: /${prefix}/docs)`);
}
bootstrap();
