class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Locator priority: getByRole > getByTestId > getByLabel > resilient CSS
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorCloseButton = page.getByRole('button', { name: 'Dismiss error' }).or(
      page.getByTestId('error-button')
    );

    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.errorBanner = page.getByTestId('error');
    this.loginCredentialsPanel = page.getByTestId('login-credentials');
    this.loginPasswordPanel = page.getByTestId('login-password');

    this.appLogo = page.locator('.login_logo');
  }

  async goto() {
    await this.page.goto('/');
  }

  async gotoInventoryDirectly() {
    await this.page.goto('/inventory.html');
  }

  /**
   * @param {string} username
   * @param {string} password
   */
  async fillCredentials(username, password) {
    if (username !== undefined && username !== null) {
      await this.usernameInput.fill(username);
    }
    if (password !== undefined && password !== null) {
      await this.passwordInput.fill(password);
    }
  }

  /**
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.fillCredentials(username, password);
    await this.loginButton.click();
  }

  async dismissError() {
    await this.errorCloseButton.click();
  }
}

module.exports = { LoginPage };