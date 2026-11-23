const { BaseCatalogPage } = require('./BaseCatalogPage');

class DynamicCatalogPage extends BaseCatalogPage {
  /**
   * Page Object for Swag Labs Dynamic Catalog views (Lazy Load, Spinner, Slider).
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.pageTitle = page.getByTestId('title');

    // Lazy Load (/dynamic-catalog-lazy-load.html)
    this.lazyLoadContainer = page.getByTestId('dynamic-catalog-lazy-load-container');
    this.lazyLoadItemNames = this.lazyLoadContainer.locator(
      '[data-test^="lazy-load-item-"][data-test$="-name"]'
    );
    this.lazyLoadItemPrices = this.lazyLoadContainer.locator(
      '[data-test^="lazy-load-item-"][data-test$="-price"]'
    );
    this.lazyLoadPlaceholders = this.lazyLoadContainer.locator(
      '[data-test^="lazy-load-item-"][data-test$="-placeholder"]'
    );

    // Spinner (/dynamic-catalog-spinner.html)
    this.spinner = page.getByTestId('dynamic-catalog-spinner');
    this.spinnerContainer = page.getByTestId('dynamic-catalog-spinner-container');
    this.spinnerGrid = page.getByTestId('dynamic-catalog-spinner-grid');
    this.spinnerItemNames = this.spinnerGrid.locator(
      '[data-test^="spinner-item-"][data-test$="-name"]'
    );
    this.spinnerItemPrices = this.spinnerGrid.locator(
      '[data-test^="spinner-item-"][data-test$="-price"]'
    );
    this.spinnerItemImages = this.spinnerGrid.locator(
      '[data-test^="spinner-item-"][data-test$="-img"]'
    );

    // Slider (/dynamic-catalog-slider.html)
    this.sliderContainer = page.getByTestId('dynamic-catalog-slider-container');
    this.sliderItem = page.getByTestId('dynamic-catalog-slider-item');
    this.sliderImage = page.getByTestId('dynamic-catalog-slider-item-img');
    this.sliderName = page.getByTestId('dynamic-catalog-slider-item-name');
    this.sliderPrice = page.getByTestId('dynamic-catalog-slider-item-price');
    this.sliderDotsContainer = page.getByTestId('dynamic-catalog-slider-dots');
    this.sliderDots = this.sliderDotsContainer.getByRole('button');
  }

  async gotoLazyLoad() {
    await this.goto('/dynamic-catalog-lazy-load.html');
  }

  async gotoSpinner() {
    await this.goto('/dynamic-catalog-spinner.html');
  }

  async gotoSlider() {
    await this.goto('/dynamic-catalog-slider.html');
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * @param {number} index
   */
  sliderDot(index) {
    return this.page.getByTestId(`dynamic-catalog-slider-dot-${index}`);
  }

  /**
   * @param {string} productName
   */
  sliderDotByProduct(productName) {
    return this.sliderDotsContainer.getByRole('button', { name: `Show ${productName}` });
  }

  /**
   * @param {number} index
   */
  async clickSliderDot(index) {
    await this.sliderDot(index).click();
  }

  /**
   * @param {string} productName
   */
  async clickSliderDotForProduct(productName) {
    await this.sliderDotByProduct(productName).click();
  }
}

module.exports = { DynamicCatalogPage };
