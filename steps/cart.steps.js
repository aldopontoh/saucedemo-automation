const { expect } = require('@playwright/test');
const { When, Then } = require('../fixtures/bddFixtures');

When('I add {string} to the cart', async ({ inventoryCartPage }, productName) => {
  await inventoryCartPage.clickAddToCart(productName);
});

When('I remove {string} from the inventory catalog', async ({ inventoryCartPage }, productName) => {
  await inventoryCartPage.clickRemove(productName);
});

When('I open the shopping cart', async ({ inventoryCartPage }) => {
  await inventoryCartPage.openCart();
});

When('I remove {string} from the shopping cart', async ({ shoppingCartPage }, productName) => {
  await shoppingCartPage.removeItemByName(productName);
});

When('I click Continue Shopping from the cart', async ({ shoppingCartPage }) => {
  await shoppingCartPage.clickContinueShopping();
});

When('I reload the current page', async ({ page }) => {
  await page.reload({ waitUntil: 'domcontentloaded' });
});

When('I reset app state from the sidebar menu', async ({ sidebarPage }) => {
  await sidebarPage.clickResetAppState();
});

Then('I should be on the shopping cart page', async ({ page, shoppingCartPage }) => {
  await expect(page).toHaveURL(/\/cart\.html$/);
  await expect(shoppingCartPage.pageTitle).toHaveText('Your Cart');
});

Then('the cart badge should display {string}', async ({ inventoryCartPage }, expectedCount) => {
  await expect(inventoryCartPage.cartBadge).toBeVisible();
  await expect(inventoryCartPage.cartBadge).toHaveText(expectedCount);
});

Then('the cart badge should be hidden', async ({ inventoryCartPage }) => {
  await expect(inventoryCartPage.cartBadge).toHaveCount(0);
});

Then(
  'the product button for {string} should show {string}',
  async ({ inventoryCartPage }, productName, expectedLabel) => {
    await expect(inventoryCartPage.getActionButton(productName)).toHaveText(expectedLabel);
  }
);

Then('the cart should contain items in order:', async ({ shoppingCartPage }, dataTable) => {
  const expectedItems = dataTable.raw().map((row) => row[0]);
  await expect(shoppingCartPage.cartItems).toHaveCount(expectedItems.length);
  expect(await shoppingCartPage.getCartItemTitlesInOrder()).toEqual(expectedItems);
});

Then('the cart should contain {int} item', async ({ shoppingCartPage }, expectedCount) => {
  await expect(shoppingCartPage.cartItems).toHaveCount(expectedCount);
});

Then('the shopping cart should be empty', async ({ shoppingCartPage }) => {
  await expect(shoppingCartPage.cartItems).toHaveCount(0);
});
