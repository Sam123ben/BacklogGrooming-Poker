"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus2 } from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CARD_COLORS } from "./constants";
import { PlayerCardProps } from "./types";

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
        className={`w-40 h-56 flex flex-col items-center justify-between p-4 transition-all duration-300
          ${isVotingComplete && player.vote
            ? `bg-gradient-to-b ${CARD_COLORS[player.vote.value as keyof typeof CARD_COLORS]}`
            : player.vote 
              ? "bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30"
              : isCurrentPlayer
                ? "ring-2 ring-blue-400 dark:ring-blue-500 bg-white dark:bg-gray-800"
                : "bg-white dark:bg-gray-800"
          }`}
      >
        {/* Avatar Section */}
        <div className="relative w-20 h-20 mb-2">
          <motion.div
            initial={false}
            animate={{ 
              scale: isCurrentPlayer ? 1.1 : 1,
              rotate: player.vote ? 360 : 0 
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-full h-full rounded-full border-2 border-white dark:border-gray-700 shadow-lg overflow-hidden">
              {player.hasJoined && player.avatarUrl ? (
                <Image 
                  src={player.avatarUrl}
                  alt={player.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg">
                  {player.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </motion.div>
          {isCurrentPlayer && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
              ★
            </div>
          )}
        </div>

        {/* Name Section */}
        <div className="text-lg font-semibold text-center mb-2 line-clamp-1">
          {player.name || `Player ${player.id}`}
        </div>

        {/* Vote Section */}
        <div className="flex-1 flex items-center justify-center">
          {isVotingComplete && player.vote ? (
            <PlayerVote value={player.vote.value} confidence={player.vote.confidence} />
          ) : player.vote ? (
            <VoteCheck />
          ) : null}
        </div>

        {/* Take Over Button */}
        {!isCurrentPlayer && !isVotingComplete && player.hasJoined && (
          <TakeOverButton 
            playerName={player.name} 
            onTakeOver={() => onTakeOver(player.id)} 
          />
        )}

        {/* Participation Rate */}
        <div className="absolute -bottom-2 right-0 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
          {player.participationRate}%
        </div>
      </Card>
    </motion.div>
  );
});