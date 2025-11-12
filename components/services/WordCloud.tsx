"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface WordCloudProps {
  words: { text: string; weight: number }[];
  title?: string;
}

export const WordCloud: React.FC<WordCloudProps> = ({ words, title }) => {
  // Calculate font sizes based on weight
  const maxWeight = Math.max(...words.map((w) => w.weight));
  const minWeight = Math.min(...words.map((w) => w.weight));
  const weightRange = maxWeight - minWeight || 1;

  const getFontSize = (weight: number) => {
    const normalizedWeight = (weight - minWeight) / weightRange;
    return 12 + normalizedWeight * 16; // Font size between 12px and 28px
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex flex-wrap gap-3 items-center justify-center p-4 min-h-[200px]">
          {words.map((word, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1 rounded-lg bg-[#F0EEED] dark:bg-[#3D3B3A] text-[#191919] dark:text-[#F0EEED] font-medium"
              style={{
                fontSize: `${getFontSize(word.weight)}px`,
              }}
            >
              {word.text}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

