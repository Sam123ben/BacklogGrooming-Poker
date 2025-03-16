import { describe, expect, it, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/games/[gameId]/route';
import { getRedisClient } from '@/lib/redis-client';

vi.mock('@/lib/redis-client');

describe('Games API Routes', () => {
  const mockRedis = {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
  };

  beforeEach(() => {
    (getRedisClient as any).mockResolvedValue(mockRedis);
    vi.clearAllMocks();
  });

  describe('GET /api/games/[gameId]', () => {
    it('should return game data if it exists', async () => {
      const gameData = { id: '123', players: [] };
      mockRedis.get.mockResolvedValue(JSON.stringify(gameData));

      const request = new NextRequest('http://localhost/api/games/123');
      const response = await GET(request, { params: { gameId: '123' } });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(gameData);
      expect(mockRedis.get).toHaveBeenCalledWith('planning-poker:game:123');
    });

    it('should return 404 if game does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/games/123');
      const response = await GET(request, { params: { gameId: '123' } });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Game not found' });
    });

    it('should handle Redis errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const request = new NextRequest('http://localhost/api/games/123');
      const response = await GET(request, { params: { gameId: '123' } });

      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: 'Database unavailable' });
    });
  });

  describe('PUT /api/games/[gameId]', () => {
    it('should save game data', async () => {
      const gameData = { id: '123', players: [] };
      const request = new NextRequest('http://localhost/api/games/123', {
        method: 'PUT',
        body: JSON.stringify(gameData),
      });

      const response = await PUT(request, { params: { gameId: '123' } });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'planning-poker:game:123',
        86400,
        JSON.stringify(gameData)
      );
    });

    it('should handle Redis errors during save', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Redis error'));

      const request = new NextRequest('http://localhost/api/games/123', {
        method: 'PUT',
        body: JSON.stringify({ id: '123' }),
      });

      const response = await PUT(request, { params: { gameId: '123' } });

      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: 'Database unavailable' });
    });
  });

  describe('DELETE /api/games/[gameId]', () => {
    it('should delete game data', async () => {
      const request = new NextRequest('http://localhost/api/games/123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { gameId: '123' } });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(mockRedis.del).toHaveBeenCalledWith('planning-poker:game:123');
    });

    it('should handle Redis errors during deletion', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      const request = new NextRequest('http://localhost/api/games/123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { gameId: '123' } });

      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: 'Database unavailable' });
    });
  });
});