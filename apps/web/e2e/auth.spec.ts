import { test, expect } from './fixtures';

const VALID_TOKEN = 'cf-valid-token-e2e';
const INVALID_TOKEN = 'cf-invalid-token-e2e';
const SESSION_TOKEN = 'e2e.session.jwt';
const STORAGE_KEY = 'paulline.sessionToken';
const LOGIN_ROUTE = '/login';
const DASHBOARD_HEADING = /hello paulline/i;
const TOKEN_LABEL = /cloudflare api token/i;
const INVALID_MESSAGE = 'Invalid API key. Check credentials at https://dash.cloudflare.com';

test.describe('Cloudflare authentication flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      const payload = route.request().postDataJSON() as { apiToken: string };

      if (payload.apiToken === VALID_TOKEN) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sessionToken: SESSION_TOKEN,
            expiresAt: '2026-06-23T00:00:00.000Z',
          }),
        });
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'INVALID_API_TOKEN', message: INVALID_MESSAGE },
        }),
      });
    });

    await page.route('**/auth/logout', async (route) => {
      await route.fulfill({ status: 204, body: '' });
    });
  });

  test('valid token logs in, stores the session, and redirects to the dashboard', async ({ page }) => {
    await page.goto(LOGIN_ROUTE);

    await page.getByLabel(TOKEN_LABEL).fill(VALID_TOKEN);
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(stored).toBe(SESSION_TOKEN);
  });

  test('session survives a page reload', async ({ page }) => {
    await page.goto(LOGIN_ROUTE);
    await page.getByLabel(TOKEN_LABEL).fill(VALID_TOKEN);
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();

    await page.reload();

    await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
    const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(stored).toBe(SESSION_TOKEN);
  });

  test('invalid token shows the exact error and does not store a session', async ({ page }) => {
    await page.goto(LOGIN_ROUTE);

    await page.getByLabel(TOKEN_LABEL).fill(INVALID_TOKEN);
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page.getByText(INVALID_MESSAGE)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${LOGIN_ROUTE}$`));

    const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(stored).toBeNull();
  });

  test('logout clears the session and returns to the login screen', async ({ page }) => {
    await page.goto(LOGIN_ROUTE);
    await page.getByLabel(TOKEN_LABEL).fill(VALID_TOKEN);
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();

    await page.getByRole('button', { name: /log out/i }).click();

    await expect(page.getByLabel(TOKEN_LABEL)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${LOGIN_ROUTE}$`));
    const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(stored).toBeNull();
  });

  test('the cloudflare token never appears in page content or console logs', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (message) => consoleMessages.push(message.text()));

    await page.goto(LOGIN_ROUTE);
    await page.getByLabel(TOKEN_LABEL).fill(VALID_TOKEN);
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();

    const content = await page.content();
    expect(content).not.toContain(VALID_TOKEN);
    expect(consoleMessages.join(' ')).not.toContain(VALID_TOKEN);
  });
});
