const { test, expect } = require('../fixtures/supplementaryFixtures');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Swag Labs - Module 4: Footer, Session & Security Boundaries', () => {
  test('SEC-01: Unauthenticated direct access to all protected routes redirects to login with exact error message', async ({
    page,
    supplementaryData,
  }) => {
    const loginPage = new LoginPage(page);

    for (const route of supplementaryData.protectedRoutes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(/\/$/);
      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.errorBanner).toBeVisible();
      await expect(loginPage.errorBanner).toHaveText(route.expectedError);
    }
  });

  test('SEC-02: Post-logout browser Back navigation blocks access to cached inventory and cart views', async ({
    plpPage,
    shoppingCartPage,
    sidebarPage,
    supplementaryData,
  }) => {
    const loginPage = new LoginPage(plpPage.page);

    // Visit /cart.html so history contains /inventory.html -> /cart.html
    await plpPage.addToCart(supplementaryData.sorting.featuredSlug);
    await plpPage.cartButton.click();
    await expect(shoppingCartPage.page).toHaveURL(/\/cart\.html$/);

    // Logout terminates session
    await sidebarPage.clickLogout();
    await expect(plpPage.page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();

    // Pressing Back must redirect to / with unauthorized error rather than rendering /cart.html
    await plpPage.page.goBack();
    await expect(plpPage.page).toHaveURL(/\/$/);
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(
      "Epic sadface: You can only access '/cart.html' when you are logged in."
    );
  });

  test('SEC-03: Empty-cart checkout edge case computes $0 totals and completes without runtime error', async ({
    plpPage,
    shoppingCartPage,
    checkoutPage,
    supplementaryData,
  }) => {
    await expect(plpPage.cartBadge).toHaveCount(0);
    await plpPage.cartButton.click();
    await expect(shoppingCartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(shoppingCartPage.cartItems).toHaveCount(0);

    await shoppingCartPage.clickCheckout();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await checkoutPage.fillCustomerInfo(
      supplementaryData.customer.firstName,
      supplementaryData.customer.lastName,
      supplementaryData.customer.postalCode
    );
    await checkoutPage.clickContinue();

    await expect(checkoutPage.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(checkoutPage.summaryCartItems).toHaveCount(0);
    await expect(checkoutPage.itemTotalLabel).toHaveText(
      supplementaryData.emptyCartTotals.itemTotal
    );
    await expect(checkoutPage.taxLabel).toHaveText(supplementaryData.emptyCartTotals.tax);
    await expect(checkoutPage.totalLabel).toHaveText(supplementaryData.emptyCartTotals.total);

    await checkoutPage.clickFinish();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutPage.completeHeader).toHaveText(
      supplementaryData.emptyCartTotals.completeHeader
    );
  });

  test('SEC-04: Footer social links (X, Facebook, LinkedIn) expose valid external URLs with target=_blank', async ({
    plpPage,
    supplementaryData,
  }) => {
    await expect(plpPage.footer).toBeVisible();

    for (const social of supplementaryData.footer.socialLinks) {
      const link = plpPage.page.getByTestId(social.testId);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', social.href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noreferrer/i);
    }
  });

  test('SEC-05: Footer copyright text renders consistently across PLP, Cart, and Checkout', async ({
    plpPage,
    shoppingCartPage,
    checkoutPage,
    supplementaryData,
  }) => {
    // PLP
    await expect(plpPage.footerCopy).toHaveText(supplementaryData.footer.copyright);

    // Cart
    await plpPage.cartButton.click();
    await expect(shoppingCartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(plpPage.footerCopy).toHaveText(supplementaryData.footer.copyright);

    // Checkout Step 1
    await shoppingCartPage.clickCheckout();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(plpPage.footerCopy).toHaveText(supplementaryData.footer.copyright);
  });
});
