const { BaseCatalogPage } = require('./BaseCatalogPage');

class PlpPage extends BaseCatalogPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.pageTitle = page.getByTestId('title');
    this.sortSelect = page.getByRole('combobox', { name: 'Sort products' });
    this.inventoryList = page.getByTestId('inventory-list');
    this.productCards = this.inventoryList.getByTestId('inventory-item');
    this.productNames = this.inventoryList.getByTestId('inventory-item-name');
    this.productDescriptions = this.inventoryList.locator(
      '[data-test="inventory-item-desc"], .inventory_item_desc'
    );
    this.productPrices = this.inventoryList.getByTestId('inventory-item-price');
  }

  /**
   * @param {string} productName
   */
  cardByName(productName) {
    return this.productCards
      .filter({
        has: this.page.getByTestId('inventory-item-name').filter({ hasText: productName }),
      })
      .first();
  }

  /**
   * @param {string} slug
   */
  addToCartButtonFor(slug) {
    return this.page.getByTestId(`add-to-cart-${slug}`);
  }

  /**
   * @param {string} slug
   */
  removeButtonFor(slug) {
    return this.page.getByTestId(`remove-${slug}`);
  }

  /**
   * @param {string} slug
   */
  async addToCart(slug) {
    await this.addToCartButtonFor(slug).click();
  }

  /**
   * @param {string} slug
   */
  async removeFromCart(slug) {
    await this.removeButtonFor(slug).click();
  }

  /**
   * @param {'az' | 'za' | 'lohi' | 'hilo'} sortValue
   */
  async selectSort(sortValue) {
    await this.sortSelect.selectOption(sortValue);
  }

  async getDisplayedProductNames() {
    const names = await this.productNames.allInnerTexts();
    return names.map((name) => name.trim());
  }

  async getDisplayedProductPrices() {
    const rawPrices = await this.productPrices.allInnerTexts();
    return rawPrices.map((price) => Number(price.replace(/[^0-9.]/g, '')));
  }

  /**
   * @param {number} productId
   */
  async openProductByTitle(productId) {
    await this.page.getByTestId(`item-${productId}-title-link`).click();
  }

  /**
   * @param {number} productId
   */
  async openProductByImage(productId) {
    await this.page.getByTestId(`item-${productId}-img-link`).click();
  }
}

module.exports = { PlpPage };
