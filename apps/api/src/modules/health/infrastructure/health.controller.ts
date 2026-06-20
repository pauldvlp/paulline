import { Controller, Get } from '@nestjs/common';
import type { HealthStatus } from '../domain/health-status';
import { HealthService } from '../application/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): HealthStatus {
    return this.healthService.check();
  }
}
