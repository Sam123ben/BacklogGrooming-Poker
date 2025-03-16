// __tests__/lib/redis-client.test.ts
import { getRedisClient, closeRedisConnection } from '@/lib/redis-client';
import Redis from 'ioredis';


// Mock the ioredis module
// jest.mock('ioredis');

describe.skip('Redis Client', () => {
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    mockRedis = {
      on: jest.fn(),
      once: jest.fn(),
      quit: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Redis>;

    (Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => mockRedis);
  });

  afterEach(async () => {
    await closeRedisConnection();
    jest.clearAllMocks();
  });

  it.skip('should create a Redis client with correct configuration', async () => {
    const client = await getRedisClient();
    expect(Redis).toHaveBeenCalledWith({
      host: 'localhost',
      port: 6379,
      password: undefined,
      tls: undefined,
      retryStrategy: expect.any(Function),
      maxRetriesPerRequest: 3,
    });
    expect(client).toBeDefined();
  });

  it.skip('should reuse existing Redis client on subsequent calls', async () => {
    const client1 = await getRedisClient();
    const client2 = await getRedisClient();
    expect(Redis).toHaveBeenCalledTimes(1);
    expect(client1).toBe(client2);
  });

  it.skip('should handle Redis connection errors', async () => {
    const errorHandler = jest.fn();
    console.error = errorHandler;

    const error = new Error('Connection failed');
    mockRedis.once.mockImplementation((event, callback) => {
      if (event === 'error') callback(error);
      return mockRedis;
    });

    await expect(getRedisClient()).rejects.toThrow('Connection failed');
    expect(errorHandler).toHaveBeenCalled();
  });

  it.skip('should close Redis connection', async () => {
    const client = await getRedisClient();
    await closeRedisConnection();
    expect(mockRedis.quit).toHaveBeenCalled();
  });
});