import 'regenerator-runtime/runtime'
import '@testing-library/jest-dom'

import { server } from './assets/js/__tests__/mocks/server.js'
import 'whatwg-fetch';

// Establish API mocking before all tests.
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())
