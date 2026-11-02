module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-ng/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|msw|until-async|@mswjs/.*|@open-draft/.*|rettime|strict-event-emitter|outvariant|headers-polyfill)',
  ],
  // msw/node is only exposed under the default export conditions, not react-native's
  testEnvironmentOptions: { customExportConditions: [''] },
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/mocks/',
    '<rootDir>/ios/',
    '<rootDir>/android/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
