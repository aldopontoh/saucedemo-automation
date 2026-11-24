const { expect } = require('@playwright/test');
const { When, Then } = require('../fixtures/bddFixtures');

When('I sort the catalog by {string}', async ({ plpPage }, sortValue) => {
  await plpPage.selectSort(sortValue);
});

Then('the active sort option should be {string}', async ({ plpPage }, expectedSort) => {
  await expect(plpPage.sortSelect).toHaveValue(expectedSort);
});

Then(
  'the catalog product names should be sorted in {string} alphabetical order',
  async ({ plpPage }, direction) => {
    const displayedNames = await plpPage.getDisplayedProductNames();
    const expectedOrder = [...displayedNames].sort((a, b) => a.localeCompare(b));
    if (direction === 'descending') {
      expectedOrder.reverse();
    }
    expect(displayedNames).toEqual(expectedOrder);
  }
);

Then(
  'the catalog product prices should be sorted numerically {string}',
  async ({ plpPage }, direction) => {
    const displayedPrices = await plpPage.getDisplayedProductPrices();
    const expectedOrder = [...displayedPrices].sort((a, b) =>
      direction === 'descending' ? b - a : a - b
    );
    expect(displayedPrices).toEqual(expectedOrder);
  }
);

Then(
  'the first displayed product price should be {float} and the last should be {float}',
  async ({ plpPage }, expectedFirst, expectedLast) => {
    const displayedPrices = await plpPage.getDisplayedProductPrices();
    expect(displayedPrices[0]).toBe(expectedFirst);
    expect(displayedPrices[displayedPrices.length - 1]).toBe(expectedLast);
  }
);
