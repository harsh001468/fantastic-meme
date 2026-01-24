import Phaser, { Scene } from 'phaser';
import { GameMode } from './GameModeSelectionScene';
import { GravityController } from '../physics/GravityController';
import walletService from '../../web3/services/WalletService';

interface ValorantTarget {
    container: Phaser.GameObjects.Container;
    headHitbox: Phaser.GameObjects.Arc;
    bodyHitbox: Phaser.GameObjects.Arc;
    health: number;
    maxHealth: number;
    isActive: boolean;
    spawnTime: number;
    movementTween?: Phaser.Tweens.Tween;
    stance: 'standing' | 'crouching' | 'peeking_left' | 'peeking_right';
    gravityController?: GravityController;
}

interface DifficultyConfig {
    targetSize: number;
    headSize: number;
    spawnDistance: { min: number; max: number };
    targetCount: number;
    targetHealth: number;
    movementSpeed: number;
    movementEnabled: boolean;
    peekMode: boolean;
    peekDuration: number;
    spawnDelay: number;
}

export class ValorantTrainingScene extends Scene {
    // Game state
    private score: number = 0;
    private shotsFired: number = 0;
    private shotsHit: number = 0;
    private headshots: number = 0;
    private kills: number = 0;
    private combo: number = 0;
    private maxCombo: number = 0;
    private timeRemaining: number = 60;
    private isGameActive: boolean = false;
    private isPaused: boolean = false;

    // ADS (Aim Down Sights) state
    private isADS: boolean = false;
    private adsTransitionProgress: number = 0;
    private normalFOV: number = 103;
    private adsFOV: number = 85;
    private adsZoomLevel: number = 1.25;

    // Mouse control
    private isMouseLocked: boolean = false;
    private cameraRotation: { x: number; y: number } = { x: 0, y: 0 };
    private mouseSensitivity: number = 0.002;

    // Weapon state
    private ammo: number = 25;
    private maxAmmo: number = 25;
    private reserveAmmo: number = 75;
    private isReloading: boolean = false;
    private reloadTime: number = 2500;
    private lastShotTime: number = 0;
    private fireRate: number = 102; // ms between shots (9.75 RPS)
    private recoilOffset: { x: number; y: number } = { x: 0, y: 0 };

    // Graphics objects
    private weapon!: Phaser.GameObjects.Container;
    private crosshair!: Phaser.GameObjects.Container;
    private targets: ValorantTarget[] = [];
    private muzzleFlash!: Phaser.GameObjects.Container;
    private adsOverlay!: Phaser.GameObjects.Container;
    private vignette!: Phaser.GameObjects.Graphics;

    // UI elements
    private scoreText!: Phaser.GameObjects.Text;
    private accuracyText!: Phaser.GameObjects.Text;
    private headshotText!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private ammoText!: Phaser.GameObjects.Text;
    private comboContainer!: Phaser.GameObjects.Container;
    private comboText!: Phaser.GameObjects.Text;
    private killFeed: Phaser.GameObjects.Container[] = [];
    private reloadBar!: Phaser.GameObjects.Container;

    // Configuration
    private gameMode: GameMode | null = null;
    private difficulty: string = 'medium';
    private difficultyConfig!: DifficultyConfig;
    private hasAntiGravity: boolean = false;

