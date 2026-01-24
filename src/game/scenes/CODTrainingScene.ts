import Phaser, { Scene } from 'phaser';
import { GameMode } from './GameModeSelectionScene';
import { settingsApplier } from '../../utils/SettingsApplier';

interface BullseyeTarget {
    container: Phaser.GameObjects.Container;
    outerRing: Phaser.GameObjects.Arc;
    middleRing: Phaser.GameObjects.Arc;
    innerRing: Phaser.GameObjects.Arc;
    health: number;
    isActive: boolean;
}

interface DifficultyConfig {
    targetSize: number;
    spawnDistance: { min: number; max: number };
    targetCount: number;
    movementSpeed: number;
    movementEnabled: boolean;
    spawnDelay: number;
}

export class CODTrainingScene extends Scene {
    // Game state
    private score: number = 0;
    private shotsFired: number = 0;
    private shotsHit: number = 0;
    private bullseyes: number = 0;
    private combo: number = 0;
    private maxCombo: number = 0;
    private timeRemaining: number = 60;
    private isGameActive: boolean = false;
    private isPaused: boolean = false;

    // Mouse control
    private isMouseLocked: boolean = false;
    private cameraRotation: { x: number; y: number } = { x: 0, y: 0 };
    private mouseSensitivity: number = 0.002;

    // Weapon state
    private ammo: number = 30;
    private maxAmmo: number = 30;
    private reserveAmmo: number = 90;
    private isReloading: boolean = false;
    private reloadTime: number = 3000;
    private lastShotTime: number = 0;
    private fireRate: number = 100; // ms between shots (600 RPM)
    private recoilOffset: { x: number; y: number } = { x: 0, y: 0 };

    // Graphics objects
    private weapon!: Phaser.GameObjects.Container;
    private playerArms!: Phaser.GameObjects.Container;
    private crosshair!: Phaser.GameObjects.Container;
    private targets: BullseyeTarget[] = [];
    private muzzleFlash!: Phaser.GameObjects.Container;

    // UI elements
    private scoreText!: Phaser.GameObjects.Text;
    private accuracyText!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private ammoText!: Phaser.GameObjects.Text;
    private comboText!: Phaser.GameObjects.Text;
    private lockHintText!: Phaser.GameObjects.Text;

    // Configuration
    private gameMode: GameMode | null = null;
    private difficulty: string = 'medium';
    private difficultyConfig!: DifficultyConfig;

