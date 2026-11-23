const { test, expect } = require('../fixtures/supplementaryFixtures');
const { LOGIN_DATA } = require('../fixtures/loginData');
const { LoginPage } = require('../pages/LoginPage');
const { PlpPage } = require('../pages/PlpPage');
const { PdpPage } = require('../pages/PdpPage');
const { ShoppingCartPage } = require('../pages/ShoppingCartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

test.describe('Swag Labs - Module 3: User Persona & Behavioral Edge-Cases', () => {
  test('PER-01: locked_out_user is blocked on login with exact locked-out error banner', async ({
    page,
    supplementaryData,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(LOGIN_DATA.users.lockedOut, LOGIN_DATA.password);

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(supplementaryData.personas.lockedOutError);
  });

  test('PER-02: standard_user completes baseline shopping & checkout flow with zero runtime page errors', async ({
    page,
    supplementaryData,
  }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(LOGIN_DATA.users.standard, LOGIN_DATA.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    const plpPage = new PlpPage(page);
    await expect(plpPage.productCards).toHaveCount(6);
    const shoppingCartPage = new ShoppingCartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await plpPage.selectSort('lohi');
    await plpPage.addToCart(supplementaryData.sorting.featuredSlug);
    await expect(plpPage.cartBadge).toHaveText('1');

    await plpPage.cartButton.click();
    await shoppingCartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo(
      supplementaryData.customer.firstName,
      supplementaryData.customer.lastName,
      supplementaryData.customer.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    expect(pageErrors).toEqual([]);
  });

  test('PER-03: problem_user exhibits duplicate 404 images, wrong PDP mapping, broken Remove/Sort, and Last Name overwrite', async ({
    page,
    supplementaryData,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(LOGIN_DATA.users.problem, LOGIN_DATA.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    const plpPage = new PlpPage(page);
    await expect(plpPage.productCards).toHaveCount(6);
    const pdpPage = new PdpPage(page);
    const shoppingCartPage = new ShoppingCartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. All 6 PLP images render the same 404 placeholder asset
    const imgSrcs = await plpPage.productCards.locator('img').evaluateAll((imgs) =>
      imgs.map((img) => img.getAttribute('src') || '')
    );
    expect(imgSrcs).toHaveLength(6);
    expect(new Set(imgSrcs).size).toBe(1);
    expect(imgSrcs[0]).toMatch(/sl-404/i);

    // 2. Sort dropdown is a no-op (order remains unchanged)
    const namesBeforeSort = await plpPage.getDisplayedProductNames();
    await plpPage.selectSort('za');
    expect(await plpPage.getDisplayedProductNames()).toEqual(namesBeforeSort);

    // 3. Add succeeds, but Remove on PLP fails to clear the item
    await plpPage.addToCart(supplementaryData.sorting.featuredSlug);
    await expect(plpPage.cartBadge).toHaveText('1');
    await plpPage.removeFromCart(supplementaryData.sorting.featuredSlug);
    await expect(plpPage.cartBadge).toHaveText('1');

    // 4. Clicking Backpack (id=4) navigates to mismatched PDP (id=5 Fleece Jacket)
    await plpPage.openProductByTitle(4);
    await pdpPage.waitForLoaded();
    await expect(page).toHaveURL(
      new RegExp(`/inventory-item\\.html\\?id=${supplementaryData.personas.problemUserWrongPdpId}$`)
    );
    await expect(pdpPage.productName).toHaveText(
      supplementaryData.personas.problemUserWrongPdpName
    );

    // 5. Checkout Step 1: typing into Last Name overwrites First Name and leaves Last Name empty
    await pdpPage.cartButton.click();
    await shoppingCartPage.clickCheckout();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

    await checkoutPage.firstNameInput.fill(supplementaryData.customer.firstName);
    await checkoutPage.lastNameInput.fill(supplementaryData.customer.lastName);
    await expect(checkoutPage.firstNameInput).toHaveValue(supplementaryData.customer.lastName);
    await expect(checkoutPage.lastNameInput).toHaveValue('');
  });

  test('PER-04: performance_glitch_user introduces 3-5s latency on login and sorting handled with dynamic waits', async ({
    page,
    supplementaryData,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillCredentials(LOGIN_DATA.users.performanceGlitch, LOGIN_DATA.password);

    const loginStart = Date.now();
    await loginPage.loginButton.click({ timeout: 15000 });
    await expect(page).toHaveURL(/\/inventory\.html$/, { timeout: 15000 });
    const plpPage = new PlpPage(page);
    await expect(plpPage.productCards.first()).toBeVisible({ timeout: 15000 });
    const loginDurationMs = Date.now() - loginStart;

    expect(loginDurationMs).toBeGreaterThan(supplementaryData.personas.performanceMinDelayMs);

    // Sorting also triggers the ~5s blocking delay; verify dynamic completion without hardcoded sleep
    const sortStart = Date.now();
    await plpPage.sortSelect.selectOption('lohi', { timeout: 15000 });
    await expect(plpPage.sortSelect).toHaveValue('lohi', { timeout: 15000 });
    const sortDurationMs = Date.now() - sortStart;

    expect(sortDurationMs).toBeGreaterThan(supplementaryData.personas.performanceMinDelayMs);
    const prices = await plpPage.getDisplayedProductPrices();
    expect(prices[0]).toBe(7.99);
  });

  test('PER-05: error_user triggers sort alert, runtime page errors on Add/Remove, and broken Checkout Finish', async ({
    page,
    supplementaryData,
  }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    let alertMessage = '';
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(LOGIN_DATA.users.error, LOGIN_DATA.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    const plpPage = new PlpPage(page);
    await expect(plpPage.productCards).toHaveCount(6);
    const shoppingCartPage = new ShoppingCartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Sort triggers native alert and stays unchanged
    await plpPage.selectSort('za');
    expect(alertMessage).toBe(supplementaryData.personas.errorUserSortAlert);

    // 2. Adding a restricted item throws an uncaught runtime error and leaves cart empty
    await plpPage.addToCart(supplementaryData.personas.errorUserBrokenAddSlug);
    await expect(plpPage.cartBadge).toHaveCount(0);

    // 3. Adding Backpack works, but Remove fails with runtime error leaving badge at 1
    await plpPage.addToCart(supplementaryData.personas.errorUserWorkingAddSlug);
    await expect(plpPage.cartBadge).toHaveText('1');
    await plpPage.removeFromCart(supplementaryData.personas.errorUserWorkingAddSlug);
    await expect(plpPage.cartBadge).toHaveText('1');

    // 4. Checkout Step 2 Finish fails with runtime error and stays on /checkout-step-two.html
    await plpPage.cartButton.click();
    await shoppingCartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo(
      supplementaryData.customer.firstName,
      supplementaryData.customer.lastName,
      supplementaryData.customer.postalCode
    );
    await checkoutPage.clickContinue();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

    const errorsBeforeFinish = pageErrors.length;
    await checkoutPage.clickFinish();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    expect(pageErrors.length).toBeGreaterThan(errorsBeforeFinish);
  });

  test('PER-06: visual_user exhibits broken Backpack image and misaligned layout failure classes on catalog', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(LOGIN_DATA.users.visual, LOGIN_DATA.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    const plpPage = new PlpPage(page);
    await expect(plpPage.productCards).toHaveCount(6);
    const backpackImg = plpPage.cardByName('Sauce Labs Backpack').locator('img');
    await expect(backpackImg).toHaveAttribute('src', /sl-404/i);

    await expect(
      page.locator('.visual_failure, .btn_inventory_misaligned').first()
    ).toBeVisible();
  });
});
