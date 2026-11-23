const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryCartPage } = require('../pages/InventoryCartPage');
const { ShoppingCartPage } = require('../pages/ShoppingCartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { LOGIN_DATA } = require('./loginData');

const checkoutTestData = {
  inventoryPath: '/inventory.html',
  cartPath: '/cart.html',
  stepOnePath: '/checkout-step-one.html',
  stepTwoPath: '/checkout-step-two.html',
  completePath: '/checkout-complete.html',
  customer: {
    firstName: 'Aldo',
    lastName: 'Pontoh',
    postalCode: '15147',
    alphanumericPostalCode: '15147A',
  },
  errors: {
    firstNameRequired: 'Error: First Name is required',
    lastNameRequired: 'Error: Last Name is required',
    postalCodeRequired: 'Error: Postal Code is required',
    unauthenticatedStepOne:
      "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.",
  },
  singleItem: {
    name: 'Sauce Labs Backpack',
    priceText: '$29.99',
    itemTotalText: 'Item total: $29.99',
    taxText: 'Tax: $2.40',
    totalText: 'Total: $32.39',
  },
  multiItems: {
    names: [
      'Sauce Labs Backpack',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Bike Light',
    ],
    expectedCount: 4,
    itemTotalText: 'Item total: $105.96',
    taxText: 'Tax: $8.48',
    totalText: 'Total: $114.44',
  },
  summaryLabels: {
    paymentInfo: 'SauceCard #31337',
    shippingInfo: 'Free Pony Express Delivery!',
    completeHeader: 'Thank you for your order!',
    completeText:
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
    checkmarkAlt: 'Pony Express',
  },
  receiptFilenamePattern: /^swag-labs-order-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.pdf$/,
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
  checkoutPage: async ({ authenticatedPage }, use) => {
    await use(new CheckoutPage(authenticatedPage));
  },
  checkoutTestData: async ({}, use) => {
    await use(checkoutTestData);
  },
});

module.exports = { test, expect: base.expect, checkoutTestData };
