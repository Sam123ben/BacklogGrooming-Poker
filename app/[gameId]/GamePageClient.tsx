"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Users } from "lucide-react";

interface GamePageClientProps {
  gameId: string;
}

export default function GamePageClient({ gameId }: GamePageClientProps) {
  const router = useRouter();
  const { game, loadGame, joinGame } = useGameStore();
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    if (gameId) {
      loadGame(gameId);
    }
  }, [gameId, loadGame]);

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      joinGame(playerName);
      setPlayerName("");
    }
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

  // If the game is not full yet, show the join game form.
  if (game.players.length < game.maxPlayers) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-[400px] shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-blue-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-200">
                Join Game
              </CardTitle>
              <CardDescription className="text-center text-blue-600 dark:text-blue-400">
                {game.players.length} of {game.maxPlayers} players joined
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinGame} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      className="pl-10"
                      required
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  size="lg"
                >
                  Join Game
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // If the game is full, display the game session (voting/results view)
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
          <Timer />
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