import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1;
    this.OPEN = 1;
    setTimeout(() => this.onopen?.(), 0);
  }
  send(data) {}
  close() {}
}

global.WebSocket = MockWebSocket;

// Mock Redis client
jest.mock('@/lib/redis-client', () => ({
  getRedisClient: jest.fn().mockResolvedValue({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }),
  closeRedisConnection: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Setup MSW
export const server = setupServer(
  http.get('/api/games/:gameId', () => {
    return HttpResponse.json({
      id: '123',
      players: [],
      maxPlayers: 5,
      isVotingComplete: false,
      timeRemaining: 300,
      timerDuration: 300,
      isTimerRunning: false,
      isPaused: false,
      currentPlayerIndex: 0,
      storyPointHistory: [],
      sprintNumber: 1,
      consensusThreshold: 70,
      currentRound: 1,
      lastSyncTimestamp: Date.now(),
      canStartGame: false,
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());