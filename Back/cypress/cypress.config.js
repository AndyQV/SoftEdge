import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://soft-edge-two.vercel.app',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
  },
})
