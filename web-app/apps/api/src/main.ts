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

  // CORS. Outside production we also allow any localhost/127.0.0.1 origin: the
  // Flutter web dev server (`flutter run -d chrome`) picks a random port on each
  // launch, so a fixed allow-list cannot cover it. Production still uses only
  // the explicit CORS_ORIGINS list.
  const allowedOrigins = config.get<string[]>('corsOrigins')!;
  const isProduction = (process.env.NODE_ENV ?? 'development') === 'production';
  app.enableCors({
    origin: (origin, callback) => {
      // Non-browser clients (curl, the Flutter mobile app) send no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
  });

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
