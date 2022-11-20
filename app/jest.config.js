/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.svg$": "<rootDir>/tests/helpers/svgTransformer.js",
  },
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/setup/jsdom.ts'],

};