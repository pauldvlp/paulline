import { describe, it, expect, beforeEach } from 'vitest';
import { HealthController } from './health.controller';
import { HealthService } from '../application/health.service';
import { HEALTH_STATUS_OK } from '../domain/health-status';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController(new HealthService());
  });

  it('returns an ok status with a valid ISO timestamp', () => {
    const result = controller.check();
    expect(result.status).toBe(HEALTH_STATUS_OK);
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});
