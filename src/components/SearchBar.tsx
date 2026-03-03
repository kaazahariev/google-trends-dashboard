"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface Props {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export function SearchBar({ keywords, onKeywordsChange, onSearch, isLoading }: Props) {
  const [input, setInput] = useState("");

  const addKeyword = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 5) {
      onKeywordsChange([...keywords, trimmed]);
    }
    setInput("");
  };

  const removeKeyword = (keyword: string) => {
    onKeywordsChange(keywords.filter((k) => k !== keyword));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (input.includes(",")) {
        const parts = input.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
        const unique = [...new Set([...keywords, ...parts])].slice(0, 5);
        onKeywordsChange(unique);
        setInput("");
      } else {
        addKeyword(input);
      }
    } else if (e.key === "Enter" && !input.trim() && keywords.length > 0) {
      e.preventDefault();
      onSearch();
    } else if (e.key === "Backspace" && !input && keywords.length > 0) {
      removeKeyword(keywords[keywords.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex min-h-[44px] flex-1 flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          >
            {keyword}
            <button
              onClick={() => removeKeyword(keyword)}
              className="rounded-sm hover:text-blue-900 dark:hover:text-blue-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            keywords.length === 0
              ? "Enter keywords to compare (e.g., react, vue, angular)"
              : keywords.length >= 5
                ? "Max 5 keywords"
                : "Add keyword..."
          }
          disabled={keywords.length >= 5}
          className="min-w-[120px] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
      </div>
      <button
        onClick={onSearch}
        disabled={keywords.length === 0 || isLoading}
        className="inline-flex h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Search className="h-4 w-4" />
        {isLoading ? "Searching..." : "Explore"}
      </button>
    </div>
  );
}
