import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService, registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const configService = new ConfigService();
const isDev = configService.get<string>('NODE_ENV') === 'development';

const databaseConfig = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
  migrationsRun: false,
  synchronize: isDev,
  logging: isDev,
} as DataSourceOptions;

export const connectionSource = new DataSource(databaseConfig);
export default registerAs('database', () => databaseConfig);
