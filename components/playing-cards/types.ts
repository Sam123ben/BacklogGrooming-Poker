import { Player } from "@/lib/store";

export type VoteStats = {
  average: number;
  distribution: Record<number, number>;
  averageConfidence: number;
  consensusRate: number;
};

export type PlayerCardProps = {
  player: Player;
  isCurrentPlayer: boolean;
  isVotingComplete: boolean;
  onTakeOver: (playerId: string) => void;
};

export type VotingCardsProps = {
  selectedValue: number | null;
  confidence: number;
  onCardClick: (number: number) => void;
  onConfidenceChange: (value: number) => void;
  onSubmitVote: () => void;
};

export type ResultsPanelProps = {
  voteStats: VoteStats;
  sprintNumber: number;
  currentRound: number;
  storyPointHistoryLength: number;
  consensusThreshold: number;
  onResetVotes: () => void;
};