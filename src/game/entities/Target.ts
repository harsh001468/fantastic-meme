export class Target {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    isActive: boolean;

    constructor(position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }) {
        this.position = position;
        this.rotation = rotation;
        this.isActive = true;
    }

    spawn() {
        // Logic to spawn the target in the game world
    }

    move(newPosition: { x: number; y: number; z: number }) {
        this.position = newPosition;
        // Additional logic for moving the target
    }

    deactivate() {
        this.isActive = false;
        // Logic for deactivating the target
    }
}