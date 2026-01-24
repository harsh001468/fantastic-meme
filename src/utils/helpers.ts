export const formatStats = (accuracy: number, score: number, tokens: number): string => {
    return `Accuracy: ${accuracy.toFixed(2)}%, Score: ${score}, Tokens: ${tokens}`;
};

export const calculateReward = (score: number): number => {
    return Math.floor(score / 10); // Example: 1 token for every 10 points scored
};

export const isGameOver = (timeElapsed: number, maxTime: number): boolean => {
    return timeElapsed >= maxTime;
};

export const resetGameState = (): void => {
    // Logic to reset game state variables
};