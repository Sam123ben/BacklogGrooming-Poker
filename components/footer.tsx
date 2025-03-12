"use client";

import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 mt-auto">
      <div className="container mx-auto text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span>With</span>
          <Heart className="w-4 h-4 text-red-500 animate-pulse" />
          <span>from a Platform Engineer</span>
        </div>
        <div>
          © {currentYear} Planning Poker. All rights reserved.
        </div>
      </div>
    </footer>
  );
}