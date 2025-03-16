"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGameStore } from "@/lib/store";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { game, wsClient } = useGameStore();

  // Sync theme changes with other players
  const handleThemeChange = (newTheme: string) => {
    if (theme === newTheme) return; // Don't update if theme hasn't changed
    setTheme(newTheme);
    if (game && wsClient) {
      wsClient.sendMessage({
        type: 'themeChange',
        gameId: game.id,
        theme: newTheme
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 px-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className={theme === "light" ? "bg-accent" : ""}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}