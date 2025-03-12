import { GameState } from './store';

// Local storage key prefix
const STORAGE_KEY_PREFIX = 'planning-poker:game:';

export async function saveGame(gameId: string, game: GameState): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${gameId}`, JSON.stringify(game));
}

export async function loadGame(gameId: string): Promise<GameState | null> {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${gameId}`);
  if (!data) return null;
  try {
    return JSON.parse(data) as GameState;
  } catch {
    return null;
  }
}

export async function deleteGame(gameId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${gameId}`);
}