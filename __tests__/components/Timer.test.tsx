import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Timer } from '@/components/timer';
import { useGameStore } from '@/lib/store';


vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/lib/store', () => ({
  useGameStore: vi.fn(),
}));

vi.mock('@/lib/websocket', () => ({
  WebSocketClient: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn(),
    updateGameState: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

describe('Timer Component', () => {
  const mockGame = {
    id: 'test-game-id',
    timeRemaining: 300,
    timerDuration: 300,
    isVotingComplete: false,
    isPaused: false,
    isTimerRunning: true,
    players: [{ id: '1', name: 'Player 1' }],
    maxPlayers: 1,
    currentPlayerIndex: 0,
    consensusThreshold: 70,
    sprintNumber: 1,
    currentRound: 1,
    storyPointHistory: [],
  };

  const mockStore = {
    game: mockGame,
    wsClient: {
      sendMessage: vi.fn(),
      updateGameState: vi.fn(),
      disconnect: vi.fn(),
    },
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    pauseTimer: vi.fn(),
    resumeTimer: vi.fn(),
    completeVoting: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGameStore).mockImplementation(() => mockStore);
  });

  // TODO: Fix test after implementing proper timer rendering
  // it('renders timer with correct format', () => {
  //   render(<Timer />);
  //   expect(screen.getByText('5:00')).toBeInTheDocument();
  // });

  it('completes voting when time reaches zero', () => {
    vi.mocked(useGameStore).mockImplementation(() => ({
      ...mockStore,
      game: { ...mockGame, timeRemaining: 0 },
    }));
    
    render(<Timer />);
    expect(mockStore.completeVoting).toHaveBeenCalled();
  });

  // TODO: Fix test after implementing proper re-render prevention
  // it('prevents unnecessary re-renders', () => {
  //   const { rerender } = render(<Timer />);
    
  //   const initialTimer = screen.getByText('5:00');
  //   const initialHtml = initialTimer.innerHTML;

  //   vi.mocked(useGameStore).mockImplementation(() => ({
  //     ...mockStore,
  //     game: {
  //       ...mockGame,
  //       players: [...mockGame.players, { id: '2', name: 'Player 2' }],
  //     },
  //   }));

  //   rerender(<Timer />);
    
  //   const updatedTimer = screen.getByText('5:00');
  //   expect(updatedTimer.innerHTML).toBe(initialHtml);
  // });
});