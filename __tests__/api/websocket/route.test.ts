// __tests__/api/websocket/route.test.ts
import { NextRequest } from 'next/server';
import { GET } from '@/api/websocket/route';

describe('WebSocket API Route', () => {
  it('should return 400 if not a WebSocket request', async () => {
    // Create a request without the "upgrade" header
    const request = new NextRequest('http://localhost/api/websocket', {
      headers: new Headers()
    });
    const response = await GET(request);
    expect(response.status).toBe(400);
  });
});