const { test: base, createBdd } = require('playwright-bdd');
const { LoginPage } = require('../pages/LoginPage');
const { PlpPage } = require('../pages/PlpPage');
const { PdpPage } = require('../pages/PdpPage');
const { InventoryCartPage } = require('../pages/InventoryCartPage');
const { ShoppingCartPage } = require('../pages/ShoppingCartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { SidebarPage } = require('../pages/SidebarPage');

const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  plpPage: async ({ page }, use) => {
    await use(new PlpPage(page));
  },
  pdpPage: async ({ page }, use) => {
    await use(new PdpPage(page));
  },
  inventoryCartPage: async ({ page }, use) => {
    await use(new InventoryCartPage(page));
  },
  shoppingCartPage: async ({ page }, use) => {
    await use(new ShoppingCartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  sidebarPage: async ({ page }, use) => {
    await use(new SidebarPage(page));
  },
});

const { Given, When, Then } = createBdd(test);

module.exports = { test, Given, When, Then };
