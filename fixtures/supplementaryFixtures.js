const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { PlpPage } = require('../pages/PlpPage');
const { PdpPage } = require('../pages/PdpPage');
const { ShoppingCartPage } = require('../pages/ShoppingCartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { SidebarPage } = require('../pages/SidebarPage');
const { DynamicCatalogPage } = require('../pages/DynamicCatalogPage');
const { LOGIN_DATA } = require('./loginData');
const { testData: catalogData } = require('./plpPdpFixtures');

const supplementaryData = {
  sidebar: {
    aboutHref: 'https://saucelabs.com/',
  },
  footer: {
    copyright: '© 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy',
    socialLinks: [
      { testId: 'social-x', href: 'https://x.com/saucelabs' },
      { testId: 'social-facebook', href: 'https://www.facebook.com/saucelabs' },
      { testId: 'social-linkedin', href: 'https://www.linkedin.com/company/sauce-labs/' },
    ],
  },
  customer: {
    firstName: 'Aldo',
    lastName: 'Pontoh',
    postalCode: '15147',
  },
  emptyCartTotals: {
    itemTotal: 'Item total: $0',
    tax: 'Tax: $0.00',
    total: 'Total: $0.00',
    completeHeader: 'Thank you for your order!',
  },
  sorting: {
    products: catalogData.products,
    featuredSlug: catalogData.featuredProduct.slug, // sauce-labs-backpack
    featuredName: catalogData.featuredProduct.name,
    cheapestSlug: 'sauce-labs-onesie',
    cheapestName: 'Sauce Labs Onesie',
    unaddedSlug: 'sauce-labs-fleece-jacket',
    sortOptions: catalogData.sortOptions,
  },
  personas: {
    lockedOutError: LOGIN_DATA.errors.lockedOut,
    errorUserSortAlert: 'Sorting is broken! This error has been reported to Backtrace.',
    errorUserBrokenAddSlug: 'sauce-labs-bolt-t-shirt',
    errorUserWorkingAddSlug: 'sauce-labs-backpack',
    problemUserWrongPdpId: 5, // Clicking Backpack (id=4) opens Fleece Jacket (id=5)
    problemUserWrongPdpName: 'Sauce Labs Fleece Jacket',
    performanceMinDelayMs: 2000,
  },
  protectedRoutes: [
    {
      path: '/inventory.html',
      expectedError:
        "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    },
    {
      path: '/inventory-item.html?id=4',
      expectedError:
        "Epic sadface: You can only access '/inventory-item.html' when you are logged in.",
    },
    {
      path: '/cart.html',
      expectedError: "Epic sadface: You can only access '/cart.html' when you are logged in.",
    },
    {
      path: '/checkout-step-one.html',
      expectedError:
        "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.",
    },
    {
      path: '/checkout-step-two.html',
      expectedError:
        "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in.",
    },
    {
      path: '/checkout-complete.html',
      expectedError:
        "Epic sadface: You can only access '/checkout-complete.html' when you are logged in.",
    },
  ],
  dynamicCatalogRoutes: [
    {
      path: '/dynamic-catalog-lazy-load.html',
      expectedError:
        "Epic sadface: You can only access '/dynamic-catalog-lazy-load.html' when you are logged in.",
    },
    {
      path: '/dynamic-catalog-spinner.html',
      expectedError:
        "Epic sadface: You can only access '/dynamic-catalog-spinner.html' when you are logged in.",
    },
    {
      path: '/dynamic-catalog-slider.html',
      expectedError:
        "Epic sadface: You can only access '/dynamic-catalog-slider.html' when you are logged in.",
    },
  ],
};

const test = base.test.extend({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(LOGIN_DATA.users.standard, LOGIN_DATA.password);
    await base.expect(page).toHaveURL(/\/inventory\.html$/);
    await base.expect(page.getByTestId('inventory-list')).toBeVisible();
    await use(page);
  },
  sidebarPage: async ({ authenticatedPage }, use) => {
    await use(new SidebarPage(authenticatedPage));
  },
  plpPage: async ({ authenticatedPage }, use) => {
    await use(new PlpPage(authenticatedPage));
  },
  pdpPage: async ({ authenticatedPage }, use) => {
    await use(new PdpPage(authenticatedPage));
  },
  shoppingCartPage: async ({ authenticatedPage }, use) => {
    await use(new ShoppingCartPage(authenticatedPage));
  },
  checkoutPage: async ({ authenticatedPage }, use) => {
    await use(new CheckoutPage(authenticatedPage));
  },
  dynamicCatalogPage: async ({ authenticatedPage }, use) => {
    await use(new DynamicCatalogPage(authenticatedPage));
  },
  supplementaryData: async ({}, use) => {
    await use(supplementaryData);
  },
});

module.exports = { test, expect: base.expect, supplementaryData };
