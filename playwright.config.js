// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { defineBddConfig } = require('playwright-bdd');

// Suppress Chromium's "Access other devices on your local network" permission prompt
const chromiumUse = {
  permissions: ['local-network-access'],
  launchOptions: {
    args: [
      '--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests',
    ],
  },
};

const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.steps.js', 'fixtures/bddFixtures.js'],
  outputDir: '.features-gen',
});

module.exports = defineConfig({
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 },
    },
  },
  projects: [
    // Existing native Playwright spec suites (./tests)
    {
      name: 'chrome',
      testDir: './tests',
      use: {
        ...devices['Desktop Chrome'],
        ...chromiumUse,
        channel: 'chrome',
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox',
      testDir: './tests',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'edge',
      testDir: './tests',
      use: {
        ...devices['Desktop Edge'],
        ...chromiumUse,
        channel: 'msedge',
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Generated Playwright-BDD suites (.features-gen)
    {
      name: 'bdd-chrome',
      testDir: bddTestDir,
      use: {
        ...devices['Desktop Chrome'],
        ...chromiumUse,
        channel: 'chrome',
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'bdd-firefox',
      testDir: bddTestDir,
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'bdd-edge',
      testDir: bddTestDir,
      use: {
        ...devices['Desktop Edge'],
        ...chromiumUse,
        channel: 'msedge',
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
