import { TrendingUp } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-semibold">Trends Explorer</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
