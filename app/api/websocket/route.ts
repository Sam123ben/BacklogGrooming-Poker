import { WebSocketServer } from 'ws';
import { NextRequest } from 'next/server';
import { GameState } from '@/lib/store';
import { IncomingMessage } from 'http';

interface WebSocketConnection {
  ws: WebSocket;
  gameId: string;
  lastPing: number;
}

// Global state for WebSocket connections and game states
let wss: WebSocketServer | null = null;
const connections = new Map<string, Set<WebSocketConnection>>();
const gameStates = new Map<string, GameState>();

function initWebSocketServer() {
  if (wss) return wss;

  wss = new WebSocketServer({ 
    noServer: true,
    path: '/api/websocket',
    clientTracking: true,
  });

  wss.on('connection', (ws: any) => {
    let currentGameId: string | null = null;

    ws.addEventListener('message', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data.toString());

        switch (data.type) {
          case 'join':
            handleJoin(ws, data.gameId);
            currentGameId = data.gameId;
            break;

          case 'gameUpdate':
            handleGameUpdate(data.gameId, data.state);
            break;

          case 'pong':
            handlePong(ws, currentGameId);
            break;

          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    ws.addEventListener('close', () => {
      if (currentGameId) {
        removeConnection(currentGameId, ws);
      }
    });

    // Start ping interval
    const pingInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });

  // Start cleanup interval
  setInterval(cleanupStaleConnections, 60000);

  return wss;
}

function handleJoin(ws: WebSocket, gameId: string) {
  if (!connections.has(gameId)) {
    connections.set(gameId, new Set());
  }

  const connection: WebSocketConnection = {
    ws,
    gameId,
    lastPing: Date.now(),
  };

  connections.get(gameId)?.add(connection);

  // Send current game state if it exists
  const currentState = gameStates.get(gameId);
  if (currentState) {
    ws.send(JSON.stringify({
      type: 'gameState',
      state: currentState,
    }));
  }
}

function handleGameUpdate(gameId: string, state: GameState) {
  gameStates.set(gameId, state);

  // Broadcast to all connections in the game
  const gameConnections = connections.get(gameId);
  if (gameConnections) {
    const message = JSON.stringify({
      type: 'gameState',
      state,
    });

    gameConnections.forEach(({ ws }) => {
      if ((ws as any).readyState === (ws as any).OPEN) {
        ws.send(message);
      }
    });
  }
}

function handlePong(ws: WebSocket, gameId: string | null) {
  if (!gameId) return;

  const gameConnections = connections.get(gameId);
  if (gameConnections) {
    gameConnections.forEach(conn => {
      if (conn.ws === ws) {
        conn.lastPing = Date.now();
      }
    });
  }
}

function removeConnection(gameId: string, ws: WebSocket) {
  const gameConnections = connections.get(gameId);
  if (gameConnections) {
    gameConnections.forEach(conn => {
      if (conn.ws === ws) {
        gameConnections.delete(conn);
      }
    });

    if (gameConnections.size === 0) {
      connections.delete(gameId);
      gameStates.delete(gameId);
    }
  }
}

function cleanupStaleConnections() {
  const staleTimeout = 70000; // Consider connections stale after 70 seconds
  const now = Date.now();

  connections.forEach((gameConnections, gameId) => {
    gameConnections.forEach(conn => {
      if (now - conn.lastPing > staleTimeout) {
        removeConnection(gameId, conn.ws);
      }
    });
  });
}

// Create a mock IncomingMessage for WebSocket upgrade
function createMockIncomingMessage(req: NextRequest): IncomingMessage {
  const duplex = new TransformStream();
  const duplexStream = duplex.readable;

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    headers,
    method: req.method,
    url: req.url,
    httpVersion: '1.1',
    httpVersionMajor: 1,
    httpVersionMinor: 1,
    rawHeaders: [],
    rawTrailers: [],
    setTimeout: (_: number, callback?: () => void) => {
      if (callback) callback();
      return duplexStream;
    },
    statusCode: 200,
    statusMessage: 'OK',
    trailers: {},
    readable: true,
    socket: duplexStream,
    resume: () => duplexStream,
    pause: () => duplexStream,
    destroy: () => duplexStream,
    pipe: () => duplexStream,
  } as unknown as IncomingMessage;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket connection', { status: 400 });
  }

  try {
    const server = initWebSocketServer();
    const mockMessage = createMockIncomingMessage(req);
    
    // Handle upgrade
    server.handleUpgrade(mockMessage, mockMessage.socket, Buffer.alloc(0), (ws) => {
      server.emit('connection', ws, mockMessage);
    });

    return new Response(null, { status: 101 }); // Switching protocols
  } catch (error) {
    console.error('WebSocket setup error:', error);
    return new Response('WebSocket setup failed', { status: 500 });
  }
}