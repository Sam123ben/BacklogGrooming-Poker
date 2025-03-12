import { Server } from 'ws';
import { NextApiRequest } from 'next';
import { GameState } from '@/lib/store';

interface WebSocketConnection {
  ws: WebSocket;
  gameId: string;
}

const connections = new Map<string, Set<WebSocketConnection>>();
const gameStates = new Map<string, GameState>();

const wss = new Server({ port: 3001 });

wss.on('connection', (ws: WebSocket) => {
  let currentGameId: string | null = null;

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          handleJoin(ws, data.gameId);
          currentGameId = data.gameId;
          break;

        case 'gameUpdate':
          handleGameUpdate(data.gameId, data.state);
          break;

        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    if (currentGameId) {
      removeConnection(currentGameId, ws);
    }
  });
});

function handleJoin(ws: WebSocket, gameId: string) {
  if (!connections.has(gameId)) {
    connections.set(gameId, new Set());
  }

  connections.get(gameId)?.add({ ws, gameId });

  // Send current game state if it exists
  const currentState = gameStates.get(gameId);
  if (currentState) {
    ws.send(JSON.stringify({
      type: 'gameState',
      state: currentState
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
      state
    });

    gameConnections.forEach(({ ws }) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
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

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest) {
  // Return 404 for all HTTP requests
  return new Response(null, { status: 404 });
}