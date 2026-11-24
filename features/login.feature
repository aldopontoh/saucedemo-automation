@bdd @login
Feature: Swag Labs Authentication and Login
  As a Swag Labs customer
  I want to authenticate with valid credentials and receive clear validation errors for invalid attempts
  So that my shopping session is secure

  Scenario: Successful login with standard_user redirects to the inventory catalog
    Given I am on the Swag Labs login page
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should be redirected to the inventory page
    And the catalog should display 6 products

  Scenario Outline: Invalid or locked login attempts display exact error messages
    Given I am on the Swag Labs login page
    When I log in with username "<username>" and password "<password>"
    Then I should remain on the login page
    And I should see the login error message "<expectedError>"

    Examples:
      | username        | password       | expectedError                                                             |
      | locked_out_user | secret_sauce   | Epic sadface: Sorry, this user has been locked out.                       |
      |                 | secret_sauce   | Epic sadface: Username is required                                        |
      | standard_user   |                | Epic sadface: Password is required                                        |
      | invalid_user    | wrong_password | Epic sadface: Username and password do not match any user in this service |

  Scenario: Dismissing the login error banner hides the alert
    Given I am on the Swag Labs login page
    When I log in with username "" and password "secret_sauce"
    Then I should see the login error message "Epic sadface: Username is required"
    When I dismiss the login error banner
    Then the login error banner should be hidden

  Scenario: Direct unauthenticated access to inventory redirects to login with exact error
    When I navigate directly to "/inventory.html" without logging in
    Then I should remain on the login page
    And I should see the login error message "Epic sadface: You can only access '/inventory.html' when you are logged in."
