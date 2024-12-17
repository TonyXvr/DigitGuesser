interface ScoreFactors {
  difficulty: string;
  digitCount: number;
  correctDigits: number;
  isComplete: boolean;
  attemptCount: number;
  maxAttempts: number;
}

const DIFFICULTY_MULTIPLIER = {
  easy: 1,
  medium: 2,
  hard: 3,
  crazy: 4,
};

const DIGIT_MULTIPLIER = {
  2: 1,
  3: 1.5,
  4: 2,
  5: 2.5,
};

export const calculateScore = ({
  difficulty,
  digitCount,
  correctDigits,
  isComplete,
  attemptCount,
  maxAttempts,
}: ScoreFactors): number => {
  // Base score for correct digits
  const digitScore = correctDigits * 100;

  // Difficulty multiplier
  const difficultyMultiplier = DIFFICULTY_MULTIPLIER[difficulty as keyof typeof DIFFICULTY_MULTIPLIER];

  // Digit count multiplier
  const digitMultiplier = DIGIT_MULTIPLIER[digitCount as keyof typeof DIGIT_MULTIPLIER];

  // Complete guess bonus
  const completeBonus = isComplete ? 500 * difficultyMultiplier : 0;

  // Attempts bonus (more points for using fewer attempts)
  const attemptsBonus = isComplete
    ? Math.round(1000 * difficultyMultiplier * ((maxAttempts - attemptCount + 1) / maxAttempts))
    : 0;

  // Calculate total score
  const totalScore = Math.round(
    (digitScore * difficultyMultiplier * digitMultiplier) + completeBonus + attemptsBonus
  );

  return totalScore;
};