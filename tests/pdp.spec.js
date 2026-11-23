const { test, expect } = require('../fixtures/plpPdpFixtures');
const { LoginPage } = require('../pages/LoginPage');
const { PlpPage } = require('../pages/PlpPage');
const { PdpPage } = require('../pages/PdpPage');

test.describe('Swag Labs - PDP (Product Detail Page)', () => {
  test('PDP-01: Product detail page matches PLP card name, description, price, and loaded image', async ({
    plpPage,
    plpTestData,
  }) => {
    const product = plpTestData.featuredProduct;
    const card = plpPage.cardByName(product.name);
    const plpName = (await card.getByTestId('inventory-item-name').innerText()).trim();
    const plpPrice = (await card.getByTestId('inventory-item-price').innerText()).trim();

    await plpPage.openProductByTitle(product.id);
    const pdpPage = new PdpPage(plpPage.page);

    await expect(pdpPage.page).toHaveURL(new RegExp(`/inventory-item\\.html\\?id=${product.id}$`));
    await pdpPage.waitForLoaded();
    await expect(pdpPage.productName).toHaveText(plpName);
    await expect(pdpPage.productPrice).toHaveText(plpPrice);
    await expect(pdpPage.productDescription).toHaveText(product.description);
    await expect(pdpPage.productImage).toBeVisible();
    await expect(pdpPage.productImage).toHaveAttribute('alt', product.name);
    await expect(pdpPage.productImage).toHaveAttribute('src', /.+/);

    await expect
      .poll(async () =>
        pdpPage.productImage.evaluate((img) => ({
          alt: img.getAttribute('alt') || '',
          src: img.getAttribute('src') || '',
          complete: img.complete,
          loaded: img.naturalWidth > 0,
        }))
      )
      .toMatchObject({
        alt: product.name,
        complete: true,
        loaded: true,
      });
  });

  test('PDP-02: Add to cart and Remove buttons toggle state and update cart badge on PDP', async ({
    pdpPage,
    plpTestData,
  }) => {
    const product = plpTestData.featuredProduct;
    await pdpPage.gotoProduct(product.id);

    await expect(pdpPage.addToCartButton).toBeVisible();
    await expect(pdpPage.cartBadge).toBeHidden();

    await pdpPage.addToCart();
    await expect(pdpPage.removeButton).toBeVisible();
    await expect(pdpPage.cartBadge).toHaveText('1');

    await pdpPage.removeFromCart();
    await expect(pdpPage.addToCartButton).toBeVisible();
    await expect(pdpPage.cartBadge).toBeHidden();
  });

  test('PDP-03: Cart state stays synchronized between PDP and PLP across Back to products navigation', async ({
    pdpPage,
    plpTestData,
  }) => {
    const product = plpTestData.featuredProduct;
    await pdpPage.gotoProduct(product.id);

    // Add on PDP and verify reflected on PLP
    await pdpPage.addToCart();
    await expect(pdpPage.cartBadge).toHaveText('1');

    await pdpPage.backToProducts();
    await expect(pdpPage.page).toHaveURL(/\/inventory\.html$/);

    const plpPage = new PlpPage(pdpPage.page);
    await expect(plpPage.cartBadge).toHaveText('1');
    await expect(plpPage.removeButtonFor(product.slug)).toBeVisible();

    // Remove on PLP and verify reflected back on PDP
    await plpPage.removeFromCart(product.slug);
    await expect(plpPage.cartBadge).toBeHidden();

    await plpPage.openProductByTitle(product.id);
    await pdpPage.waitForLoaded();
    await expect(pdpPage.addToCartButton).toBeVisible();
    await expect(pdpPage.cartBadge).toBeHidden();
  });

  test('PDP-04: Direct navigation across multiple product IDs renders distinct details and Back to products returns to PLP', async ({
    pdpPage,
    plpTestData,
  }) => {
    const first = plpTestData.featuredProduct;
    const second = plpTestData.secondaryProduct;

    await pdpPage.gotoProduct(first.id);
    await expect(pdpPage.productName).toHaveText(first.name);
    await expect(pdpPage.productPrice).toHaveText(first.price);

    await pdpPage.gotoProduct(second.id);
    await expect(pdpPage.productName).toHaveText(second.name);
    await expect(pdpPage.productPrice).toHaveText(second.price);

    await pdpPage.backToProducts();
    await expect(pdpPage.page).toHaveURL(/\/inventory\.html$/);
  });

  test('PDP-05: Direct navigation to PDP without active session redirects to login with exact error message', async ({
    page,
    plpTestData,
  }) => {
    await page.goto(plpTestData.pdpPathFor(plpTestData.featuredProduct.id));

    const loginPage = new LoginPage(page);
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(plpTestData.errors.unauthenticatedItem);
  });
});