    // Timers
    private gameTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: 'CODTrainingScene' });
    }

    init(data: { gameMode?: GameMode; difficulty?: string }) {
        this.gameMode = data.gameMode || null;
        this.difficulty = data.difficulty || 'medium';
        this.resetGameState();

        // Load settings and register this scene with settings applier
        settingsApplier.setScene(this);
        const settings = settingsApplier.getSettings();

        // Apply gameplay settings
        this.mouseSensitivity = settings.gameplay.mouseSensitivity;
        this.timeRemaining = settings.gameplay.sessionDuration;
    }

    private resetGameState() {
        this.score = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.bullseyes = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeRemaining = 60;
        this.isGameActive = false;
        this.isPaused = false;
        this.isMouseLocked = false;
        this.cameraRotation = { x: 0, y: 0 };
        this.ammo = 30;
        this.reserveAmmo = 90;
        this.isReloading = false;
        this.recoilOffset = { x: 0, y: 0 };
        this.targets = [];
    }

    private getDifficultyConfig(): DifficultyConfig {
        const configs: Record<string, DifficultyConfig> = {
            easy: {
                targetSize: 100,
                spawnDistance: { min: 150, max: 300 },
                targetCount: 2,
                movementSpeed: 0,
                movementEnabled: false,
                spawnDelay: 1000
            },
            medium: {
                targetSize: 80,
                spawnDistance: { min: 200, max: 400 },
                targetCount: 3,
                movementSpeed: 40,
                movementEnabled: true,
                spawnDelay: 600
            },
            hard: {
                targetSize: 60,
                spawnDistance: { min: 250, max: 500 },
                targetCount: 4,
                movementSpeed: 80,
                movementEnabled: true,
                spawnDelay: 400
            },
            extreme: {
                targetSize: 50,
                spawnDistance: { min: 300, max: 550 },
                targetCount: 5,
                movementSpeed: 120,
                movementEnabled: true,
                spawnDelay: 300
            }
        };
        return configs[this.difficulty] || configs.medium;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.difficultyConfig = this.getDifficultyConfig();

        // Create environment
        this.createMilitaryRange();

        // Create player arms and weapon
        this.createPlayerArms();
        this.createAK47();

        // Create crosshair (hidden until mouse locked)
        this.createCrosshair();

        // Create HUD
        this.createHUD();

        // Setup input
        this.setupInput();

        // Start game after brief delay
        this.time.delayedCall(500, () => {
            this.startGame();
        });
    }

    private createMilitaryRange() {
        const { width, height } = this.cameras.main;
        const graphics = this.add.graphics();

        // Military range background - olive/tan colors
        graphics.fillGradientStyle(0x4a5c3e, 0x4a5c3e, 0x6b7c5f, 0x6b7c5f, 1);
        graphics.fillRect(0, 0, width, height);

        // Dirt ground texture
        const groundY = height - 150;
        graphics.fillStyle(0x8b7355, 1);
        graphics.fillRect(0, groundY, width, 150);

        // Add dirt texture pattern
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = groundY + Math.random() * 150;
            const size = Math.random() * 3 + 1;
            graphics.fillStyle(0x6b5344, Math.random() * 0.3);
            graphics.fillCircle(x, y, size);
        }

        // Mountain backdrop
        graphics.fillStyle(0x3a4a3e, 1);
        graphics.beginPath();
        graphics.moveTo(0, 200);
        graphics.lineTo(width * 0.3, 120);
        graphics.lineTo(width * 0.5, 160);
        graphics.lineTo(width * 0.7, 100);
        graphics.lineTo(width, 180);
        graphics.lineTo(width, 200);
        graphics.closePath();
        graphics.fillPath();

        // Shooting range lanes
        this.createRangeLanes(graphics, groundY);

        // Distance markers
        this.createDistanceMarkers(groundY);

        // Sandbag walls (decorative)
        this.createSandbags(graphics);
    }

    private createRangeLanes(graphics: Phaser.GameObjects.Graphics, groundY: number) {
        const { width, height } = this.cameras.main;

        // Lane divider lines
        graphics.lineStyle(2, 0xcccccc, 0.3);
        for (let x = width / 4; x < width; x += width / 4) {
            graphics.beginPath();
            graphics.moveTo(x, groundY);
            graphics.lineTo(x, height);
            graphics.strokePath();
        }

        // Ground grid
        graphics.lineStyle(1, 0x666666, 0.2);
        for (let y = groundY; y < height; y += 30) {
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
            graphics.strokePath();
        }
    }

    private createDistanceMarkers(groundY: number) {
        const { width } = this.cameras.main;
        const distances = ['10m', '15m', '20m', '25m', '30m'];

        distances.forEach((dist, i) => {
            const x = 150 + i * ((width - 300) / 4);
            const marker = this.add.text(x, groundY - 20, dist, {
                fontSize: '14px',
                color: '#cccccc',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5).setAlpha(0.6);
        });
    }

    private createSandbags(graphics: Phaser.GameObjects.Graphics) {
        const { height } = this.cameras.main;

        // Left sandbag wall
        const bags = [
            { x: 40, y: height - 180, w: 60, h: 25 },
            { x: 50, y: height - 155, w: 55, h: 25 },
            { x: 45, y: height - 130, w: 50, h: 22 }
        ];

        bags.forEach(bag => {
            graphics.fillStyle(0x8b7e66, 1);
            graphics.fillRoundedRect(bag.x, bag.y, bag.w, bag.h, 5);
            graphics.lineStyle(2, 0x6b5e46, 1);
            graphics.strokeRoundedRect(bag.x, bag.y, bag.w, bag.h, 5);
        });
    }

    private createPlayerArms() {
        const { width, height } = this.cameras.main;
        this.playerArms = this.add.container(width / 2 - 80, height - 50);

        // Left arm (simplified)
        const leftArm = this.add.graphics();

        // Tactical glove (dark green)
        leftArm.fillStyle(0x3a4a2e, 1);
        leftArm.fillRect(-30, -30, 25, 80);

        // Fingers
        leftArm.fillStyle(0x2a3a1e, 1);
        leftArm.fillRect(-30, 45, 6, 15);
        leftArm.fillRect(-22, 48, 6, 18);
        leftArm.fillRect(-14, 47, 6, 17);
        leftArm.fillRect(-6, 45, 6, 15);

        // Sleeve (multicam pattern approximation)
        leftArm.fillStyle(0x6b7c5f, 1);
        leftArm.fillRect(-30, -80, 25, 50);

        this.playerArms.add(leftArm);

        // Right arm (holding trigger)
        const rightArm = this.add.graphics();

        // Tactical glove
        rightArm.fillStyle(0x3a4a2e, 1);
        rightArm.fillRect(150, -20, 28, 70);

        // Fingers gripping
        rightArm.fillStyle(0x2a3a1e, 1);
        rightArm.fillRect(150, 45, 7, 12);
        rightArm.fillRect(158, 47, 7, 14);
        rightArm.fillRect(166, 46, 7, 13);
        rightArm.fillRect(174, 44, 6, 11);

        // Sleeve
        rightArm.fillStyle(0x6b7c5f, 1);
        rightArm.fillRect(150, -70, 28, 50);

        this.playerArms.add(rightArm);

        // Breathing animation
        this.tweens.add({
            targets: this.playerArms,
            y: height - 48,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createAK47() {
        const { width, height } = this.cameras.main;
        this.weapon = this.add.container(width / 2 + 30, height - 70);

        // AK-47 body (realistic proportions)
        const gun = this.add.graphics();

        // Wooden stock
        gun.fillStyle(0x6b4423, 1);
        gun.fillRect(-200, -15, 80, 35);
        gun.lineStyle(2, 0x4a2a13, 1);
        gun.strokeRect(-200, -15, 80, 35);

        // Receiver
        gun.fillStyle(0x2a2a2a, 1);
        gun.fillRect(-120, -20, 160, 45);

        // Bolt carrier
        gun.fillStyle(0x1a1a1a, 1);
        gun.fillRect(-100, -23, 40, 10);

        // Magazine (curved)
        gun.fillStyle(0x3a3a3a, 1);
        gun.beginPath();
        gun.moveTo(-40, 25);
        gun.lineTo(-30, 25);
        gun.lineTo(-20, 90);
        gun.lineTo(-50, 90);
        gun.closePath();
        gun.fillPath();
        gun.strokePath();

        // Wooden handguard
        gun.fillStyle(0x6b4423, 1);
        gun.fillRect(40, -12, 80, 30);
        gun.lineStyle(2, 0x4a2a13, 1);
        gun.strokeRect(40, -12, 80, 30);

        // Gas tube
        gun.fillStyle(0x2a2a2a, 1);
        gun.fillRect(40, -18, 80, 6);

        // Barrel
        gun.fillStyle(0x1a1a1a, 1);
        gun.fillRect(120, -8, 100, 20);

        // Front sight
        gun.fillStyle(0x2a2a2a, 1);
        gun.fillRect(210, -25, 8, 30);
        gun.fillRect(211, -28, 6, 5);

        // Muzzle brake
        gun.fillStyle(0x1a1a1a, 1);
        gun.fillRect(220, -12, 20, 28);
        gun.lineStyle(1, 0x0a0a0a, 1);
        gun.strokeRect(225, -8, 2, 20);
        gun.strokeRect(230, -8, 2, 20);
        gun.strokeRect(235, -8, 2, 20);

        // Grip
        gun.fillStyle(0x3a3a3a, 1);
        gun.beginPath();
        gun.moveTo(-10, 25);
        gun.lineTo(10, 25);
        gun.lineTo(20, 80);
        gun.lineTo(-20, 80);
        gun.closePath();
        gun.fillPath();

        // Trigger guard
        gun.lineStyle(3, 0x2a2a2a, 1);
        gun.strokeRect(-15, 20, 30, 15);

        this.weapon.add(gun);

        // Muzzle flash container
        this.muzzleFlash = this.add.container(240, 0);
        this.weapon.add(this.muzzleFlash);

        // Weapon sway animation
        this.tweens.add({
            targets: this.weapon,
            angle: -0.5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createCrosshair() {
        const { width, height } = this.cameras.main;
        this.crosshair = this.add.container(width / 2, height / 2);
        this.crosshair.setAlpha(0); // Hidden until mouse locked

        this.updateCrosshair(); // Build initial crosshair based on settings

        this.crosshair.setDepth(1000);
    }

    /**
     * Update crosshair style and color from settings
     * Called when settings change or on initialization
     */
    public updateCrosshair() {
        if (!this.crosshair) return;

        // Clear existing crosshair elements
        this.crosshair.removeAll(true);

        const settings = settingsApplier.getSettings();
        const style = settings.gameplay.crosshairStyle;
        const color = settings.gameplay.crosshairColor;

        switch (style) {
            case 'classic':
                this.createClassicCrosshair(color);
                break;
            case 'dot':
                this.createDotCrosshair(color);
                break;
            case 'circle':
                this.createCircleCrosshair(color);
                break;
            case 't-shape':
                this.createTShapeCrosshair(color);
                break;
            default:
                this.createClassicCrosshair(color);
        }
    }

    private createClassicCrosshair(color: number) {
        const size = 15;
        const thickness = 3;
        const gap = 6;

        // Center dot
        const dot = this.add.circle(0, 0, 2, color);
        this.crosshair.add(dot);

        // Crosshair lines with black outline
        const createLine = (x: number, y: number, w: number, h: number) => {
            const outline = this.add.rectangle(x, y, w + 2, h + 2, 0x000000);
            const line = this.add.rectangle(x, y, w, h, color);
            return [outline, line];
        };

        // Top
        this.crosshair.add(createLine(0, -(gap + size / 2), thickness, size));
        // Bottom
        this.crosshair.add(createLine(0, gap + size / 2, thickness, size));
        // Left
        this.crosshair.add(createLine(-(gap + size / 2), 0, size, thickness));
        // Right
        this.crosshair.add(createLine(gap + size / 2, 0, size, thickness));
    }

    private createDotCrosshair(color: number) {
        const outline = this.add.circle(0, 0, 4, 0x000000);
        const dot = this.add.circle(0, 0, 3, color);
        this.crosshair.add([outline, dot]);
    }

    private createCircleCrosshair(color: number) {
        const outerCircle = this.add.circle(0, 0, 12, 0x000000);
        outerCircle.setStrokeStyle(3, 0x000000);
        outerCircle.isFilled = false;

        const circle = this.add.circle(0, 0, 10, color);
        circle.setStrokeStyle(2, color);
        circle.isFilled = false;

        const centerDot = this.add.circle(0, 0, 2, color);

        this.crosshair.add([outerCircle, circle, centerDot]);
    }

    private createTShapeCrosshair(color: number) {
        const thickness = 3;
        const length = 15;

        // T-shape: vertical line and horizontal top
        const createLine = (x: number, y: number, w: number, h: number) => {
            const outline = this.add.rectangle(x, y, w + 2, h + 2, 0x000000);
            const line = this.add.rectangle(x, y, w, h, color);
            return [outline, line];
        };

        // Vertical line
        this.crosshair.add(createLine(0, length / 2, thickness, length));
        // Horizontal top
        this.crosshair.add(createLine(0, -length / 2, length, thickness));
    }

    private createHUD() {
        const { width, height } = this.cameras.main;

        // Score (top center)
        this.scoreText = this.add.text(width / 2, 30, 'SCORE: 0', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial Black',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Accuracy (top left)
        this.accuracyText = this.add.text(30, 30, 'ACCURACY: 0%', {
            fontSize: '20px',
            color: '#4ade80',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });

        // Timer (top right)
        this.timerText = this.add.text(width - 30, 30, 'TIME: 1:00', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Ammo counter (bottom right - COD style)
        this.ammoText = this.add.text(width - 50, height - 50, '30 / 90', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial Black',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1);

        // Combo (bottom right above ammo)
        this.comboText = this.add.text(width - 50, height - 100, '', {
            fontSize: '24px',
            color: '#ff6b35',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(1).setAlpha(0);

        // Mouse lock hint
        this.lockHintText = this.add.text(width / 2, height - 40, 'Press CTRL to lock cursor', {
            fontSize: '16px',
            color: '#ffdd00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // ESC hint
        this.add.text(width - 30, 60, 'ESC: Menu', {
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(1, 0);
    }

    private setupInput() {
        // Prevent context menu
        this.game.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Left click - shoot
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown() && this.isMouseLocked) {
                this.shoot();
            }
        });

        // Keyboard controls
        this.input.keyboard?.on('keydown-CTRL', () => {
            this.toggleMouseLock();
        });

        this.input.keyboard?.on('keydown-ESC', () => {
            this.showPauseMenu();
        });

        this.input.keyboard?.on('keydown-R', () => {
            this.startReload();
        });

        // Mouse movement for aiming
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isMouseLocked && this.isGameActive && !this.isPaused) {
                const deltaX = pointer.movementX || 0;
                const deltaY = pointer.movementY || 0;

                // Apply mouse sensitivity and invert Y if enabled
                const settings = settingsApplier.getSettings();
                const yMultiplier = settings.controls.invertMouseY ? 1 : -1;

                this.cameraRotation.x += deltaX * this.mouseSensitivity * 100;
                this.cameraRotation.y += deltaY * yMultiplier * this.mouseSensitivity * 100;

                // Clamp camera rotation
                this.cameraRotation.x = Phaser.Math.Clamp(this.cameraRotation.x, -350, 350);
                this.cameraRotation.y = Phaser.Math.Clamp(this.cameraRotation.y, -250, 250);
            }
        });
    }

    private toggleMouseLock() {
        this.isMouseLocked = !this.isMouseLocked;

        const { width, height } = this.cameras.main;

        if (this.isMouseLocked) {
            // Lock mouse
            this.input.mouse?.requestPointerLock();
            this.crosshair.setAlpha(1);
            this.lockHintText.setAlpha(0);

            // Show lock indicator
            const lockText = this.add.text(width / 2, height / 2 - 60, '🔒 POINTER LOCKED', {
                fontSize: '20px',
                color: '#00ff00',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(1002);

            this.tweens.add({
                targets: lockText,
                alpha: 0,
                y: height / 2 - 100,
                duration: 1500,
                onComplete: () => lockText.destroy()
            });
        } else {
            // Unlock mouse
            this.input.mouse?.releasePointerLock();
            this.crosshair.setAlpha(0);
            this.lockHintText.setAlpha(1);
        }
    }

    private shoot() {
        if (!this.isGameActive || this.isPaused || this.isReloading) return;

        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.fireRate) return;

        if (this.ammo <= 0) {
            this.showEmptyMag();
            return;
        }

        this.lastShotTime = currentTime;
        this.ammo--;
        this.shotsFired++;

        // Muzzle flash
        this.showMuzzleFlash();

        // Weapon recoil
        this.applyRecoil();

        // Shell ejection
        this.ejectShell();

        // Check hit
        this.checkHit();

        // Update ammo display
        this.updateAmmoDisplay();

        // Auto reload when empty
        if (this.ammo === 0 && this.reserveAmmo > 0) {
            this.time.delayedCall(300, () => this.startReload());
        }
    }

    private showMuzzleFlash() {
        this.muzzleFlash.removeAll(true);

        // Orange-yellow realistic flash
        const flashCore = this.add.circle(0, 0, 18, 0xffaa00);
        const flashOuter = this.add.circle(0, 0, 30, 0xff6600, 0.6);
        const flashGlow = this.add.circle(0, 0, 45, 0xff4400, 0.3);

        this.muzzleFlash.add([flashGlow, flashOuter, flashCore]);

        this.tweens.add({
            targets: [flashCore, flashOuter, flashGlow],
            alpha: 0,
            scale: 1.8,
            duration: 50,
            onComplete: () => this.muzzleFlash.removeAll(true)
        });

        // Screen flash
        this.cameras.main.flash(30, 255, 200, 100, true);
    }

    private ejectShell() {
        const shellX = this.weapon.x + 100;
        const shellY = this.weapon.y - 20;

        const shell = this.add.rectangle(shellX, shellY, 8, 15, 0xddaa44);
        shell.setAngle(45);

        this.tweens.add({
            targets: shell,
            x: shellX + 80 + Math.random() * 40,
            y: shellY + 100 + Math.random() * 50,
            angle: 360 + Math.random() * 180,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => shell.destroy()
        });
    }

    private applyRecoil() {
        const recoilAmount = 2.5;
        const horizontalRecoil = (Math.random() - 0.5);

        this.recoilOffset.y -= recoilAmount;
        this.recoilOffset.x += horizontalRecoil;

        // Weapon kick
        this.tweens.add({
            targets: this.weapon,
            y: this.weapon.y + 8,
            angle: this.weapon.angle - 3,
            duration: 60,
            yoyo: true,
            ease: 'Cubic.easeOut'
        });

        // Arms recoil
        this.tweens.add({
            targets: this.playerArms,
            y: this.playerArms.y + 5,
            duration: 60,
            yoyo: true
        });

        // Crosshair expansion
        this.tweens.add({
            targets: this.crosshair,
            scaleX: 1.4,
            scaleY: 1.4,
            duration: 60,
            yoyo: true
        });

        // Recoil recovery
        this.tweens.add({
            targets: this.recoilOffset,
            y: 0,
            x: 0,
            duration: 300,
            ease: 'Cubic.easeOut'
        });
    }

    private checkHit() {
        const { width, height } = this.cameras.main;

        // Calculate aim point
        const spread = 10;
        const aimX = width / 2 + this.cameraRotation.x + this.recoilOffset.x + (Math.random() - 0.5) * spread;
        const aimY = height / 2 + this.cameraRotation.y + this.recoilOffset.y + (Math.random() - 0.5) * spread;

        let hitTarget: BullseyeTarget | null = null;
        let hitRing: 'bullseye' | 'middle' | 'outer' | null = null;

        for (const target of this.targets) {
            if (!target.isActive) continue;

            const containerX = target.container.x;
            const containerY = target.container.y;

            const distance = Phaser.Math.Distance.Between(aimX, aimY, containerX, containerY);

            // Check which ring was hit (from center outward)
            if (distance <= target.innerRing.radius) {
                hitTarget = target;
                hitRing = 'bullseye';
                break;
            } else if (distance <= target.middleRing.radius) {
                hitTarget = target;
                hitRing = 'middle';
                break;
            } else if (distance <= target.outerRing.radius) {
                hitTarget = target;
                hitRing = 'outer';
                break;
            }
        }

        if (hitTarget && hitRing) {
            this.onTargetHit(hitTarget, hitRing, aimX, aimY);
        } else {
            this.onMiss(aimX, aimY);
        }
    }

    private onTargetHit(target: BullseyeTarget, ring: 'bullseye' | 'middle' | 'outer', x: number, y: number) {
        this.shotsHit++;

        const settings = settingsApplier.getSettings();

        let points = 0;
        let color = '#ffffff';
        let text = '';

        if (ring === 'bullseye') {
            points = 10;
            color = '#ffdd00';
            text = 'BULLSEYE!';
            this.bullseyes++;
            this.showBullseyeEffect(x, y);
        } else if (ring === 'middle') {
            points = 8;
            color = '#ff4444';
            text = '+8';
        } else {
            points = 5;
            color = '#ffffff';
            text = '+5';
        }

        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        this.score += points * this.getComboMultiplier();

        // Show hit effects only if enabled in settings
        if (settings.gameplay.showHitMarkers) {
            this.showHitMarker();
        }

        if (settings.gameplay.damageNumbers) {
            this.showHitEffect(x, y, text, color);
        }

        this.showBulletHole(x, y);

        // Destroy and respawn target
        this.destroyTarget(target);

        this.updateHUD();
    }

    /**
     * Show hit marker (X in center of screen)
     */
    private showHitMarker() {
        const { width, height } = this.cameras.main;

        const markerSize = 30;
        const thickness = 4;
        const marker = this.add.container(width / 2, height / 2);
        marker.setDepth(1001);

        // X shape
        const line1 = this.add.rectangle(0, 0, markerSize, thickness, 0xffffff, 0.8);
        line1.setAngle(45);
        const line2 = this.add.rectangle(0, 0, markerSize, thickness, 0xffffff, 0.8);
        line2.setAngle(-45);

        marker.add([line1, line2]);

        // Fade out quickly
        this.tweens.add({
            targets: marker,
            alpha: 0,
            scale: 1.5,
            duration: 200,
            onComplete: () => marker.destroy()
        });
    }

    private onMiss(x: number, y: number) {
        this.combo = 0;
        this.updateHUD();

        // Wall impact
        this.showWallImpact(x, y);

        // Crosshair feedback
        this.tweens.add({
            targets: this.crosshair,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });
    }

    private showBullseyeEffect(x: number, y: number) {
        // Golden burst
        const burst = this.add.graphics();
        burst.fillStyle(0xffdd00, 0.8);
        burst.fillCircle(x, y, 40);

        // Particles
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 / 16) * i;
            const particle = this.add.circle(x, y, 5, 0xffdd00);
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 80,
                y: y + Math.sin(angle) * 80,
                alpha: 0,
                scale: 0.3,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }

        // Screen flash
        this.cameras.main.flash(150, 255, 221, 0, true);

        this.tweens.add({
            targets: burst,
            alpha: 0,
            scale: 2.5,
            duration: 300,
            onComplete: () => burst.destroy()
        });
    }

    private showHitEffect(x: number, y: number, text: string, color: string) {
        const scoreText = this.add.text(x, y, text, {
            fontSize: text === 'BULLSEYE!' ? '32px' : '24px',
            color: color,
            fontFamily: 'Arial Black',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: scoreText,
            y: y - 60,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => scoreText.destroy()
        });
    }

    private showBulletHole(x: number, y: number) {
        const hole = this.add.circle(x, y, 4, 0x222222);
        hole.setAlpha(0.8);

        this.time.delayedCall(5000, () => {
            this.tweens.add({
                targets: hole,
                alpha: 0,
                duration: 500,
                onComplete: () => hole.destroy()
            });
        });
    }

    private showWallImpact(x: number, y: number) {
        const impact = this.add.graphics();
        impact.fillStyle(0x8b7355, 0.6);
        impact.fillCircle(x, y, 8);

        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const particle = this.add.circle(x, y, 2, 0x6b5344);
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 25,
                y: y + Math.sin(angle) * 25,
                alpha: 0,
                duration: 200,
                onComplete: () => particle.destroy()
            });
        }

        this.tweens.add({
            targets: impact,
            alpha: 0,
            duration: 300,
            onComplete: () => impact.destroy()
        });
    }

    private getComboMultiplier(): number {
        if (this.combo >= 20) return 5;
        if (this.combo >= 10) return 3;
        if (this.combo >= 5) return 2;
        return 1;
    }

    private destroyTarget(target: BullseyeTarget) {
        target.isActive = false;

        // Destruction animation
        this.tweens.add({
            targets: target.container,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            angle: 20,
            duration: 200,
            onComplete: () => {
                target.container.destroy();
                const index = this.targets.indexOf(target);
                if (index > -1) this.targets.splice(index, 1);

                // Respawn
                this.time.delayedCall(this.difficultyConfig.spawnDelay, () => {
                    if (this.isGameActive) this.spawnTarget();
                });
            }
        });
    }

    private showEmptyMag() {
        this.ammoText.setColor('#ff0000');
        this.tweens.add({
            targets: this.ammoText,
            scale: 1.3,
            duration: 100,
            yoyo: true,
            onComplete: () => this.ammoText.setColor('#ffffff')
        });
    }

    private startReload() {
        if (this.isReloading || this.ammo === this.maxAmmo || this.reserveAmmo === 0) return;

        this.isReloading = true;

        // Reload animation
        this.tweens.add({
            targets: this.weapon,
            y: this.weapon.y + 60,
            angle: 15,
            duration: 500,
            yoyo: true,
            repeat: 1,
            onComplete: () => this.completeReload()
        });
    }

    private completeReload() {
        const ammoNeeded = this.maxAmmo - this.ammo;
        const ammoToLoad = Math.min(ammoNeeded, this.reserveAmmo);

        this.ammo += ammoToLoad;
        this.reserveAmmo -= ammoToLoad;
        this.isReloading = false;

        this.updateAmmoDisplay();
    }

    private updateAmmoDisplay() {
        this.ammoText.setText(`${this.ammo} / ${this.reserveAmmo}`);

        if (this.ammo <= 5 && this.ammo > 0) {
            this.ammoText.setColor('#ffaa00');
        } else {
            this.ammoText.setColor('#ffffff');
        }
    }

    private updateHUD() {
        this.scoreText.setText(`SCORE: ${this.score}`);

        const accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired * 100) : 0;
        this.accuracyText.setText(`ACCURACY: ${accuracy.toFixed(0)}%`);

        if (accuracy >= 80) this.accuracyText.setColor('#4ade80');
        else if (accuracy >= 60) this.accuracyText.setColor('#ffdd00');
        else this.accuracyText.setColor('#ff6b6b');

        // Combo display
        if (this.combo >= 3) {
            const multiplier = this.getComboMultiplier();
            this.comboText.setText(`x${multiplier} COMBO (${this.combo})`);
            this.comboText.setAlpha(1);

            this.tweens.add({
                targets: this.comboText,
                scale: 1.15,
                duration: 100,
                yoyo: true
            });
        } else {
            this.comboText.setAlpha(0);
        }
    }

    private startGame() {
        this.isGameActive = true;

        // Spawn initial targets
        for (let i = 0; i < this.difficultyConfig.targetCount; i++) {
            this.time.delayedCall(i * 300, () => this.spawnTarget());
        }

        // Start timer
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            repeat: this.timeRemaining - 1
        });
    }

    private spawnTarget() {
        if (!this.isGameActive) return;

        const { width, height } = this.cameras.main;
        const config = this.difficultyConfig;

        const angle = (Math.random() - 0.5) * 2.4;
        const distance = Phaser.Math.Between(config.spawnDistance.min, config.spawnDistance.max);

        const x = width / 2 + Math.sin(angle) * distance;
        const y = height / 2 - 50 + (Math.random() - 0.5) * 200;

        const clampedX = Phaser.Math.Clamp(x, 100, width - 100);
        const clampedY = Phaser.Math.Clamp(y, 100, height - 250);

        const target = this.createBullseyeTarget(clampedX, clampedY);
        this.targets.push(target);

        // Spawn animation
        target.container.setAlpha(0);
        target.container.setScale(0.3);
        this.tweens.add({
            targets: target.container,
            alpha: 1,
            scale: 1,
            angle: 360,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Movement
        if (config.movementEnabled && config.movementSpeed > 0) {
            const startX = target.container.x;
            this.tweens.add({
                targets: target.container,
                x: startX + (Math.random() - 0.5) * 100,
                duration: 2000 / (config.movementSpeed / 40),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    private createBullseyeTarget(x: number, y: number): BullseyeTarget {
        const config = this.difficultyConfig;
        const container = this.add.container(x, y);

        const outerRadius = config.targetSize / 2;
        const middleRadius = outerRadius * 0.6;
        const innerRadius = outerRadius * 0.3;

        // Outer white ring
        const outerRing = this.add.circle(0, 0, outerRadius, 0xffffff);
        outerRing.setStrokeStyle(3, 0x222222);
        container.add(outerRing);

        // Middle red ring
        const middleRing = this.add.circle(0, 0, middleRadius, 0xdd2222);
        middleRing.setStrokeStyle(2, 0x880000);
        container.add(middleRing);

        // Inner yellow bullseye
        const innerRing = this.add.circle(0, 0, innerRadius, 0xffdd00);
        innerRing.setStrokeStyle(2, 0xcc9900);
        container.add(innerRing);

        // Center dot
        const centerDot = this.add.circle(0, 0, 3, 0xff6600);
        container.add(centerDot);

        // Glow effect
        const glow = this.add.circle(0, 0, outerRadius + 10, 0xffaa44, 0.2);
        container.add(glow);
        container.sendToBack(glow);

        // Pulsing animation
        this.tweens.add({
            targets: glow,
            alpha: 0.4,
            scale: 1.1,
            duration: 1200,
            yoyo: true,
            repeat: -1
        });

        return {
            container,
            outerRing,
            middleRing,
            innerRing,
            health: 100,
            isActive: true
        };
    }

    private updateTimer() {
        this.timeRemaining--;

        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerText.setText(`TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`);

        if (this.timeRemaining <= 10) {
            this.timerText.setColor('#ff0000');
            this.tweens.add({
                targets: this.timerText,
                scale: 1.2,
                duration: 100,
                yoyo: true
            });
        }

        if (this.timeRemaining <= 0) {
            this.endGame();
        }
    }

    private showPauseMenu() {
        if (!this.isGameActive) return;

        this.isPaused = true;
        this.isMouseLocked = false;
        this.input.mouse?.releasePointerLock();
        this.crosshair.setAlpha(0);
        this.lockHintText.setAlpha(1);

        if (this.gameTimer) this.gameTimer.paused = true;

        const { width, height } = this.cameras.main;

        const pauseOverlay = this.add.container(0, 0);
        pauseOverlay.setName('pauseOverlay');
        pauseOverlay.setDepth(2000);

        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        bg.setInteractive();
        pauseOverlay.add(bg);

        const panel = this.add.rectangle(width / 2, height / 2, 500, 500, 0x2a3a1e);
        panel.setStrokeStyle(4, 0x6b7c5f);
        pauseOverlay.add(panel);

        const title = this.add.text(width / 2, height / 2 - 140, 'PAUSED', {
            fontSize: '48px',
            color: '#ffdd00',
            fontFamily: 'Arial Black',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        pauseOverlay.add(title);

        // Session stats
        const accuracy = this.shotsFired > 0 ? ((this.shotsHit / this.shotsFired) * 100).toFixed(0) : '0';
        const statsText = this.add.text(width / 2, height / 2 - 70,
            `Score: ${this.score}  |  Accuracy: ${accuracy}%  |  Combo: ${this.maxCombo}`, {
            fontSize: '16px',
            color: '#cccccc'
        }).setOrigin(0.5);
        pauseOverlay.add(statsText);

        // Continue button
        const continueBtn = this.createPauseButton(0, -60, 'CONTINUE', () => {
            this.resumeGame();
        });
        pauseOverlay.add(continueBtn);

        // Settings button
        const settingsBtn = this.createPauseButton(0, 0, '⚙️ SETTINGS', () => {
            this.scene.pause();
            this.scene.launch('SettingsScene');
        });
        pauseOverlay.add(settingsBtn);

        // Leaderboard button
        const leaderboardBtn = this.createPauseButton(0, 60, '🏆 LEADERBOARD', () => {
            this.scene.pause();
            this.scene.launch('LeaderboardScene');
        });
        pauseOverlay.add(leaderboardBtn);

        // Exit button
        const exitBtn = this.createPauseButton(0, 120, 'EXIT TO MENU', () => {
            this.exitToMenu();
        });
        pauseOverlay.add(exitBtn);

        const hint = this.add.text(width / 2, height / 2 + 180, 'Press ESC to resume', {
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);
        pauseOverlay.add(hint);
    }

    private createPauseButton(offsetX: number, offsetY: number, text: string, callback: () => void): Phaser.GameObjects.Container {
        const { width, height } = this.cameras.main;
        const btn = this.add.container(width / 2 + offsetX, height / 2 + offsetY);

        const bg = this.add.rectangle(0, 0, 300, 50, 0x3a4a2e);
        bg.setStrokeStyle(2, 0x6b7c5f);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x6b7c5f);
            label.setColor('#ffdd00');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x3a4a2e);
            label.setColor('#ffffff');
        });

        bg.on('pointerdown', callback);

        return btn;
    }

    private resumeGame() {
        const pauseOverlay = this.children.getByName('pauseOverlay') as Phaser.GameObjects.Container;
        if (pauseOverlay) pauseOverlay.destroy();

        this.isPaused = false;
        if (this.gameTimer) this.gameTimer.paused = false;

        // Show hint to re-lock mouse
        const { width, height } = this.cameras.main;
        const hint = this.add.text(width / 2, height / 2, 'Press CTRL to lock cursor', {
            fontSize: '24px',
            color: '#ffdd00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2001);

        this.tweens.add({
            targets: hint,
            alpha: 0,
            duration: 2000,
            delay: 1000,
            onComplete: () => hint.destroy()
        });
    }

    private exitToMenu() {
        this.isGameActive = false;
        this.input.mouse?.releasePointerLock();
        this.scene.start('MainMenu');
    }

    private endGame() {
        this.isGameActive = false;
        this.isMouseLocked = false;
        this.input.mouse?.releasePointerLock();

        const accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired * 100) : 0;

        this.saveStats(accuracy);

        this.time.delayedCall(1000, () => {
            this.showResults(accuracy);
        });
    }

    private saveStats(accuracy: number) {
        const stats = {
            score: this.score,
            accuracy: accuracy,
            bullseyes: this.bullseyes,
            maxCombo: this.maxCombo,
            shotsFired: this.shotsFired,
            shotsHit: this.shotsHit,
            difficulty: this.difficulty,
            mode: 'cod',
            timestamp: Date.now()
        };

        const history = JSON.parse(localStorage.getItem('aimchain_cod_history') || '[]');
        history.push(stats);
        localStorage.setItem('aimchain_cod_history', JSON.stringify(history.slice(-50)));

        const best = JSON.parse(localStorage.getItem('aimchain_cod_best') || '{}');
        if (!best.score || this.score > best.score) best.score = this.score;
        if (!best.accuracy || accuracy > best.accuracy) best.accuracy = accuracy;
        localStorage.setItem('aimchain_cod_best', JSON.stringify(best));
    }

    private showResults(accuracy: number) {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.9).setOrigin(0).setDepth(3000);

        const resultsContainer = this.add.container(width / 2, height / 2).setDepth(3001);

        const panel = this.add.rectangle(0, 0, 650, 550, 0x2a3a1e);
        panel.setStrokeStyle(4, 0xffdd00);
        resultsContainer.add(panel);

        const title = this.add.text(0, -220, 'MISSION COMPLETE', {
            fontSize: '40px',
            color: '#ffdd00',
            fontFamily: 'Arial Black',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        resultsContainer.add(title);

        const scoreLabel = this.add.text(0, -150, 'FINAL SCORE', {
            fontSize: '18px',
            color: '#888888'
        }).setOrigin(0.5);
        const scoreValue = this.add.text(0, -110, this.score.toString(), {
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        resultsContainer.add([scoreLabel, scoreValue]);

        const stats = [
            { label: 'Accuracy', value: `${accuracy.toFixed(0)}%`, color: accuracy >= 70 ? '#4ade80' : '#ff6b6b' },
            { label: 'Bullseyes', value: this.bullseyes.toString(), color: '#ffdd00' },
            { label: 'Best Combo', value: `x${this.maxCombo}`, color: '#ff6b35' },
            { label: 'Shots Fired', value: this.shotsFired.toString(), color: '#888888' }
        ];

        stats.forEach((stat, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = -150 + col * 300;
            const y = -30 + row * 70;

            const label = this.add.text(x, y, stat.label, {
                fontSize: '16px',
                color: '#888888'
            }).setOrigin(0.5);
            const value = this.add.text(x, y + 25, stat.value, {
                fontSize: '28px',
                color: stat.color,
                fontStyle: 'bold'
            }).setOrigin(0.5);
            resultsContainer.add([label, value]);
        });

        // Token rewards
        const baseTokens = 10;
        const accuracyBonus = Math.floor(Math.max(0, accuracy - 70) / 5);
        const scoreBonus = this.score >= 1000 ? 20 : (this.score >= 600 ? 10 : (this.score >= 300 ? 5 : 0));
        const bullseyeBonus = Math.floor(this.bullseyes / 5);
        const totalTokens = baseTokens + accuracyBonus + scoreBonus + bullseyeBonus;

        const rewardText = this.add.text(0, 130, `🎖️ REWARDS: +${totalTokens} AimTokens`, {
            fontSize: '22px',
            color: '#ffdd00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        resultsContainer.add(rewardText);

        // Buttons
        const playBtn = this.createResultButton(-120, 200, 'PLAY AGAIN', () => {
            this.scene.restart({ gameMode: this.gameMode, difficulty: this.difficulty });
        });
        resultsContainer.add(playBtn);

        const menuBtn = this.createResultButton(120, 200, 'MAIN MENU', () => {
            this.scene.start('MainMenu');
        });
        resultsContainer.add(menuBtn);

        resultsContainer.setScale(0.8).setAlpha(0);
        this.tweens.add({
            targets: resultsContainer,
            scale: 1,
            alpha: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
    }

    private createResultButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
        const btn = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 220, 50, 0x3a4a2e);
        bg.setStrokeStyle(2, 0xffdd00);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(0xffdd00);
            label.setColor('#000000');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x3a4a2e);
            label.setColor('#ffffff');
        });

        bg.on('pointerdown', callback);

        return btn;
    }

    update() {
        // Update FPS counter if enabled
        settingsApplier.updateFPSCounter();

        // Recoil recovery
        if (this.recoilOffset.y < 0) {
            this.recoilOffset.y = Math.min(0, this.recoilOffset.y + 0.5);
        }
        if (Math.abs(this.recoilOffset.x) > 0.1) {
            this.recoilOffset.x *= 0.95;
        }

        // Update crosshair with camera rotation
        const { width, height } = this.cameras.main;
        if (this.crosshair && this.isMouseLocked) {
            this.crosshair.x = width / 2 + this.cameraRotation.x + this.recoilOffset.x;
            this.crosshair.y = height / 2 + this.cameraRotation.y + this.recoilOffset.y;
        }
    }

    /**
     * Update session duration (called from settings applier)
     */
    public updateSessionDuration(duration: number) {
        if (!this.isGameActive) {
            // Only update if game hasn't started yet
            this.timeRemaining = duration;

            // Update timer display
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            this.timerText.setText(`TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
    }

    /**
     * Toggle background music (called from settings applier)
     */
    public toggleBackgroundMusic(enabled: boolean) {
        // Using Phaser's sound manager
        if (enabled) {
            // Start background music if not playing
            // Note: Requires audio file to be preloaded
            // this.sound.play('backgroundMusic', { loop: true, volume: 0.3 });
        } else {
            // Stop background music
            // this.sound.stopByKey('backgroundMusic');
        }
    }
}
