/**
 * Jest 测试环境设置
 */

// Mock Chrome Extension APIs
(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    },
    sync: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    },
  },
  runtime: {
    getManifest: jest.fn(() => ({
      version: '1.0.0',
      name: 'Easy Todo',
    })),
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  notifications: {
    create: jest.fn(),
    clear: jest.fn(),
  },
  tabs: {
    query: jest.fn(),
    create: jest.fn(),
  },
};

// Mock DOM APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
});

// Mock console methods for cleaner test output
(global as any).console = {
  ...console,
  debug: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock crypto APIs for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(
      () =>
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    ),
    getRandomValues: jest.fn(arr => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});
