"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface Suggestion {
  id: string;
  text: string;
  mentionCount: number;
}

interface ImprovementSuggestionProps {
  suggestions: Suggestion[];
  title?: string;
}

export const ImprovementSuggestion: React.FC<ImprovementSuggestionProps> = ({
  suggestions,
  title,
}) => {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#191919] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
            >
              <p className="text-sm text-[#191919] dark:text-[#F0EEED] flex-1">
                {suggestion.text}
              </p>
              <button className="ml-4 px-3 py-1 rounded-lg bg-[#C1A7A3] hover:bg-[#A88F8B] text-white text-xs font-medium transition-colors">
                {suggestion.mentionCount} mention
                {suggestion.mentionCount !== 1 ? "s" : ""}
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

