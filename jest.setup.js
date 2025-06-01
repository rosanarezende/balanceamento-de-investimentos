/* global jest */

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"
import 'whatwg-fetch'

// Mock do fetch para testes
global.fetch = jest.fn()

// Mock do localStorage
const localStorageData = {}
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key) => localStorageData[key] || null),
    setItem: jest.fn((key, value) => { localStorageData[key] = value }),
    removeItem: jest.fn((key) => { delete localStorageData[key] }),
    clear: jest.fn(() => { Object.keys(localStorageData).forEach(key => delete localStorageData[key]) }),
    get length() { return Object.keys(localStorageData).length },
    key: jest.fn((index) => Object.keys(localStorageData)[index] || null),
  },
  writable: true,
})

// Mock do Headers
global.Headers = jest.fn().mockImplementation((init) => {
  const headers = {}
  if (init) {
    Object.entries(init).forEach(([key, value]) => {
      headers[key.toLowerCase()] = value
    })
  }
  return {
    get: (key) => headers[key.toLowerCase()],
    set: (key, value) => { headers[key.toLowerCase()] = value },
    has: (key) => Object.prototype.hasOwnProperty.call(headers, key.toLowerCase()),
    forEach: (callback) => Object.entries(headers).forEach(([key, value]) => callback(value, key)),
  }
})

// Mock do Request e Response apenas se não existirem
if (typeof global.Request === 'undefined') {
  global.Request = jest.fn().mockImplementation((input, init) => ({
    url: typeof input === 'string' ? input : input.url,
    method: init?.method || 'GET',
    headers: new Headers(init?.headers),
    body: init?.body,
  }))
}

if (typeof global.Response === 'undefined') {
  global.Response = jest.fn().mockImplementation((body, init) => ({
    ok: init?.status ? init.status >= 200 && init.status < 300 : true,
    status: init?.status || 200,
    statusText: init?.statusText || 'OK',
    headers: new Headers(init?.headers),
    json: jest.fn().mockResolvedValue(typeof body === 'string' ? JSON.parse(body) : body),
    text: jest.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
  }))
}
