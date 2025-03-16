import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';

// Create LRU cache for Redis connections
const connectionCache = new LRUCache<string, Redis>({
  max: 100,
  ttl: 1000 * 60 * 5,
  updateAgeOnGet: true,
  dispose: (client) => {
    client.quit().catch(console.error);
  }
});

let isConnecting = false;
let connectionPromise: Promise<Redis | null> | null = null;

export async function getRedisClient() {
  const cacheKey = 'default';
  
  // Try to get existing client from cache
  let client = connectionCache.get(cacheKey);
  if (client?.status === 'ready') {
    return client;
  }

  // Remove any existing client that's not ready
  if (client) {
    connectionCache.delete(cacheKey);
  }

  // If already connecting, wait for that connection
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  isConnecting = true;
  connectionPromise = (async () => {
    try {
      // Create new client if none exists
      client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_SSL === 'true' ? {
          rejectUnauthorized: false
        } : undefined,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error(`Redis retry attempt ${times} failed, giving up`);
            return null;
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableOfflineQueue: true,
        connectTimeout: 5000,
        disconnectTimeout: 2000,
        commandTimeout: 3000,
        keepAlive: 10000,
        noDelay: true,
        autoResubscribe: false,
        autoResendUnfulfilledCommands: false,
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        }
      });

      // Set up event handlers
      client.on('error', (error) => {
        console.error('Redis connection error:', error);
        connectionCache.delete(cacheKey);
      });

      client.on('connect', () => {
        console.log('Redis connected successfully');
      });

      // Wait for ready event with timeout
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          client!.once('ready', () => resolve());
          client!.once('error', reject);
        }),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        )
      ]);

      // Store client in cache
      connectionCache.set(cacheKey, client);
      return client;
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      if (client) {
        client.quit().catch(console.error);
      }
      return null;
    } finally {
      isConnecting = false;
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

export async function closeRedisConnection() {
  connectionCache.clear();
}