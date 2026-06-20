// Infrastructure health module: stateless liveness check, no external dependencies or persisted state.
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from '../application/health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
