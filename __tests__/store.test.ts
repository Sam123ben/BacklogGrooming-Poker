import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '@/lib/store';

describe('Game Store', () => {
  beforeEach(() => {
    useGameStore.setState({ game: null });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should create a new game and return game ID', () => {
    const maxPlayers = 5;
    const timerDuration = 300;
    const gameId = useGameStore.getState().createGame(maxPlayers, timerDuration);
    
    expect(gameId).toBeTruthy();
    expect(typeof gameId).toBe('string');
    
    const game = useGameStore.getState().game;
    expect(game).toBeTruthy();
    expect(game?.id).toBe(gameId);
    expect(game?.maxPlayers).toBe(maxPlayers);
    expect(game?.timerDuration).toBe(timerDuration);
    expect(game?.timeRemaining).toBe(timerDuration);
    expect(game?.players).toHaveLength(0);
  });

  it('should load existing game by ID', () => {
    const gameId = useGameStore.getState().createGame(3, 300);
    useGameStore.setState({ game: null }); // Clear current game
    
    useGameStore.getState().loadGame(gameId);
    const loadedGame = useGameStore.getState().game;
    
    expect(loadedGame).toBeTruthy();
    expect(loadedGame?.id).toBe(gameId);
  });

  it('should return null when loading non-existent game', () => {
    useGameStore.getState().loadGame('non-existent-id');
    expect(useGameStore.getState().game).toBeNull();
  });

  it('should allow players to join the game', () => {
    const gameId = useGameStore.getState().createGame(3, 300);
    useGameStore.getState().joinGame('Player 1');
    
    const game = useGameStore.getState().game;
    expect(game?.players).toHaveLength(1);
    expect(game?.players[0].name).toBe('Player 1');
    expect(game?.players[0].vote).toBeNull();
    expect(game?.players[0].participationRate).toBe(100);
  });

  it('should handle voting and confidence levels', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1');
    const playerId = useGameStore.getState().game!.players[0].id;
    
    useGameStore.getState().submitVote(playerId, 5, 80);
    
    const game = useGameStore.getState().game;
    expect(game?.players[0].vote).toEqual({ value: 5, confidence: 80 });
    expect(game?.players[0].totalVotes).toBe(1);
    expect(game?.players[0].totalRounds).toBe(1);
  });

  it('should complete voting when all players have voted', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1');
    useGameStore.getState().joinGame('Player 2');
    
    const [player1, player2] = useGameStore.getState().game!.players;
    useGameStore.getState().submitVote(player1.id, 5, 80);
    useGameStore.getState().submitVote(player2.id, 8, 70);
    
    const game = useGameStore.getState().game;
    expect(game?.isVotingComplete).toBe(true);
  });

  it('should handle timer operations', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().startTimer();
    
    const game = useGameStore.getState().game;
    expect(game?.isTimerRunning).toBe(true);
    expect(game?.isPaused).toBe(false);
    
    vi.advanceTimersByTime(1000);
    expect(useGameStore.getState().game?.timeRemaining).toBe(299);
  });

  it('should pause and resume timer', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().startTimer();
    useGameStore.getState().pauseTimer();
    
    const pausedGame = useGameStore.getState().game;
    expect(pausedGame?.isPaused).toBe(true);
    
    vi.advanceTimersByTime(1000);
    expect(useGameStore.getState().game?.timeRemaining).toBe(300);
    
    useGameStore.getState().resumeTimer();
    expect(useGameStore.getState().game?.isPaused).toBe(false);
    
    vi.advanceTimersByTime(1000);
    expect(useGameStore.getState().game?.timeRemaining).toBe(299);
  });

  it('should reset votes and start new round', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1');
    const playerId = useGameStore.getState().game!.players[0].id;
    useGameStore.getState().submitVote(playerId, 5, 80);
    
    useGameStore.getState().resetVotes();
    
    const game = useGameStore.getState().game;
    expect(game?.players[0].vote).toBeNull();
    expect(game?.currentRound).toBe(2);
    expect(game?.storyPointHistory).toHaveLength(1);
    expect(game?.timeRemaining).toBe(300);
    expect(game?.isTimerRunning).toBe(true);
  });

  it('should calculate participation rate correctly', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1');
    const playerId = useGameStore.getState().game!.players[0].id;
    
    useGameStore.getState().submitVote(playerId, 5, 80);
    useGameStore.getState().resetVotes();
    useGameStore.getState().submitVote(playerId, 8, 90);
    
    const game = useGameStore.getState().game;
    expect(game?.players[0].participationRate).toBe(100);
    expect(game?.players[0].totalVotes).toBe(2);
    expect(game?.players[0].totalRounds).toBe(2);
  });

  it('should handle taking over another player', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1');
    useGameStore.getState().joinGame('Player 2');
    const player2Id = useGameStore.getState().game!.players[1].id;
    
    useGameStore.getState().takeOverPlayer(player2Id);
    
    const game = useGameStore.getState().game;
    expect(game?.currentPlayerIndex).toBe(1);
  });
});