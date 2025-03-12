"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FIBONACCI_NUMBERS, CARD_COLORS, CARD_DESCRIPTIONS, CARD_LABELS } from "./constants";
import { VotingCardsProps } from "./types";
import { motion, AnimatePresence } from "framer-motion";

const CardDetail = memo(function CardDetail({
  number,
  isSelected,
  onSelect,
}: {
  number: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ scale: isSelected ? 1.05 : 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onSelect}
    >
      <div
        className={`w-24 h-36 rounded-lg shadow-lg flex flex-col items-center justify-between p-3 cursor-pointer
          transition-all duration-300 relative overflow-hidden group
          ${isSelected 
            ? `bg-gradient-to-b ${CARD_COLORS[number as keyof typeof CARD_COLORS]} ring-2 ring-blue-500` 
            : `bg-gradient-to-b ${CARD_COLORS[number as keyof typeof CARD_COLORS]} hover:shadow-xl`
          }`}
      >
        <div className="text-xs font-medium text-center opacity-70">
          {CARD_LABELS[number as keyof typeof CARD_LABELS]}
        </div>
        
        <div className="text-3xl font-bold">{number}</div>
        
        <motion.div 
          className="absolute inset-0 bg-black/5 dark:bg-white/5 flex items-center justify-center p-3
            opacity-0 group-hover:opacity-100 transition-all duration-200"
          initial={false}
        >
          <div className="text-xs text-center leading-tight">
            {CARD_DESCRIPTIONS[number as keyof typeof CARD_DESCRIPTIONS]}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

const ConfidenceSlider = memo(function ConfidenceSlider({ 
  confidence, 
  onConfidenceChange 
}: { 
  confidence: number;
  onConfidenceChange: (value: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          How confident are you about this estimate?
        </label>
        <Slider
          value={[confidence]}
          onValueChange={(values) => onConfidenceChange(values[0])}
          max={100}
          step={5}
          className="w-full"
        />
      </div>
      <motion.div 
        className="text-center"
        initial={false}
        animate={{ 
          color: confidence >= 80 ? 'rgb(22 163 74)' : 
                 confidence >= 60 ? 'rgb(234 179 8)' : 
                 'rgb(239 68 68)'
        }}
      >
        <div className="text-2xl font-bold">
          {confidence}%
        </div>
        <div className="text-sm">
          {confidence >= 80 ? 'High confidence' : 
           confidence >= 60 ? 'Moderate confidence' : 
           'Low confidence'}
        </div>
      </motion.div>
    </div>
  );
});

const SubmitButton = memo(function SubmitButton({ 
  onClick,
  confidence 
}: { 
  onClick: () => void;
  confidence: number;
}) {
  return (
    <Button
      className={`w-full transition-colors duration-300 ${
        confidence >= 80 
          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
          : confidence >= 60
            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
      }`}
      onClick={onClick}
    >
      Submit Vote
    </Button>
  );
});

export const VotingCards = memo(function VotingCards({
  selectedValue,
  confidence,
  onCardClick,
  onConfidenceChange,
  onSubmitVote,
}: VotingCardsProps) {
  return (
    <div className="space-y-8">
      <motion.div 
        className="flex gap-4 flex-wrap justify-center"
        initial={false}
      >
        <AnimatePresence mode="wait">
          {FIBONACCI_NUMBERS.map((number) => (
            <CardDetail
              key={number}
              number={number}
              isSelected={selectedValue === number}
              onSelect={() => onCardClick(number)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedValue && (
          <motion.div 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ConfidenceSlider 
              confidence={confidence}
              onConfidenceChange={onConfidenceChange}
            />
            <SubmitButton 
              onClick={onSubmitVote}
              confidence={confidence}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});