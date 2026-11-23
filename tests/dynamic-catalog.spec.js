const { test, expect } = require('../fixtures/supplementaryFixtures');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Swag Labs - Module 5: Dynamic Catalog (Lazy Load, Spinner, Slider)', () => {
  test('DC-01: Lazy Load renders initial batch with Loading placeholders and appends more items on scroll', async ({
    sidebarPage,
    dynamicCatalogPage,
  }) => {
    await sidebarPage.openDynamicCatalogView('lazy-load');
    await expect(dynamicCatalogPage.page).toHaveURL(/\/dynamic-catalog-lazy-load\.html$/);
    await expect(dynamicCatalogPage.pageTitle).toHaveText('Dynamic Catalog - Lazy Load');

    // Tall viewports (e.g. 1920x1080) may immediately load >1 batch; wait for at least 6 items
    await expect
      .poll(async () => dynamicCatalogPage.lazyLoadItemNames.count())
      .toBeGreaterThanOrEqual(6);
    await expect(dynamicCatalogPage.lazyLoadPlaceholders.first()).toBeVisible();

    const initialCount = await dynamicCatalogPage.lazyLoadItemNames.count();

    // Scroll placeholders into view to trigger IntersectionObserver lazy-loading
    await dynamicCatalogPage.lazyLoadPlaceholders.first().scrollIntoViewIfNeeded();
    await dynamicCatalogPage.scrollToBottom();
    await expect
      .poll(async () => dynamicCatalogPage.lazyLoadItemNames.count(), { timeout: 10000 })
      .toBeGreaterThan(initialCount);
  });

  test('DC-02: Spinner shows accessible Loading status indicator before rendering 6 product cards', async ({
    sidebarPage,
    dynamicCatalogPage,
  }) => {
    await sidebarPage.openDynamicCatalogView('spinner');
    await expect(dynamicCatalogPage.page).toHaveURL(/\/dynamic-catalog-spinner\.html$/);
    await expect(dynamicCatalogPage.pageTitle).toHaveText('Dynamic Catalog - Spinner');

    await expect(dynamicCatalogPage.spinner).toBeVisible();
    await expect(dynamicCatalogPage.spinner).toHaveAttribute('role', 'status');
    await expect(dynamicCatalogPage.spinner).toHaveAttribute('aria-label', 'Loading');

    // Dynamically wait for ~3s spinner to finish and 6 product cards to appear
    await expect(dynamicCatalogPage.spinner).toBeHidden({ timeout: 10000 });
    await expect(dynamicCatalogPage.spinnerItemNames).toHaveCount(6, { timeout: 10000 });
    await expect(dynamicCatalogPage.spinnerItemPrices).toHaveCount(6);

    const prices = await dynamicCatalogPage.spinnerItemPrices.allInnerTexts();
    for (const price of prices) {
      expect(price.trim()).toMatch(/^\$\d+\.\d{2}$/);
    }
  });

  test('DC-03: Slider supports manual dot navigation with aria-current state and auto-advances slides', async ({
    sidebarPage,
    dynamicCatalogPage,
  }) => {
    await sidebarPage.openDynamicCatalogView('slider');
    await expect(dynamicCatalogPage.page).toHaveURL(/\/dynamic-catalog-slider\.html$/);
    await expect(dynamicCatalogPage.pageTitle).toHaveText('Dynamic Catalog - Slider');

    await expect(dynamicCatalogPage.sliderItem).toBeVisible();
    await expect(dynamicCatalogPage.sliderDots).toHaveCount(6);

    // Select Sauce Labs Backpack via accessible dot button
    const backpackDot = dynamicCatalogPage.sliderDotByProduct('Sauce Labs Backpack');
    const fleeceDot = dynamicCatalogPage.sliderDotByProduct('Sauce Labs Fleece Jacket');

    await backpackDot.click();
    await expect(backpackDot).toHaveAttribute('aria-current', 'true');
    await expect(dynamicCatalogPage.sliderName).toHaveText('Sauce Labs Backpack');
    await expect(dynamicCatalogPage.sliderPrice).toHaveText('$29.99');

    // Select Sauce Labs Fleece Jacket via accessible dot button
    await fleeceDot.click();
    await expect(fleeceDot).toHaveAttribute('aria-current', 'true');
    await expect(backpackDot).toHaveAttribute('aria-current', 'false');
    await expect(dynamicCatalogPage.sliderName).toHaveText('Sauce Labs Fleece Jacket');
    await expect(dynamicCatalogPage.sliderPrice).toHaveText('$49.99');

    // Verify slider auto-play advances dynamically without hardcoded sleeps
    await expect(dynamicCatalogPage.sliderName).not.toHaveText('Sauce Labs Fleece Jacket', {
      timeout: 10000,
    });
  });

  test('DC-04: Unauthenticated access to all 3 Dynamic Catalog routes redirects to login with exact errors', async ({
    page,
    supplementaryData,
  }) => {
    const loginPage = new LoginPage(page);

    for (const route of supplementaryData.dynamicCatalogRoutes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(/\/$/);
      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.errorBanner).toBeVisible();
      await expect(loginPage.errorBanner).toHaveText(route.expectedError);
    }
  });
});
