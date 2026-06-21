import { test, expect } from './fixtures';
import { waitForApiReady } from './setup';

const HEALTH_PATH = '/health';
const HTTP_OK = 200;
const HEALTHY_STATUS = 'ok';

test.beforeAll(async () => {
  await waitForApiReady();
});

test.describe('API health', () => {
  test('GET /health responds 200 with a healthy payload', async ({ apiContext }) => {
    const response = await apiContext.get(HEALTH_PATH);

    expect(response.status()).toBe(HTTP_OK);

    const body = await response.json();
    expect(body.status).toBe(HEALTHY_STATUS);
    expect(body.timestamp).toEqual(expect.any(String));
  });
});
