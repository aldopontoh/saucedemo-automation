@bdd @checkout
Feature: Swag Labs End-to-End Checkout
  As a Swag Labs customer
  I want to validate checkout customer information, review accurate totals, and complete my order
  So that I can purchase items reliably

  Background:
    Given I am logged in as "standard_user" on the inventory page

  Scenario: Checkout Step 1 enforces sequential required-field validation
    When I add "Sauce Labs Backpack" to the cart
    And I open the shopping cart
    And I proceed to checkout
    Then I should be on checkout step one
    When I continue checkout without entering customer information
    Then I should see the checkout error message "Error: First Name is required"
    When I fill checkout info with first name "Aldo", last name "", and postal code ""
    And I click Continue on checkout step one
    Then I should see the checkout error message "Error: Last Name is required"
    When I fill checkout info with first name "Aldo", last name "Pontoh", and postal code ""
    And I click Continue on checkout step one
    Then I should see the checkout error message "Error: Postal Code is required"
    When I fill checkout info with first name "Aldo", last name "Pontoh", and postal code "15147A"
    And I click Continue on checkout step one
    Then I should be on checkout step two

  Scenario: Single-item checkout verifies totals and completes the order
    When I add "Sauce Labs Backpack" to the cart
    And I open the shopping cart
    And I proceed to checkout
    And I fill checkout info with first name "Aldo", last name "Pontoh", and postal code "15147"
    And I click Continue on checkout step one
    Then I should be on checkout step two
    And the checkout overview should show item total "Item total: $29.99", tax "Tax: $2.40", and total "Total: $32.39"
    When I finish the checkout order
    Then I should be on the checkout complete page
    And the order confirmation header should display "Thank you for your order!"
    And the cart badge should be hidden

  Scenario: Canceling on Step 1 returns to cart and canceling on Step 2 returns to inventory preserving cart
    When I add "Sauce Labs Backpack" to the cart
    And I open the shopping cart
    And I proceed to checkout
    And I cancel checkout on step one
    Then I should be on the shopping cart page
    And the cart should contain 1 item
    When I proceed to checkout
    And I fill checkout info with first name "Aldo", last name "Pontoh", and postal code "15147"
    And I click Continue on checkout step one
    And I cancel checkout on step two
    Then I should be redirected to the inventory page
    And the cart badge should display "1"
