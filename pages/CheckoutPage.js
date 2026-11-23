class CheckoutPage {
  /**
   * Consolidated POM covering Checkout Step 1, Step 2, and Order Complete.
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Step 1: Your Information (/checkout-step-one.html)
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.firstNameFieldErrorIcon = page.locator('[data-test="firstName"] + svg.error_icon');
    this.errorBanner = page.getByTestId('error');
    this.continueButton = page.getByTestId('continue');
    this.stepOneCancelButton = page.getByTestId('cancel');

    // Step 2: Overview & Total Calculations (/checkout-step-two.html)
    this.summaryCartList = page.getByTestId('cart-list');
    this.summaryCartItems = this.summaryCartList.getByTestId('inventory-item');
    this.paymentInfo = page.getByTestId('payment-info-value');
    this.shippingInfo = page.getByTestId('shipping-info-value');
    this.itemTotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.stepTwoCancelButton = page.getByTestId('cancel');
    this.finishButton = page.getByTestId('finish');

    // Order Complete (/checkout-complete.html)
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.checkmarkIcon = page.getByTestId('pony-express');
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.backHomeButton = page.getByTestId('back-to-products');
    this.generatePdfButton = page.getByTestId('generate-pdf-order');
  }

  async gotoStepOne(path = '/checkout-step-one.html') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async fillCustomerInfo(firstName, lastName, postalCode) {
    if (firstName !== undefined) {
      await this.firstNameInput.fill(firstName);
    }
    if (lastName !== undefined) {
      await this.lastNameInput.fill(lastName);
    }
    if (postalCode !== undefined) {
      await this.postalCodeInput.fill(postalCode);
    }
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async clickStepOneCancel() {
    await this.stepOneCancelButton.click();
  }

  async clickStepTwoCancel() {
    await this.stepTwoCancelButton.click();
  }

  async clickFinish() {
    await this.finishButton.click();
  }

  async clickBackHome() {
    await this.backHomeButton.click();
  }

  async clickGeneratePdfOrder() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.generatePdfButton.click(),
    ]);
    return download;
  }
}

module.exports = { CheckoutPage };
