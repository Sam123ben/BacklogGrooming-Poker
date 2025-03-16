"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[400px] shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-blue-100 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <p className="mt-4 text-lg text-blue-600 dark:text-blue-400">
              Loading...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}