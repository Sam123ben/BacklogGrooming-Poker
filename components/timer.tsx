"use client";

import { memo, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { Play, Pause, Timer as TimerIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

const TimerText = memo(function TimerText({
  minutes,
  seconds
}: {
  minutes: number;
  seconds: number;
}) {
  return (
    <motion.div 
      className="text-2xl font-mono tabular-nums"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </motion.div>
  );
});

const TimerProgress = memo(function TimerProgress({
  progress,
  isLowTime
}: {
  progress: number;
  isLowTime: boolean;
}) {
  return (
    <Progress 
      value={progress} 
      className={`w-32 h-1.5 transition-colors duration-300 ${
        isLowTime ? "bg-rose-100 dark:bg-rose-950" : "bg-blue-100 dark:bg-blue-900"
      }`}
    />
  );
});

const TimerButton = memo(function TimerButton({
  isPaused,
  onPause,
  onResume
}: {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}) {
  const handleClick = useCallback(() => {
    if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  }, [isPaused, onPause, onResume]);

  return (
    <Button
      variant={isPaused ? "default" : "secondary"}
      size="icon"
      className={`backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-blue-100 dark:border-blue-900 transition-colors duration-300 ${
        isPaused 
          ? "hover:bg-emerald-500 hover:text-white" 
          : "hover:bg-amber-500 hover:text-white"
      }`}
      onClick={handleClick}
    >
      {isPaused ? (
        <Play className="h-4 w-4" />
      ) : (
        <Pause className="h-4 w-4" />
      )}
    </Button>
  );
});

export const Timer = memo(function Timer() {
  const { game, pauseTimer, resumeTimer, completeVoting } = useGameStore();

  useEffect(() => {
    if (game?.timeRemaining === 0) {
      completeVoting();
    }
  }, [game?.timeRemaining, completeVoting]);

  const { minutes, seconds, progress, isLowTime } = useMemo(() => {
    if (!game) return { minutes: 0, seconds: 0, progress: 0, isLowTime: false };
    
    const mins = Math.floor(game.timeRemaining / 60);
    const secs = game.timeRemaining % 60;
    const prog = (game.timeRemaining / game.timerDuration) * 100;
    const lowTime = game.timeRemaining < 60;
  
    return {
      minutes: mins,
      seconds: secs,
      progress: prog,
      isLowTime: lowTime
    };
  }, [game]);  

  if (!game) return null;

  return (
    <motion.div 
      className="flex items-center gap-4"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col gap-2">
        <div className={`flex items-center gap-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 px-6 py-3 rounded-lg border border-blue-100 dark:border-blue-900 transition-colors duration-300 ${
          isLowTime ? "text-rose-500 dark:text-rose-400" : "text-blue-700 dark:text-blue-300"
        }`}>
          <TimerIcon className="w-5 h-5" />
          <TimerText minutes={minutes} seconds={seconds} />
        </div>
        <TimerProgress progress={progress} isLowTime={isLowTime} />
      </div>
      
      {!game.isVotingComplete && game.players.length === game.maxPlayers && (
        <AnimatePresence mode="wait">
          <TimerButton
            key={game.isPaused ? "paused" : "running"}
            isPaused={game.isPaused}
            onPause={pauseTimer}
            onResume={resumeTimer}
          />
        </AnimatePresence>
      )}
    </motion.div>
  );
});