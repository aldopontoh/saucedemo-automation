const { test, expect } = require('../fixtures/plpPdpFixtures');

test.describe('Swag Labs - PLP (Product Listing Page)', () => {
  test('PLP-01: Renders Products header and all 6 catalog cards with valid names, descriptions, prices, and images', async ({
    plpPage,
    plpTestData,
  }) => {
    await expect(plpPage.pageTitle).toBeVisible();
    await expect(plpPage.pageTitle).toHaveText(plpTestData.uiText.plpTitle);
    await expect(plpPage.inventoryList).toBeVisible();
    await expect(plpPage.productCards).toHaveCount(plpTestData.expectedProductCount);

    const names = await plpPage.getDisplayedProductNames();
    expect(names).toHaveLength(plpTestData.expectedProductCount);
    for (const product of plpTestData.products) {
      expect(names).toContain(product.name);
    }

    const descriptions = await plpPage.productDescriptions.allInnerTexts();
    expect(descriptions).toHaveLength(plpTestData.expectedProductCount);
    for (const desc of descriptions) {
      expect(desc.trim().length).toBeGreaterThan(10);
    }

    const rawPrices = await plpPage.productPrices.allInnerTexts();
    expect(rawPrices).toHaveLength(plpTestData.expectedProductCount);
    for (const price of rawPrices) {
      expect(price.trim()).toMatch(/^\$\d+\.\d{2}$/);
    }

    const productImages = plpPage.productCards.locator('img');
    await expect(productImages).toHaveCount(plpTestData.expectedProductCount);

    await expect
      .poll(async () =>
        productImages.evaluateAll((imgs) =>
          imgs
            .map((img) => ({
              alt: img.getAttribute('alt') || '',
              src: img.getAttribute('src') || '',
              complete: img.complete,
              naturalWidth: img.naturalWidth,
            }))
            .filter((img) => !img.src || !img.complete || img.naturalWidth <= 0)
        )
      )
      .toEqual([]);
  });

  test('PLP-02: Sort dropdown reorders products accurately across all 4 sort options', async ({
    plpPage,
    plpTestData,
  }) => {
    const expectedAz = [...plpTestData.products].map((p) => p.name).sort((a, b) => a.localeCompare(b));
    const expectedZa = [...expectedAz].reverse();
    const expectedLoHi = [...plpTestData.products].map((p) => p.priceValue).sort((a, b) => a - b);
    const expectedHiLo = [...expectedLoHi].reverse();

    // Default: Name (A to Z)
    await expect(plpPage.sortSelect).toHaveValue(plpTestData.sortOptions.az.value);
    expect(await plpPage.getDisplayedProductNames()).toEqual(expectedAz);

    // Name (Z to A)
    await plpPage.selectSort(plpTestData.sortOptions.za.value);
    await expect(plpPage.sortSelect).toHaveValue(plpTestData.sortOptions.za.value);
    expect(await plpPage.getDisplayedProductNames()).toEqual(expectedZa);

    // Price (low to high)
    await plpPage.selectSort(plpTestData.sortOptions.lohi.value);
    await expect(plpPage.sortSelect).toHaveValue(plpTestData.sortOptions.lohi.value);
    expect(await plpPage.getDisplayedProductPrices()).toEqual(expectedLoHi);

    // Price (high to low)
    await plpPage.selectSort(plpTestData.sortOptions.hilo.value);
    await expect(plpPage.sortSelect).toHaveValue(plpTestData.sortOptions.hilo.value);
    expect(await plpPage.getDisplayedProductPrices()).toEqual(expectedHiLo);

    // Return to Name (A to Z)
    await plpPage.selectSort(plpTestData.sortOptions.az.value);
    expect(await plpPage.getDisplayedProductNames()).toEqual(expectedAz);
  });

  test('PLP-03: Adding and removing multiple products updates button states and cart badge count', async ({
    plpPage,
    plpTestData,
  }) => {
    const first = plpTestData.featuredProduct;
    const second = plpTestData.secondaryProduct;

    await expect(plpPage.cartBadge).toBeHidden();

    // Add first product
    await plpPage.addToCart(first.slug);
    await expect(plpPage.removeButtonFor(first.slug)).toBeVisible();
    await expect(plpPage.cartBadge).toHaveText('1');

    // Add second product
    await plpPage.addToCart(second.slug);
    await expect(plpPage.removeButtonFor(second.slug)).toBeVisible();
    await expect(plpPage.cartBadge).toHaveText('2');

    // Remove first product
    await plpPage.removeFromCart(first.slug);
    await expect(plpPage.addToCartButtonFor(first.slug)).toBeVisible();
    await expect(plpPage.cartBadge).toHaveText('1');

    // Remove second product
    await plpPage.removeFromCart(second.slug);
    await expect(plpPage.addToCartButtonFor(second.slug)).toBeVisible();
    await expect(plpPage.cartBadge).toBeHidden();
  });

  test('PLP-04: Sidebar Reset App State clears cart badge immediately and restores Add to cart after reload', async ({
    plpPage,
    plpTestData,
  }) => {
    const product = plpTestData.featuredProduct;

    await plpPage.addToCart(product.slug);
    await expect(plpPage.cartBadge).toHaveText('1');
    await expect(plpPage.removeButtonFor(product.slug)).toBeVisible();

    await plpPage.resetAppState();
    await expect(plpPage.cartBadge).toBeHidden();

    // Swag Labs updates card CTA labels back to "Add to cart" once /inventory.html reloads
    await plpPage.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(plpPage.cartBadge).toBeHidden();
    await expect(plpPage.addToCartButtonFor(product.slug)).toBeVisible();
  });

  test('PLP-05: Clicking product title or image navigates to its matching PDP', async ({
    plpPage,
    plpTestData,
  }) => {
    const first = plpTestData.featuredProduct;
    const second = plpTestData.secondaryProduct;

    // Navigate via product title
    await plpPage.openProductByTitle(first.id);
    await expect(plpPage.page).toHaveURL(new RegExp(`/inventory-item\\.html\\?id=${first.id}$`));

    // Return to PLP and navigate via product image
    await plpPage.page.goBack();
    await expect(plpPage.page).toHaveURL(/\/inventory\.html$/);
    await plpPage.openProductByImage(second.id);
    await expect(plpPage.page).toHaveURL(new RegExp(`/inventory-item\\.html\\?id=${second.id}$`));
  });

  test('PLP-06: Footer renders copyright notice and social links', async ({ plpPage }) => {
    await expect(plpPage.footer).toBeVisible();
    await expect(plpPage.footerCopy).toContainText(/Sauce Labs\. All Rights Reserved/i);
    await expect(plpPage.socialXLink).toBeVisible();
    await expect(plpPage.socialFacebookLink).toBeVisible();
    await expect(plpPage.socialLinkedInLink).toBeVisible();
  });
});
