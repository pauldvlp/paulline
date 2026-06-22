import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './modules/health/infrastructure/health.module';
import { AuthModule } from './modules/auth/infrastructure/auth.module';

@Module({
  imports: [ConfigModule, HealthModule, AuthModule],
})
export class AppModule {}
