import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const dataSourceOptions = (
  configService: ConfigService,
): DataSourceOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE_NAME'),
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
  logging: configService.get<boolean>('DB_LOGGING', false),
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
  migrationsRun: configService.get<boolean>('DB_RUN_MIGRATIONS', false),
});

const configService = new ConfigService();
const dataSource = new DataSource(dataSourceOptions(configService));
export default dataSource;
