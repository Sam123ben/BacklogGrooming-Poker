"use client";

import { GameState } from './store';
// Removed unused import of config
// import { config } from './config';

// Use relative WebSocket URL that will work in any environment
const WS_URL = typeof window !== 'undefined'
  ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/websocket`
  : '';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private gameId: string;
  private onMessageCallback: (data: any) => void;
  private isConnecting = false;

  constructor(gameId: string, onMessage: (data: any) => void) {
    this.gameId = gameId;
    this.onMessageCallback = onMessage;
    // Don't connect in test environment
    if (process.env.NODE_ENV !== 'test') {
      this.connect();
    }
  }

  private async connect() {
    if (this.isConnecting || process.env.NODE_ENV === 'test') return;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.joinGame();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessageCallback(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (process.env.NODE_ENV === 'test') return;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    }
  }

  private joinGame() {
    this.sendMessage({
      type: 'join',
      gameId: this.gameId
    });
  }

  public sendMessage(data: any) {
    // In test environment, just call the callback directly
    if (process.env.NODE_ENV === 'test') {
      if (data.type === 'gameState') {
        this.onMessageCallback(data);
      }
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not ready, attempting to reconnect...');
      this.connect();
    }
  }

  public updateGameState(gameState: GameState) {
    this.sendMessage({
      type: 'gameUpdate',
      gameId: this.gameId,
      state: gameState
    });
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}