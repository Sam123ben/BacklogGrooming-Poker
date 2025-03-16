import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useGameStore } from '@/lib/store';

describe('Game Store', () => {
  beforeEach(() => {
    useGameStore.setState({ game: null, wsClient: null });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create a new game and return game ID', () => {
    const gameId = useGameStore.getState().createGame(2, 300);
    const game = useGameStore.getState().game;

    expect(game).toBeDefined();
    expect(game?.maxPlayers).toBe(2);
    expect(game?.timerDuration).toBe(300);
    expect(game?.players).toHaveLength(2);
    expect(game?.players.every(p => !p.hasJoined)).toBe(true);
  });

  // TODO: Fix test after implementing proper Redis mock
  // it('should load existing game by ID', async () => {
  //   const gameId = useGameStore.getState().createGame(2, 300);
  //   useGameStore.setState({ game: null, wsClient: null });
    
  //   await useGameStore.getState().loadGame(gameId);
  //   const game = useGameStore.getState().game;
    
  //   expect(game).toBeDefined();
  //   expect(game?.id).toBe(gameId);
  // });

  it('should allow players to join the game', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1', 'avatar1.png');
    
    const game = useGameStore.getState().game;
    expect(game?.players.filter(p => p.hasJoined)).toHaveLength(1);
    expect(game?.players[0].name).toBe('Player 1');
    expect(game?.players[0].avatarUrl).toBe('avatar1.png');
  });

  it('should handle voting and confidence levels', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1', 'avatar1.png');
    
    const playerId = useGameStore.getState().game!.players[0].id;
    useGameStore.getState().submitVote(playerId, 5, 80);
    
    const game = useGameStore.getState().game;
    expect(game?.players[0].vote).toEqual({ value: 5, confidence: 80 });
  });

  it('should complete voting when all players have voted', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1', 'avatar1.png');
    useGameStore.getState().joinGame('Player 2', 'avatar2.png');
    
    const [player1, player2] = useGameStore.getState().game!.players;
    useGameStore.getState().submitVote(player1.id, 5, 80);
    useGameStore.getState().submitVote(player2.id, 8, 70);
    
    const game = useGameStore.getState().game;
    expect(game?.isVotingComplete).toBe(true);
  });

  it('should handle timer operations', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1', 'avatar1.png');
    useGameStore.getState().joinGame('Player 2', 'avatar2.png');
    
    useGameStore.getState().startGame();
    const game = useGameStore.getState().game;
    
    expect(game?.isTimerRunning).toBe(true);
    expect(game?.isPaused).toBe(false);
  });

  it('should pause and resume timer', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1', 'avatar1.png');
    useGameStore.getState().joinGame('Player 2', 'avatar2.png');
    
    useGameStore.getState().startGame();
    useGameStore.getState().pauseTimer();
    
    const pausedGame = useGameStore.getState().game;
    expect(pausedGame?.isPaused).toBe(true);
    
    vi.advanceTimersByTime(1000);
    expect(useGameStore.getState().game?.timeRemaining).toBe(300);
    
    useGameStore.getState().resumeTimer();
    expect(useGameStore.getState().game?.isPaused).toBe(false);
  });

  it('should reset votes and start new round', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1', 'avatar1.png');
    const playerId = useGameStore.getState().game!.players[0].id;
    useGameStore.getState().submitVote(playerId, 5, 80);
    
    useGameStore.getState().resetVotes();
    
    const game = useGameStore.getState().game;
    expect(game?.players[0].vote).toBeNull();
    expect(game?.currentRound).toBe(2);
    expect(game?.storyPointHistory).toHaveLength(1);
    expect(game?.timeRemaining).toBe(300);
    expect(game?.isTimerRunning).toBe(false);
  });

  it('should calculate participation rate correctly', () => {
    useGameStore.getState().createGame(2, 300);
    useGameStore.getState().joinGame('Player 1', 'avatar1.png');
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
    useGameStore.getState().joinGame('Player 1', 'avatar1.png');
    useGameStore.getState().joinGame('Player 2', 'avatar2.png');
    const player2Id = useGameStore.getState().game!.players[1].id;
    
    useGameStore.getState().takeOverPlayer(player2Id);
    
    const game = useGameStore.getState().game;
    expect(game?.currentPlayerIndex).toBe(1);
  });

  // TODO: Fix test after implementing proper WebSocket mock
  // it('should handle WebSocket game state updates', () => {
  //   const gameId = useGameStore.getState().createGame(2, 300);
  //   const wsClient = useGameStore.getState().wsClient;
    
  //   const onMessage = vi.fn();
  //   wsClient?.updateGameState({
  //     ...useGameStore.getState().game!,
  //     timeRemaining: 250,
  //     isTimerRunning: true
  //   });
    
  //   const game = useGameStore.getState().game;
  //   expect(game?.timeRemaining).toBe(250);
  //   expect(game?.isTimerRunning).toBe(true);
  // });
});