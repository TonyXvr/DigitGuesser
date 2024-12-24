import React, { useState, useEffect } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import Auth from "@/components/Auth";
import { useProfile } from "@/contexts/ProfileContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { calculateScore } from "@/util/scoring";

export default function Home() {
  const { user, loading } = useProfile();
  const [targetNumber, setTargetNumber] = useState<string>("");
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [digitCount, setDigitCount] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const { toast } = useToast();

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      if (event.key >= "0" && event.key <= "9") {
        handleNumberClick(event.key);
      } else if (event.key === "Backspace") {
        handleDelete();
      } else if (event.key === "Enter") {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, gameOver, digitCount, currentGuess]);

  const getMaxAttempts = () => {
    switch (difficulty) {
      case "easy":
        return 5;
      case "medium":
        return 4;
      case "hard":
        return 3;
      case "crazy":
        return 2;
      default:
        return 5;
    }
  };

  const generateTarget = (digits: number) => {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  };

  const startGame = (digits: number) => {
    setDigitCount(digits);
    setTargetNumber(generateTarget(digits));
    setGameStarted(true);
    setCurrentGuess("");
    setGuesses([]);
    setGameOver(false);
    setWon(false);
  };

  const handleNumberClick = (num: string) => {
    if (currentGuess.length < digitCount && !gameOver) {
      setCurrentGuess(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setCurrentGuess(prev => prev.slice(0, -1));
  };

  const calculateCorrectDigits = (guess: string): number => {
    let correct = 0;
    const targetArray = targetNumber.split("");
    const guessArray = guess.split("");
    
    for (let i = 0; i < guess.length; i++) {
      if (guessArray[i] === targetArray[i]) {
        correct++;
      }
    }
    
    return correct;
  };

  const handleSubmit = () => {
    if (currentGuess.length !== digitCount) {
      toast({
        description: `Please enter a ${digitCount}-digit number`,
        variant: "destructive",
      });
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    
    const correctDigits = calculateCorrectDigits(currentGuess);
    const isComplete = currentGuess === targetNumber;
    
    // Calculate score for this guess
    const newScore = calculateScore({
      difficulty,
      digitCount,
      correctDigits,
      isComplete,
      attemptCount: newGuesses.length,
      maxAttempts: getMaxAttempts(),
    });
    
    setScore(newScore);
    
    if (isComplete) {
      setWon(true);
      setGameOver(true);
      toast({
        description: `Congratulations! You won! 🎉 Score: ${newScore}`,
      });
    } else if (newGuesses.length >= getMaxAttempts()) {
      setGameOver(true);
      toast({
        description: `Game Over! The number was ${targetNumber}. Final Score: ${newScore}`,
        variant: "destructive",
      });
    }

    setCurrentGuess("");
  };

  const getGuessColors = (guess: string) => {
    const result = [];
    const targetArray = targetNumber.split("");
    const guessArray = guess.split("");

    for (let i = 0; i < guess.length; i++) {
      if (guessArray[i] === targetArray[i]) {
        result.push("bg-green-500");
      } else if (targetArray.includes(guessArray[i])) {
        result.push("bg-yellow-500");
      } else {
        result.push("bg-red-500");
      }
    }

    return result;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>DigitGuesser</title>
        <meta name="description" content="A number guessing game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-start p-4 gap-4">
          {/* How to Play and Scoring Parameters */}
          <Card className="w-full max-w-md p-4 mb-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-to-play">
                <AccordionTrigger>How to Play</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>1. Choose your difficulty level and number of digits</p>
                    <p>2. Try to guess the secret number within the given attempts</p>
                    <p>3. After each guess, you'll get color-coded feedback:</p>
                    <ul className="list-disc list-inside pl-4">
                      <li className="text-green-500">Green: Correct digit in correct position</li>
                      <li className="text-yellow-500">Yellow: Correct digit in wrong position</li>
                      <li className="text-red-500">Red: Digit not in the number</li>
                    </ul>
                    <p>4. Use keyboard numbers or the on-screen keypad to input your guess</p>
                    <p>5. Press Enter or ✓ to submit your guess</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="scoring">
                <AccordionTrigger>Scoring Parameters</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p className="font-semibold">Base Points:</p>
                    <ul className="list-disc list-inside pl-4">
                      <li>Correct digit placement: 10 points each</li>
                      <li>Complete guess: 50 bonus points</li>
                    </ul>
                    <p className="font-semibold mt-4">Multipliers:</p>
                    <ul className="list-disc list-inside pl-4">
                      <li>Easy: 1x</li>
                      <li>Medium: 1.5x</li>
                      <li>Hard: 2x</li>
                      <li>Crazy: 3x</li>
                    </ul>
                    <p className="font-semibold mt-4">Digit Count Bonus:</p>
                    <ul className="list-disc list-inside pl-4">
                      <li>Additional 0.5x per digit above 2</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
          
          {/* Game Component */}
          <Card className="w-full max-w-md p-4">
            {!gameStarted ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-center mb-4">New Game Setup</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Select Difficulty</h3>
                    <Select onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy (5 attempts)</SelectItem>
                        <SelectItem value="medium">Medium (4 attempts)</SelectItem>
                        <SelectItem value="hard">Hard (3 attempts)</SelectItem>
                        <SelectItem value="crazy">Crazy (2 attempts)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {difficulty && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Select Number of Digits</h3>
                      <Select onValueChange={(value) => startGame(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose digits" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Digits</SelectItem>
                          <SelectItem value="3">3 Digits</SelectItem>
                          <SelectItem value="4">4 Digits</SelectItem>
                          <SelectItem value="5">5 Digits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Game Info */}
                <div className="text-center mb-4 space-y-2">
                  <p className="text-sm opacity-70">
                    Guess the {digitCount}-digit number in {getMaxAttempts()} attempts
                  </p>
                  <p className="text-lg font-bold text-primary">
                    Score: {score}
                  </p>
                </div>

                {/* Game Grid */}
                <div className="grid gap-2 mb-4">
                  {Array.from({ length: getMaxAttempts() }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2 justify-center">
                      {Array.from({ length: digitCount }).map((_, colIndex) => {
                        const guess = guesses[rowIndex] || "";
                        const colors = guess ? getGuessColors(guess) : [];
                        return (
                          <div
                            key={colIndex}
                            className={`w-12 h-12 border-2 flex items-center justify-center text-xl font-bold rounded
                              ${guess ? colors[colIndex] : "border-gray-500"}`}
                          >
                            {guess[colIndex] || ""}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Current Guess Display */}
                {!gameOver && (
                  <div className="flex gap-2 justify-center mb-4">
                    {Array.from({ length: digitCount }).map((_, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 border-2 border-primary flex items-center justify-center text-xl font-bold rounded"
                      >
                        {currentGuess[index] || ""}
                      </div>
                    ))}
                  </div>
                )}

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "✓"].map((num) => (
                    <Button
                      key={num}
                      onClick={() => {
                        if (num === "⌫") handleDelete();
                        else if (num === "✓") handleSubmit();
                        else handleNumberClick(num.toString());
                      }}
                      className="h-12 text-lg font-bold"
                      variant={typeof num === "number" ? "outline" : "default"}
                    >
                      {num}
                    </Button>
                  ))}
                </div>

                {/* Game Over State */}
                {gameOver && (
                  <div className="flex flex-col gap-4">
                    <Alert>
                      <AlertDescription>
                        {won 
                          ? "Congratulations! You won! 🎉" 
                          : `Game Over! The number was ${targetNumber}`}
                      </AlertDescription>
                    </Alert>
                    <Button onClick={() => setGameStarted(false)}>New Game</Button>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Authentication Section */}
          <Card className="w-full max-w-md p-4 mt-8">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Want to save your scores?</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Sign in to track your progress and compete on the leaderboard!
              </p>
            </div>
            {!user && <Auth />}
          </Card>
        </main>
      </div>
    </>
  );
}