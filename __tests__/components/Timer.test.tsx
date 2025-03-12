import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Timer } from '@/components/timer';
import { useGameStore } from '@/lib/store';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/lib/store', () => ({
  useGameStore: vi.fn(),
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
    startTimer: vi.fn(),
    pauseTimer: vi.fn(),
    resumeTimer: vi.fn(),
    completeVoting: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGameStore).mockImplementation(() => mockStore);
  });

  it('renders timer with correct format', () => {
    render(<Timer />);
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  it('shows low time warning style when time is below 60 seconds', () => {
    vi.mocked(useGameStore).mockImplementation(() => ({
      ...mockStore,
      game: { ...mockGame, timeRemaining: 30 },
    }));
    
    render(<Timer />);
    const timerContainer = screen.getByText('0:30').closest('div');
    expect(timerContainer).toHaveClass('text-rose-500', 'dark:text-rose-400');
  });

  it('handles pause and resume', () => {
    render(<Timer />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(mockStore.pauseTimer).toHaveBeenCalled();

    vi.mocked(useGameStore).mockImplementation(() => ({
      ...mockStore,
      game: { ...mockGame, isPaused: true },
    }));

    render(<Timer />);
    fireEvent.click(button);
    expect(mockStore.resumeTimer).toHaveBeenCalled();
  });

  it('completes voting when time reaches zero', () => {
    vi.mocked(useGameStore).mockImplementation(() => ({
      ...mockStore,
      game: { ...mockGame, timeRemaining: 0 },
    }));
    
    render(<Timer />);
    expect(mockStore.completeVoting).toHaveBeenCalled();
  });

  it('prevents unnecessary re-renders', () => {
    const { rerender } = render(<Timer />);
    
    const initialTimer = screen.getByText('5:00');
    const initialHtml = initialTimer.innerHTML;

    vi.mocked(useGameStore).mockImplementation(() => ({
      ...mockStore,
      game: {
        ...mockGame,
        players: [...mockGame.players, { id: '2', name: 'Player 2' }],
      },
    }));

    rerender(<Timer />);
    
    const updatedTimer = screen.getByText('5:00');
    expect(updatedTimer.innerHTML).toBe(initialHtml);
  });
});