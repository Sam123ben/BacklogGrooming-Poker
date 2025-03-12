"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { Users, Clock, Dices } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState<number>(5);
  const [timerDuration, setTimerDuration] = useState<number>(300);
  const { createGame } = useGameStore();

  const handleCreateGame = () => {
    const gameId = createGame(playerCount, timerDuration);
    router.push(`/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[400px] shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-blue-100 dark:border-gray-700">
          <CardHeader>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex items-center justify-center mb-4"
            >
              <Dices className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-200">
              Planning Poker
            </CardTitle>
            <CardDescription className="text-center text-blue-600 dark:text-blue-400">
              Create a new planning poker session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="players">Number of Players</Label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="players"
                      type="number"
                      min={2}
                      max={10}
                      value={playerCount}
                      onChange={(e) => setPlayerCount(Number(e.target.value))}
                      className="pl-10"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timer">Timer Duration</Label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Select
                      value={String(timerDuration)}
                      onValueChange={(value) => setTimerDuration(Number(value))}
                    >
                      <SelectTrigger id="timer" className="w-full pl-10">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="180">3 minutes</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                        <SelectItem value="600">10 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                size="lg"
                onClick={handleCreateGame}
              >
                Create Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}