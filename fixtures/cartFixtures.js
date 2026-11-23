const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryCartPage } = require('../pages/InventoryCartPage');
const { ShoppingCartPage } = require('../pages/ShoppingCartPage');
const { LOGIN_DATA } = require('./loginData');

const cartTestData = {
  inventoryPath: '/inventory.html',
  cartPath: '/cart.html',
  checkoutStepOnePath: '/checkout-step-one.html',
  primaryItem: {
    name: 'Sauce Labs Backpack',
    priceText: '$29.99',
  },
  secondaryItem: {
    name: 'Sauce Labs Bike Light',
  },
  uiText: {
    cartTitle: 'Your Cart',
    qtyHeader: 'QTY',
    descriptionHeader: 'Description',
    emptyCartLabel: 'Cart, empty',
  },
  errors: {
    unauthenticatedCart:
      "Epic sadface: You can only access '/cart.html' when you are logged in.",
  },
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
  inventoryCartPage: async ({ authenticatedPage }, use) => {
    await use(new InventoryCartPage(authenticatedPage));
  },
  shoppingCartPage: async ({ authenticatedPage }, use) => {
    await use(new ShoppingCartPage(authenticatedPage));
  },
  cartTestData: async ({}, use) => {
    await use(cartTestData);
  },
});

module.exports = { test, expect: base.expect, cartTestData };
