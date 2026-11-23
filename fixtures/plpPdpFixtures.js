const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { PlpPage } = require('../pages/PlpPage');
const { PdpPage } = require('../pages/PdpPage');
const { LOGIN_DATA } = require('./loginData');

const catalogProducts = [
  {
    id: 4,
    slug: 'sauce-labs-backpack',
    name: 'Sauce Labs Backpack',
    price: '$29.99',
    priceValue: 29.99,
    description:
      'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.',
  },
  {
    id: 0,
    slug: 'sauce-labs-bike-light',
    name: 'Sauce Labs Bike Light',
    price: '$9.99',
    priceValue: 9.99,
    description:
      "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.",
  },
  {
    id: 1,
    slug: 'sauce-labs-bolt-t-shirt',
    name: 'Sauce Labs Bolt T-Shirt',
    price: '$15.99',
    priceValue: 15.99,
    description:
      'Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.',
  },
  {
    id: 5,
    slug: 'sauce-labs-fleece-jacket',
    name: 'Sauce Labs Fleece Jacket',
    price: '$49.99',
    priceValue: 49.99,
    description:
      "It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.",
  },
  {
    id: 2,
    slug: 'sauce-labs-onesie',
    name: 'Sauce Labs Onesie',
    price: '$7.99',
    priceValue: 7.99,
    description:
      "Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel.",
  },
  {
    id: 3,
    slug: 'test.allthethings()-t-shirt-(red)',
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: '$15.99',
    priceValue: 15.99,
    description:
      'This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy ringspun combed cotton.',
  },
];

const testData = {
  plpPath: '/inventory.html',
  pdpPathFor: (id) => `/inventory-item.html?id=${id}`,
  expectedProductCount: catalogProducts.length,
  products: catalogProducts,
  featuredProduct: catalogProducts[0], // Sauce Labs Backpack (id=4)
  secondaryProduct: catalogProducts[1], // Sauce Labs Bike Light (id=0)
  sortOptions: {
    az: { value: 'az', label: 'Name (A to Z)' },
    za: { value: 'za', label: 'Name (Z to A)' },
    lohi: { value: 'lohi', label: 'Price (low to high)' },
    hilo: { value: 'hilo', label: 'Price (high to low)' },
  },
  errors: {
    unauthenticatedInventory:
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    unauthenticatedItem:
      "Epic sadface: You can only access '/inventory-item.html' when you are logged in.",
  },
  uiText: {
    pageTitle: 'Swag Labs',
    plpTitle: 'Products',
    emptyCartLabel: 'Cart, empty',
  },
};

/**
 * Authenticate as standard_user and land on /inventory.html.
 * @param {import('@playwright/test').Page} page
 */
async function authenticateStandardUser(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(LOGIN_DATA.users.standard, LOGIN_DATA.password);
  await base.expect(page).toHaveURL(/\/inventory\.html$/);
  await base.expect(page.getByTestId('inventory-list')).toBeVisible();
}

const test = base.test.extend({
  plpPage: async ({ page }, use) => {
    await authenticateStandardUser(page);
    await use(new PlpPage(page));
  },
  pdpPage: async ({ page }, use) => {
    await authenticateStandardUser(page);
    await use(new PdpPage(page));
  },
  plpTestData: async ({}, use) => {
    await use(testData);
  },
});

module.exports = { test, expect: base.expect, testData };
