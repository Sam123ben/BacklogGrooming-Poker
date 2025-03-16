import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayingCards } from '@/components/playing-cards';
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

describe('PlayingCards Component', () => {
  const mockGame = {
    id: 'test-game-id',
    players: [
      { 
        id: '1', 
        name: 'Player 1', 
        vote: null, 
        participationRate: 100,
        totalVotes: 0,
        totalRounds: 0,
        votesThisSprint: 0,
        hasJoined: true,
        avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=test1'
      },
      { 
        id: '2', 
        name: 'Player 2', 
        vote: null, 
        participationRate: 100,
        totalVotes: 0,
        totalRounds: 0,
        votesThisSprint: 0,
        hasJoined: true,
        avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=test2'
      },
    ],
    currentPlayerIndex: 0,
    isVotingComplete: false,
    consensusThreshold: 70,
    sprintNumber: 1,
    currentRound: 1,
    storyPointHistory: [],
    timeRemaining: 300,
    timerDuration: 300,
    isTimerRunning: true,
    isPaused: false,
    maxPlayers: 2,
  };

  const mockStore = {
    game: mockGame,
    wsClient: {
      sendMessage: vi.fn(),
      updateGameState: vi.fn(),
      disconnect: vi.fn(),
    },
    submitVote: vi.fn(),
    resetVotes: vi.fn(),
    takeOverPlayer: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGameStore).mockImplementation(() => mockStore);
  });

  it('renders all Fibonacci number cards', () => {
    render(<PlayingCards />);
    [1, 2, 3, 5, 8, 13].forEach(number => {
      expect(screen.getByText(number.toString())).toBeInTheDocument();
    });
  });

  // TODO: Fix test after implementing proper hover state mock
  // it('shows card descriptions on hover', () => {
  //   render(<PlayingCards />);
  //   const card = screen.getByText('5').closest('div');
    
  //   if (card) {
  //     fireEvent.mouseEnter(card);
  //     expect(screen.getByText(/complexity/i)).toBeInTheDocument();
      
  //     fireEvent.mouseLeave(card);
  //     expect(screen.queryByText(/complexity/i)).not.toBeInTheDocument();
  //   }
  // });

  it('shows confidence slider after selecting a card', () => {
    render(<PlayingCards />);
    fireEvent.click(screen.getByText('5'));
    
    expect(screen.getByText(/How confident are you/)).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  // TODO: Fix test after implementing proper slider value mock
  // it('submits vote with confidence', () => {
  //   render(<PlayingCards />);
  //   fireEvent.click(screen.getByText('5'));
    
  //   const slider = screen.getByRole('slider');
  //   fireEvent.change(slider, { target: { value: '80' } });
    
  //   fireEvent.click(screen.getByText(/Submit Vote/i));
  //   expect(mockStore.submitVote).toHaveBeenCalledWith('1', 5, 80);
  // });

  it('shows results panel when voting is complete', () => {
    vi.mocked(useGameStore).mockImplementation(() => ({
      ...mockStore,
      game: {
        ...mockGame,
        isVotingComplete: true,
        players: mockGame.players.map(p => ({
          ...p,
          vote: { value: 5, confidence: 80 },
        })),
      },
    }));

    render(<PlayingCards />);
    expect(screen.getByText(/Team Confidence/)).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  // TODO: Fix test after implementing proper button selection mock
  // it('allows taking over another player', () => {
  //   render(<PlayingCards />);
  //   const takeOverButton = screen.getByRole('button', { name: /take over as Player 2/i });
  //   fireEvent.click(takeOverButton);
  //   expect(mockStore.takeOverPlayer).toHaveBeenCalledWith('2');
  // });

  it('prevents re-renders of cards when timer updates', () => {
    const { rerender } = render(<PlayingCards />);
    
    const initialCard = screen.getByText('5').closest('div');
    const initialHtml = initialCard?.innerHTML;

    vi.mocked(useGameStore).mockImplementation(() => ({
      ...mockStore,
      game: {
        ...mockGame,
        timeRemaining: 290,
      },
    }));

    rerender(<PlayingCards />);
    
    const updatedCard = screen.getByText('5').closest('div');
    expect(updatedCard?.innerHTML).toBe(initialHtml);
  });
});