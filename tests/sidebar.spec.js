const { test, expect } = require('../fixtures/supplementaryFixtures');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Swag Labs - Module 1: Sidebar / Burger Menu', () => {
  test('SB-01: Reset App State clears cart badge immediately, empties cart storage, and restores catalog CTA after reload', async ({
    plpPage,
    sidebarPage,
    shoppingCartPage,
    supplementaryData,
  }) => {
    const slug = supplementaryData.sorting.featuredSlug;

    await plpPage.addToCart(slug);
    await expect(sidebarPage.cartBadge).toHaveText('1');
    await expect(plpPage.removeButtonFor(slug)).toBeVisible();

    await sidebarPage.clickResetAppState();
    await expect(sidebarPage.cartBadge).toHaveCount(0);

    // Verify cart page reflects empty state
    await plpPage.cartButton.click();
    await expect(shoppingCartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(shoppingCartPage.cartItems).toHaveCount(0);

    // Returning to /inventory.html shows Reset catalog CTA state ("Add to cart")
    await shoppingCartPage.clickContinueShopping();
    await expect(plpPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(plpPage.addToCartButtonFor(slug)).toBeVisible();
  });

  test('SB-02: Logout from Checkout Step 1 terminates session, clears inputs, and blocks browser Back button', async ({
    plpPage,
    shoppingCartPage,
    checkoutPage,
    sidebarPage,
    supplementaryData,
  }) => {
    await plpPage.addToCart(supplementaryData.sorting.featuredSlug);
    await plpPage.cartButton.click();
    await shoppingCartPage.clickCheckout();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-step-one\.html$/);

    await sidebarPage.clickLogout();

    const loginPage = new LoginPage(checkoutPage.page);
    await expect(checkoutPage.page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.usernameInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');

    // Browser Back button must not re-render protected checkout page from cache
    await checkoutPage.page.goBack();
    await expect(checkoutPage.page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(
      "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
    );
  });

  test('SB-03: Opening and closing drawer preserves current route and active cart state', async ({
    plpPage,
    shoppingCartPage,
    sidebarPage,
    supplementaryData,
  }) => {
    await plpPage.addToCart(supplementaryData.sorting.featuredSlug);
    await expect(sidebarPage.cartBadge).toHaveText('1');

    // Open and close on /inventory.html
    await sidebarPage.open();
    await expect(sidebarPage.allItemsLink).toBeVisible();
    await expect(sidebarPage.aboutLink).toBeVisible();
    await expect(sidebarPage.logoutLink).toBeVisible();
    await expect(sidebarPage.resetAppStateLink).toBeVisible();

    await sidebarPage.close();
    await expect(sidebarPage.allItemsLink).toBeHidden();
    await expect(plpPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(sidebarPage.cartBadge).toHaveText('1');

    // Open and close on /cart.html
    await plpPage.cartButton.click();
    await expect(shoppingCartPage.page).toHaveURL(/\/cart\.html$/);
    await sidebarPage.open();
    await sidebarPage.close();
    await expect(shoppingCartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(shoppingCartPage.cartItems).toHaveCount(1);
    await expect(sidebarPage.cartBadge).toHaveText('1');
  });

  test('SB-04: All Items returns to /inventory.html from PDP, Cart, and Checkout while auto-closing drawer and keeping cart intact', async ({
    plpPage,
    pdpPage,
    shoppingCartPage,
    checkoutPage,
    sidebarPage,
    supplementaryData,
  }) => {
    await plpPage.addToCart(supplementaryData.sorting.featuredSlug);
    await expect(sidebarPage.cartBadge).toHaveText('1');

    // From PDP
    await pdpPage.gotoProduct(4);
    await sidebarPage.clickAllItems();
    await expect(plpPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(sidebarPage.allItemsLink).toBeHidden();
    await expect(sidebarPage.cartBadge).toHaveText('1');

    // From Cart
    await plpPage.cartButton.click();
    await expect(shoppingCartPage.page).toHaveURL(/\/cart\.html$/);
    await sidebarPage.clickAllItems();
    await expect(plpPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(sidebarPage.allItemsLink).toBeHidden();
    await expect(sidebarPage.cartBadge).toHaveText('1');

    // From Checkout Step 1
    await plpPage.cartButton.click();
    await shoppingCartPage.clickCheckout();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await sidebarPage.clickAllItems();
    await expect(plpPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(sidebarPage.allItemsLink).toBeHidden();
    await expect(sidebarPage.cartBadge).toHaveText('1');
  });

  test('SB-05: About link exposes valid external Sauce Labs href and Dynamic Catalog submenu reveals all 3 views', async ({
    sidebarPage,
    supplementaryData,
  }) => {
    await sidebarPage.open();
    await expect(sidebarPage.aboutLink).toBeVisible();
    await expect(sidebarPage.aboutLink).toHaveAttribute('href', supplementaryData.sidebar.aboutHref);

    await sidebarPage.dynamicCatalogToggle.click();
    await expect(sidebarPage.dynamicCatalogSubmenu).toBeVisible();
    await expect(sidebarPage.lazyLoadLink).toBeVisible();
    await expect(sidebarPage.spinnerLink).toBeVisible();
    await expect(sidebarPage.sliderLink).toBeVisible();
  });
});
