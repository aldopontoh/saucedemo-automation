const { expect } = require('@playwright/test');
const { When, Then } = require('../fixtures/bddFixtures');

When('I proceed to checkout', async ({ shoppingCartPage }) => {
  await shoppingCartPage.clickCheckout();
});

When('I continue checkout without entering customer information', async ({ checkoutPage }) => {
  await checkoutPage.clickContinue();
});

When(
  'I fill checkout info with first name {string}, last name {string}, and postal code {string}',
  async ({ checkoutPage }, firstName, lastName, postalCode) => {
    await checkoutPage.fillCustomerInfo(firstName, lastName, postalCode);
  }
);

When('I click Continue on checkout step one', async ({ checkoutPage }) => {
  await checkoutPage.clickContinue();
});

When('I cancel checkout on step one', async ({ checkoutPage }) => {
  await checkoutPage.clickStepOneCancel();
});

When('I cancel checkout on step two', async ({ checkoutPage }) => {
  await checkoutPage.clickStepTwoCancel();
});

When('I finish the checkout order', async ({ checkoutPage }) => {
  await checkoutPage.clickFinish();
});

Then('I should be on checkout step one', async ({ page }) => {
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
});

Then('I should be on checkout step two', async ({ page }) => {
  await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
});

Then('I should be on the checkout complete page', async ({ page }) => {
  await expect(page).toHaveURL(/\/checkout-complete\.html$/);
});

Then(
  'I should see the checkout error message {string}',
  async ({ checkoutPage }, expectedMessage) => {
    await expect(checkoutPage.errorBanner).toBeVisible();
    await expect(checkoutPage.errorBanner).toHaveText(expectedMessage);
  }
);

Then(
  'the checkout overview should show item total {string}, tax {string}, and total {string}',
  async ({ checkoutPage }, itemTotal, tax, total) => {
    await expect(checkoutPage.itemTotalLabel).toHaveText(itemTotal);
    await expect(checkoutPage.taxLabel).toHaveText(tax);
    await expect(checkoutPage.totalLabel).toHaveText(total);
  }
);

Then(
  'the order confirmation header should display {string}',
  async ({ checkoutPage }, expectedHeader) => {
    await expect(checkoutPage.completeHeader).toHaveText(expectedHeader);
  }
);
