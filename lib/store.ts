"use client";

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { saveGame, loadGame, deleteGame } from './redis';

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
  createGame: (maxPlayers: number, timerDuration: number) => string;
  loadGame: (gameId: string) => Promise<void>;
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
  syncGameState: () => Promise<void>;
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
  let syncInterval: number | null = null;

  const startTimer = () => {
    const game = get().game;
    if (!game) return;

    if (timerInterval) {
      clearInterval(timerInterval);
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    set({
      game: {
        ...game,
        isTimerRunning: true,
        isPaused: false,
      },
    });

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
          saveGame(updatedGame.id, updatedGame);
          set({ game: updatedGame });
          return;
        }

        const updatedGame = {
          ...currentGame,
          timeRemaining: currentGame.timeRemaining - 1,
          lastSyncTimestamp: Date.now(),
        };
        saveGame(updatedGame.id, updatedGame);
        set({ game: updatedGame });
      }

      rafId = requestAnimationFrame(updateTimer);
    };

    rafId = requestAnimationFrame(updateTimer);
  };

  const startSync = (gameId: string) => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }

    // Sync every 2 seconds
    syncInterval = window.setInterval(async () => {
      const currentGame = get().game;
      if (!currentGame) return;

      try {
        const serverGame = await loadGame(gameId);
        if (!serverGame) return;

        // Only update if server state is newer
        if (serverGame.lastSyncTimestamp > currentGame.lastSyncTimestamp) {
          set({ game: serverGame });
          
          // Restart timer if it should be running
          if (serverGame.isTimerRunning && !serverGame.isPaused) {
            startTimer();
          }
        }
      } catch (error) {
        console.error('Game sync error:', error);
      }
    }, 2000);
  };

  return {
    game: null,
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
      
      saveGame(gameId, newGame);
      set({ game: newGame });
      startSync(gameId);
      return gameId;
    },
    loadGame: async (gameId: string) => {
      const game = await loadGame(gameId);
      if (game) {
        set({ game });
        startSync(gameId);
        if (game.isTimerRunning && !game.isPaused) {
          startTimer();
        }
      }
    },
    syncGameState: async () => {
      const currentGame = get().game;
      if (!currentGame) return;
      
      const serverGame = await loadGame(currentGame.id);
      if (serverGame && serverGame.lastSyncTimestamp > currentGame.lastSyncTimestamp) {
        set({ game: serverGame });
      }
    },
    joinGame: (name: string) => {
      const game = get().game;
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

      saveGame(game.id, updatedGame);
      set({ game: updatedGame });

      if (updatedGame.players.length === game.maxPlayers) {
        startTimer();
      }
    },
    submitVote: (playerId: string, value: number, confidence: number) => {
      const game = get().game;
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

      saveGame(game.id, updatedGame);
      set({ game: updatedGame });
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
      const game = get().game;
      if (!game) return;
      
      const updatedGame = {
        ...game,
        isTimerRunning: false,
        isPaused: false,
        lastSyncTimestamp: Date.now(),
      };
      saveGame(updatedGame.id, updatedGame);
      set({ game: updatedGame });
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
      const game = get().game;
      if (!game) return;
      
      const updatedGame = {
        ...game,
        isPaused: true,
        lastSyncTimestamp: Date.now(),
      };
      saveGame(updatedGame.id, updatedGame);
      set({ game: updatedGame });
    },
    resumeTimer: () => {
      const game = get().game;
      if (!game) return;

      const updatedGame = {
        ...game,
        isPaused: false,
        lastSyncTimestamp: Date.now(),
      };
      saveGame(updatedGame.id, updatedGame);
      set({ game: updatedGame });
      startTimer();
    },
    resetVotes: () => {
      const game = get().game;
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
        isTimerRunning: true,
        isPaused: false,
        storyPointHistory: [...game.storyPointHistory, newStoryPoint],
        currentRound: game.currentRound + 1,
        lastSyncTimestamp: Date.now(),
      };

      saveGame(game.id, updatedGame);
      set({ game: updatedGame });
      startTimer();
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
      const game = get().game;
      if (!game) return;
      
      const updatedGame = {
        ...game,
        isVotingComplete: true,
        isTimerRunning: false,
        isPaused: false,
        lastSyncTimestamp: Date.now(),
      };
      saveGame(updatedGame.id, updatedGame);
      set({ game: updatedGame });
    },
    takeOverPlayer: (playerId: string) => {
      const game = get().game;
      if (!game) return;
      
      const playerIndex = game.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return;
      
      const updatedGame = {
        ...game,
        currentPlayerIndex: playerIndex,
        lastSyncTimestamp: Date.now(),
      };
      saveGame(updatedGame.id, updatedGame);
      set({ game: updatedGame });
    },
    updateConsensusThreshold: (threshold: number) => {
      const game = get().game;
      if (!game) return;
      
      const updatedGame = {
        ...game,
        consensusThreshold: threshold,
        lastSyncTimestamp: Date.now(),
      };
      saveGame(updatedGame.id, updatedGame);
      set({ game: updatedGame });
    },
  };
});