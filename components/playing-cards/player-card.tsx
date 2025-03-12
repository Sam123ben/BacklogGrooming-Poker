"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CARD_COLORS } from "./constants";
import { PlayerCardProps } from "./types";
import { motion } from "framer-motion";

const PlayerVote = memo(function PlayerVote({ 
  value, 
  confidence 
}: { 
  value: number;
  confidence: number;
}) {
  return (
    <div className="space-y-2 text-center">
      <div className="text-3xl font-bold">
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {confidence}% confident
      </div>
    </div>
  );
});

const VoteCheck = memo(function VoteCheck() {
  return (
    <div className="text-2xl text-blue-500 dark:text-blue-400">
      ✓
    </div>
  );
});

const TakeOverButton = memo(function TakeOverButton({
  playerName,
  onTakeOver
}: {
  playerName: string;
  onTakeOver: () => void;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onTakeOver}
          >
            <UserPlus2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Take over as {playerName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export const PlayerCard = memo(function PlayerCard({ 
  player, 
  isCurrentPlayer, 
  isVotingComplete,
  onTakeOver 
}: PlayerCardProps) {
  return (
    <motion.div 
      className="relative group"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      layout
    >
      <Card 
        className={`w-32 h-48 flex flex-col items-center justify-center p-4 transition-colors duration-300
          ${isVotingComplete && player.vote
            ? `bg-gradient-to-b ${CARD_COLORS[player.vote.value as keyof typeof CARD_COLORS]}`
            : player.vote 
              ? "bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30"
              : isCurrentPlayer
                ? "ring-2 ring-blue-400 dark:ring-blue-500 bg-white dark:bg-gray-800"
                : "bg-white dark:bg-gray-800"
          }`}
      >
        <div className="text-lg font-semibold mb-2">{player.name}</div>
        {isVotingComplete && player.vote ? (
          <PlayerVote value={player.vote.value} confidence={player.vote.confidence} />
        ) : player.vote ? (
          <VoteCheck />
        ) : null}
        
        {!isCurrentPlayer && !isVotingComplete && (
          <TakeOverButton 
            playerName={player.name} 
            onTakeOver={() => onTakeOver(player.id)} 
          />
        )}

        <div className="absolute -bottom-2 right-0 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
          {player.participationRate}%
        </div>
      </Card>
    </motion.div>
  );
});