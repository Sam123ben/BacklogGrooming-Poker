"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { FIBONACCI_NUMBERS, CARD_COLORS } from "./constants";
import { ResultsPanelProps } from "./types";
import { motion } from "framer-motion";

const VoteDistribution = memo(function VoteDistribution({
  distribution
}: {
  distribution: Record<number, number>;
}) {
  return (
    <div className="flex gap-4 justify-center mt-4">
      {FIBONACCI_NUMBERS.map((number) => {
        const votes = distribution[number] || 0;
        if (votes === 0) return null;
        return (
          <motion.div
            key={number}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className={`text-lg font-bold p-2 rounded-lg bg-gradient-to-b ${CARD_COLORS[number as keyof typeof CARD_COLORS]}`}>
              {number}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {votes} {votes === 1 ? 'vote' : 'votes'}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

const ConsensusIndicator = memo(function ConsensusIndicator({
  consensusRate,
  consensusThreshold
}: {
  consensusRate: number;
  consensusThreshold: number;
}) {
  const hasConsensus = consensusRate >= consensusThreshold;
  
  return (
    <div className="flex items-center gap-2 mt-2">
      {hasConsensus ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-600">
            {Math.round(consensusRate)}% consensus achieved
          </span>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-yellow-600">
            Only {Math.round(consensusRate)}% consensus
          </span>
        </motion.div>
      )}
    </div>
  );
});

export const ResultsPanel = memo(function ResultsPanel({
  voteStats,
  sprintNumber,
  currentRound,
  storyPointHistoryLength,
  consensusThreshold,
  onResetVotes,
}: ResultsPanelProps) {
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Vote Distribution
              </h3>
              <VoteDistribution distribution={voteStats.distribution} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Team Confidence</h3>
              <motion.div 
                className="flex items-center gap-2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="text-2xl font-bold">
                  {voteStats.averageConfidence}%
                </div>
                <div className="text-sm text-gray-500">
                  average confidence
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Results</h3>
              <motion.div 
                className="text-3xl font-bold"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {voteStats.average} points
              </motion.div>
              <ConsensusIndicator 
                consensusRate={voteStats.consensusRate}
                consensusThreshold={consensusThreshold}
              />
            </div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold">Sprint Stats</h3>
              <div className="text-sm text-gray-600">
                Sprint #{sprintNumber} • Round #{currentRound}
              </div>
              <div className="text-sm text-gray-600">
                {storyPointHistoryLength} stories estimated
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={onResetVotes}
          variant="outline"
          size="lg"
          className="gap-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 dark:from-gray-800 dark:to-gray-900"
        >
          <RefreshCw className="w-4 h-4" />
          Start New Round
        </Button>
      </div>
    </motion.div>
  );
});