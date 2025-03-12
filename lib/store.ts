"use client";

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketClient } from './websocket';

export type Vote = {
  value: number;
  confidence: number;
};

export type Player = {
  id: string;
  name: string;
  vote: Vote | null;
  participationRate: number;
  votesThisSprint: number;
  totalVotes: number;
  totalRounds: number;
};

export type StoryPoint = {
  id: string;
  finalValue: number;
  timestamp: number;
  consensusRate: number;
  votingDuration: number;
};

export type GameState = {
  id: string;
  players: Player[];
  maxPlayers: number;
  isVotingComplete: boolean;
  timeRemaining: number;
  timerDuration: number;
  isTimerRunning: boolean;
  isPaused: boolean;
  currentPlayerIndex: number;
  storyPointHistory: StoryPoint[];
  sprintNumber: number;
  consensusThreshold: number;
  currentRound: number;
  lastSyncTimestamp: number;
};

type GameStore = {
  game: GameState | null;
  wsClient: WebSocketClient | null;
  createGame: (maxPlayers: number, timerDuration: number) => string;
  loadGame: (gameId: string) => void;
  joinGame: (name: string) => void;
  submitVote: (playerId: string, value: number, confidence: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetVotes: () => void;
  completeVoting: () => void;
  takeOverPlayer: (playerId: string) => void;
  updateConsensusThreshold: (threshold: number) => void;
};

function calculateFinalValue(players: Player[]): number {
  const votes = players
    .map((p) => p.vote?.value)
    .filter((v): v is number => v !== null);
  
  if (votes.length === 0) return 0;
  return Math.round(votes.reduce((a, b) => a + b, 0) / votes.length);
}

function calculateConsensusRate(players: Player[]): number {
  const votes = players
    .map((p) => p.vote?.value)
    .filter((v): v is number => v !== null);
  
  if (votes.length <= 1) return 100;
  
  const mode = findMode(votes);
  const agreementCount = votes.filter(v => v === mode).length;
  
  return (agreementCount / votes.length) * 100;
}

function findMode(numbers: number[]): number {
  const counts = numbers.reduce((acc, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  let mode = numbers[0];
  let maxCount = 0;

  for (const [num, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mode = Number(num);
    }
  }

  return mode;
}

export const useGameStore = create<GameStore>((set, get) => {
  let timerInterval: number | null = null;
  let rafId: number | null = null;

  const startTimer = () => {
    const game = get().game;
    if (!game) return;

    if (timerInterval) {
      clearInterval(timerInterval);
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    const updatedGame = {
      ...game,
      isTimerRunning: true,
      isPaused: false,
      lastSyncTimestamp: Date.now(),
    };

    set({ game: updatedGame });
    get().wsClient?.updateGameState(updatedGame);

    let lastUpdate = performance.now();
    const updateTimer = () => {
      const currentGame = get().game;
      if (!currentGame || !currentGame.isTimerRunning || currentGame.isPaused) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        return;
      }

      const now = performance.now();
      const delta = now - lastUpdate;

      if (delta >= 1000) {
        lastUpdate = now;

        if (currentGame.timeRemaining <= 0) {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          const updatedGame = {
            ...currentGame,
            isVotingComplete: true,
            isTimerRunning: false,
            isPaused: false,
            lastSyncTimestamp: Date.now(),
          };
          set({ game: updatedGame });
          get().wsClient?.updateGameState(updatedGame);
          return;
        }

        const updatedGame = {
          ...currentGame,
          timeRemaining: currentGame.timeRemaining - 1,
          lastSyncTimestamp: Date.now(),
        };
        set({ game: updatedGame });
        get().wsClient?.updateGameState(updatedGame);
      }

      rafId = requestAnimationFrame(updateTimer);
    };

    rafId = requestAnimationFrame(updateTimer);
  };

  return {
    game: null,
    wsClient: null,
    createGame: (maxPlayers: number, timerDuration: number) => {
      const gameId = uuidv4();
      const newGame: GameState = {
        id: gameId,
        players: [],
        maxPlayers,
        isVotingComplete: false,
        timeRemaining: timerDuration,
        timerDuration,
        isTimerRunning: false,
        isPaused: false,
        currentPlayerIndex: 0,
        storyPointHistory: [],
        sprintNumber: 1,
        consensusThreshold: 70,
        currentRound: 1,
        lastSyncTimestamp: Date.now(),
      };

      const wsClient = new WebSocketClient(gameId, (data) => {
        if (data.type === 'gameState') {
          set({ game: data.state });
          if (data.state.isTimerRunning && !data.state.isPaused) {
            startTimer();
          }
        }
      });
      
      set({ game: newGame, wsClient });
      wsClient.updateGameState(newGame);
      
      return gameId;
    },
    loadGame: (gameId: string) => {
      const wsClient = new WebSocketClient(gameId, (data) => {
        if (data.type === 'gameState') {
          set({ game: data.state });
          if (data.state.isTimerRunning && !data.state.isPaused) {
            startTimer();
          }
        }
      });
      set({ wsClient });
    },
    joinGame: (name: string) => {
      const { game, wsClient } = get();
      if (!game || game.players.length >= game.maxPlayers) return;

      const newPlayer: Player = {
        id: uuidv4(),
        name,
        vote: null,
        participationRate: 100,
        votesThisSprint: 0,
        totalVotes: 0,
        totalRounds: 0,
      };

      const updatedGame = {
        ...game,
        players: [...game.players, newPlayer],
        currentPlayerIndex: game.players.length,
        lastSyncTimestamp: Date.now(),
      };

      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
    },
    submitVote: (playerId: string, value: number, confidence: number) => {
      const { game, wsClient } = get();
      if (!game) return;

      const updatedPlayers = game.players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              vote: { value, confidence },
              votesThisSprint: player.votesThisSprint + 1,
              totalVotes: player.totalVotes + 1,
              totalRounds: player.totalRounds + 1,
              participationRate: Math.round((player.totalVotes / game.currentRound) * 100),
            }
          : player
      );

      const allVoted = updatedPlayers.every((player) => player.vote !== null);
      const updatedGame = {
        ...game,
        players: updatedPlayers,
        isVotingComplete: allVoted,
        lastSyncTimestamp: Date.now(),
      };

      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
    },
    startTimer,
    stopTimer: () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const { game, wsClient } = get();
      if (!game) return;
      
      const updatedGame = {
        ...game,
        isTimerRunning: false,
        isPaused: false,
        lastSyncTimestamp: Date.now(),
      };
      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
    },
    pauseTimer: () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const { game, wsClient } = get();
      if (!game) return;
      
      const updatedGame = {
        ...game,
        isPaused: true,
        lastSyncTimestamp: Date.now(),
      };
      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
    },
    resumeTimer: () => {
      const { game, wsClient } = get();
      if (!game) return;

      const updatedGame = {
        ...game,
        isPaused: false,
        lastSyncTimestamp: Date.now(),
      };
      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
      startTimer();
    },
    resetVotes: () => {
      const { game, wsClient } = get();
      if (!game) return;

      const newStoryPoint: StoryPoint = {
        id: uuidv4(),
        finalValue: calculateFinalValue(game.players),
        timestamp: Date.now(),
        consensusRate: calculateConsensusRate(game.players),
        votingDuration: game.timerDuration - game.timeRemaining,
      };

      const updatedGame = {
        ...game,
        players: game.players.map((player) => ({ ...player, vote: null })),
        isVotingComplete: false,
        timeRemaining: game.timerDuration,
        isTimerRunning: false,
        isPaused: false,
        storyPointHistory: [...game.storyPointHistory, newStoryPoint],
        currentRound: game.currentRound + 1,
        lastSyncTimestamp: Date.now(),
      };

      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
    },
    completeVoting: () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const { game, wsClient } = get();
      if (!game) return;
      
      const updatedGame = {
        ...game,
        isVotingComplete: true,
        isTimerRunning: false,
        isPaused: false,
        lastSyncTimestamp: Date.now(),
      };
      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
    },
    takeOverPlayer: (playerId: string) => {
      const { game, wsClient } = get();
      if (!game) return;
      
      const playerIndex = game.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return;
      
      const updatedGame = {
        ...game,
        currentPlayerIndex: playerIndex,
        lastSyncTimestamp: Date.now(),
      };
      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
    },
    updateConsensusThreshold: (threshold: number) => {
      const { game, wsClient } = get();
      if (!game) return;
      
      const updatedGame = {
        ...game,
        consensusThreshold: threshold,
        lastSyncTimestamp: Date.now(),
      };
      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
    },
  };
});