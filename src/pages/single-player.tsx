import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { NumberPad } from '@/components/NumberPad'
import { calculateScore } from '@/util/scoring'

type Difficulty = 'easy' | 'medium' | 'hard' | 'crazy'
type GameMode = 'classic' | 'progressive'

interface ProgressiveState {
  currentDigitLevel: number;
  completedLevels: number[];
  totalScore: number;
}

export default function SinglePlayer() {
  const [mode, setMode] = useState<GameMode | ''>('');
  const [targetNumber, setTargetNumber] = useState<string>("");
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [digitCount, setDigitCount] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [score, setScore] = useState<number>(0);
  const [progressiveState, setProgressiveState] = useState<ProgressiveState>({
    currentDigitLevel: 2,
    completedLevels: [],
    totalScore: 0
  });
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

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    if (mode === 'progressive') {
      setProgressiveState({
        currentDigitLevel: 2,
        completedLevels: [],
        totalScore: 0
      });
      startProgressiveLevel(2);
    }
  };

  const startProgressiveLevel = (digits: number) => {
    setDigitCount(digits);
    setTargetNumber(generateTarget(digits));
    setGameStarted(true);
    setCurrentGuess("");
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setScore(0);
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
      
      if (mode === 'progressive') {
        const newTotalScore = progressiveState.totalScore + newScore;
        const newCompletedLevels = [...progressiveState.completedLevels, digitCount];
        
        setProgressiveState(prev => ({
          ...prev,
          completedLevels: newCompletedLevels,
          totalScore: newTotalScore
        }));

        if (digitCount < 5) {
          toast({
            description: `Level Complete! Moving to ${digitCount + 1} digits. Current Total Score: ${newTotalScore}`,
          });
          setTimeout(() => {
            startProgressiveLevel(digitCount + 1);
          }, 2000);
        } else {
          toast({
            description: `Congratulations! You've completed all levels! Final Score: ${newTotalScore}`,
          });
        }
      } else {
        toast({
          description: `Congratulations! You won! 🎉 Score: ${newScore}`,
        });
      }
    } else if (newGuesses.length >= getMaxAttempts()) {
      setGameOver(true);
      if (mode === 'progressive') {
        toast({
          description: `Game Over! The number was ${targetNumber}. Final Total Score: ${progressiveState.totalScore}`,
          variant: "destructive",
        });
      } else {
        toast({
          description: `Game Over! The number was ${targetNumber}. Final Score: ${newScore}`,
          variant: "destructive",
        });
      }
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

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">Single Player Mode</h1>
      
      {/* Game Component */}
      <Card className="w-full max-w-2xl mx-auto p-4">
        {!mode ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-center mb-4">Select Game Mode</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="h-24 text-lg flex flex-col items-center justify-center"
                onClick={() => setMode('progressive')}
              >
                <span className="text-base sm:text-lg whitespace-normal text-center">Progressive Guesser</span>
                <span className="text-xs sm:text-sm mt-2 opacity-70 text-center">
                  Progress through increasing digit counts
                </span>
              </Button>
            </div>
          </div>
        ) : !gameStarted ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-center mb-4">Select Difficulty</h2>
            <p className="text-center text-sm mb-4">
              You'll have the same number of attempts for each level (2-5 digits)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => startGame('easy')}
              >
                <div className="flex flex-col items-center">
                  <span>Easy</span>
                  <span className="text-sm mt-1">5 attempts per level</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => startGame('medium')}
              >
                <div className="flex flex-col items-center">
                  <span>Medium</span>
                  <span className="text-sm mt-1">4 attempts per level</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => startGame('hard')}
              >
                <div className="flex flex-col items-center">
                  <span>Hard</span>
                  <span className="text-sm mt-1">3 attempts per level</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => startGame('crazy')}
              >
                <div className="flex flex-col items-center">
                  <span>Crazy</span>
                  <span className="text-sm mt-1">2 attempts per level</span>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Game Info */}
            <div className="text-center mb-4 space-y-2">
              <p className="text-sm opacity-70">
                Level {progressiveState.currentDigitLevel - 1}: Guess the {digitCount}-digit number in {getMaxAttempts()} attempts
              </p>
              {mode === 'progressive' && (
                <p className="text-sm font-medium">
                  Total Score: {progressiveState.totalScore} | Current Level Score: {score}
                </p>
              )}
            </div>

            {/* Game Grid */}
            <div className="grid gap-2 mb-4">
              {Array.from({ length: getMaxAttempts() }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-1 sm:gap-2 justify-center">
                  {Array.from({ length: digitCount }).map((_, colIndex) => {
                    const guess = guesses[rowIndex] || "";
                    const colors = guess ? getGuessColors(guess) : [];
                    return (
                      <div
                        key={colIndex}
                        className={`w-8 h-8 sm:w-12 sm:h-12 border-2 flex items-center justify-center text-base sm:text-xl font-bold rounded
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
              <div className="flex gap-1 sm:gap-2 justify-center mb-4">
                {Array.from({ length: digitCount }).map((_, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-primary flex items-center justify-center text-base sm:text-xl font-bold rounded"
                  >
                    {currentGuess[index] || ""}
                  </div>
                ))}
              </div>
            )}

            {/* Number Pad */}
            {!gameOver && (
              <NumberPad
                onNumberClick={handleNumberClick}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
                currentGuess={currentGuess}
                maxLength={digitCount}
                feedback={won ? "Correct!" : gameOver ? "Game Over" : ""}
                attempts={guesses.length}
                maxAttempts={getMaxAttempts()}
              />
            )}

            {/* Game Over State */}
            {gameOver && !won && (
              <div className="flex flex-col gap-4">
                <Alert>
                  <AlertDescription>
                    Game Over! The number was {targetNumber}
                    {mode === 'progressive' && (
                      <p className="mt-2">Final Total Score: {progressiveState.totalScore}</p>
                    )}
                  </AlertDescription>
                </Alert>
                <Button onClick={() => {
                  setMode('');
                  setGameStarted(false);
                }}>New Game</Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}