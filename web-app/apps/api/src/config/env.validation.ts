import { plainToInstance } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, MinLength, validateSync } from 'class-validator';

class EnvVars {
  @IsIn(['development', 'test', 'production'])
  NODE_ENV: string = 'development';

  @IsNumber()
  @IsOptional()
  API_PORT: number = 4000;

  @IsString()
  API_PREFIX: string = 'api/v1';

  @IsString()
  CORS_ORIGINS: string = 'http://localhost:5173';

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(16)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(16)
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_TTL: string = '15m';

  @IsString()
  JWT_REFRESH_TTL: string = '7d';

  @IsString()
  @MinLength(8)
  COOKIE_SECRET!: string;

  @IsString()
  REFRESH_COOKIE_NAME: string = 'wms_rt';

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL: number = 60;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT: number = 120;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvVars, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length) {
    throw new Error(
      `Invalid environment configuration:\n${errors
        .map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
        .join('\n')}`,
    );
  }
  return validated;
}
