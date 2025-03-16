"use client";

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketClient } from './websocket';
import { saveGame, loadGame } from './redis';

export type Vote = {
  value: number;
  confidence: number;
};

export type Player = {
  id: string;
  name: string;
  avatarUrl: string;
  vote: Vote | null;
  participationRate: number;
  votesThisSprint: number;
  totalVotes: number;
  totalRounds: number;
  hasJoined: boolean;
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
  canStartGame: boolean;
};

type GameStore = {
  game: GameState | null;
  wsClient: WebSocketClient | null;
  createGame: (maxPlayers: number, timerDuration: number) => string;
  loadGame: (gameId: string) => void;
  joinGame: (name: string, avatarUrl: string) => void;
  submitVote: (playerId: string, value: number, confidence: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetVotes: () => void;
  completeVoting: () => void;
  takeOverPlayer: (playerId: string) => void;
  updateConsensusThreshold: (threshold: number) => void;
  startGame: () => void;
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
  let animationFrameId: number | null = null;
  let lastUpdateTime = 0;

  const updateTimer = (timestamp: number) => {
    const game = get().game;
    if (!game || !game.isTimerRunning || game.isPaused) {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      return;
    }

    if (!lastUpdateTime) {
      lastUpdateTime = timestamp;
    }

    const deltaTime = timestamp - lastUpdateTime;

    if (deltaTime >= 1000) {
      lastUpdateTime = timestamp;

      if (game.timeRemaining <= 0) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        const updatedGame = {
          ...game,
          isVotingComplete: true,
          isTimerRunning: false,
          isPaused: false,
          lastSyncTimestamp: Date.now(),
        };
        set({ game: updatedGame });
        get().wsClient?.updateGameState(updatedGame);
        saveGame(game.id, updatedGame);
        return;
      }

      const updatedGame = {
        ...game,
        timeRemaining: game.timeRemaining - 1,
        lastSyncTimestamp: Date.now(),
      };
      set({ game: updatedGame });
      get().wsClient?.updateGameState(updatedGame);
      saveGame(game.id, updatedGame);
    }

    animationFrameId = requestAnimationFrame(updateTimer);
  };

  const startTimer = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }

    lastUpdateTime = 0;
    animationFrameId = requestAnimationFrame(updateTimer);
  };

  return {
    game: null,
    wsClient: null,
    createGame: (maxPlayers: number, timerDuration: number) => {
      const gameId = uuidv4();
      const newGame: GameState = {
        id: gameId,
        players: Array(maxPlayers).fill(null).map(() => ({
          id: uuidv4(),
          name: '',
          avatarUrl: '',
          vote: null,
          participationRate: 100,
          votesThisSprint: 0,
          totalVotes: 0,
          totalRounds: 0,
          hasJoined: false,
        })),
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
        canStartGame: false,
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
      saveGame(gameId, newGame);
      
      return gameId;
    },
    loadGame: async (gameId: string) => {
      const existingGame = await loadGame(gameId);
      if (existingGame) {
        const wsClient = new WebSocketClient(gameId, (data) => {
          if (data.type === 'gameState') {
            set({ game: data.state });
            if (data.state.isTimerRunning && !data.state.isPaused) {
              startTimer();
            }
          }
        });
        set({ game: existingGame, wsClient });
      }
    },
    joinGame: (name: string, avatarUrl: string) => {
      const { game, wsClient } = get();
      if (!game) return;

      const availableSlot = game.players.findIndex(p => !p.hasJoined);
      if (availableSlot === -1) return;

      const updatedPlayers = [...game.players];
      updatedPlayers[availableSlot] = {
        ...updatedPlayers[availableSlot],
        name,
        avatarUrl,
        hasJoined: true,
      };

      const allPlayersJoined = updatedPlayers.every(p => p.hasJoined);

      const updatedGame = {
        ...game,
        players: updatedPlayers,
        currentPlayerIndex: availableSlot,
        canStartGame: allPlayersJoined,
        lastSyncTimestamp: Date.now(),
      };

      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
      saveGame(game.id, updatedGame);
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
              participationRate: Math.round(((player.totalVotes + 1) / game.currentRound) * 100),
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
      saveGame(game.id, updatedGame);
    },
    startTimer,
    stopTimer: () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
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
      saveGame(game.id, updatedGame);
    },
    pauseTimer: () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
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
      saveGame(game.id, updatedGame);
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
      saveGame(game.id, updatedGame);
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
      saveGame(game.id, updatedGame);
    },
    completeVoting: () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
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
      saveGame(game.id, updatedGame);
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
      saveGame(game.id, updatedGame);
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
      saveGame(game.id, updatedGame);
    },
    startGame: () => {
      const { game, wsClient } = get();
      if (!game || !game.canStartGame) return;
      
      const updatedGame = {
        ...game,
        isTimerRunning: true,
        isPaused: false,
        lastSyncTimestamp: Date.now(),
      };
      set({ game: updatedGame });
      wsClient?.updateGameState(updatedGame);
      saveGame(game.id, updatedGame);
      startTimer();
    },
  };
});