const { BaseCatalogPage } = require('./BaseCatalogPage');

class PdpPage extends BaseCatalogPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.backToProductsButton = page.getByRole('button', { name: 'Back to products' });
    this.productImage = page.locator('img.inventory_details_img');
    this.productContainer = page
      .getByTestId('inventory-item')
      .filter({ has: this.productImage });
    this.productName = this.productContainer.getByTestId('inventory-item-name');
    this.productDescription = this.productContainer.getByTestId('inventory-item-desc');
    this.productPrice = this.productContainer.getByTestId('inventory-item-price');
    this.addToCartButton = this.productContainer.getByTestId('add-to-cart');
    this.removeButton = this.productContainer.getByTestId('remove');
  }

  async waitForLoaded() {
    await this.backToProductsButton.waitFor({ state: 'visible' });
    await this.productImage.waitFor({ state: 'visible' });
  }

  /**
   * @param {number} productId
   */
  async gotoProduct(productId) {
    await this.goto(`/inventory-item.html?id=${productId}`);
    await this.waitForLoaded();
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async removeFromCart() {
    await this.removeButton.click();
  }

  async backToProducts() {
    await this.backToProductsButton.click();
  }
}

module.exports = { PdpPage };
