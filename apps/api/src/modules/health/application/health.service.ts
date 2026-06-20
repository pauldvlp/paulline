import { Injectable } from '@nestjs/common';
import { HEALTH_STATUS_OK, type HealthStatus } from '../domain/health-status';

@Injectable()
export class HealthService {
  check(): HealthStatus {
    return {
      status: HEALTH_STATUS_OK,
      timestamp: new Date().toISOString(),
    };
  }
}
