const { test, expect } = require('../fixtures/supplementaryFixtures');

test.describe('Swag Labs - Module 2: Product Sorting & Cart Preservation', () => {
  test('SRT-01: Price (low to high) sorts numerically ascending ($7.99 -> $9.99 -> $49.99) rather than lexically', async ({
    plpPage,
    supplementaryData,
  }) => {
    const expectedNumericAsc = [...supplementaryData.sorting.products]
      .map((p) => p.priceValue)
      .sort((a, b) => a - b);

    await plpPage.selectSort(supplementaryData.sorting.sortOptions.lohi.value);
    await expect(plpPage.sortSelect).toHaveValue('lohi');

    const displayedPrices = await plpPage.getDisplayedProductPrices();
    expect(displayedPrices).toEqual(expectedNumericAsc);
    // Explicitly assert numeric float ordering ($7.99 < $9.99 < $15.99 < $49.99)
    expect(displayedPrices[0]).toBe(7.99);
    expect(displayedPrices[1]).toBe(9.99);
    expect(displayedPrices[displayedPrices.length - 1]).toBe(49.99);
  });

  test('SRT-02: Price (high to low) sorts numerically descending ($49.99 -> $29.99 -> $7.99) as exact inverse of lohi', async ({
    plpPage,
    supplementaryData,
  }) => {
    const expectedNumericDesc = [...supplementaryData.sorting.products]
      .map((p) => p.priceValue)
      .sort((a, b) => b - a);

    await plpPage.selectSort(supplementaryData.sorting.sortOptions.hilo.value);
    await expect(plpPage.sortSelect).toHaveValue('hilo');

    const displayedPrices = await plpPage.getDisplayedProductPrices();
    expect(displayedPrices).toEqual(expectedNumericDesc);
    expect(displayedPrices[0]).toBe(49.99);
    expect(displayedPrices[1]).toBe(29.99);
    expect(displayedPrices[displayedPrices.length - 1]).toBe(7.99);
  });

  test('SRT-03: Name (A to Z) default and Name (Z to A) enforce exact alphabetical inverse order', async ({
    plpPage,
    supplementaryData,
  }) => {
    const expectedAz = [...supplementaryData.sorting.products]
      .map((p) => p.name)
      .sort((a, b) => a.localeCompare(b));
    const expectedZa = [...expectedAz].reverse();

    await expect(plpPage.sortSelect).toHaveValue('az');
    expect(await plpPage.getDisplayedProductNames()).toEqual(expectedAz);

    await plpPage.selectSort(supplementaryData.sorting.sortOptions.za.value);
    await expect(plpPage.sortSelect).toHaveValue('za');
    expect(await plpPage.getDisplayedProductNames()).toEqual(expectedZa);
  });

  test('SRT-04: Switching across all 4 sort modes preserves cart badge count and exact Remove CTA bindings per SKU', async ({
    plpPage,
    shoppingCartPage,
    supplementaryData,
  }) => {
    const { featuredSlug, featuredName, cheapestSlug, cheapestName, unaddedSlug } =
      supplementaryData.sorting;

    await plpPage.addToCart(featuredSlug);
    await plpPage.addToCart(cheapestSlug);
    await expect(plpPage.cartBadge).toHaveText('2');

    for (const sortMode of ['za', 'lohi', 'hilo', 'az']) {
      await plpPage.selectSort(sortMode);
      await expect(plpPage.sortSelect).toHaveValue(sortMode);

      // Badge count and exact SKU button bindings must remain intact after reordering
      await expect(plpPage.cartBadge).toHaveText('2');
      await expect(plpPage.removeButtonFor(featuredSlug)).toBeVisible();
      await expect(plpPage.removeButtonFor(cheapestSlug)).toBeVisible();
      await expect(plpPage.addToCartButtonFor(unaddedSlug)).toBeVisible();
    }

    // Confirm both added SKUs are still intact in /cart.html
    await plpPage.cartButton.click();
    await expect(shoppingCartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(shoppingCartPage.cartItems).toHaveCount(2);
    expect(await shoppingCartPage.getCartItemTitlesInOrder()).toEqual([featuredName, cheapestName]);
  });
});
