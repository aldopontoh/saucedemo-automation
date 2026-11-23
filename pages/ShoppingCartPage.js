class ShoppingCartPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.pageTitle = page.getByTestId('title');
    this.qtyHeader = page.getByTestId('cart-quantity-label');
    this.descriptionHeader = page.getByTestId('cart-desc-label');
    this.cartList = page.getByTestId('cart-list');
    this.cartItems = this.cartList.getByTestId('inventory-item');
    this.cartQuantities = this.cartList.getByTestId('item-quantity');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto(path = '/cart.html') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  itemRowByName(productName) {
    return this.cartItems.filter({ hasText: productName }).first();
  }

  async removeItemByName(productName) {
    const row = this.itemRowByName(productName);
    await row.getByRole('button', { name: /^remove$/i }).click();
  }

  async getCartItemTitlesInOrder() {
    const titles = await this.cartItems.getByTestId('inventory-item-name').allInnerTexts();
    return titles.map((title) => title.trim());
  }

  async clickContinueShopping() {
    await this.continueShoppingButton.click();
  }

  async clickCheckout() {
    await this.checkoutButton.click();
  }
}

module.exports = { ShoppingCartPage };
