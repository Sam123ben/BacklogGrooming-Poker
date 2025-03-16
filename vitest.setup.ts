import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers);

// Mock fetch with success responses for tests
global.fetch = vi.fn((input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();
  if (url.includes('/api/games/')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    } as Response);
  }
  return Promise.reject(new Error(`Unhandled fetch mock for URL: ${url}`));
}) as unknown as typeof fetch;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) =>
      React.createElement('div', { ...props, whileHover: undefined, whileTap: undefined }, children),
    span: ({ children, ...props }: any) =>
      React.createElement('span', { ...props, whileHover: undefined, whileTap: undefined }, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock WebSocket
vi.mock('ws', () => ({
  WebSocket: vi.fn(() => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    send: vi.fn(),
    close: vi.fn(),
    readyState: 1,
    OPEN: 1,
  })),
  WebSocketServer: vi.fn(),
}));

// Setup fake timers
beforeEach(() => {
  vi.useFakeTimers();
  // Reset fetch mock
  vi.mocked(global.fetch).mockClear();
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.clearAllTimers();
  vi.useRealTimers();
});