    // Timers
    private gameTimer!: Phaser.Time.TimerEvent;
    private spawnTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: 'ValorantTrainingScene' });
    }

    init(data: { gameMode?: GameMode; difficulty?: string }) {
        this.gameMode = data.gameMode || null;
        this.difficulty = data.difficulty || 'medium';
        this.resetGameState();
    }

    private resetGameState() {
        this.score = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.headshots = 0;
        this.kills = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeRemaining = 60;
        this.isGameActive = false;
        this.isPaused = false;
        this.isADS = false;
        this.adsTransitionProgress = 0;
        this.ammo = 25;
        this.reserveAmmo = 75;
        this.isReloading = false;
        this.recoilOffset = { x: 0, y: 0 };
        this.targets = [];
        this.killFeed = [];
    }

    private getDifficultyConfig(): DifficultyConfig {
        const configs: Record<string, DifficultyConfig> = {
            easy: {
                targetSize: 80,
                headSize: 30,
                spawnDistance: { min: 150, max: 300 },
                targetCount: 1,
                targetHealth: 40,
                movementSpeed: 0,
                movementEnabled: false,
                peekMode: false,
                peekDuration: 0,
                spawnDelay: 800
            },
            medium: {
                targetSize: 65,
                headSize: 25,
                spawnDistance: { min: 200, max: 400 },
                targetCount: 3,
                targetHealth: 80,
                movementSpeed: 50,
                movementEnabled: true,
                peekMode: false,
                peekDuration: 0,
                spawnDelay: 500
            },
            hard: {
                targetSize: 50,
                headSize: 20,
                spawnDistance: { min: 250, max: 500 },
                targetCount: 5,
                targetHealth: 120,
                movementSpeed: 100,
                movementEnabled: true,
                peekMode: true,
                peekDuration: 1200,
                spawnDelay: 300
            },
            competitive: {
                targetSize: 45,
                headSize: 18,
                spawnDistance: { min: 300, max: 550 },
                targetCount: 5,
                targetHealth: 160,
                movementSpeed: 150,
                movementEnabled: true,
                peekMode: true,
                peekDuration: 800,
                spawnDelay: 200
            }
        };
        return configs[this.difficulty] || configs.medium;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.difficultyConfig = this.getDifficultyConfig();

        // Check Anti-Gravity Capability
        walletService.getConnectedAddress().then(async (address) => {
            if (address) {
                this.hasAntiGravity = await walletService.hasAntiGravityItem(address);
                if (this.hasAntiGravity) console.log("Anti-Gravity Boots Enabled!");
            }
        });



        // Enable 3D Gun Overlay
        window.dispatchEvent(new CustomEvent('toggle-3d-gun', { detail: { visible: true } }));

        // Create environment
        this.createEnvironment();

        // Create weapon
        this.createVandal();

        // Create crosshair
        this.createCrosshair();

        // Create ADS overlay
        this.createADSOverlay();

        // Create HUD
        this.createHUD();

        // Setup input
        this.setupInput();

        // Start game after brief delay
        this.time.delayedCall(500, () => {
            this.startGame();
        });
    }



    private createEnvironment() {
        const { width, height } = this.cameras.main;
        const graphics = this.add.graphics();

        // Valorant-style dark background with gradient
        graphics.fillGradientStyle(0x0f1923, 0x0f1923, 0x1a2634, 0x1a2634, 1);
        graphics.fillRect(0, 0, width, height);

        // Hexagonal floor pattern
        this.createHexFloor(graphics);

        // Side walls with geometric patterns
        this.createWalls(graphics);

        // Accent lights (cyan and purple glow)
        this.createAccentLights();

        // Distance markers
        this.createDistanceMarkers();
    }

    private createHexFloor(graphics: Phaser.GameObjects.Graphics) {
        const { width, height } = this.cameras.main;
        const floorY = height - 120;

        // Floor gradient
        graphics.fillGradientStyle(0x1e3a5f, 0x1e3a5f, 0x0d1f33, 0x0d1f33, 1);
        graphics.fillRect(0, floorY, width, 120);

        // Hexagon pattern lines
        graphics.lineStyle(1, 0x00d4ff, 0.3);
        const hexSize = 40;
        for (let x = 0; x < width + hexSize; x += hexSize * 1.5) {
            for (let y = floorY; y < height; y += hexSize * 0.866) {
                const offset = ((y - floorY) / (hexSize * 0.866)) % 2 === 0 ? 0 : hexSize * 0.75;
                this.drawHexagon(graphics, x + offset, y, hexSize / 2);
            }
        }

        // Glowing energy lines
        graphics.lineStyle(2, 0x00d4ff, 0.6);
        graphics.beginPath();
        graphics.moveTo(0, floorY);
        graphics.lineTo(width, floorY);
        graphics.strokePath();

        // Grid lines
        graphics.lineStyle(1, 0x00d4ff, 0.2);
        for (let x = 0; x < width; x += 100) {
            graphics.beginPath();
            graphics.moveTo(x, floorY);
            graphics.lineTo(x, height);
            graphics.strokePath();
        }
    }

    private drawHexagon(graphics: Phaser.GameObjects.Graphics, x: number, y: number, size: number) {
        const points: Phaser.Math.Vector2[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            points.push(new Phaser.Math.Vector2(
                x + size * Math.cos(angle),
                y + size * Math.sin(angle)
            ));
        }
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < 6; i++) {
            graphics.lineTo(points[i].x, points[i].y);
        }
        graphics.closePath();
        graphics.strokePath();
    }

    private createWalls(graphics: Phaser.GameObjects.Graphics) {
        const { width, height } = this.cameras.main;

        // Left wall
        graphics.fillStyle(0x1a2634, 1);
        graphics.fillRect(0, 0, 80, height - 120);

        // Right wall
        graphics.fillRect(width - 80, 0, 80, height - 120);

        // Back wall (range)
        graphics.fillStyle(0x0d1f33, 1);
        graphics.fillRect(80, 50, width - 160, 80);

        // Geometric patterns on walls
        graphics.lineStyle(1, 0x00d4ff, 0.3);
        for (let y = 100; y < height - 150; y += 60) {
            // Left wall pattern
            graphics.strokeRect(10, y, 60, 40);
            graphics.strokeRect(20, y + 10, 40, 20);

            // Right wall pattern
            graphics.strokeRect(width - 70, y, 60, 40);
            graphics.strokeRect(width - 60, y + 10, 40, 20);
        }
    }

    private createAccentLights() {
        const { width, height } = this.cameras.main;

        // Cyan accent lights (left side)
        const cyanGlow1 = this.add.rectangle(40, 200, 4, 150, 0x00d4ff);
        cyanGlow1.setAlpha(0.8);
        this.tweens.add({
            targets: cyanGlow1,
            alpha: 0.4,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        const cyanGlow2 = this.add.rectangle(40, 400, 4, 150, 0x00d4ff);
        cyanGlow2.setAlpha(0.6);
        this.tweens.add({
            targets: cyanGlow2,
            alpha: 0.3,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            delay: 300
        });

        // Purple accent lights (right side)
        const purpleGlow1 = this.add.rectangle(width - 40, 200, 4, 150, 0x9b59b6);
        purpleGlow1.setAlpha(0.8);
        this.tweens.add({
            targets: purpleGlow1,
            alpha: 0.4,
            duration: 1600,
            yoyo: true,
            repeat: -1,
            delay: 500
        });

        const purpleGlow2 = this.add.rectangle(width - 40, 400, 4, 150, 0x9b59b6);
        purpleGlow2.setAlpha(0.6);
        this.tweens.add({
            targets: purpleGlow2,
            alpha: 0.3,
            duration: 1900,
            yoyo: true,
            repeat: -1,
            delay: 800
        });
    }

    private createDistanceMarkers() {
        const { width, height } = this.cameras.main;
        const distances = ['10m', '15m', '20m', '25m', '30m'];
        const y = height - 135;

        distances.forEach((dist, i) => {
            const x = 150 + i * ((width - 300) / 4);

            // Marker line
            const line = this.add.rectangle(x, y, 2, 20, 0x00d4ff, 0.5);

            // Distance text
            this.add.text(x, y - 20, dist, {
                fontSize: '12px',
                color: '#00d4ff',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setAlpha(0.7);
        });
    }

    private createVandal() {
        const { width, height } = this.cameras.main;
        this.weapon = this.add.container(width / 2 + 100, height - 80);

        // Vandal rifle body (futuristic design)
        const gunBody = this.add.graphics();

        // Main receiver (angular futuristic shape)
        gunBody.fillStyle(0x1a1a2e, 1);
        gunBody.fillRect(-120, -25, 200, 50);

        // Angular top rail
        gunBody.fillStyle(0x2a2a3e, 1);
        gunBody.beginPath();
        gunBody.moveTo(-100, -25);
        gunBody.lineTo(60, -25);
        gunBody.lineTo(70, -35);
        gunBody.lineTo(-90, -35);
        gunBody.closePath();
        gunBody.fillPath();

        // Barrel (longer, sleeker)
        gunBody.fillStyle(0x333344, 1);
        gunBody.fillRect(80, -12, 100, 24);

        // Barrel tip (muzzle brake)
        gunBody.fillStyle(0x2a2a3e, 1);
        gunBody.fillRect(175, -15, 25, 30);
        gunBody.fillStyle(0x1a1a2e, 1);
        gunBody.fillRect(180, -10, 3, 20);
        gunBody.fillRect(188, -10, 3, 20);
        gunBody.fillRect(196, -10, 3, 20);

        // Magazine (curved, futuristic)
        gunBody.fillStyle(0x2a2a3e, 1);
        gunBody.beginPath();
        gunBody.moveTo(-40, 25);
        gunBody.lineTo(-30, 25);
        gunBody.lineTo(-20, 85);
        gunBody.lineTo(-50, 85);
        gunBody.closePath();
        gunBody.fillPath();

        // Grip (ergonomic)
        gunBody.fillStyle(0x1a1a2e, 1);
        gunBody.beginPath();
        gunBody.moveTo(20, 25);
        gunBody.lineTo(35, 25);
        gunBody.lineTo(45, 75);
        gunBody.lineTo(10, 75);
        gunBody.closePath();
        gunBody.fillPath();

        // Stock (angular, modern)
        gunBody.fillStyle(0x2a2a3e, 1);
        gunBody.beginPath();
        gunBody.moveTo(-120, -20);
        gunBody.lineTo(-180, -10);
        gunBody.lineTo(-180, 20);
        gunBody.lineTo(-120, 20);
        gunBody.closePath();
        gunBody.fillPath();

        // LED accent strips (Valorant style)
        gunBody.fillStyle(0x00d4ff, 1);
        gunBody.fillRect(-100, -22, 80, 3);
        gunBody.fillRect(-100, 22, 80, 3);
        gunBody.fillRect(85, -8, 60, 2);
        gunBody.fillRect(85, 8, 60, 2);

        // Side panel details
        gunBody.fillStyle(0x3a3a4e, 1);
        gunBody.fillRect(-90, -15, 50, 30);
        gunBody.lineStyle(1, 0x00d4ff, 0.5);
        gunBody.strokeRect(-90, -15, 50, 30);

        // Scope mount
        gunBody.fillStyle(0x333344, 1);
        gunBody.fillRect(-30, -40, 60, 10);

        this.weapon.add(gunBody);

        // Iron sights
        const frontSight = this.add.rectangle(170, -42, 4, 12, 0x00d4ff);
        const rearSight = this.add.rectangle(-20, -42, 20, 8, 0x2a2a3e);
        this.weapon.add([frontSight, rearSight]);

        // Create muzzle flash container
        this.muzzleFlash = this.add.container(200, 0);
        this.weapon.add(this.muzzleFlash);

        // Weapon idle animation
        this.tweens.add({
            targets: this.weapon,
            y: height - 78,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createCrosshair() {
        const { width, height } = this.cameras.main;
        this.crosshair = this.add.container(width / 2, height / 2);

        // Valorant-style crosshair with inner/outer lines - INCREASED SIZE FOR VISIBILITY
        const lineLength = 12;
        const lineWidth = 3;
        const gap = 5;
        const color = 0x00ffff;

        // Center dot - LARGER
        const centerDot = this.add.circle(0, 0, 3, color);
        this.crosshair.add(centerDot);

        // Outer lines with black outline - THICKER
        const createLine = (x: number, y: number, w: number, h: number) => {
            const outline = this.add.rectangle(x, y, w + 3, h + 3, 0x000000);
            const line = this.add.rectangle(x, y, w, h, color);
            return [outline, line];
        };

        // Top
        this.crosshair.add(createLine(0, -(gap + lineLength / 2), lineWidth, lineLength));
        // Bottom
        this.crosshair.add(createLine(0, gap + lineLength / 2, lineWidth, lineLength));
        // Left
        this.crosshair.add(createLine(-(gap + lineLength / 2), 0, lineLength, lineWidth));
        // Right
        this.crosshair.add(createLine(gap + lineLength / 2, 0, lineLength, lineWidth));

        this.crosshair.setDepth(1000);
    }

    private createADSOverlay() {
        const { width, height } = this.cameras.main;

        this.adsOverlay = this.add.container(0, 0);
        this.adsOverlay.setDepth(999);
        this.adsOverlay.setAlpha(0);

        // Vignette effect
        this.vignette = this.add.graphics();
        this.vignette.fillStyle(0x000000, 0.6);

        // Create vignette with gradient-like effect using multiple rectangles
        const vignetteWidth = 120;
        for (let i = 0; i < 10; i++) {
            const alpha = 0.08 * (10 - i);
            this.vignette.fillStyle(0x000000, alpha);
            // Left
            this.vignette.fillRect(0, 0, vignetteWidth - i * 10, height);
            // Right
            this.vignette.fillRect(width - vignetteWidth + i * 10, 0, vignetteWidth - i * 10, height);
            // Top
            this.vignette.fillRect(0, 0, width, vignetteWidth - i * 10);
            // Bottom
            this.vignette.fillRect(0, height - vignetteWidth + i * 10, width, vignetteWidth - i * 10);
        }

        this.adsOverlay.add(this.vignette);

        // ADS crosshair (smaller, more precise)
        const adsDot = this.add.circle(width / 2, height / 2, 1.5, 0x00ffff);
        this.adsOverlay.add(adsDot);

        // Zoom indicator
        const zoomText = this.add.text(100, height - 80, '1.25x', {
            fontSize: '14px',
            color: '#00d4ff',
            fontFamily: 'Arial'
        }).setAlpha(0.7);
        this.adsOverlay.add(zoomText);
    }

    private createHUD() {
        const { width, height } = this.cameras.main;

        // Score (top center)
        const scoreContainer = this.add.container(width / 2, 40);
        const scoreBg = this.add.rectangle(0, 0, 200, 50, 0x0f1923, 0.8);
        scoreBg.setStrokeStyle(2, 0x00d4ff, 0.5);
        this.scoreText = this.add.text(0, 0, 'SCORE: 0', {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        scoreContainer.add([scoreBg, this.scoreText]);

        // Accuracy (top left)
        this.accuracyText = this.add.text(30, 30, 'ACC: 0.0%', {
            fontSize: '18px',
            color: '#4ade80',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });

        // Headshot percentage (below accuracy)
        this.headshotText = this.add.text(30, 55, 'HS: 0%', {
            fontSize: '16px',
            color: '#ff6b6b',
            fontFamily: 'Arial'
        });

        // Timer (top right)
        this.timerText = this.add.text(width - 30, 30, 'TIME: 1:00', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Ammo counter (bottom right - Valorant style)
        const ammoContainer = this.add.container(width - 80, height - 60);
        const ammoBg = this.add.rectangle(0, 0, 120, 60, 0x0f1923, 0.8);
        ammoBg.setStrokeStyle(1, 0x00d4ff, 0.3);
        this.ammoText = this.add.text(0, 0, '25 / 75', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        ammoContainer.add([ammoBg, this.ammoText]);

        // Combo indicator (center right)
        this.comboContainer = this.add.container(width - 100, height / 2);
        this.comboContainer.setAlpha(0);
        const comboBg = this.add.rectangle(0, 0, 120, 50, 0xff4757, 0.3);
        this.comboText = this.add.text(0, 0, 'x1 STREAK', {
            fontSize: '20px',
            color: '#ff4757',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.comboContainer.add([comboBg, this.comboText]);

        // Reload bar (below crosshair)
        this.reloadBar = this.add.container(width / 2, height / 2 + 50);
        this.reloadBar.setAlpha(0);
        const reloadBg = this.add.rectangle(0, 0, 100, 8, 0x1a1a2e);
        const reloadProgress = this.add.rectangle(-50, 0, 0, 6, 0x00d4ff).setOrigin(0, 0.5);
        reloadProgress.setName('progress');
        const reloadText = this.add.text(0, 15, 'RELOADING', {
            fontSize: '12px',
            color: '#00d4ff'
        }).setOrigin(0.5);
        this.reloadBar.add([reloadBg, reloadProgress, reloadText]);

        // Difficulty indicator
        this.add.text(30, height - 30, `${this.difficulty.toUpperCase()} MODE`, {
            fontSize: '14px',
            color: '#888888',
            fontFamily: 'Arial'
        });

        // Controls hint
        this.add.text(width / 2, height - 30, 'CTRL: Lock/Unlock Mouse  |  ESC: Menu', {
            fontSize: '12px',
            color: '#666666',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    private setupInput() {
        // Prevent context menu on right-click
        this.game.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Left click - shoot
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.shoot();
            }
        });

        // Right click - ADS
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) {
                this.enterADS();
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (!pointer.rightButtonDown()) {
                this.exitADS();
            }
        });

        // Keyboard
        this.input.keyboard?.on('keydown-R', () => {
            this.startReload();
        });

        this.input.keyboard?.on('keydown-ESC', () => {
            this.showExitMenu();
        });

        this.input.keyboard?.on('keydown-CTRL', () => {
            this.toggleMouseLock();
        });

        // Mouse movement for aiming
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isMouseLocked && this.isGameActive && !this.isPaused) {
                const deltaX = pointer.movementX || 0;
                const deltaY = pointer.movementY || 0;

                this.cameraRotation.x += deltaX * this.mouseSensitivity * 100;
                this.cameraRotation.y += deltaY * this.mouseSensitivity * 100;

                // Clamp camera rotation
                this.cameraRotation.x = Phaser.Math.Clamp(this.cameraRotation.x, -300, 300);
                this.cameraRotation.y = Phaser.Math.Clamp(this.cameraRotation.y, -200, 200);
            }
        });
    }

    private enterADS() {
        if (this.isADS || this.isReloading) return;

        this.isADS = true;

        // Weapon position shift
        this.tweens.add({
            targets: this.weapon,
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height - 60,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 250,
            ease: 'Cubic.easeOut'
        });

        // Show ADS overlay
        this.tweens.add({
            targets: this.adsOverlay,
            alpha: 1,
            duration: 250,
            ease: 'Cubic.easeOut'
        });

        // Hide normal crosshair
        this.tweens.add({
            targets: this.crosshair,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 250
        });

        // Zoom camera
        this.tweens.add({
            targets: this.cameras.main,
            zoom: this.adsZoomLevel,
            duration: 250,
            ease: 'Cubic.easeOut'
        });
    }

    private exitADS() {
        if (!this.isADS) return;

        this.isADS = false;

        // Weapon position reset
        this.tweens.add({
            targets: this.weapon,
            x: this.cameras.main.width / 2 + 100,
            y: this.cameras.main.height - 80,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Cubic.easeOut'
        });

        // Hide ADS overlay
        this.tweens.add({
            targets: this.adsOverlay,
            alpha: 0,
            duration: 200
        });

        // Show normal crosshair
        this.tweens.add({
            targets: this.crosshair,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 200
        });

        // Reset camera zoom
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1,
            duration: 200,
            ease: 'Cubic.easeOut'
        });
    }

    private shoot() {
        if (!this.isGameActive || this.isPaused || this.isReloading) return;

        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.fireRate) return;

        if (this.ammo <= 0) {
            // Empty click sound feedback
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

        // Raycast for hit detection
        this.checkHit();

        // Update ammo display
        this.updateAmmoDisplay();

        // Auto reload when empty
        if (this.ammo === 0 && this.reserveAmmo > 0) {
            this.time.delayedCall(300, () => this.startReload());
        }
    }

    private showMuzzleFlash() {
        // Clear previous flash
        this.muzzleFlash.removeAll(true);

        // Blue-white energy flash (Valorant style)
        const flashCore = this.add.circle(0, 0, 15, 0xffffff);
        const flashOuter = this.add.circle(0, 0, 25, 0x00d4ff, 0.6);

        // Hexagonal energy pattern
        const hexFlash = this.add.graphics();
        hexFlash.fillStyle(0x00d4ff, 0.4);
        this.drawHexagon(hexFlash, 0, 0, 30);

        this.muzzleFlash.add([flashOuter, flashCore, hexFlash]);

        // Flash animation
        this.tweens.add({
            targets: [flashCore, flashOuter, hexFlash],
            alpha: 0,
            scale: 1.5,
            duration: 60,
            onComplete: () => {
                this.muzzleFlash.removeAll(true);
            }
        });

        // Create tracer
        this.createTracer();
    }

    private createTracer() {
        const { width, height } = this.cameras.main;
        const startX = this.weapon.x + 200;
        const startY = this.weapon.y;
        const endX = width / 2 + this.recoilOffset.x;
        const endY = height / 2 + this.recoilOffset.y - 200;

        const tracer = this.add.graphics();
        tracer.lineStyle(2, 0x00d4ff, 0.8);
        tracer.beginPath();
        tracer.moveTo(startX, startY);
        tracer.lineTo(endX, endY);
        tracer.strokePath();

        this.tweens.add({
            targets: tracer,
            alpha: 0,
            duration: 100,
            onComplete: () => tracer.destroy()
        });
    }

    private applyRecoil() {
        const recoilAmount = this.isADS ? 2 : 3;
        const horizontalRecoil = (Math.random() - 0.5) * (this.isADS ? 0.5 : 1);

        // Accumulate recoil
        this.recoilOffset.y -= recoilAmount;
        this.recoilOffset.x += horizontalRecoil;

        // Weapon kick animation
        this.tweens.add({
            targets: this.weapon,
            y: this.weapon.y + 5,
            angle: this.weapon.angle - 2,
            duration: 50,
            yoyo: true,
            ease: 'Cubic.easeOut'
        });

        // Crosshair expansion
        if (!this.isADS) {
            this.tweens.add({
                targets: this.crosshair,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 50,
                yoyo: true
            });
        }

        // Recoil recovery
        this.tweens.add({
            targets: this.recoilOffset,
            y: 0,
            x: 0,
            duration: 400,
            ease: 'Cubic.easeOut'
        });
    }

    private checkHit() {
        const { width, height } = this.cameras.main;

        // Calculate aim point with camera rotation, recoil and spread
        const spread = this.isADS ? 5 : 15;
        const aimX = width / 2 + this.cameraRotation.x + this.recoilOffset.x + (Math.random() - 0.5) * spread;
        const aimY = height / 2 + this.cameraRotation.y + this.recoilOffset.y + (Math.random() - 0.5) * spread;

        let hitTarget: ValorantTarget | null = null;
        let isHeadshot = false;
        let hitX = aimX;
        let hitY = aimY;

        // Check all targets for hits
        for (const target of this.targets) {
            if (!target.isActive) continue;

            // Get world positions of hitboxes
            const containerX = target.container.x;
            const containerY = target.container.y;

            // Check head hitbox first (priority)
            const headWorldX = containerX + target.headHitbox.x;
            const headWorldY = containerY + target.headHitbox.y;
            const headRadius = target.headHitbox.radius;

            const headDistance = Phaser.Math.Distance.Between(aimX, aimY, headWorldX, headWorldY);
            if (headDistance <= headRadius) {
                hitTarget = target;
                isHeadshot = true;
                hitX = headWorldX;
                hitY = headWorldY;
                break;
            }

            // Check body hitbox
            const bodyWorldX = containerX + target.bodyHitbox.x;
            const bodyWorldY = containerY + target.bodyHitbox.y;
            const bodyHalfWidth = target.bodyHitbox.width / 2;
            const bodyHalfHeight = target.bodyHitbox.height / 2;

            if (aimX >= bodyWorldX - bodyHalfWidth &&
                aimX <= bodyWorldX + bodyHalfWidth &&
                aimY >= bodyWorldY - bodyHalfHeight &&
                aimY <= bodyWorldY + bodyHalfHeight) {
                hitTarget = target;
                isHeadshot = false;
                hitX = bodyWorldX;
                hitY = bodyWorldY;
                break;
            }
        }

        if (hitTarget) {
            this.onTargetHit(hitTarget, isHeadshot, hitX, hitY);
        } else {
            this.onMiss(aimX, aimY);
        }
    }

    private onTargetHit(target: ValorantTarget, isHeadshot: boolean, hitX: number, hitY: number) {
        this.shotsHit++;

        const damage = isHeadshot ? 160 : 40;
        target.health -= damage;

        if (isHeadshot) {
            this.headshots++;
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;

            // Headshot effects
            this.showHeadshotEffect(hitX, hitY);
            this.showHitMarker(true);
            this.addScore(10, 'HEADSHOT', hitX, hitY, true);
            this.addKillFeedEntry('Headshot');
        } else {
            // Body shot effects
            this.showBodyHitEffect(hitX, hitY);
            this.showHitMarker(false);
            this.addScore(5, 'BODY', hitX, hitY, false);

            // Show damage number
            this.showDamageNumber(hitX, hitY, damage);
        }

        // Check if target is killed
        if (target.health <= 0) {
            this.kills++;
            this.destroyTarget(target);

            if (!isHeadshot) {
                this.addKillFeedEntry('Eliminated');
            }
        }

        this.updateHUD();
    }

    private onMiss(hitX: number, hitY: number) {
        this.combo = 0;
        this.updateComboDisplay();

        // Wall impact effect
        this.showWallImpact(hitX, hitY);

        // Crosshair miss feedback
        this.tweens.add({
            targets: this.crosshair,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });
    }

    private showHeadshotEffect(x: number, y: number) {
        // Red energy burst
        const burst = this.add.graphics();
        burst.fillStyle(0xff4444, 0.8);
        burst.fillCircle(x, y, 30);

        // Particles
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const particle = this.add.circle(x, y, 4, 0xff4444);
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 60,
                y: y + Math.sin(angle) * 60,
                alpha: 0,
                scale: 0.3,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }

        // Screen flash
        this.cameras.main.flash(100, 255, 68, 68, true);

        this.tweens.add({
            targets: burst,
            alpha: 0,
            scale: 2,
            duration: 200,
            onComplete: () => burst.destroy()
        });
    }

    private showBodyHitEffect(x: number, y: number) {
        // White spark impact
        const spark = this.add.graphics();
        spark.fillStyle(0xffffff, 0.9);
        spark.fillCircle(x, y, 15);

        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const particle = this.add.circle(x, y, 2, 0xffffff);
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 30,
                y: y + Math.sin(angle) * 30,
                alpha: 0,
                duration: 200,
                onComplete: () => particle.destroy()
            });
        }

        this.tweens.add({
            targets: spark,
            alpha: 0,
            scale: 1.5,
            duration: 150,
            onComplete: () => spark.destroy()
        });
    }

    private showHitMarker(isHeadshot: boolean) {
        const { width, height } = this.cameras.main;
        const color = isHeadshot ? 0xff4444 : 0xffffff;

        const hitMarker = this.add.container(width / 2, height / 2);
        hitMarker.setDepth(1001);

        // X shape for headshot, + for body
        const size = isHeadshot ? 15 : 10;
        const thickness = 3;

        if (isHeadshot) {
            // X marker
            const line1 = this.add.rectangle(0, 0, size * 2, thickness, color);
            line1.setAngle(45);
            const line2 = this.add.rectangle(0, 0, size * 2, thickness, color);
            line2.setAngle(-45);
            hitMarker.add([line1, line2]);
        } else {
            // + marker (crosshair expansion)
            const line1 = this.add.rectangle(0, 0, size * 2, thickness, color);
            const line2 = this.add.rectangle(0, 0, thickness, size * 2, color);
            hitMarker.add([line1, line2]);
        }

        this.tweens.add({
            targets: hitMarker,
            alpha: 0,
            scale: 1.5,
            duration: 200,
            onComplete: () => hitMarker.destroy()
        });
    }

    private showDamageNumber(x: number, y: number, damage: number) {
        const damageText = this.add.text(x, y, `-${damage}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: damageText,
            y: y - 40,
            alpha: 0,
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => damageText.destroy()
        });
    }

    private showWallImpact(x: number, y: number) {
        // Blue energy impact
        const impact = this.add.graphics();
        impact.fillStyle(0x00d4ff, 0.5);
        impact.fillCircle(x, y, 10);

        // Spark particles
        for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spark = this.add.circle(x, y, 2, 0x00d4ff);
            this.tweens.add({
                targets: spark,
                x: x + Math.cos(angle) * 20,
                y: y + Math.sin(angle) * 20,
                alpha: 0,
                duration: 150,
                onComplete: () => spark.destroy()
            });
        }

        this.tweens.add({
            targets: impact,
            alpha: 0,
            duration: 200,
            onComplete: () => impact.destroy()
        });
    }

    private addScore(points: number, type: string, x: number, y: number, isHeadshot: boolean) {
        const multiplier = this.getComboMultiplier();
        const finalPoints = Math.floor(points * multiplier);
        this.score += finalPoints;

        // Floating score text
        const color = isHeadshot ? '#ffd700' : '#ffffff';
        const fontSize = isHeadshot ? '24px' : '18px';
        const text = isHeadshot ? `+${finalPoints} HEADSHOT` : `+${finalPoints}`;

        const scorePopup = this.add.text(x, y - 30, text, {
            fontSize: fontSize,
            color: color,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: scorePopup,
            y: y - 80,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => scorePopup.destroy()
        });
    }

    private getComboMultiplier(): number {
        if (this.combo >= 10) return 2;
        if (this.combo >= 5) return 1.5;
        return 1;
    }

    private addKillFeedEntry(type: string) {
        const { width } = this.cameras.main;

        const entry = this.add.container(width + 200, 100 + this.killFeed.length * 30);

        const bg = this.add.rectangle(0, 0, 250, 25, 0x0f1923, 0.8);
        const text = this.add.text(0, 0, `You eliminated Bot - ${type}`, {
            fontSize: '12px',
            color: type === 'Headshot' ? '#ff4444' : '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        entry.add([bg, text]);
        this.killFeed.push(entry);

        // Slide in
        this.tweens.add({
            targets: entry,
            x: width - 140,
            duration: 200,
            ease: 'Cubic.easeOut'
        });

        // Fade out after 3 seconds
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: entry,
                alpha: 0,
                x: width + 200,
                duration: 300,
                onComplete: () => {
                    const index = this.killFeed.indexOf(entry);
                    if (index > -1) this.killFeed.splice(index, 1);
                    entry.destroy();
                }
            });
        });
    }

    private destroyTarget(target: ValorantTarget) {
        target.isActive = false;

        if (target.movementTween) {
            target.movementTween.stop();
        }

        // Disintegration effect
        const particles: Phaser.GameObjects.Arc[] = [];
        for (let i = 0; i < 20; i++) {
            const px = target.container.x + (Math.random() - 0.5) * 80;
            const py = target.container.y + (Math.random() - 0.5) * 100;
            const particle = this.add.circle(px, py, 5, 0xff4444);
            particles.push(particle);

            this.tweens.add({
                targets: particle,
                x: px + (Math.random() - 0.5) * 100,
                y: py + (Math.random() - 0.5) * 100,
                alpha: 0,
                scale: 0,
                duration: 400,
                delay: i * 10,
                onComplete: () => particle.destroy()
            });
        }

        // Fade out target
        this.tweens.add({
            targets: target.container,
            alpha: 0,
            scale: 0.8,
            duration: 200,
            onComplete: () => {
                target.container.destroy();
                const index = this.targets.indexOf(target);
                if (index > -1) this.targets.splice(index, 1);

                // Respawn after delay
                this.time.delayedCall(this.difficultyConfig.spawnDelay, () => {
                    if (this.isGameActive) this.spawnTarget();
                });
            }
        });
    }

    private showEmptyMag() {
        // Visual feedback for empty magazine
        this.ammoText.setColor('#ff4444');
        this.tweens.add({
            targets: this.ammoText,
            scale: 1.2,
            duration: 100,
            yoyo: true,
            onComplete: () => this.ammoText.setColor('#ffffff')
        });
    }

    private startReload() {
        if (this.isReloading || this.ammo === this.maxAmmo || this.reserveAmmo === 0) return;

        this.isReloading = true;
        this.exitADS();

        // Show reload bar
        this.reloadBar.setAlpha(1);
        const progressBar = this.reloadBar.getByName('progress') as Phaser.GameObjects.Rectangle;
        progressBar.width = 0;

        // Reload animation
        this.tweens.add({
            targets: progressBar,
            width: 100,
            duration: this.reloadTime,
            ease: 'Linear',
            onComplete: () => {
                this.completeReload();
            }
        });

        // Weapon reload animation
        this.tweens.add({
            targets: this.weapon,
            y: this.weapon.y + 50,
            duration: 300,
            yoyo: true,
            repeat: 1,
            ease: 'Cubic.easeInOut'
        });
    }

    private completeReload() {
        const ammoNeeded = this.maxAmmo - this.ammo;
        const ammoToLoad = Math.min(ammoNeeded, this.reserveAmmo);

        this.ammo += ammoToLoad;
        this.reserveAmmo -= ammoToLoad;
        this.isReloading = false;

        this.reloadBar.setAlpha(0);
        this.updateAmmoDisplay();
    }

    private updateAmmoDisplay() {
        this.ammoText.setText(`${this.ammo} / ${this.reserveAmmo}`);

        // Low ammo warning
        if (this.ammo <= 5 && this.ammo > 0) {
            this.ammoText.setColor('#ff4444');
            this.tweens.add({
                targets: this.ammoText,
                scale: 1.1,
                duration: 200,
                yoyo: true,
                repeat: 2
            });
        } else {
            this.ammoText.setColor('#ffffff');
        }
    }

    private updateHUD() {
        // Score
        this.scoreText.setText(`SCORE: ${this.score}`);

        // Accuracy
        const accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired * 100) : 0;
        this.accuracyText.setText(`ACC: ${accuracy.toFixed(1)}%`);
        if (accuracy >= 85) this.accuracyText.setColor('#4ade80');
        else if (accuracy >= 70) this.accuracyText.setColor('#f7dc6f');
        else this.accuracyText.setColor('#ff6b6b');

        // Headshot percentage
        const hsPercent = this.kills > 0 ? (this.headshots / this.kills * 100) : 0;
        this.headshotText.setText(`HS: ${hsPercent.toFixed(0)}%`);

        // Combo
        this.updateComboDisplay();
    }

    private updateComboDisplay() {
        if (this.combo >= 3) {
            const multiplier = this.getComboMultiplier();
            this.comboText.setText(`x${multiplier} STREAK`);
            this.comboContainer.setAlpha(1);

            // Pulse animation
            this.tweens.add({
                targets: this.comboContainer,
                scale: 1.1,
                duration: 100,
                yoyo: true
            });
        } else {
            this.comboContainer.setAlpha(0);
        }
    }

    private startGame() {
        this.isGameActive = true;

        // Spawn initial targets
        for (let i = 0; i < this.difficultyConfig.targetCount; i++) {
            this.time.delayedCall(i * 200, () => this.spawnTarget());
        }

        // Start game timer
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

        // Random position within spawn area
        const angle = (Math.random() - 0.5) * 2 * (Math.PI / 3); // ±60 degrees
        const distance = Phaser.Math.Between(config.spawnDistance.min, config.spawnDistance.max);

        const x = width / 2 + Math.sin(angle) * distance;
        const y = height / 2 - 100 + (Math.random() - 0.5) * 150;

        // Clamp to visible area
        const clampedX = Phaser.Math.Clamp(x, 150, width - 150);
        const clampedY = Phaser.Math.Clamp(y, 150, height - 200);

        const target = this.createTarget(clampedX, clampedY);
        this.targets.push(target);

        // Spawn animation
        target.container.setAlpha(0);
        target.container.setScale(0.5);
        this.tweens.add({
            targets: target.container,
            alpha: 1,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        // Movement for appropriate difficulties
        if (config.movementEnabled && config.movementSpeed > 0) {
            this.addTargetMovement(target);
        }

        // Peek mode
        if (config.peekMode) {
            this.time.delayedCall(config.peekDuration, () => {
                if (target.isActive) {
                    this.hideTarget(target);
                }
            });
        }
    }

    private createTarget(x: number, y: number): ValorantTarget {
        const config = this.difficultyConfig;
        const container = this.add.container(x, y);

        // Bullseye target design
        const outerRadius = config.targetSize / 2;
        const middleRadius = outerRadius * 0.6;
        const innerRadius = config.headSize;

        // Outer ring (white/light gray)
        const outerRing = this.add.circle(0, 0, outerRadius, 0xe0e0e0);
        outerRing.setStrokeStyle(3, 0x333333);
        container.add(outerRing);

        // Middle ring (red)
        const middleRing = this.add.circle(0, 0, middleRadius, 0xff4444);
        middleRing.setStrokeStyle(2, 0xcc0000);
        container.add(middleRing);

        // Inner bullseye (gold - headshot zone)
        const innerBullseye = this.add.circle(0, 0, innerRadius, 0xffd700);
        innerBullseye.setStrokeStyle(2, 0xffaa00);
        container.add(innerBullseye);

        // Center dot
        const centerDot = this.add.circle(0, 0, 3, 0xffffff);
        container.add(centerDot);

        // Glow effect
        const glow = this.add.circle(0, 0, outerRadius + 8, 0xff4444, 0.2);
        container.add(glow);
        container.sendToBack(glow);

        // Body hitbox (outer + middle rings)
        const bodyHitbox = this.add.circle(0, 0, outerRadius, 0xff4444, 0);
        bodyHitbox.setStrokeStyle(1, 0xff4444, 0.2);
        container.add(bodyHitbox);

        // Head hitbox (inner bullseye)
        const headHitbox = this.add.circle(0, 0, innerRadius, 0xffd700, 0);
        headHitbox.setStrokeStyle(1, 0xffd700, 0.3);
        container.add(headHitbox);

        // Pulsing glow animation
        this.tweens.add({
            targets: glow,
            alpha: 0.4,
            scale: 1.15,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const targetData: ValorantTarget = {
            container,
            headHitbox,
            bodyHitbox,
            health: config.targetHealth,
            maxHealth: config.targetHealth,
            isActive: true,
            spawnTime: Date.now(),
            stance: 'standing'
        };

        // Initialize Gravity Controller if entitled
        if (this.hasAntiGravity) {
            this.physics.world.enable(container);
            const body = container.body as Phaser.Physics.Arcade.Body;
            if (body) {
                body.setAllowGravity(false);
                body.setImmovable(true);

                targetData.gravityController = new GravityController(container as any);
                targetData.gravityController.toggleAntiGravity(true);
            }
        }

        return targetData;
    }

    private addTargetMovement(target: ValorantTarget) {
        const config = this.difficultyConfig;
        const startX = target.container.x;
        const range = 80;

        target.movementTween = this.tweens.add({
            targets: target.container,
            x: startX + range,
            duration: 2000 / (config.movementSpeed / 50),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private hideTarget(target: ValorantTarget) {
        if (!target.isActive) return;

        this.tweens.add({
            targets: target.container,
            alpha: 0,
            duration: 150,
            onComplete: () => {
                // Respawn at new location
                if (target.isActive && this.isGameActive) {
                    target.container.destroy();
                    const index = this.targets.indexOf(target);
                    if (index > -1) this.targets.splice(index, 1);
                    this.spawnTarget();
                }
            }
        });
    }

    private updateTimer() {
        this.timeRemaining--;

        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerText.setText(`TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`);

        // Warning at 10 seconds
        if (this.timeRemaining <= 10) {
            this.timerText.setColor('#ff4444');
            this.tweens.add({
                targets: this.timerText,
                scale: 1.1,
                duration: 100,
                yoyo: true
            });
        }

        if (this.timeRemaining <= 0) {
            this.endGame();
        }
    }

    private toggleMouseLock() {
        this.isMouseLocked = !this.isMouseLocked;

        const { width, height } = this.cameras.main;

        if (this.isMouseLocked) {
            // Lock mouse
            this.input.mouse?.requestPointerLock();

            // Show indicator
            const lockText = this.add.text(width / 2, 120, '🔒 MOUSE LOCKED', {
                fontSize: '16px',
                color: '#00ff88',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(1001);
            lockText.setName('mouseLockIndicator');

            this.tweens.add({
                targets: lockText,
                alpha: 0,
                duration: 1500,
                delay: 500,
                onComplete: () => lockText.destroy()
            });
        } else {
            // Unlock mouse
            this.input.mouse?.releasePointerLock();

            // Show indicator
            const unlockText = this.add.text(width / 2, 120, '🔓 MOUSE UNLOCKED', {
                fontSize: '16px',
                color: '#ff6b6b',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(1001);

            this.tweens.add({
                targets: unlockText,
                alpha: 0,
                duration: 1500,
                delay: 500,
                onComplete: () => unlockText.destroy()
            });
        }
    }

    private pauseGame() {
        if (!this.isGameActive) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.gameTimer.paused = true;
            this.showPauseMenu();
        } else {
            this.gameTimer.paused = false;
            this.hidePauseMenu();
        }
    }

    private showPauseMenu() {
        const { width, height } = this.cameras.main;

        const pauseOverlay = this.add.container(0, 0);
        pauseOverlay.setName('pauseOverlay');
        pauseOverlay.setDepth(2000);

        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        pauseOverlay.add(bg);

        const pauseText = this.add.text(width / 2, height / 2 - 50, 'PAUSED', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        pauseOverlay.add(pauseText);

        const resumeText = this.add.text(width / 2, height / 2 + 20, 'Press ESC to Resume', {
            fontSize: '20px',
            color: '#00d4ff'
        }).setOrigin(0.5);
        pauseOverlay.add(resumeText);
    }

    private hidePauseMenu() {
        const pauseOverlay = this.children.getByName('pauseOverlay') as Phaser.GameObjects.Container;
        if (pauseOverlay) {
            pauseOverlay.destroy();
        }
    }

    private showExitMenu() {
        if (!this.isGameActive) return;

        const { width, height } = this.cameras.main;

        const exitOverlay = this.add.container(0, 0);
        exitOverlay.setDepth(2001);

        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        bg.setInteractive();
        exitOverlay.add(bg);

        const panel = this.add.rectangle(width / 2, height / 2, 500, 300, 0x0f1923);
        panel.setStrokeStyle(3, 0x00d4ff);
        exitOverlay.add(panel);

        const title = this.add.text(width / 2, height / 2 - 80, 'EXIT TO MENU?', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        exitOverlay.add(title);

        const subtitle = this.add.text(width / 2, height / 2 - 30, 'Your progress will be saved', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
        exitOverlay.add(subtitle);

        // Exit button
        const exitBtn = this.createMenuButton(-110, 40, 'EXIT', () => {
            this.isGameActive = false;
            this.input.mouse?.releasePointerLock();
            this.scene.start('MainMenu');
        });
        exitOverlay.add(exitBtn);

        // Resume button
        const resumeBtn = this.createMenuButton(110, 40, 'RESUME', () => {
            exitOverlay.destroy();
        });
        exitOverlay.add(resumeBtn);
    }

    private createMenuButton(offsetX: number, offsetY: number, text: string, callback: () => void): Phaser.GameObjects.Container {
        const { width, height } = this.cameras.main;
        const btn = this.add.container(width / 2 + offsetX, height / 2 + offsetY);

        const bg = this.add.rectangle(0, 0, 180, 50, 0x1a2634);
        bg.setStrokeStyle(2, 0x00d4ff);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x00d4ff);
            label.setColor('#000000');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x1a2634);
            label.setColor('#ffffff');
        });

        bg.on('pointerdown', callback);

        return btn;
    }

    private endGame() {
        this.isGameActive = false;

        // Stop all target movements
        this.targets.forEach(target => {
            if (target.movementTween) target.movementTween.stop();
        });

        // Calculate rewards
        const accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired * 100) : 0;
        const hsPercent = this.kills > 0 ? (this.headshots / this.kills * 100) : 0;

        // Save stats
        this.saveStats(accuracy, hsPercent);

        // Show results after delay
        this.time.delayedCall(1000, () => {
            this.showResults(accuracy, hsPercent);
        });
    }

    private saveStats(accuracy: number, hsPercent: number) {
        const stats = {
            score: this.score,
            accuracy: accuracy,
            headshotPercent: hsPercent,
            kills: this.kills,
            headshots: this.headshots,
            maxCombo: this.maxCombo,
            difficulty: this.difficulty,
            mode: 'valorant',
            timestamp: Date.now()
        };

        // Save to local storage
        const history = JSON.parse(localStorage.getItem('aimchain_valorant_history') || '[]');
        history.push(stats);
        localStorage.setItem('aimchain_valorant_history', JSON.stringify(history.slice(-50)));

        // Update best scores
        const best = JSON.parse(localStorage.getItem('aimchain_valorant_best') || '{}');
        if (!best.score || this.score > best.score) best.score = this.score;
        if (!best.accuracy || accuracy > best.accuracy) best.accuracy = accuracy;
        if (!best.hsPercent || hsPercent > best.hsPercent) best.hsPercent = hsPercent;
        localStorage.setItem('aimchain_valorant_best', JSON.stringify(best));
    }

    private showResults(accuracy: number, hsPercent: number) {
        const { width, height } = this.cameras.main;

        // Darken background
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);
        overlay.setDepth(3000);

        const resultsContainer = this.add.container(width / 2, height / 2);
        resultsContainer.setDepth(3001);

        // Panel background
        const panel = this.add.rectangle(0, 0, 600, 500, 0x0f1923);
        panel.setStrokeStyle(3, 0x00d4ff);
        resultsContainer.add(panel);

        // Title
        const title = this.add.text(0, -200, 'COMBAT REPORT', {
            fontSize: '36px',
            color: '#00d4ff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        resultsContainer.add(title);

        // Score (large)
        const scoreLabel = this.add.text(0, -130, 'FINAL SCORE', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
        const scoreValue = this.add.text(0, -95, this.score.toString(), {
            fontSize: '56px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        resultsContainer.add([scoreLabel, scoreValue]);

        // Stats grid
        const stats = [
            { label: 'Accuracy', value: `${accuracy.toFixed(1)}%`, color: accuracy >= 70 ? '#4ade80' : '#ff6b6b' },
            { label: 'Headshot Rate', value: `${hsPercent.toFixed(0)}%`, color: hsPercent >= 50 ? '#ffd700' : '#ffffff' },
            { label: 'Eliminations', value: this.kills.toString(), color: '#ffffff' },
            { label: 'Headshots', value: this.headshots.toString(), color: '#ff4444' },
            { label: 'Best Streak', value: `x${this.maxCombo}`, color: '#ff4757' },
            { label: 'Shots Fired', value: this.shotsFired.toString(), color: '#888888' }
        ];

        stats.forEach((stat, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = -130 + col * 260;
            const y = -20 + row * 60;

            const label = this.add.text(x, y, stat.label, {
                fontSize: '14px',
                color: '#888888'
            });
            const value = this.add.text(x, y + 20, stat.value, {
                fontSize: '24px',
                color: stat.color,
                fontStyle: 'bold'
            });
            resultsContainer.add([label, value]);
        });

        // Token rewards
        const baseTokens = 10;
        const accuracyBonus = Math.floor(Math.max(0, accuracy - 50) / 10);
        const hsBonus = Math.floor(Math.max(0, hsPercent - 30) / 10);
        const scoreBonus = this.score >= 1000 ? 10 : (this.score >= 500 ? 5 : 0);
        const totalTokens = baseTokens + accuracyBonus + hsBonus + scoreBonus;

        const rewardBg = this.add.rectangle(0, 155, 400, 50, 0x00d4ff, 0.2);
        const rewardText = this.add.text(0, 155, `🎯 REWARDS EARNED: +${totalTokens} AimTokens`, {
            fontSize: '20px',
            color: '#00d4ff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        resultsContainer.add([rewardBg, rewardText]);

        // Buttons
        const playAgainBtn = this.createResultButton(-120, 210, 'PLAY AGAIN', () => {
            this.scene.restart({ gameMode: this.gameMode, difficulty: this.difficulty });
        });
        resultsContainer.add(playAgainBtn);

        const menuBtn = this.createResultButton(120, 210, 'MAIN MENU', () => {
            this.scene.start('MainMenu');
        });
        resultsContainer.add(menuBtn);

        // Animate in
        resultsContainer.setScale(0.8);
        resultsContainer.setAlpha(0);
        this.tweens.add({
            targets: resultsContainer,
            scale: 1,
            alpha: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    private createResultButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
        const btn = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 200, 45, 0x1a2634);
        bg.setStrokeStyle(2, 0x00d4ff);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x00d4ff);
            label.setColor('#000000');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x1a2634);
            label.setColor('#ffffff');
        });

        bg.on('pointerdown', callback);

        return btn;
    }


    update(time: number, delta: number) {
        // Update gravity
        this.targets.forEach(target => {
            if (target.isActive && target.gravityController) {
                target.gravityController.update(delta);
            }
        });

        // Recoil recovery in update loop
        if (this.recoilOffset.y < 0) {
            this.recoilOffset.y = Math.min(0, this.recoilOffset.y + 0.5);
        }
        if (Math.abs(this.recoilOffset.x) > 0.1) {
            this.recoilOffset.x *= 0.95;
        }

        // Update crosshair position with mouse movement + recoil
        const { width, height } = this.cameras.main;
        if (this.crosshair) {
            this.crosshair.x = width / 2 + this.cameraRotation.x + this.recoilOffset.x;
            this.crosshair.y = height / 2 + this.cameraRotation.y + this.recoilOffset.y;
        }

        // Update ADS overlay position if active
        if (this.adsOverlay && this.isADS) {
            const adsDot = this.adsOverlay.list.find(obj => obj.type === 'Arc') as Phaser.GameObjects.Arc;
            if (adsDot) {
                adsDot.x = width / 2 + this.cameraRotation.x;
                adsDot.y = height / 2 + this.cameraRotation.y;
            }
        }
    }
}
