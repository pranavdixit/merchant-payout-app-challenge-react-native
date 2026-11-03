import { server } from './mocks/server.test';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that are declared as a part of our tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// The native module isn't available under Jest
jest.mock('./modules/screen-security', () => ({
  addScreenshotListener: jest.fn(() => jest.fn()),
  getDeviceId: jest.fn(() => 'test-device-id'),
  isBiometricAuthenticated: jest.fn(() => Promise.resolve(true)),
  isBiometricsNotEnrolledError: jest.fn(() => false),
}));

// Screens render outside a navigator under Jest, so focus effects behave like mount effects
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return { useFocusEffect: (effect) => useEffect(effect, [effect]), router: { push: jest.fn() } };
});
