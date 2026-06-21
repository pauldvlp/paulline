import { test as base, type APIRequestContext, type Page } from '@playwright/test';
import { apiBaseURL } from '../playwright.config';

interface PaullineFixtures {
  apiContext: APIRequestContext;
  authPage: Page;
}

/**
 * Extended Playwright `test` carrying project-specific fixtures.
 *
 * - `apiContext`: request context pre-pointed at the API base URL, for
 *   endpoint-level assertions without a browser page.
 * - `authPage`: a page that will be authenticated once AUTH-001 lands; today it
 *   yields a plain page so suites can already depend on the fixture name.
 */
export const test = base.extend<PaullineFixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: apiBaseURL });
    await use(context);
    await context.dispose();
  },

  authPage: async ({ page }, use) => {
    // TODO(AUTH-001): perform login and seed the session before yielding.
    await use(page);
  },
});

export const expect = test.expect;
