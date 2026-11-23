const LOGIN_DATA = {
  urls: {
    login: '/',
    inventory: '/inventory.html',
  },
  password: 'secret_sauce',
  users: {
    standard: 'standard_user',
    lockedOut: 'locked_out_user',
    problem: 'problem_user',
    performanceGlitch: 'performance_glitch_user',
    error: 'error_user',
    visual: 'visual_user',
  },
  invalidInputs: {
    nonExistentUser: 'invalid_user',
    wrongPassword: 'wrong_password',
    upperCaseUser: 'STANDARD_USER',
    mixedCasePassword: 'Secret_Sauce',
    leadingTrailingSpaceUser: ' standard_user ',
    leadingTrailingSpacePass: ' secret_sauce ',
    sqlInjection: "' OR '1'='1",
    htmlPayload: '<script>alert(1)</script>',
  },
  errors: {
    lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
    usernameRequired: 'Epic sadface: Username is required',
    passwordRequired: 'Epic sadface: Password is required',
    invalidCredentials:
      'Epic sadface: Username and password do not match any user in this service',
    unauthenticatedInventory:
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
  },
  uiText: {
    appTitle: 'Swag Labs',
  },
};

module.exports = { LOGIN_DATA };