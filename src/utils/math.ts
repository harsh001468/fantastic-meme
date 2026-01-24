export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}