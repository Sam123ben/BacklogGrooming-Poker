import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis-client';

const GAME_KEY_PREFIX = 'planning-poker:game:';
const GAME_TTL = 60 * 60 * 24; // 24 hours

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: { gameId: string } }
) {
  const { gameId } = context.params;
  
  try {
    const client = await getRedisClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const data = await client.get(`${GAME_KEY_PREFIX}${gameId}`);
    
    if (!data) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Redis get error:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PUT(
  request: Request,
  context: { params: { gameId: string } }
) {
  const { gameId } = context.params;
  
  try {
    const body = await request.json();
    const client = await getRedisClient();
    
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    await client.setex(
      `${GAME_KEY_PREFIX}${gameId}`,
      GAME_TTL,
      JSON.stringify(body)
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis save error:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: { gameId: string } }
) {
  const { gameId } = context.params;
  
  try {
    const client = await getRedisClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    await client.del(`${GAME_KEY_PREFIX}${gameId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis delete error:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}