export const HEALTH_STATUS_OK = 'ok';

export type HealthStatus = {
  status: typeof HEALTH_STATUS_OK;
  timestamp: string;
};
