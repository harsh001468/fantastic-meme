export class Crosshair {
    private x: number;
    private y: number;
    private size: number;
    private color: string;

    constructor(x: number, y: number, size: number = 10, color: string = 'red') {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }

    public updatePosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    public getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }
}