import { server } from './mocks/server.test';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that are declared as a part of our tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// The native module isn't available under Jest
jest.mock('./modules/screen-security', () => ({
  getDeviceId: jest.fn(() => 'test-device-id'),
}));
