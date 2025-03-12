import { GameState } from './store';

// Key prefix for game data
const API_BASE = '/api/games';

export async function saveGame(gameId: string, game: GameState): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${gameId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(game),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save game');
    }
  } catch (error) {
    console.error('Save game error:', error);
  }
}

export async function loadGame(gameId: string): Promise<GameState | null> {
  try {
    const response = await fetch(`${API_BASE}/${gameId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to load game');
    }
    return await response.json();
  } catch (error) {
    console.error('Load game error:', error);
    return null;
  }
}

export async function deleteGame(gameId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${gameId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete game');
    }
  } catch (error) {
    console.error('Delete game error:', error);
  }
}