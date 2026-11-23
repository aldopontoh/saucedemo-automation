class SidebarPage {
  /**
   * Page Object for the Swag Labs slide-out burger menu drawer across authenticated routes.
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.menuWrap = page.locator('.bm-menu-wrap');
    this.overlay = page.locator('.bm-overlay');
    this.openButton = page.locator('#react-burger-menu-btn');
    this.closeButton = page.locator('#react-burger-cross-btn');

    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.dynamicCatalogToggle = page.getByTestId('dynamic-catalog-sidebar-link');
    this.dynamicCatalogSubmenu = page.getByTestId('dynamic-catalog-submenu');
    this.lazyLoadLink = page.getByTestId('dynamic-catalog-lazy-load-link');
    this.spinnerLink = page.getByTestId('dynamic-catalog-spinner-link');
    this.sliderLink = page.getByTestId('dynamic-catalog-slider-link');
    this.aboutLink = page.getByTestId('about-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');

    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async open() {
    await this.openButton.click();
    await this.allItemsLink.waitFor({ state: 'visible' });
  }

  async close() {
    await this.closeButton.click();
    await this.allItemsLink.waitFor({ state: 'hidden' });
  }

  async clickAllItems() {
    await this.open();
    await this.allItemsLink.click();
  }

  async clickLogout() {
    await this.open();
    await this.logoutLink.click();
  }

  async clickResetAppState() {
    await this.open();
    await this.resetAppStateLink.click();
    await this.close();
  }

  async openDynamicCatalogSubmenu() {
    await this.open();
    if (!(await this.dynamicCatalogSubmenu.isVisible())) {
      await this.dynamicCatalogToggle.click();
    }
    await this.dynamicCatalogSubmenu.waitFor({ state: 'visible' });
  }

  /**
   * @param {'lazy-load' | 'spinner' | 'slider'} view
   */
  async openDynamicCatalogView(view) {
    await this.openDynamicCatalogSubmenu();
    const targetMap = {
      'lazy-load': this.lazyLoadLink,
      spinner: this.spinnerLink,
      slider: this.sliderLink,
    };
    await targetMap[view].click();
  }
}

module.exports = { SidebarPage };
