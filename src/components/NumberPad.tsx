import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NumberPadProps {
  onNumberClick: (number: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  currentGuess: string;
  maxLength: number;
  feedback: string;
  attempts: number;
  maxAttempts: number;
}

export function NumberPad({
  onNumberClick,
  onDelete,
  onSubmit,
  currentGuess,
  maxLength,
  feedback,
  attempts,
  maxAttempts
}: NumberPadProps) {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const getFeedbackColor = () => {
    if (feedback.includes('Correct!')) return 'success';
    if (feedback.includes('Game Over')) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold font-mono tracking-wider">
          {currentGuess.padEnd(maxLength, '_')}
        </div>
        <Badge variant="outline">
          Attempts: {attempts}/{maxAttempts}
        </Badge>
      </div>

      {feedback && (
        <Badge className="w-full justify-center py-2 text-base" variant={getFeedbackColor()}>
          {feedback}
        </Badge>
      )}

      <div className="grid grid-cols-3 gap-2">
        {numbers.map((num) => (
          <Button
            key={num}
            variant="outline"
            className="h-12 text-lg font-mono"
            onClick={() => onNumberClick(num)}
            disabled={currentGuess.length >= maxLength}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-12 text-lg font-mono"
          onClick={onDelete}
          disabled={currentGuess.length === 0}
        >
          ←
        </Button>
        <Button
          className="h-12 text-lg font-mono col-span-2"
          onClick={onSubmit}
          disabled={currentGuess.length !== maxLength}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}