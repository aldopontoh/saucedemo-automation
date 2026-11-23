const { test, expect } = require('../fixtures/checkoutFixtures');
const { LoginPage } = require('../pages/LoginPage');

test.describe('End-to-End Checkout & Order Complete Workflow', () => {
  test('TC-01: Step 1 sequential required-field validation, red x icon, and alphanumeric postal code', async ({
    inventoryCartPage,
    shoppingCartPage,
    checkoutPage,
    checkoutTestData,
  }) => {
    await inventoryCartPage.clickAddToCart(checkoutTestData.singleItem.name);
    await inventoryCartPage.openCart();
    await shoppingCartPage.clickCheckout();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-step-one\.html$/);

    await checkoutPage.clickContinue();
    await expect(checkoutPage.errorBanner).toBeVisible();
    await expect(checkoutPage.errorBanner).toHaveText(checkoutTestData.errors.firstNameRequired);
    await expect(checkoutPage.firstNameFieldErrorIcon).toBeVisible();

    await checkoutPage.fillCustomerInfo(checkoutTestData.customer.firstName, '', '');
    await checkoutPage.clickContinue();
    await expect(checkoutPage.errorBanner).toBeVisible();
    await expect(checkoutPage.errorBanner).toHaveText(checkoutTestData.errors.lastNameRequired);

    await checkoutPage.fillCustomerInfo(
      checkoutTestData.customer.firstName,
      checkoutTestData.customer.lastName,
      ''
    );
    await checkoutPage.clickContinue();
    await expect(checkoutPage.errorBanner).toBeVisible();
    await expect(checkoutPage.errorBanner).toHaveText(checkoutTestData.errors.postalCodeRequired);

    await checkoutPage.fillCustomerInfo(
      checkoutTestData.customer.firstName,
      checkoutTestData.customer.lastName,
      checkoutTestData.customer.alphanumericPostalCode
    );
    await checkoutPage.clickContinue();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  test('TC-02: Single-item checkout overview totals ($29.99, $2.40, $32.39) and Finish flow', async ({
    inventoryCartPage,
    shoppingCartPage,
    checkoutPage,
    checkoutTestData,
  }) => {
    await inventoryCartPage.clickAddToCart(checkoutTestData.singleItem.name);
    await inventoryCartPage.openCart();
    await shoppingCartPage.clickCheckout();

    await checkoutPage.fillCustomerInfo(
      checkoutTestData.customer.firstName,
      checkoutTestData.customer.lastName,
      checkoutTestData.customer.postalCode
    );
    await checkoutPage.clickContinue();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-step-two\.html$/);

    await expect(checkoutPage.summaryCartItems).toHaveCount(1);
    await expect(checkoutPage.paymentInfo).toHaveText(checkoutTestData.summaryLabels.paymentInfo);
    await expect(checkoutPage.shippingInfo).toHaveText(checkoutTestData.summaryLabels.shippingInfo);
    await expect(checkoutPage.itemTotalLabel).toHaveText(checkoutTestData.singleItem.itemTotalText);
    await expect(checkoutPage.taxLabel).toHaveText(checkoutTestData.singleItem.taxText);
    await expect(checkoutPage.totalLabel).toHaveText(checkoutTestData.singleItem.totalText);

    await checkoutPage.clickFinish();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutPage.cartBadge).toHaveCount(0);
  });

  test('TC-03: Multi-item (4 SKUs) checkout renders 4 items and totals ($105.96, $8.48, $114.44)', async ({
    inventoryCartPage,
    shoppingCartPage,
    checkoutPage,
    checkoutTestData,
  }) => {
    for (const skuName of checkoutTestData.multiItems.names) {
      await inventoryCartPage.clickAddToCart(skuName);
    }
    await expect(inventoryCartPage.cartBadge).toHaveText(
      String(checkoutTestData.multiItems.expectedCount)
    );

    await inventoryCartPage.openCart();
    await shoppingCartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo(
      checkoutTestData.customer.firstName,
      checkoutTestData.customer.lastName,
      checkoutTestData.customer.postalCode
    );
    await checkoutPage.clickContinue();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-step-two\.html$/);

    await expect(checkoutPage.summaryCartItems).toHaveCount(
      checkoutTestData.multiItems.expectedCount
    );
    await expect(checkoutPage.itemTotalLabel).toHaveText(checkoutTestData.multiItems.itemTotalText);
    await expect(checkoutPage.taxLabel).toHaveText(checkoutTestData.multiItems.taxText);
    await expect(checkoutPage.totalLabel).toHaveText(checkoutTestData.multiItems.totalText);

    await checkoutPage.clickFinish();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutPage.cartBadge).toHaveCount(0);
  });

  test('TC-04: Cancel on Step 1 and Step 2 preserves cart contents', async ({
    inventoryCartPage,
    shoppingCartPage,
    checkoutPage,
    checkoutTestData,
  }) => {
    await inventoryCartPage.clickAddToCart(checkoutTestData.singleItem.name);
    await inventoryCartPage.openCart();
    await shoppingCartPage.clickCheckout();

    await checkoutPage.clickStepOneCancel();
    await expect(shoppingCartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(shoppingCartPage.cartItems).toHaveCount(1);

    await shoppingCartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo(
      checkoutTestData.customer.firstName,
      checkoutTestData.customer.lastName,
      checkoutTestData.customer.postalCode
    );
    await checkoutPage.clickContinue();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-step-two\.html$/);

    await checkoutPage.clickStepTwoCancel();
    await expect(inventoryCartPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryCartPage.cartBadge).toHaveText('1');
  });

  test('TC-05: Order Complete confirmation visuals and Back Home resets state to 0', async ({
    inventoryCartPage,
    shoppingCartPage,
    checkoutPage,
    checkoutTestData,
  }) => {
    await inventoryCartPage.clickAddToCart(checkoutTestData.singleItem.name);
    await inventoryCartPage.openCart();
    await shoppingCartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo(
      checkoutTestData.customer.firstName,
      checkoutTestData.customer.lastName,
      checkoutTestData.customer.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-complete\.html$/);

    await expect(checkoutPage.cartBadge).toHaveCount(0);
    await expect(checkoutPage.completeHeader).toHaveText(
      checkoutTestData.summaryLabels.completeHeader
    );
    await expect(checkoutPage.completeText).toHaveText(checkoutTestData.summaryLabels.completeText);
    await expect(checkoutPage.checkmarkIcon).toBeVisible();
    await expect(checkoutPage.checkmarkIcon).toHaveAttribute(
      'alt',
      checkoutTestData.summaryLabels.checkmarkAlt
    );
    await expect(checkoutPage.checkmarkIcon).toHaveAttribute('src', /.+/);

    await expect
      .poll(async () =>
        checkoutPage.checkmarkIcon.evaluate((img) => ({
          alt: img.getAttribute('alt') || '',
          src: img.getAttribute('src') || '',
          complete: img.complete,
          loaded: img.naturalWidth > 0,
        }))
      )
      .toMatchObject({
        alt: checkoutTestData.summaryLabels.checkmarkAlt,
        complete: true,
        loaded: true,
      });

    await checkoutPage.clickBackHome();
    await expect(inventoryCartPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryCartPage.cartBadge).toHaveCount(0);
    await expect(inventoryCartPage.getActionButton(checkoutTestData.singleItem.name)).toHaveText(
      /^add to cart$/i
    );
  });

  test('TC-06: Generate PDF order triggers swag-labs-order-YYYY-MM-DD_HH-MM-SS.pdf download with content', async ({
    inventoryCartPage,
    shoppingCartPage,
    checkoutPage,
    checkoutTestData,
  }) => {
    await inventoryCartPage.clickAddToCart(checkoutTestData.singleItem.name);
    await inventoryCartPage.openCart();
    await shoppingCartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo(
      checkoutTestData.customer.firstName,
      checkoutTestData.customer.lastName,
      checkoutTestData.customer.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();
    await expect(checkoutPage.page).toHaveURL(/\/checkout-complete\.html$/);

    const urlBeforePdfClick = checkoutPage.page.url();
    const download = await checkoutPage.clickGeneratePdfOrder();
    expect(await download.failure()).toBeNull();
    expect(download.suggestedFilename()).toMatch(checkoutTestData.receiptFilenamePattern);
    expect(checkoutPage.page.url()).toBe(urlBeforePdfClick);

    const stream = await download.createReadStream();
    expect(stream).toBeTruthy();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);
    expect(pdfBuffer.byteLength).toBeGreaterThan(0);
    expect(pdfBuffer.subarray(0, 4).toString('utf8')).toBe('%PDF');
  });

  test('TC-07: Direct navigation to /checkout-step-one.html without active session redirects to login with exact error', async ({
    page,
    checkoutTestData,
  }) => {
    await page.goto(checkoutTestData.stepOnePath);

    const loginPage = new LoginPage(page);
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(checkoutTestData.errors.unauthenticatedStepOne);
  });
});
