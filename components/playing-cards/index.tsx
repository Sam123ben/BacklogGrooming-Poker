"use client";

import { useGameStore, Player, Vote } from "@/lib/store";
import { useState, useCallback, useMemo } from "react";
import { PlayerCard } from "./player-card";
import { VotingCards } from "./voting-cards";
import { ResultsPanel } from "./results-panel";
import { VoteStats } from "./types";
import { motion, AnimatePresence } from "framer-motion";

export function PlayingCards() {
  const { game, submitVote, resetVotes, takeOverPlayer } = useGameStore();
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(75);

  const voteStats = useMemo<VoteStats>(() => {
    if (!game) return { average: 0, distribution: {}, averageConfidence: 0, consensusRate: 0 };
  
    const votes = game.players
      .filter((player) => player.vote !== null)
      .map((player) => player.vote!);
  
    if (votes.length === 0) return { average: 0, distribution: {}, averageConfidence: 0, consensusRate: 0 };
  
    const average = Math.round((votes.reduce((a, b) => a + b.value, 0) / votes.length) * 10) / 10;
    const averageConfidence = Math.round(votes.reduce((a, b) => a + b.confidence, 0) / votes.length);
  
    const distribution = votes.reduce((acc, vote) => {
      acc[vote.value] = (acc[vote.value] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  
    const mode = Object.entries(distribution).reduce((a, b) =>
      (distribution[Number(a)] || 0) > (distribution[Number(b)] || 0) ? a : b
    )[0];
  
    const consensusRate = (distribution[Number(mode)] / votes.length) * 100;
  
    return { average, distribution, averageConfidence, consensusRate };
  }, [game]);  

  const handleCardClick = useCallback((number: number) => {
    setSelectedValue(number);
  }, []);

  const handleSubmitVote = useCallback(() => {
    if (!game || selectedValue === null) return;
    const currentPlayer = game.players[game.currentPlayerIndex];
    submitVote(currentPlayer.id, selectedValue, confidence);
    setSelectedValue(null);
    setConfidence(75);
  }, [game, selectedValue, confidence, submitVote]);

  if (!game) return null;

  return (
    <div className="space-y-8">
      <motion.div 
        className="flex flex-wrap gap-6 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {game.players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isCurrentPlayer={game.players[game.currentPlayerIndex].id === player.id}
            isVotingComplete={game.isVotingComplete}
            onTakeOver={takeOverPlayer}
          />
        ))}
      </motion.div>
      
      <AnimatePresence mode="wait">
        {!game.isVotingComplete ? (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <VotingCards
              selectedValue={selectedValue}
              confidence={confidence}
              onCardClick={handleCardClick}
              onConfidenceChange={setConfidence}
              onSubmitVote={handleSubmitVote}
            />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ResultsPanel
              voteStats={voteStats}
              sprintNumber={game.sprintNumber}
              currentRound={game.currentRound}
              storyPointHistoryLength={game.storyPointHistory.length}
              consensusThreshold={game.consensusThreshold}
              onResetVotes={resetVotes}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}