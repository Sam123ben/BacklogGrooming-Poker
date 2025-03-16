"use client";

import { memo, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FIBONACCI_NUMBERS, CARD_COLORS, CARD_DESCRIPTIONS, CARD_LABELS } from "./constants";
import { VotingCardsProps } from "./types";

const CardDetail = memo(function CardDetail({
  number,
  isSelected,
  onSelect,
}: {
  number: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  // Use spring animation for smoother hover effect
  const scale = useMotionValue(1);
  const smoothScale = useSpring(scale, {
    mass: 0.1,
    stiffness: 200,
    damping: 15
  });

  const rotate = useMotionValue(0);
  const smoothRotate = useSpring(rotate, {
    mass: 0.1,
    stiffness: 200,
    damping: 15
  });

  const handleHoverStart = () => {
    scale.set(1.05);
    rotate.set(isSelected ? 0 : 2);
  };

  const handleHoverEnd = () => {
    scale.set(1);
    rotate.set(0);
  };

  return (
    <motion.div
      className="relative"
      style={{ 
        scale: smoothScale,
        rotate: smoothRotate
      }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
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
          className="absolute inset-0 bg-black/5 dark:bg-white/5 flex items-center justify-center p-3"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
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
  // Smooth color transitions based on confidence
  const color = useMotionValue(confidence);
  const smoothColor = useSpring(color, {
    mass: 0.1,
    stiffness: 200,
    damping: 15
  });

  const backgroundColor = useTransform(
    smoothColor,
    [0, 60, 80, 100],
    ['rgb(239, 68, 68)', 'rgb(234, 179, 8)', 'rgb(34, 197, 94)', 'rgb(34, 197, 94)']
  );

  const handleChange = useCallback((values: number[]) => {
    const newValue = values[0];
    color.set(newValue);
    onConfidenceChange(newValue);
  }, [color, onConfidenceChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          How confident are you about this estimate?
        </label>
        <Slider
          value={[confidence]}
          onValueChange={handleChange}
          max={100}
          step={5}
          className="w-full"
        />
      </div>
      <motion.div 
        className="text-center transition-colors duration-300"
        style={{ color: backgroundColor }}
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
  const buttonColor = useTransform(
    useMotionValue(confidence),
    [0, 60, 80, 100],
    [
      'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    ]
  );

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        className={`w-full transition-colors duration-300 ${buttonColor.get()}`}
        onClick={onClick}
      >
        Submit Vote
      </Button>
    </motion.div>
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
        {FIBONACCI_NUMBERS.map((number) => (
          <CardDetail
            key={number}
            number={number}
            isSelected={selectedValue === number}
            onSelect={() => onCardClick(number)}
          />
        ))}
      </motion.div>

      {selectedValue && (
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
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
    </div>
  );
});