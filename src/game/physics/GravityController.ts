import Phaser from 'phaser';

export class GravityController {
    private target: Phaser.Physics.Arcade.Sprite | Phaser.Physics.Arcade.Image | Phaser.Physics.Arcade.Body;
    private isAntiGravityActive: boolean = false;

    // Physics parameters
    public liftStrength: number = 500;
    public damping: number = 0.95;

    constructor(target: any) {
        this.target = target;
    }

    public toggleAntiGravity(active: boolean) {
        this.isAntiGravityActive = active;
        const target = this.target as any;
        const body = (target.body || target) as Phaser.Physics.Arcade.Body;

        if (body) {
            if (active) {
                body.setAllowGravity(false);
                body.setDrag(100, 100);
            } else {
                body.setAllowGravity(true); // Or maintain false if scene requires
                body.setDrag(0, 0);
            }
        }
    }

    public update(delta: number) {
        if (!this.isAntiGravityActive) return;

        const target = this.target as any;
        const body = (target.body || target) as Phaser.Physics.Arcade.Body;
        if (!body) return;

        // Apply buoyancy / hover effect
        const time = Date.now() / 1000;
        const bobbing = Math.sin(time * 2) * 50;

        // Apply upward force
        body.setAccelerationY(-this.liftStrength + bobbing);

        // Apply custom damping
        body.velocity.x *= this.damping;
        body.velocity.y *= this.damping;
    }
}
