# Swag Labs Playwright Automation Rules

## Test Execution Preference
- Do **not** run Playwright tests automatically (`npx playwright test`, `npm test`, etc.) unless the user explicitly asks you to execute them. Fix/edit the code and let the user run the suite manually.

## Swag Labs (`https://www.saucedemo.com`) Verified Behaviors
- **Exact login error messages (`[data-test="error"]`)**:
  - Locked out user: `Epic sadface: Sorry, this user has been locked out.` *(has a trailing period)*
  - Empty username: `Epic sadface: Username is required` *(no trailing period)*
  - Empty password: `Epic sadface: Password is required` *(no trailing period)*
  - Invalid credentials: `Epic sadface: Username and password do not match any user in this service` *(no trailing period)*
  - Unauthenticated `/inventory.html` access: `Epic sadface: You can only access '/inventory.html' when you are logged in.` *(has a trailing period)*
  - Unauthenticated `/inventory-item.html?id=...` access: `Epic sadface: You can only access '/inventory-item.html' when you are logged in.` *(omits query string, has a trailing period)*
  - Unauthenticated `/cart.html` access: `Epic sadface: You can only access '/cart.html' when you are logged in.` *(has a trailing period)*
  - Unauthenticated `/checkout-step-one.html` access: `Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.` *(has a trailing period)*
- **Checkout Step 1 validation errors (`[data-test="error"]`)**:
  - Empty first name: `Error: First Name is required` *(no trailing period)*
  - Empty last name: `Error: Last Name is required` *(no trailing period)*
  - Empty postal code: `Error: Postal Code is required` *(no trailing period)*
- **Checkout Step 2 & Order Complete (`/checkout-step-two.html`, `/checkout-complete.html`)**:
  - Step 2 `Cancel` (`[data-test="cancel"]`) returns to `/inventory.html` (preserving cart), while Step 1 `Cancel` returns to `/cart.html`.
  - Order Complete confirmation checkmark (`[data-test="pony-express"]`) is an `<img>` (`alt="Pony Express"`, PNG asset), not an inline SVG—verify loaded image properties (`complete && naturalWidth > 0`) rather than CSS `color`.
  - Order Complete includes `[data-test="generate-pdf-order"]` (`"Generate PDF order"`), which downloads `swag-labs-order-YYYY-MM-DD_HH-MM-SS.pdf`.
- **Error banner dismiss button**:
  - Accessible name is `"Dismiss error"` (`data-test="error-button"`), not `"Close error"`.
- **PLP (`/inventory.html`), PDP (`/inventory-item.html?id=0..5`), & Cart (`/cart.html`)**:
  - All three routes require authentication (`standard_user` / `secret_sauce`).
  - On `/cart.html`, line items use `[data-test="inventory-item"]` inside `[data-test="cart-list"]` (not `[data-test="cart-item"]`), headers use `cart-quantity-label` (`QTY`) and `cart-desc-label` (`Description`), and actions use `continue-shopping` and `checkout`.
  - `Reset App State` clears `[data-test="shopping-cart-badge"]` immediately, while PLP product card buttons reset from `"Remove"` back to `"Add to cart"` after reloading `/inventory.html`.
  - No JSON-LD schemas, canonical links, or GA4 `dataLayer` exist on Swag Labs; accessibility checks should target real landmarks (`banner`, `main`, `contentinfo`), `<title>`, image `alt` attributes, and accessible button/combobox names.
- **Multi-persona tests (`TC-10`)**:
  - Isolate each user persona in a fresh `browser.newContext({ baseURL, viewport })` (closed in a `finally` block) instead of reusing one page with only `context.clearCookies()`.
- **`performance_glitch_user` timing & timeouts**:
  - Introduces an artificial ~5-second client-side blocking delay when rendering or sorting `/inventory.html`.
  - Measure latency strictly from `loginButton.click()` to `/inventory.html` + first `.inventory_item` visible (excluding `.fill()` overhead).
  - Pass an explicit `{ timeout: 15000 }` to click and `expect` assertions for `performance_glitch_user` so the ~5s delay does not race Playwright's default 5s `expect` timeout.
