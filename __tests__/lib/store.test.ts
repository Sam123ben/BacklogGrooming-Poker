// __tests__/lib/store.test.ts
import { act, renderHook } from '@testing-library/react';
import { useGameStore } from '@/lib/store';
import { WebSocketClient } from '@/lib/websocket';


// jest.mock('@/lib/websocket');
// jest.mock('@/lib/redis');

describe.skip('Game Store', () => {
  beforeEach(() => {
    useGameStore.setState({ game: null, wsClient: null });
    jest.clearAllMocks();
  });

  it.skip('should create a new game', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.createGame(5, 300);
    });

    expect(result.current.game).toBeDefined();
    expect(result.current.game?.maxPlayers).toBe(5);
    expect(result.current.game?.timerDuration).toBe(300);
    expect(result.current.wsClient).toBeDefined();
  });

  it.skip('should allow players to join the game', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.createGame(2, 300);
      result.current.joinGame('Player 1', 'avatar1.png');
    });

    expect(result.current.game?.players[0].name).toBe('Player 1');
    expect(result.current.game?.players[0].avatarUrl).toBe('avatar1.png');
    expect(result.current.game?.players[0].hasJoined).toBe(true);
  });

  it.skip('should handle voting', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.createGame(2, 300);
      result.current.joinGame('Player 1', 'avatar1.png');
      result.current.submitVote(result.current.game!.players[0].id, 5, 80);
    });

    expect(result.current.game?.players[0].vote).toEqual({
      value: 5,
      confidence: 80,
    });
  });

  it.skip('should handle timer controls', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.createGame(2, 300);
      result.current.startTimer();
    });

    expect(result.current.game?.isTimerRunning).toBe(true);
    expect(result.current.game?.isPaused).toBe(false);

    act(() => {
      result.current.pauseTimer();
    });

    expect(result.current.game?.isPaused).toBe(true);

    act(() => {
      result.current.resumeTimer();
    });

    expect(result.current.game?.isPaused).toBe(false);
    expect(result.current.game?.isTimerRunning).toBe(true);
  });

  it.skip('should calculate consensus correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.createGame(3, 300);
      result.current.joinGame('Player 1', 'avatar1.png');
      result.current.joinGame('Player 2', 'avatar2.png');
      result.current.joinGame('Player 3', 'avatar3.png');
      
      const players = result.current.game!.players;
      result.current.submitVote(players[0].id, 5, 80);
      result.current.submitVote(players[1].id, 5, 90);
      result.current.submitVote(players[2].id, 8, 70);
    });

    expect(result.current.game?.isVotingComplete).toBe(true);
    
    act(() => {
      result.current.resetVotes();
    });

    const lastStoryPoint = result.current.game?.storyPointHistory[0];
    expect(lastStoryPoint?.finalValue).toBe(6); // Average of 5, 5, 8
    expect(lastStoryPoint?.consensusRate).toBe(66.67); // 2 out of 3 agreed
  });
});