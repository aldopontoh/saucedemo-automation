class InventoryCartPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.inventoryList = page.getByTestId('inventory-list');
    this.inventoryItems = this.inventoryList.getByTestId('inventory-item');
  }

  async goto(path = '/inventory.html') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  cardByProductName(productName) {
    return this.inventoryItems.filter({ hasText: productName }).first();
  }

  async clickAddToCart(productName) {
    const card = this.cardByProductName(productName);
    await card.getByRole('button', { name: /^add to cart$/i }).click();
  }

  async clickRemove(productName) {
    const card = this.cardByProductName(productName);
    await card.getByRole('button', { name: /^remove$/i }).click();
  }

  getActionButton(productName) {
    const card = this.cardByProductName(productName);
    return card.getByRole('button', { name: /^(add to cart|remove)$/i });
  }

  async openCart() {
    await this.cartLink.click();
  }
}

module.exports = { InventoryCartPage };
