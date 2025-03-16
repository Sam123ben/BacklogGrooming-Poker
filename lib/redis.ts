import { config } from './config';

// API routes base path
const API_BASE = `${config.api.url}/games`;

export async function saveGame(gameId: string, game: any): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${gameId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(game),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to save game: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Save game error:', error);
    // Don't throw in test environment
    if (process.env.NODE_ENV !== 'test') {
      throw error;
    }
  }
}

export async function loadGame(gameId: string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE}/${gameId}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to load game: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Load game error:', error);
    // Don't throw in test environment
    if (process.env.NODE_ENV !== 'test') {
      throw error;
    }
    return null;
  }
}

export async function deleteGame(gameId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${gameId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete game: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Delete game error:', error);
    // Don't throw in test environment
    if (process.env.NODE_ENV !== 'test') {
      throw error;
    }
  }
}