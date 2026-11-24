@bdd @sorting
Feature: Swag Labs Product Sorting
  As a Swag Labs shopper
  I want to sort catalog products alphabetically and numerically by price without losing cart state
  So that I can easily find items while shopping

  Background:
    Given I am logged in as "standard_user" on the inventory page

  Scenario: Default catalog order is alphabetical A to Z
    Then the active sort option should be "az"
    And the catalog product names should be sorted in "ascending" alphabetical order

  Scenario: Sorting by Name Z to A reverses alphabetical order
    When I sort the catalog by "za"
    Then the active sort option should be "za"
    And the catalog product names should be sorted in "descending" alphabetical order

  Scenario: Sorting by Price low to high orders products numerically ascending
    When I sort the catalog by "lohi"
    Then the active sort option should be "lohi"
    And the catalog product prices should be sorted numerically "ascending"
    And the first displayed product price should be 7.99 and the last should be 49.99

  Scenario: Sorting by Price high to low orders products numerically descending
    When I sort the catalog by "hilo"
    Then the active sort option should be "hilo"
    And the catalog product prices should be sorted numerically "descending"
    And the first displayed product price should be 49.99 and the last should be 7.99

  Scenario: Changing sort order preserves active cart items and button states
    When I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Onesie" to the cart
    Then the cart badge should display "2"
    When I sort the catalog by "lohi"
    Then the cart badge should display "2"
    And the product button for "Sauce Labs Backpack" should show "Remove"
    And the product button for "Sauce Labs Onesie" should show "Remove"
    And the product button for "Sauce Labs Fleece Jacket" should show "Add to cart"
