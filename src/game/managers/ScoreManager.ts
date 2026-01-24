export class ScoreManager {
    private score: number;
    private shotsFired: number;
    private hits: number;

    constructor() {
        this.score = 0;
        this.shotsFired = 0;
        this.hits = 0;
    }

    public recordHit(): void {
        this.hits++;
        this.updateScore();
    }

    public recordMiss(): void {
        this.shotsFired++;
    }

    private updateScore(): void {
        this.score = Math.floor((this.hits / (this.shotsFired || 1)) * 100);
    }

    public getScore(): number {
        return this.score;
    }

    public getAccuracy(): number {
        return this.shotsFired > 0 ? (this.hits / this.shotsFired) * 100 : 0;
    }

    public reset(): void {
        this.score = 0;
        this.shotsFired = 0;
        this.hits = 0;
    }
}