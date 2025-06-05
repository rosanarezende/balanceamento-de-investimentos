/* global jest, beforeAll, afterAll */

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"
import 'whatwg-fetch'

// Mocks simples dos serviços - valores específicos configurados nos testes
jest.mock('@/services/firebase/firestore', () => ({
  getUserPortfolio: jest.fn(),
  updateStock: jest.fn(),
  removeStock: jest.fn(),
  updateUserRecommendation: jest.fn(),
  validateUserInput: jest.fn(),
  addStock: jest.fn(),
  createUserPortfolio: jest.fn(),
  deleteUserPortfolio: jest.fn(),
  getUserRecommendation: jest.fn(),
  saveUserRecommendation: jest.fn(),
  deleteUserRecommendation: jest.fn(),
  updateUserProfile: jest.fn(),
  getUserProfile: jest.fn(),
  createUserProfile: jest.fn(),
  saveManualRecommendation: jest.fn(),
  saveSimulation: jest.fn(),
  getSimulations: jest.fn(),
  getSimulation: jest.fn(),
  getUserWatchlist: jest.fn(),
  addToWatchlist: jest.fn(),
  updateWatchlistItem: jest.fn(),
  removeFromWatchlist: jest.fn(),
  saveUserPreferences: jest.fn(),
  getUserPreferences: jest.fn(),
}))
jest.mock('@/services/api/stock-price', () => ({
  getCurrentPrice: jest.fn(),
  getPriceHistory: jest.fn(),
  searchStocks: jest.fn(),
  getStockInfo: jest.fn(),
}))

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

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    reload: jest.fn(),
  },
  writable: true,
});

beforeAll(() => {
  // Silenciar console.error durante os testes
  jest.spyOn(console, 'error').mockImplementation(() => { /* silenciar */ })
  jest.spyOn(console, 'warn').mockImplementation(() => { /* silenciar */ })
})

afterAll(() => {
  // Restaurar console.error após os testes
  jest.restoreAllMocks()
})

// Configurar variáveis de ambiente para testes
process.env.NEXT_PUBLIC_DEVELOPMENT_MODE = 'true';
process.env.NEXT_PUBLIC_MOCK_DATA = 'true';
process.env.NEXT_PUBLIC_MOCK_AUTH = 'true';

// Mock Firebase
const mockApp = { name: '[DEFAULT]' };

// Criar mocks Jest para as funções de autenticação
const mockSignInWithPopup = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn(() => jest.fn()); // Retorna uma função unsubscribe

const mockAuth = {
  currentUser: null,
  app: mockApp,
  signInWithPopup: mockSignInWithPopup,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
};

const mockDb = {};
const mockGoogleProvider = {};

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(),
  getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()), // Retorna uma função unsubscribe
  GoogleAuthProvider: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock da configuração do Firebase para evitar erros de inicialização
jest.mock('./src/services/firebase/config', () => ({
  firebaseConfig: {
    apiKey: 'mockApiKey',
    authDomain: 'mockAuthDomain',
    projectId: 'mockProjectId',
    storageBucket: 'mockStorageBucket',
    messagingSenderId: 'mockMessagingSenderId',
    appId: 'mockAppId',
    measurementId: 'mockMeasurementId',
  },
  app: mockApp,
  auth: mockAuth,
  db: mockDb,
  googleProvider: mockGoogleProvider,
}));
