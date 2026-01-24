export class Player {
    private name: string;
    private score: number;
    private accuracy: number;
    private tokens: number;

    constructor(name: string) {
        this.name = name;
        this.score = 0;
        this.accuracy = 0;
        this.tokens = 0;
    }

    public shoot(targetHit: boolean): void {
        if (targetHit) {
            this.score += 10; // Increment score for hitting a target
            this.tokens += 1; // Increment tokens for hitting a target
            this.updateAccuracy();
        } else {
            this.score -= 5; // Decrement score for missing a target
        }
    }

    private updateAccuracy(): void {
        // Logic to update accuracy based on hits and misses
        // This is a placeholder for actual accuracy calculation
        this.accuracy = (this.score > 0) ? (this.score / (this.score + 5)) * 100 : 0;
    }

    public getStats(): { name: string; score: number; accuracy: number; tokens: number } {
        return {
            name: this.name,
            score: this.score,
            accuracy: this.accuracy,
            tokens: this.tokens,
        };
    }
}