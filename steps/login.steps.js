const { expect } = require('@playwright/test');
const { Given, When, Then } = require('../fixtures/bddFixtures');
const { LOGIN_DATA } = require('../fixtures/loginData');

Given('I am on the Swag Labs login page', async ({ loginPage }) => {
  await loginPage.goto();
});

Given('I am logged in as {string} on the inventory page', async ({ page, loginPage }, username) => {
  await loginPage.goto();
  await loginPage.login(username, LOGIN_DATA.password);
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(page.getByTestId('inventory-list')).toBeVisible();
});

When(
  'I log in with username {string} and password {string}',
  async ({ loginPage }, username, password) => {
    await loginPage.login(username, password);
  }
);

When('I dismiss the login error banner', async ({ loginPage }) => {
  await loginPage.dismissError();
});

When('I navigate directly to {string} without logging in', async ({ page }, targetPath) => {
  await page.goto(targetPath);
});

Then('I should be redirected to the inventory page', async ({ page }) => {
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(page.getByTestId('inventory-list')).toBeVisible();
});

Then('I should remain on the login page', async ({ page, loginPage }) => {
  await expect(page).toHaveURL(/\/$/);
  await expect(loginPage.loginButton).toBeVisible();
});

Then('the catalog should display {int} products', async ({ plpPage }, expectedCount) => {
  await expect(plpPage.productCards).toHaveCount(expectedCount);
});

Then('I should see the login error message {string}', async ({ loginPage }, expectedMessage) => {
  await expect(loginPage.errorBanner).toBeVisible();
  await expect(loginPage.errorBanner).toHaveText(expectedMessage);
});

Then('the login error banner should be hidden', async ({ loginPage }) => {
  await expect(loginPage.errorBanner).toBeHidden();
});
