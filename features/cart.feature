@bdd @cart
Feature: Swag Labs Shopping Cart Management
  As a Swag Labs shopper
  I want to add, inspect, persist, and remove products from my cart
  So that my order accurately reflects what I want to buy

  Background:
    Given I am logged in as "standard_user" on the inventory page

  Scenario: Adding and removing a single product updates button state and badge
    Then the cart badge should be hidden
    When I add "Sauce Labs Backpack" to the cart
    Then the product button for "Sauce Labs Backpack" should show "Remove"
    And the cart badge should display "1"
    When I remove "Sauce Labs Backpack" from the inventory catalog
    Then the product button for "Sauce Labs Backpack" should show "Add to cart"
    And the cart badge should be hidden

  Scenario: Adding multiple products preserves chronological cart order across reload
    When I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    And I open the shopping cart
    Then I should be on the shopping cart page
    And the cart should contain items in order:
      | Sauce Labs Backpack   |
      | Sauce Labs Bike Light |
    When I reload the current page
    Then the cart badge should display "2"
    And the cart should contain items in order:
      | Sauce Labs Backpack   |
      | Sauce Labs Bike Light |

  Scenario: Removing an item on the cart page syncs back to the inventory catalog
    When I add "Sauce Labs Backpack" to the cart
    And I open the shopping cart
    And I remove "Sauce Labs Backpack" from the shopping cart
    Then the shopping cart should be empty
    And the cart badge should be hidden
    When I click Continue Shopping from the cart
    Then I should be redirected to the inventory page
    And the product button for "Sauce Labs Backpack" should show "Add to cart"

  Scenario: Reset App State from the sidebar clears the cart badge and empties the cart
    When I add "Sauce Labs Backpack" to the cart
    Then the cart badge should display "1"
    When I reset app state from the sidebar menu
    Then the cart badge should be hidden
    When I open the shopping cart
    Then the shopping cart should be empty
