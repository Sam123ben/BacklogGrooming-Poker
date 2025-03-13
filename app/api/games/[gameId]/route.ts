import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';

// Create Redis client singleton
let redis: Redis | null = null;

function getRedisClient() {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD,
      tls: {
        servername: process.env.REDIS_HOST
      }
    });

    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }
  return redis;
}

const GAME_KEY_PREFIX = 'planning-poker:game:';
const GAME_TTL = 60 * 60 * 24; // 24 hours

export async function GET(
  request: Request,
  context: { params: { gameId: string } }
) {
  const { gameId } = context.params;
  
  try {
    const client = getRedisClient();
    const data = await client.get(`${GAME_KEY_PREFIX}${gameId}`);
    
    if (!data) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Redis get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: { gameId: string } }
) {
  const { gameId } = context.params;
  
  try {
    const body = await request.json();
    const client = getRedisClient();
    
    await client.setex(
      `${GAME_KEY_PREFIX}${gameId}`,
      GAME_TTL,
      JSON.stringify(body)
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { gameId: string } }
) {
  const { gameId } = context.params;
  
  try {
    const client = getRedisClient();
    await client.del(`${GAME_KEY_PREFIX}${gameId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}