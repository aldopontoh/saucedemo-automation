const { test, expect } = require('../fixtures/plpPdpFixtures');

test.describe('Swag Labs - Accessibility & Page Metadata (PLP & PDP)', () => {
  test('A11Y-01: PLP exposes document title, semantic landmarks, accessible controls, and product image alt text', async ({
    plpPage,
    plpTestData,
  }) => {
    await expect(plpPage.page).toHaveTitle(plpTestData.uiText.pageTitle);

    await expect(plpPage.bannerLandmark).toBeVisible();
    await expect(plpPage.mainLandmark).toBeVisible();
    await expect(plpPage.footerLandmark).toBeVisible();

    await expect(plpPage.openMenuButton).toBeVisible();
    await expect(plpPage.sortSelect).toBeVisible();
    await expect(plpPage.cartButton).toHaveAccessibleName(plpTestData.uiText.emptyCartLabel);

    await expect(plpPage.productCards).toHaveCount(plpTestData.expectedProductCount);
    const imgAlts = await plpPage.productCards.locator('img').evaluateAll((imgs) =>
      imgs.map((img) => (img.getAttribute('alt') || '').trim())
    );
    expect(imgAlts).toHaveLength(plpTestData.expectedProductCount);
    for (const alt of imgAlts) {
      expect(alt.length).toBeGreaterThan(0);
    }
  });

  test('A11Y-02: PLP cart button accessible name updates dynamically and cards expose View details controls', async ({
    plpPage,
    plpTestData,
  }) => {
    const product = plpTestData.featuredProduct;

    const detailsButtons = plpPage.page.getByRole('button', {
      name: `View details for ${product.name}`,
    });
    await expect(detailsButtons.first()).toBeVisible();
    await expect(detailsButtons).toHaveCount(2);

    await expect(plpPage.cartButton).toHaveAccessibleName(plpTestData.uiText.emptyCartLabel);

    await plpPage.addToCart(product.slug);
    await expect(plpPage.cartButton).toHaveAccessibleName(/Cart,\s*1\s*items?/i);

    await plpPage.removeFromCart(product.slug);
    await expect(plpPage.cartButton).toHaveAccessibleName(plpTestData.uiText.emptyCartLabel);
  });

  test('A11Y-03: PDP exposes document title, semantic landmarks, accessible action buttons, and matching image alt text', async ({
    pdpPage,
    plpTestData,
  }) => {
    const product = plpTestData.featuredProduct;
    await pdpPage.gotoProduct(product.id);

    await expect(pdpPage.page).toHaveTitle(plpTestData.uiText.pageTitle);
    await expect(pdpPage.bannerLandmark).toBeVisible();
    await expect(pdpPage.mainLandmark).toBeVisible();
    await expect(pdpPage.footerLandmark).toBeVisible();

    await expect(pdpPage.backToProductsButton).toBeVisible();
    await expect(pdpPage.addToCartButton).toBeVisible();
    await expect(pdpPage.productImage).toHaveAttribute('alt', product.name);
  });
});
