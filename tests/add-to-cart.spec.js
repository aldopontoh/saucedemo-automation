const { test, expect } = require('../fixtures/cartFixtures');
const { LOGIN_DATA } = require('../fixtures/loginData');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryCartPage } = require('../pages/InventoryCartPage');
const { ShoppingCartPage } = require('../pages/ShoppingCartPage');

test.describe('Add to Cart & Shopping Cart Experience', () => {
  test('TC-01: Add single product from catalog updates CTA to Remove and sets badge to 1 without reload', async ({
    inventoryCartPage,
    cartTestData,
  }) => {
    await expect(inventoryCartPage.cartBadge).toHaveCount(0);
    await expect(inventoryCartPage.cartLink).toHaveAccessibleName(cartTestData.uiText.emptyCartLabel);

    await inventoryCartPage.clickAddToCart(cartTestData.primaryItem.name);

    await expect(inventoryCartPage.getActionButton(cartTestData.primaryItem.name)).toHaveText(
      /^remove$/i
    );
    await expect(inventoryCartPage.cartBadge).toBeVisible();
    await expect(inventoryCartPage.cartBadge).toHaveText('1');
    await expect(inventoryCartPage.cartLink).toHaveAccessibleName(/Cart,\s*1\s*items?/i);
  });

  test('TC-02: Add multiple SKUs and remove one SKU updates badge and reverts CTA state', async ({
    inventoryCartPage,
    cartTestData,
  }) => {
    await inventoryCartPage.clickAddToCart(cartTestData.primaryItem.name);
    await inventoryCartPage.clickAddToCart(cartTestData.secondaryItem.name);
    await expect(inventoryCartPage.cartBadge).toHaveText('2');

    await inventoryCartPage.clickRemove(cartTestData.primaryItem.name);
    await expect(inventoryCartPage.getActionButton(cartTestData.primaryItem.name)).toHaveText(
      /^add to cart$/i
    );
    await expect(inventoryCartPage.cartBadge).toHaveText('1');
  });

  test('TC-03: Cart page displays taxonomy, chronological item order, and persists across reload', async ({
    inventoryCartPage,
    shoppingCartPage,
    cartTestData,
  }) => {
    await inventoryCartPage.clickAddToCart(cartTestData.primaryItem.name);
    await inventoryCartPage.clickAddToCart(cartTestData.secondaryItem.name);

    await inventoryCartPage.openCart();
    await expect(shoppingCartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(shoppingCartPage.pageTitle).toHaveText(cartTestData.uiText.cartTitle);
    await expect(shoppingCartPage.qtyHeader).toHaveText(cartTestData.uiText.qtyHeader);
    await expect(shoppingCartPage.descriptionHeader).toHaveText(cartTestData.uiText.descriptionHeader);
    await expect(shoppingCartPage.cartItems).toHaveCount(2);

    const orderedTitles = await shoppingCartPage.getCartItemTitlesInOrder();
    expect(orderedTitles).toEqual([
      cartTestData.primaryItem.name,
      cartTestData.secondaryItem.name,
    ]);

    const firstRow = shoppingCartPage.itemRowByName(cartTestData.primaryItem.name);
    await expect(firstRow.getByTestId('inventory-item-price')).toHaveText(
      cartTestData.primaryItem.priceText
    );
    await expect(firstRow.getByTestId('item-quantity')).toHaveText('1');

    await shoppingCartPage.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(shoppingCartPage.cartItems).toHaveCount(2);
    expect(await shoppingCartPage.getCartItemTitlesInOrder()).toEqual([
      cartTestData.primaryItem.name,
      cartTestData.secondaryItem.name,
    ]);
    await expect(shoppingCartPage.cartBadge).toHaveText('2');
  });

  test('TC-04: Remove line item on cart page syncs to inventory and shows empty cart headers & hidden badge', async ({
    inventoryCartPage,
    shoppingCartPage,
    cartTestData,
  }) => {
    await inventoryCartPage.clickAddToCart(cartTestData.primaryItem.name);
    await inventoryCartPage.openCart();

    await shoppingCartPage.removeItemByName(cartTestData.primaryItem.name);
    await expect(shoppingCartPage.cartItems).toHaveCount(0);
    await expect(shoppingCartPage.qtyHeader).toBeVisible();
    await expect(shoppingCartPage.descriptionHeader).toBeVisible();
    await expect(shoppingCartPage.cartBadge).toHaveCount(0);
    await expect(shoppingCartPage.cartLink).toHaveAccessibleName(cartTestData.uiText.emptyCartLabel);

    await shoppingCartPage.clickContinueShopping();
    await expect(inventoryCartPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryCartPage.getActionButton(cartTestData.primaryItem.name)).toHaveText(
      /^add to cart$/i
    );
  });

  test('TC-05: Continue Shopping retains cart items and Checkout CTA navigates to checkout step one', async ({
    inventoryCartPage,
    shoppingCartPage,
    cartTestData,
  }) => {
    await inventoryCartPage.clickAddToCart(cartTestData.primaryItem.name);
    await inventoryCartPage.openCart();

    await shoppingCartPage.clickContinueShopping();
    await expect(inventoryCartPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryCartPage.cartBadge).toHaveText('1');

    await inventoryCartPage.openCart();
    await expect(shoppingCartPage.checkoutButton).toBeVisible();
    await expect(shoppingCartPage.checkoutButton).toBeEnabled();
    await shoppingCartPage.clickCheckout();
    await expect(shoppingCartPage.page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('TC-06: Unauthenticated /cart.html access redirects with exact error and authenticated cart updates accessible label', async ({
    page,
    cartTestData,
  }) => {
    // Unauthenticated direct access to /cart.html redirects to login with exact error message
    await page.goto(cartTestData.cartPath);
    const loginPage = new LoginPage(page);
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(cartTestData.errors.unauthenticatedCart);

    // Authenticate and verify accessible cart label transitions across add, view cart, and remove
    await loginPage.login(LOGIN_DATA.users.standard, LOGIN_DATA.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    const inventoryCartPage = new InventoryCartPage(page);
    const shoppingCartPage = new ShoppingCartPage(page);

    await expect(inventoryCartPage.cartLink).toHaveAccessibleName(cartTestData.uiText.emptyCartLabel);

    await inventoryCartPage.clickAddToCart(cartTestData.primaryItem.name);
    await expect(inventoryCartPage.cartLink).toHaveAccessibleName(/Cart,\s*1\s*items?/i);

    await inventoryCartPage.openCart();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(shoppingCartPage.cartLink).toHaveAccessibleName(/Cart,\s*1\s*items?/i);

    await shoppingCartPage.removeItemByName(cartTestData.primaryItem.name);
    await expect(shoppingCartPage.cartLink).toHaveAccessibleName(cartTestData.uiText.emptyCartLabel);
  });
});
