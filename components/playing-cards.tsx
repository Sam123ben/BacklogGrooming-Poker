"use client";

import { useGameStore, Player, Vote } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RefreshCw, UserPlus2, Users, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo, useState, useCallback } from "react";

const FIBONACCI_NUMBERS = [1, 2, 3, 5, 8, 13];

const CARD_DESCRIPTIONS = {
  1: "Clear requirements, straightforward implementation. No unknowns.",
  2: "Simple task with minor complexity. Well understood.",
  3: "Understood requirements but may have some unknowns or technical challenges.",
  5: "Moderate complexity. Some unknowns that need discussion.",
  8: "Complex task with significant unknowns. Requires thorough planning.",
  13: "Very complex. Needs breaking down. High uncertainty or technical challenges."
};

const CARD_COLORS = {
  1: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30',
  2: 'from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-900/30',
  3: 'from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-900/30',
  5: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30',
  8: 'from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/30',
  13: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30'
};

export function PlayingCards() {
  const { game, submitVote, resetVotes, takeOverPlayer } = useGameStore();
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(75);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const voteStats = useMemo(() => {
    if (!game) return { 
      average: 0, 
      distribution: {}, 
      averageConfidence: 0,
      consensusRate: 0 
    };

    const votes = game.players
      .filter((player): player is Player & { vote: Vote } => player.vote !== null)
      .map((player) => player.vote);
    
    if (votes.length === 0) return { 
      average: 0, 
      distribution: {}, 
      averageConfidence: 0,
      consensusRate: 0 
    };
    
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

  const handleTooltipChange = useCallback((open: boolean, number: number) => {
    if (open) {
      setActiveTooltip(number);
    } else if (activeTooltip === number) {
      setActiveTooltip(null);
    }
  }, [activeTooltip]);

  const handleCardClick = useCallback((number: number) => {
    setSelectedValue(number);
    setActiveTooltip(null);
  }, []);

  const handleInfoClick = useCallback((e: React.MouseEvent, number: number) => {
    e.stopPropagation();
    setActiveTooltip(activeTooltip === number ? null : number);
  }, [activeTooltip]);

  const handleSubmitVote = useCallback(() => {
    if (!game || selectedValue === null) return;
    const currentPlayer = game.players[game.currentPlayerIndex];
    submitVote(currentPlayer.id, selectedValue, confidence);
    setSelectedValue(null);
    setConfidence(75);
  }, [game, selectedValue, confidence, submitVote]);

  const PlayerCard = useCallback(({ player }: { player: Player }) => {
    if (!game) return null;

    const isCurrentPlayer = game.players[game.currentPlayerIndex].id === player.id;

    return (
      <div className="relative group">
        <Card 
          className={`w-32 h-48 flex flex-col items-center justify-center p-4 transition-all duration-300
            ${game.isVotingComplete && player.vote
              ? `bg-gradient-to-b ${CARD_COLORS[player.vote.value as keyof typeof CARD_COLORS]}`
              : player.vote 
                ? "bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30"
                : isCurrentPlayer
                  ? "ring-2 ring-blue-400 dark:ring-blue-500 bg-white dark:bg-gray-800"
                  : "bg-white dark:bg-gray-800"
            }`}
        >
          <div className="text-lg font-semibold mb-2">{player.name}</div>
          {game.isVotingComplete ? (
            <div className="space-y-2 text-center">
              <div className="text-3xl font-bold">
                {player.vote?.value || "?"}
              </div>
              {player.vote && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {player.vote.confidence}% confident
                </div>
              )}
            </div>
          ) : (
            player.vote && (
              <div className="text-2xl text-blue-500 dark:text-blue-400">
                ✓
              </div>
            )
          )}
          
          {!isCurrentPlayer && !game.isVotingComplete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => takeOverPlayer(player.id)}
                  >
                    <UserPlus2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Take over as {player.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="absolute -bottom-2 right-0 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
            {player.participationRate}%
          </div>
        </Card>
      </div>
    );
  }, [game, takeOverPlayer]);

  const VotingCards = useCallback(() => {
    if (!game) return null;
    
    return (
      <div className="space-y-8">
        <div className="flex gap-4 flex-wrap justify-center">
          {FIBONACCI_NUMBERS.map((number) => (
            <TooltipProvider key={number}>
              <Tooltip 
                open={activeTooltip === number}
                onOpenChange={(open) => handleTooltipChange(open, number)}
              >
                <TooltipTrigger asChild>
                  <div 
                    className="relative"
                    onClick={() => handleCardClick(number)}
                  >
                    <button
                      className={`w-20 h-32 rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold
                        transition-all duration-300 transform hover:scale-105 relative
                        ${selectedValue === number 
                          ? `bg-gradient-to-b ${CARD_COLORS[number as keyof typeof CARD_COLORS]} ring-2 ring-blue-500` 
                          : `bg-gradient-to-b ${CARD_COLORS[number as keyof typeof CARD_COLORS]} hover:shadow-xl`
                        }`}
                    >
                      {number}
                      <div 
                        className="absolute top-2 right-2"
                        onClick={(e) => handleInfoClick(e, number)}
                      >
                        <Info className={`w-4 h-4 ${activeTooltip === number ? 'text-blue-500' : 'text-gray-500'}`} />
                      </div>
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="max-w-xs p-3"
                  onClick={() => setActiveTooltip(null)}
                >
                  <p className="text-sm">{CARD_DESCRIPTIONS[number as keyof typeof CARD_DESCRIPTIONS]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {selectedValue && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                How confident are you about this estimate?
              </label>
              <Slider
                value={[confidence]}
                onValueChange={(values) => setConfidence(values[0])}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">
                {confidence}% confident
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              onClick={handleSubmitVote}
            >
              Submit Vote
            </Button>
          </div>
        )}
      </div>
    );
  }, [activeTooltip, selectedValue, confidence, handleTooltipChange, handleCardClick, handleInfoClick, handleSubmitVote, game]);

  const ResultsPanel = useCallback(() => {
    if (!game) return null;
    
    return (
      <div className="space-y-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Vote Distribution
                </h3>
                <div className="flex gap-4 justify-center mt-4">
                  {FIBONACCI_NUMBERS.map((number) => {
                    const votes = voteStats.distribution[number] || 0;
                    if (votes === 0) return null;
                    return (
                      <div key={number} className="text-center">
                        <div className={`text-lg font-bold p-2 rounded-lg bg-gradient-to-b ${CARD_COLORS[number as keyof typeof CARD_COLORS]}`}>
                          {number}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {votes} {votes === 1 ? 'vote' : 'votes'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Team Confidence</h3>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {voteStats.averageConfidence}%
                  </div>
                  <div className="text-sm text-gray-500">
                    average confidence
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Results</h3>
                <div className="text-3xl font-bold">
                  {voteStats.average} points
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {voteStats.consensusRate >= (game?.consensusThreshold ?? 70) ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600">
                        {Math.round(voteStats.consensusRate)}% consensus achieved
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-yellow-600">
                        Only {Math.round(voteStats.consensusRate)}% consensus
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Sprint Stats</h3>
                <div className="text-sm text-gray-600">
                  Sprint #{game?.sprintNumber ?? 1} • Round #{game?.currentRound ?? 1}
                </div>
                <div className="text-sm text-gray-600">
                  {game?.storyPointHistory.length ?? 0} stories estimated
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={resetVotes}
            variant="outline"
            size="lg"
            className="gap-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 dark:from-gray-800 dark:to-gray-900"
          >
            <RefreshCw className="w-4 h-4" />
            Start New Round
          </Button>
        </div>
      </div>
    );
  }, [voteStats, game, resetVotes]);

  if (!game) return null;

  return (
    <div className="space-y-8" onClick={() => setActiveTooltip(null)}>
      <div className="flex flex-wrap gap-6 justify-center">
        {game.players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
      
      {!game.isVotingComplete && <VotingCards />}
      {game.isVotingComplete && <ResultsPanel />}
    </div>
  );
}