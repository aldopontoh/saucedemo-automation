class BaseCatalogPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Landmarks
    this.bannerLandmark = page.getByRole('banner');
    this.mainLandmark = page.getByRole('main');
    this.footerLandmark = page.getByRole('contentinfo');

    // Primary header & sidebar menu
    this.openMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeMenuButton = page.getByRole('button', { name: 'Close Menu' });
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.aboutLink = page.getByTestId('about-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');

    // Cart controls
    this.cartButton = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');

    // Footer
    this.footer = page.getByTestId('footer');
    this.footerCopy = page.getByTestId('footer-copy');
    this.socialXLink = page.getByTestId('social-x');
    this.socialFacebookLink = page.getByTestId('social-facebook');
    this.socialLinkedInLink = page.getByTestId('social-linkedin');
  }

  async goto(path) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async openMenu() {
    await this.openMenuButton.click();
  }

  async closeMenu() {
    await this.closeMenuButton.click();
  }

  async resetAppState() {
    await this.openMenu();
    await this.resetAppStateLink.click();
    await this.closeMenu();
  }

  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async getCartBadgeCount() {
    if ((await this.cartBadge.count()) === 0) {
      return 0;
    }
    const text = (await this.cartBadge.innerText()).trim();
    return Number(text);
  }
}

module.exports = { BaseCatalogPage };
