import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGameStore } from '@/lib/store';
import Image from 'next/image';

interface WaitingScreenProps {
  onRefresh: () => void;
}

export function WaitingScreen({ onRefresh }: WaitingScreenProps) {
  const game = useGameStore((state) => state.game);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto refresh every 5 seconds
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onRefresh();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setCountdown(5);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (!game) return null;

  return (
    <Card className="w-[400px] shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-blue-100 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-200">
            Waiting for Players
          </CardTitle>
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={{ duration: 1, ease: "linear" }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleManualRefresh}
              className="relative"
            >
              <RefreshCw className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-4 h-4 text-[10px] rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                {countdown}
              </div>
            </Button>
          </motion.div>
        </div>
        <CardDescription className="text-center text-blue-600 dark:text-blue-400">
          {game.players.filter(p => p.hasJoined).length} of {game.maxPlayers} players joined
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {game.players.map((player, index) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                {player.hasJoined ? (
                  <div className="relative w-8 h-8">
                    <Image
                      src={player.avatarUrl}
                      alt={player.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                )}
                <div className="flex-1">
                  <span className="text-sm text-gray-500">Player {index + 1}</span>
                  <div>
                    {player.hasJoined ? (
                      player.name
                    ) : (
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}