import { describe, it, expect } from 'vitest';
import { HealthService } from './health.service';
import { HEALTH_STATUS_OK } from './health-status';

describe('HealthService', () => {
  it('reports an ok status', () => {
    const service = new HealthService();
    expect(service.check().status).toBe(HEALTH_STATUS_OK);
  });

  it('includes a valid ISO timestamp', () => {
    const service = new HealthService();
    const { timestamp } = service.check();
    expect(Number.isNaN(Date.parse(timestamp))).toBe(false);
  });
});
