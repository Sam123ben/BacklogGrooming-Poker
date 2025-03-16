"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGameStore } from "@/lib/store";
import { PlayingCards } from "@/components/playing-cards";
import { Timer } from "@/components/timer";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { WaitingScreen } from "@/components/waiting-screen";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface GamePageClientProps {
  gameId: string;
}

export default function GamePageClient({ gameId }: GamePageClientProps) {
  const router = useRouter();
  const { game, loadGame, joinGame } = useGameStore();
  const [hasJoined, setHasJoined] = useState(false);

  const refreshGame = useCallback(() => {
    if (gameId) {
      loadGame(gameId);
    }
  }, [gameId, loadGame]);

  useEffect(() => {
    refreshGame();
  }, [refreshGame]);

  // Auto-start game when all players have joined
  useEffect(() => {
    if (game?.canStartGame && !game.isTimerRunning) {
      // Small delay to allow for state sync
      const timer = setTimeout(() => {
        useGameStore.getState().startGame();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [game?.canStartGame, game?.isTimerRunning]);

  const handleJoinGame = (name: string, avatarUrl: string) => {
    joinGame(name, avatarUrl);
    setHasJoined(true);
  };

  // When game data isn't loaded or the game doesn't exist:
  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-[400px] shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-blue-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-red-600 dark:text-red-400">
                Game Not Found
              </CardTitle>
              <CardDescription className="text-center">
                This game session doesn&apos;t exist or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                onClick={() => router.push("/")}
              >
                Create New Game
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // If the player hasn't joined yet and there are available slots
  if (!hasJoined && game.players.some(p => !p.hasJoined)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AvatarPicker onSubmit={handleJoinGame} />
        </motion.div>
      </div>
    );
  }

  // Waiting for other players to join
  if (!game.canStartGame) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <WaitingScreen onRefresh={refreshGame} />
        </motion.div>
      </div>
    );
  }

  // Game is in progress
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-blue-800 dark:text-blue-200"
          >
            Planning Poker
          </motion.h1>
          <div className="flex items-center gap-4">
            <Timer />
            <ThemeSwitcher />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={game.isVotingComplete ? "results" : "voting"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PlayingCards />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}