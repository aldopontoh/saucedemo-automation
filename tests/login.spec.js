const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { LOGIN_DATA } = require('../fixtures/loginData');

test.describe('Swag Labs - Authentication & Login Module', () => {
  /** @type {LoginPage} */
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-01 [REQ-01, NFR-01]: Render login page title, masked inputs, login button, and credentials panel', async () => {
    await expect(loginPage.appLogo).toBeVisible();
    await expect(loginPage.appLogo).toHaveText(LOGIN_DATA.uiText.appTitle);

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.loginCredentialsPanel).toBeVisible();
    await expect(loginPage.loginPasswordPanel).toBeVisible();
  });

  test('TC-02 [REQ-02, NFR-02]: Valid login with standard_user redirects to /inventory.html promptly', async ({ page }) => {
    const startTime = Date.now();
    await loginPage.login(LOGIN_DATA.users.standard, LOGIN_DATA.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    const standardDurationMs = Date.now() - startTime;

    // [MISSING IN SPEC] Exact SLA threshold not defined in PRD; verify non-zero bounded navigation
    expect(standardDurationMs).toBeLessThan(5000);
  });

  test('TC-03 [REQ-03]: locked_out_user is blocked with locked-out error banner', async ({ page }) => {
    await loginPage.login(LOGIN_DATA.users.lockedOut, LOGIN_DATA.password);

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.lockedOut);
  });

  test('TC-04 [REQ-04]: Empty username displays username required error', async ({ page }) => {
    await loginPage.login('', LOGIN_DATA.password);

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.usernameRequired);
  });

  test('TC-05 [REQ-04]: Populated username with empty password displays password required error', async ({ page }) => {
    await loginPage.login(LOGIN_DATA.users.standard, '');

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.passwordRequired);
  });

  test('TC-06 [REQ-05]: Non-existent username and wrong password display credential mismatch error', async ({ page }) => {
    // Non-existent username
    await loginPage.login(LOGIN_DATA.invalidInputs.nonExistentUser, LOGIN_DATA.password);
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.invalidCredentials);

    // Wrong password
    await loginPage.login(LOGIN_DATA.users.standard, LOGIN_DATA.invalidInputs.wrongPassword);
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.invalidCredentials);
  });

  test('TC-07 [REQ-05, EDGE-01]: Invalid casing (username & password) and leading/trailing whitespace do not grant access', async ({ page }) => {
    const boundaryCases = [
      { user: LOGIN_DATA.invalidInputs.upperCaseUser, pass: LOGIN_DATA.password },
      { user: LOGIN_DATA.users.standard, pass: LOGIN_DATA.invalidInputs.mixedCasePassword },
      { user: LOGIN_DATA.invalidInputs.leadingTrailingSpaceUser, pass: LOGIN_DATA.password },
      { user: LOGIN_DATA.users.standard, pass: LOGIN_DATA.invalidInputs.leadingTrailingSpacePass },
    ];

    for (const creds of boundaryCases) {
      await loginPage.login(creds.user, creds.pass);
      await expect(page).toHaveURL(/\/$/);
      await expect(loginPage.errorBanner).toBeVisible();
      await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.invalidCredentials);
    }
  });

  test('TC-08 [EDGE-01, REQ-05]: SQL injection and HTML strings in inputs do not grant access', async ({ page }) => {
    let dialogTriggered = false;
    page.on('dialog', () => {
      dialogTriggered = true;
    });

    // SQL injection payload
    await loginPage.login(
      LOGIN_DATA.invalidInputs.sqlInjection,
      LOGIN_DATA.invalidInputs.sqlInjection
    );
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.invalidCredentials);

    // HTML/script payload
    await loginPage.login(
      LOGIN_DATA.invalidInputs.htmlPayload,
      LOGIN_DATA.invalidInputs.wrongPassword
    );
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.invalidCredentials);
    expect(dialogTriggered).toBe(false);
  });

  test('TC-09 [REQ-06]: Clicking close (x) button dismisses validation error banner', async () => {
    await loginPage.login('', LOGIN_DATA.password);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.usernameRequired);

    await loginPage.dismissError();
    await expect(loginPage.errorBanner).toBeHidden();
    // [MISSING IN SPEC] Input field error class clearing behavior not defined in PRD
  });

  test('TC-10 [REQ-07, NFR-02]: Special personas pass through with expected traits and performance_glitch_user shows delay', async ({ browser, baseURL, viewport, permissions }, testInfo) => {
    /** @type {Array<{ label: string, video: import('@playwright/test').Video }>} */
    const recordedVideos = [];
    let testFailed = false;

    /**
     * Run a persona flow inside a fresh browser context so cookies and web storage
     * never leak between users, while retaining video recordings on failure.
     * @template T
     * @param {string} label
     * @param {(ctxPage: import('@playwright/test').Page, ctxLoginPage: LoginPage) => Promise<T>} fn
     * @returns {Promise<T>}
     */
    const runInFreshContext = async (label, fn) => {
      const freshContext = await browser.newContext({
        baseURL,
        viewport,
        ...(permissions ? { permissions } : {}),
        recordVideo: { dir: testInfo.outputDir, size: { width: 1280, height: 720 } },
      });
      const freshPage = await freshContext.newPage();
      const freshLoginPage = new LoginPage(freshPage);
      const video = freshPage.video();
      if (video) {
        recordedVideos.push({ label, video });
      }
      try {
        return await fn(freshPage, freshLoginPage);
      } finally {
        await freshContext.close();
      }
    };

    try {
      // Baseline standard_user timing (click-to-inventory-ready, excluding input fill overhead)
      const stdDuration = await runInFreshContext(LOGIN_DATA.users.standard, async (ctxPage, ctxLoginPage) => {
        await ctxLoginPage.goto();
        await ctxLoginPage.fillCredentials(LOGIN_DATA.users.standard, LOGIN_DATA.password);
        const start = Date.now();
        await ctxLoginPage.loginButton.click();
        await expect(ctxPage).toHaveURL(/\/inventory\.html$/);
        await expect(ctxPage.locator('.inventory_item').first()).toBeVisible();
        return Date.now() - start;
      });

      // problem_user: authenticates to /inventory.html and exhibits broken/duplicate catalog image behavior
      await runInFreshContext(LOGIN_DATA.users.problem, async (ctxPage, ctxLoginPage) => {
        await ctxLoginPage.goto();
        await ctxLoginPage.login(LOGIN_DATA.users.problem, LOGIN_DATA.password);
        await expect(ctxPage).toHaveURL(/\/inventory\.html$/);
        await expect(ctxPage.locator('.inventory_item img').first()).toBeVisible();
        const problemImgSrcs = await ctxPage.locator('.inventory_item img').evaluateAll((imgs) =>
          imgs.map((img) => img.getAttribute('src'))
        );
        expect(problemImgSrcs.length).toBeGreaterThan(0);
        expect(new Set(problemImgSrcs).size).toBeLessThan(problemImgSrcs.length);
      });

      // error_user & visual_user: authenticates to /inventory.html
      for (const persona of [LOGIN_DATA.users.error, LOGIN_DATA.users.visual]) {
        await runInFreshContext(persona, async (ctxPage, ctxLoginPage) => {
          await ctxLoginPage.goto();
          await ctxLoginPage.login(persona, LOGIN_DATA.password);
          await expect(ctxPage).toHaveURL(/\/inventory\.html$/);
        });
      }

      // performance_glitch_user: authenticates with noticeable delay (~5s) compared to standard_user
      const glitchDuration = await runInFreshContext(LOGIN_DATA.users.performanceGlitch, async (ctxPage, ctxLoginPage) => {
        await ctxLoginPage.goto();
        await ctxLoginPage.fillCredentials(LOGIN_DATA.users.performanceGlitch, LOGIN_DATA.password);
        const start = Date.now();
        await ctxLoginPage.loginButton.click({ timeout: 15000 });
        await expect(ctxPage).toHaveURL(/\/inventory\.html$/, { timeout: 15000 });
        await expect(ctxPage.locator('.inventory_item').first()).toBeVisible({ timeout: 15000 });
        return Date.now() - start;
      });

      expect(glitchDuration).toBeGreaterThan(stdDuration);
    } catch (error) {
      testFailed = true;
      throw error;
    } finally {
      for (const { label, video } of recordedVideos) {
        try {
          if (testFailed) {
            const videoPath = await video.path();
            await testInfo.attach(`video-${label}`, {
              path: videoPath,
              contentType: 'video/webm',
            });
          } else {
            await video.delete();
          }
        } catch {
          // Ignore video cleanup/attach errors so original test failure is preserved
        }
      }
    }
  });

  test('TC-11 [EDGE-02]: Direct navigation to /inventory.html without active session redirects to login', async ({ page }) => {
    await loginPage.gotoInventoryDirectly();

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.unauthenticatedInventory);
  });

  test('TC-12 [NFR-01]: Repeated failed login attempts continue to deny access', async ({ page }) => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      await loginPage.login(
        LOGIN_DATA.invalidInputs.nonExistentUser,
        LOGIN_DATA.invalidInputs.wrongPassword
      );
      await expect(page).toHaveURL(/\/$/);
      await expect(loginPage.errorBanner).toBeVisible();
      await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.invalidCredentials);
    }
    // [MISSING IN SPEC] Rate-limiting or lockout threshold not specified in PRD
  });

  test('TC-13 [REQ-04]: Submitting both empty username and empty password displays username required error', async ({ page }) => {
    await loginPage.login('', '');

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(LOGIN_DATA.errors.usernameRequired);
  });
});