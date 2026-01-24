import Phaser, { Scene } from 'phaser';
import { GameMode } from './GameModeSelectionScene';

interface TargetData {
    graphics: Phaser.GameObjects.Container;
    hitZones: {
        outer: Phaser.Geom.Circle;
        middle: Phaser.Geom.Circle;
        center: Phaser.Geom.Circle;
    };
    spawnTime: number;
    isMoving: boolean;
}

interface SessionStats {
    score: number;
    hits: number;
    shots: number;
    perfectHits: number;
    middleHits: number;
    outerHits: number;
    misses: number;
    combo: number;
    maxCombo: number;
    reactionTimes: number[];
    tokensEarned: number;
}

export class CSGOTrainingScene extends Scene {
    private gameMode: GameMode | null = null;

    // Game state
    private targets: TargetData[] = [];
    private stats: SessionStats = {
        score: 0, hits: 0, shots: 0, perfectHits: 0,
        middleHits: 0, outerHits: 0, misses: 0,
        combo: 0, maxCombo: 0, reactionTimes: [], tokensEarned: 0
    };
    private timeRemaining: number = 60;
    private gameActive: boolean = false;
    private difficulty: 'easy' | 'medium' | 'hard' | 'competitive' = 'medium';

    // Weapon
    private weaponContainer: Phaser.GameObjects.Container | null = null;
    private weaponBody: Phaser.GameObjects.Graphics | null = null;
    private muzzleFlash: Phaser.GameObjects.Graphics | null = null;
    private shellCasings: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private weaponSway: { x: number; y: number } = { x: 0, y: 0 };
    private recoilOffset: number = 0;

    // Crosshair
    private crosshair: Phaser.GameObjects.Container | null = null;
    private crosshairExpanded: boolean = false;

    // HUD Elements
    private scoreText: Phaser.GameObjects.Text | null = null;
    private accuracyText: Phaser.GameObjects.Text | null = null;
    private timerText: Phaser.GameObjects.Text | null = null;
    private comboText: Phaser.GameObjects.Text | null = null;
    private comboMultiplierText: Phaser.GameObjects.Text | null = null;

    // Effects
    private hitMarker: Phaser.GameObjects.Graphics | null = null;
    private scorePopups: Phaser.GameObjects.Container[] = [];

    // Audio context for sounds
    private lastShotTime: number = 0;
    private fireRate: number = 100; // ms between shots

    constructor() {
        super({ key: 'CSGOTrainingScene' });
    }

    init(data: { gameMode?: GameMode; difficulty?: string }) {
        this.gameMode = data.gameMode || null;
        this.difficulty = (data.difficulty as any) || 'medium';
        this.resetStats();
        this.timeRemaining = 60;
        this.targets = [];
    }

    private resetStats() {
        this.stats = {
            score: 0, hits: 0, shots: 0, perfectHits: 0,
            middleHits: 0, outerHits: 0, misses: 0,
            combo: 0, maxCombo: 0, reactionTimes: [], tokensEarned: 0
        };
    }

    create() {
        const { width, height } = this.cameras.main;

        // Lock pointer for FPS feel
        this.input.setDefaultCursor('none');

        // Create environment
        this.createShootingRange();

        // Create weapon
        this.createAK47();

        // Create crosshair
        this.createCrosshair();

        // Create HUD
        this.createHUD();

        // Create hit marker
        this.createHitMarker();

        // Start game
        this.startGame();

        // Input handling
        this.input.on('pointerdown', this.shoot, this);
        this.input.on('pointermove', this.handleMouseMove, this);

        // ESC to pause/quit
        this.input.keyboard?.on('keydown-ESC', () => this.endGame());

        // Weapon sway animation
        this.time.addEvent({
            delay: 16,
            callback: this.updateWeaponSway,
            callbackScope: this,
            loop: true
        });
    }

    private createShootingRange() {
        const { width, height } = this.cameras.main;

        // Sky/ceiling gradient
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f1e, 0x0f0f1e, 1);
        sky.fillRect(0, 0, width, height * 0.4);

        // Back wall
        const backWall = this.add.graphics();
        backWall.fillStyle(0x2a2a3e, 1);
        backWall.fillRect(0, height * 0.15, width, height * 0.5);

        // Wall texture lines
        backWall.lineStyle(1, 0x3a3a4e, 0.5);
        for (let y = height * 0.15; y < height * 0.65; y += 30) {
            backWall.lineBetween(0, y, width, y);
        }

        // Distance markers
        this.createDistanceMarkers();

        // Floor with grid
        this.createFloor();

        // Side walls (perspective)
        this.createSideWalls();

        // Ceiling lights
        this.createLights();
    }

    private createDistanceMarkers() {
        const { width, height } = this.cameras.main;
        const distances = [10, 15, 20, 25];

        distances.forEach((dist, i) => {
            const x = 100 + (i * 280);
            const markerY = height * 0.6;

            // Marker post
            const marker = this.add.graphics();
            marker.fillStyle(0x00ff88, 0.8);
            marker.fillRect(x - 2, markerY - 20, 4, 20);

            // Distance text
            this.add.text(x, markerY + 5, `${dist}m`, {
                fontSize: '12px',
                color: '#00ff88'
            }).setOrigin(0.5, 0);
        });
    }

    private createFloor() {
        const { width, height } = this.cameras.main;

        const floor = this.add.graphics();

        // Main floor color
        floor.fillStyle(0x1a1a2e, 1);
        floor.fillRect(0, height * 0.65, width, height * 0.35);

        // Grid pattern
        floor.lineStyle(1, 0x00ff88, 0.1);

        // Perspective grid lines (vertical)
        const vanishY = height * 0.4;
        for (let x = 0; x <= width; x += 60) {
            floor.lineBetween(x, height * 0.65, x, height);
        }

        // Horizontal lines
        for (let y = height * 0.65; y <= height; y += 40) {
            floor.lineBetween(0, y, width, y);
        }
    }

    private createSideWalls() {
        const { width, height } = this.cameras.main;

        // Left wall
        const leftWall = this.add.graphics();
        leftWall.fillStyle(0x1f1f2e, 1);
        leftWall.beginPath();
        leftWall.moveTo(0, 0);
        leftWall.lineTo(80, height * 0.15);
        leftWall.lineTo(80, height * 0.65);
        leftWall.lineTo(0, height);
        leftWall.closePath();
        leftWall.fill();

        // Right wall
        const rightWall = this.add.graphics();
        rightWall.fillStyle(0x1f1f2e, 1);
        rightWall.beginPath();
        rightWall.moveTo(width, 0);
        rightWall.lineTo(width - 80, height * 0.15);
        rightWall.lineTo(width - 80, height * 0.65);
        rightWall.lineTo(width, height);
        rightWall.closePath();
        rightWall.fill();
    }

    private createLights() {
        const { width, height } = this.cameras.main;

        // Ceiling light strips
        for (let x = 200; x < width - 200; x += 300) {
            const light = this.add.graphics();
            light.fillStyle(0xffffff, 0.3);
            light.fillRect(x - 50, 20, 100, 10);

            // Light glow
            light.fillStyle(0xffffff, 0.1);
            light.fillRect(x - 60, 30, 120, 30);
        }
    }

    private createAK47() {
        const { width, height } = this.cameras.main;

        this.weaponContainer = this.add.container(width - 200, height - 150);

        // Create detailed AK-47 model
        const weapon = this.add.graphics();

        // Main receiver body
        weapon.fillStyle(0x2a2a2a, 1);
        weapon.fillRect(-180, -30, 320, 45);

        // Top receiver cover
        weapon.fillStyle(0x333333, 1);
        weapon.fillRect(-170, -40, 280, 15);

        // Barrel
        weapon.fillStyle(0x1a1a1a, 1);
        weapon.fillRect(140, -25, 80, 20);

        // Barrel tip
        weapon.fillStyle(0x0a0a0a, 1);
        weapon.fillRect(220, -22, 15, 14);

        // Front sight
        weapon.fillStyle(0x333333, 1);
        weapon.fillRect(200, -45, 8, 20);

        // Gas tube
        weapon.fillStyle(0x8B4513, 1); // Wood color
        weapon.fillRect(80, -50, 100, 12);

        // Wooden handguard
        weapon.fillStyle(0x8B4513, 1);
        weapon.fillRect(60, -20, 80, 35);

        // Handguard details
        weapon.lineStyle(2, 0x654321, 1);
        weapon.lineBetween(70, -15, 130, -15);
        weapon.lineBetween(70, 0, 130, 0);

        // Magazine (curved)
        weapon.fillStyle(0x1a1a1a, 1);
        weapon.beginPath();
        weapon.moveTo(-50, 15);
        weapon.lineTo(-30, 15);
        weapon.lineTo(-20, 80);
        weapon.lineTo(-60, 80);
        weapon.closePath();
        weapon.fill();

        // Trigger guard
        weapon.lineStyle(3, 0x2a2a2a, 1);
        weapon.strokeCircle(-80, 30, 15);

        // Trigger
        weapon.fillStyle(0x1a1a1a, 1);
        weapon.fillRect(-85, 15, 8, 20);

        // Pistol grip
        weapon.fillStyle(0x8B4513, 1);
        weapon.beginPath();
        weapon.moveTo(-100, 15);
        weapon.lineTo(-70, 15);
        weapon.lineTo(-60, 70);
        weapon.lineTo(-110, 70);
        weapon.closePath();
        weapon.fill();

        // Wooden stock
        weapon.fillStyle(0x8B4513, 1);
        weapon.beginPath();
        weapon.moveTo(-180, -25);
        weapon.lineTo(-180, 20);
        weapon.lineTo(-250, 35);
        weapon.lineTo(-260, 10);
        weapon.lineTo(-250, -15);
        weapon.closePath();
        weapon.fill();

        // Stock butt plate
        weapon.fillStyle(0x1a1a1a, 1);
        weapon.fillRect(-265, -10, 8, 40);

        // Rear sight
        weapon.fillStyle(0x333333, 1);
        weapon.fillRect(-140, -50, 20, 15);

        // Selector switch
        weapon.fillStyle(0x444444, 1);
        weapon.fillCircle(-120, -5, 5);

        // Ejection port
        weapon.fillStyle(0x0a0a0a, 1);
        weapon.fillRect(-100, -35, 40, 12);

        // Bolt carrier (visible through port)
        weapon.fillStyle(0x666666, 1);
        weapon.fillRect(-95, -32, 30, 6);

        // Wood grain lines on stock
        weapon.lineStyle(1, 0x654321, 0.5);
        weapon.lineBetween(-240, -10, -190, -20);
        weapon.lineBetween(-245, 5, -185, 0);
        weapon.lineBetween(-250, 25, -180, 15);

        this.weaponBody = weapon;
        this.weaponContainer.add(weapon);

        // Create muzzle flash (hidden initially)
        this.muzzleFlash = this.add.graphics();
        this.muzzleFlash.setVisible(false);
        this.weaponContainer.add(this.muzzleFlash);

        // Weapon shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.3);
        shadow.fillEllipse(0, 60, 300, 30);
        this.weaponContainer.add(shadow);
    }

    private createCrosshair() {
        const { width, height } = this.cameras.main;

        this.crosshair = this.add.container(width / 2, height / 2);

        const ch = this.add.graphics();
        this.drawCrosshair(ch, 1);
        this.crosshair.add(ch);
    }

    private drawCrosshair(graphics: Phaser.GameObjects.Graphics, scale: number) {
        graphics.clear();

        const size = 12 * scale;
        const gap = 4 * scale;
        const thickness = 2;

        // Black outline
        graphics.lineStyle(thickness + 2, 0x000000, 1);
        graphics.lineBetween(0, -gap - size, 0, -gap);
        graphics.lineBetween(0, gap, 0, gap + size);
        graphics.lineBetween(-gap - size, 0, -gap, 0);
        graphics.lineBetween(gap, 0, gap + size, 0);

        // Green crosshair
        graphics.lineStyle(thickness, 0x00ff00, 1);
        graphics.lineBetween(0, -gap - size, 0, -gap);
        graphics.lineBetween(0, gap, 0, gap + size);
        graphics.lineBetween(-gap - size, 0, -gap, 0);
        graphics.lineBetween(gap, 0, gap + size, 0);

        // Center dot
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(0, 0, 2);
    }

    private createHitMarker() {
        const { width, height } = this.cameras.main;

        this.hitMarker = this.add.graphics();
        this.hitMarker.setPosition(width / 2, height / 2);
        this.hitMarker.setVisible(false);
        this.hitMarker.setDepth(100);
    }

    private showHitMarker(isPerfect: boolean) {
        if (!this.hitMarker) return;

        this.hitMarker.clear();

        const color = isPerfect ? 0xff0000 : 0xffffff;
        const size = isPerfect ? 15 : 10;

        this.hitMarker.lineStyle(3, color, 1);
        this.hitMarker.lineBetween(-size, -size, -5, -5);
        this.hitMarker.lineBetween(size, -size, 5, -5);
        this.hitMarker.lineBetween(-size, size, -5, 5);
        this.hitMarker.lineBetween(size, size, 5, 5);

        this.hitMarker.setVisible(true);
        this.hitMarker.setAlpha(1);

        this.tweens.add({
            targets: this.hitMarker,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.hitMarker?.setVisible(false);
            }
        });
    }

    private createHUD() {
        const { width, height } = this.cameras.main;

        // Score (top center)
        const scoreBg = this.add.graphics();
        scoreBg.fillStyle(0x000000, 0.5);
        scoreBg.fillRoundedRect(width / 2 - 100, 10, 200, 50, 5);

        this.scoreText = this.add.text(width / 2, 35, 'SCORE: 0', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Accuracy (top left)
        const accBg = this.add.graphics();
        accBg.fillStyle(0x000000, 0.5);
        accBg.fillRoundedRect(10, 10, 180, 70, 5);

        this.accuracyText = this.add.text(20, 20, 'ACCURACY\n100%', {
            fontSize: '18px',
            color: '#00ff00',
            fontStyle: 'bold',
            align: 'left'
        });

        // Timer (top right)
        const timerBg = this.add.graphics();
        timerBg.fillStyle(0x000000, 0.5);
        timerBg.fillRoundedRect(width - 130, 10, 120, 50, 5);

        this.timerText = this.add.text(width - 70, 35, '60', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Combo display (right side)
        this.comboText = this.add.text(width - 20, height / 2 - 50, '', {
            fontSize: '24px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);

        this.comboMultiplierText = this.add.text(width - 20, height / 2, '', {
            fontSize: '36px',
            color: '#ff6600',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);

        // Game mode label
        this.add.text(20, height - 30, `CS:GO STYLE | ${this.difficulty.toUpperCase()}`, {
            fontSize: '14px',
            color: '#00ff88',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });

        // Instructions
        this.add.text(width / 2, height - 30, 'CLICK TO SHOOT | ESC TO EXIT', {
            fontSize: '12px',
            color: '#666666'
        }).setOrigin(0.5);
    }

    private startGame() {
        this.gameActive = true;

        // Spawn first target
        this.spawnTarget();

        // Start timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    private getDifficultySettings() {
        switch (this.difficulty) {
            case 'easy':
                return { targetSize: 60, spawnDelay: 1000, moving: false, distance: { min: 0.3, max: 0.5 } };
            case 'medium':
                return { targetSize: 45, spawnDelay: 500, moving: false, distance: { min: 0.25, max: 0.6 } };
            case 'hard':
                return { targetSize: 30, spawnDelay: 200, moving: true, distance: { min: 0.2, max: 0.7 } };
            case 'competitive':
                return { targetSize: 20, spawnDelay: 100, moving: true, distance: { min: 0.15, max: 0.75 } };
            default:
                return { targetSize: 45, spawnDelay: 500, moving: false, distance: { min: 0.25, max: 0.6 } };
        }
    }

    private spawnTarget() {
        if (!this.gameActive) return;

        const { width, height } = this.cameras.main;
        const settings = this.getDifficultySettings();

        // Random position within shooting range area
        const minX = 120;
        const maxX = width - 120;
        const minY = height * 0.2;
        const maxY = height * 0.55;

        const x = Phaser.Math.Between(minX, maxX);
        const y = Phaser.Math.Between(minY, maxY);

        // Create bullseye target
        const targetContainer = this.add.container(x, y);
        const size = settings.targetSize;

        const target = this.add.graphics();

        // Outer ring (white) - 5 points
        target.fillStyle(0xffffff, 1);
        target.fillCircle(0, 0, size);

        // Middle ring (red) - 8 points
        target.fillStyle(0xff0000, 1);
        target.fillCircle(0, 0, size * 0.6);

        // Center bullseye (yellow) - 10 points
        target.fillStyle(0xffff00, 1);
        target.fillCircle(0, 0, size * 0.3);

        // Ring outlines for clarity
        target.lineStyle(2, 0x000000, 0.5);
        target.strokeCircle(0, 0, size);
        target.strokeCircle(0, 0, size * 0.6);
        target.strokeCircle(0, 0, size * 0.3);

        // Glow effect
        const glow = this.add.graphics();
        glow.fillStyle(0xffff00, 0.2);
        glow.fillCircle(0, 0, size * 1.2);

        targetContainer.add(glow);
        targetContainer.add(target);

        // Spawn animation
        targetContainer.setScale(0);
        this.tweens.add({
            targets: targetContainer,
            scale: 1,
            duration: 150,
            ease: 'Back.easeOut'
        });

        // Hit zones
        const hitZones = {
            center: new Phaser.Geom.Circle(x, y, size * 0.3),
            middle: new Phaser.Geom.Circle(x, y, size * 0.6),
            outer: new Phaser.Geom.Circle(x, y, size)
        };

        const targetData: TargetData = {
            graphics: targetContainer,
            hitZones: hitZones,
            spawnTime: Date.now(),
            isMoving: settings.moving
        };

        // Moving targets
        if (settings.moving) {
            const moveDistance = Phaser.Math.Between(50, 150);
            this.tweens.add({
                targets: targetContainer,
                x: x + moveDistance,
                duration: Phaser.Math.Between(800, 1500),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    // Update hit zone positions
                    hitZones.center.x = targetContainer.x;
                    hitZones.center.y = targetContainer.y;
                    hitZones.middle.x = targetContainer.x;
                    hitZones.middle.y = targetContainer.y;
                    hitZones.outer.x = targetContainer.x;
                    hitZones.outer.y = targetContainer.y;
                }
            });
        }

        this.targets.push(targetData);
    }

    private shoot(pointer: Phaser.Input.Pointer) {
        if (!this.gameActive) return;

        // Fire rate limiting
        const now = Date.now();
        if (now - this.lastShotTime < this.fireRate) return;
        this.lastShotTime = now;

        this.stats.shots++;

        // Show muzzle flash
        this.showMuzzleFlash();

        // Weapon recoil
        this.applyRecoil();

        // Expand crosshair briefly
        this.expandCrosshair();

        // Screen shake
        this.cameras.main.shake(30, 0.003);

        // Check hits
        let hit = false;
        let hitPoints = 0;
        let hitType = '';
        let reactionTime = 0;

        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];

            // Check center first (highest points)
            if (target.hitZones.center.contains(pointer.x, pointer.y)) {
                hitPoints = 10;
                hitType = 'PERFECT!';
                hit = true;
                this.stats.perfectHits++;
                reactionTime = now - target.spawnTime;
            } else if (target.hitZones.middle.contains(pointer.x, pointer.y)) {
                hitPoints = 8;
                hitType = 'GOOD';
                hit = true;
                this.stats.middleHits++;
                reactionTime = now - target.spawnTime;
            } else if (target.hitZones.outer.contains(pointer.x, pointer.y)) {
                hitPoints = 5;
                hitType = 'HIT';
                hit = true;
                this.stats.outerHits++;
                reactionTime = now - target.spawnTime;
            }

            if (hit) {
                this.destroyTarget(target, hitPoints, hitType, pointer.x, pointer.y);
                this.targets.splice(i, 1);
                this.stats.hits++;
                this.stats.reactionTimes.push(reactionTime);

                // Update combo
                this.stats.combo++;
                if (this.stats.combo > this.stats.maxCombo) {
                    this.stats.maxCombo = this.stats.combo;
                }

                // Apply combo multiplier
                const multiplier = this.getComboMultiplier();
                this.stats.score += hitPoints * multiplier;

                // Show hit marker
                this.showHitMarker(hitPoints === 10);

                // Spawn new target
                const settings = this.getDifficultySettings();
                this.time.delayedCall(settings.spawnDelay, () => {
                    this.spawnTarget();
                });

                break;
            }
        }

        if (!hit) {
            this.stats.misses++;
            this.stats.combo = 0;
            this.showMiss(pointer.x, pointer.y);
        }

        this.updateHUD();
    }

    private getComboMultiplier(): number {
        if (this.stats.combo >= 20) return 4;
        if (this.stats.combo >= 10) return 3;
        if (this.stats.combo >= 5) return 2;
        return 1;
    }

    private showMuzzleFlash() {
        if (!this.muzzleFlash || !this.weaponContainer) return;

        this.muzzleFlash.clear();

        // Bright flash
        this.muzzleFlash.fillStyle(0xffff00, 1);
        this.muzzleFlash.fillCircle(235, -15, 20);

        // Orange core
        this.muzzleFlash.fillStyle(0xff6600, 0.8);
        this.muzzleFlash.fillCircle(235, -15, 12);

        // White hot center
        this.muzzleFlash.fillStyle(0xffffff, 0.9);
        this.muzzleFlash.fillCircle(235, -15, 6);

        this.muzzleFlash.setVisible(true);

        this.time.delayedCall(50, () => {
            this.muzzleFlash?.setVisible(false);
        });

        // Shell ejection particle
        this.createShellCasing();
    }

    private createShellCasing() {
        if (!this.weaponContainer) return;

        const { width, height } = this.cameras.main;

        const shell = this.add.graphics();
        shell.fillStyle(0xc4a000, 1);
        shell.fillRect(0, 0, 8, 4);
        shell.setPosition(width - 280, height - 180);

        // Animate shell ejection
        this.tweens.add({
            targets: shell,
            x: shell.x + Phaser.Math.Between(30, 60),
            y: shell.y + 100,
            rotation: Phaser.Math.Between(2, 5),
            alpha: 0,
            duration: 500,
            onComplete: () => shell.destroy()
        });
    }

    private applyRecoil() {
        if (!this.weaponContainer) return;

        // Quick recoil up and back
        this.tweens.add({
            targets: this.weaponContainer,
            y: this.weaponContainer.y - 15,
            duration: 50,
            yoyo: true,
            ease: 'Power2'
        });
    }

    private expandCrosshair() {
        if (!this.crosshair) return;

        const ch = this.crosshair.list[0] as Phaser.GameObjects.Graphics;
        this.drawCrosshair(ch, 1.5);

        this.time.delayedCall(100, () => {
            this.drawCrosshair(ch, 1);
        });
    }

    private destroyTarget(target: TargetData, points: number, type: string, hitX: number, hitY: number) {
        // Particle explosion
        this.createHitParticles(target.graphics.x, target.graphics.y, points);

        // Score popup
        this.createScorePopup(hitX, hitY, points, type);

        // Screen flash for perfect hits
        if (points === 10) {
            this.cameras.main.flash(50, 255, 255, 255, true);
        }

        // Destroy animation
        this.tweens.add({
            targets: target.graphics,
            scale: 0,
            alpha: 0,
            duration: 150,
            onComplete: () => {
                target.graphics.destroy();
            }
        });
    }

    private createHitParticles(x: number, y: number, points: number) {
        const color = points === 10 ? 0xffff00 : points === 8 ? 0xff6600 : 0xffffff;

        for (let i = 0; i < 12; i++) {
            const particle = this.add.graphics();
            particle.fillStyle(color, 1);
            particle.fillCircle(0, 0, Phaser.Math.Between(2, 5));
            particle.setPosition(x, y);

            const angle = (i / 12) * Math.PI * 2;
            const distance = Phaser.Math.Between(30, 80);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }
    }

    private createScorePopup(x: number, y: number, points: number, type: string) {
        const multiplier = this.getComboMultiplier();
        const totalPoints = points * multiplier;

        const color = points === 10 ? '#ffff00' : points === 8 ? '#ff6600' : '#ffffff';

        const popup = this.add.container(x, y);

        const pointsText = this.add.text(0, 0, `+${totalPoints}`, {
            fontSize: '28px',
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const typeText = this.add.text(0, 25, type, {
            fontSize: '16px',
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        popup.add(pointsText);
        popup.add(typeText);

        // Animate upward and fade
        this.tweens.add({
            targets: popup,
            y: y - 60,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => popup.destroy()
        });
    }

    private showMiss(x: number, y: number) {
        // Bullet hole on wall
        const bulletHole = this.add.graphics();
        bulletHole.fillStyle(0x000000, 0.7);
        bulletHole.fillCircle(0, 0, 3);
        bulletHole.setPosition(x, y);

        // Dust particles
        for (let i = 0; i < 5; i++) {
            const dust = this.add.graphics();
            dust.fillStyle(0x888888, 0.5);
            dust.fillCircle(0, 0, 2);
            dust.setPosition(x, y);

            this.tweens.add({
                targets: dust,
                x: x + Phaser.Math.Between(-20, 20),
                y: y + Phaser.Math.Between(-20, 10),
                alpha: 0,
                duration: 300,
                onComplete: () => dust.destroy()
            });
        }

        // Red crosshair flash
        if (this.crosshair) {
            const ch = this.crosshair.list[0] as Phaser.GameObjects.Graphics;
            ch.clear();
            this.drawCrosshairRed(ch);

            this.time.delayedCall(150, () => {
                this.drawCrosshair(ch, 1);
            });
        }

        // Fade bullet hole
        this.tweens.add({
            targets: bulletHole,
            alpha: 0,
            delay: 500,
            duration: 500,
            onComplete: () => bulletHole.destroy()
        });
    }

    private drawCrosshairRed(graphics: Phaser.GameObjects.Graphics) {
        const size = 15;
        const gap = 5;
        const thickness = 2;

        graphics.lineStyle(thickness + 2, 0x000000, 1);
        graphics.lineBetween(0, -gap - size, 0, -gap);
        graphics.lineBetween(0, gap, 0, gap + size);
        graphics.lineBetween(-gap - size, 0, -gap, 0);
        graphics.lineBetween(gap, 0, gap + size, 0);

        graphics.lineStyle(thickness, 0xff0000, 1);
        graphics.lineBetween(0, -gap - size, 0, -gap);
        graphics.lineBetween(0, gap, 0, gap + size);
        graphics.lineBetween(-gap - size, 0, -gap, 0);
        graphics.lineBetween(gap, 0, gap + size, 0);
    }

    private handleMouseMove(pointer: Phaser.Input.Pointer) {
        // Update crosshair position to follow mouse
        if (this.crosshair) {
            this.crosshair.setPosition(pointer.x, pointer.y);
        }

        // Update hit marker position
        if (this.hitMarker) {
            this.hitMarker.setPosition(pointer.x, pointer.y);
        }
    }

    private updateWeaponSway() {
        if (!this.weaponContainer || !this.gameActive) return;

        const time = this.time.now / 1000;

        // Subtle breathing sway
        const swayX = Math.sin(time * 1.5) * 3;
        const swayY = Math.cos(time * 2) * 2;

        const { width, height } = this.cameras.main;
        this.weaponContainer.setPosition(
            width - 200 + swayX,
            height - 150 + swayY
        );
    }

    private updateTimer() {
        if (!this.gameActive) return;

        this.timeRemaining--;

        if (this.timerText) {
            this.timerText.setText(String(this.timeRemaining));

            if (this.timeRemaining <= 10) {
                this.timerText.setColor('#ff0000');
            }
        }

        if (this.timeRemaining <= 0) {
            this.endGame();
        }
    }

    private updateHUD() {
        if (this.scoreText) {
            this.scoreText.setText(`SCORE: ${this.stats.score}`);
        }

        if (this.accuracyText) {
            const accuracy = this.stats.shots > 0
                ? ((this.stats.hits / this.stats.shots) * 100).toFixed(1)
                : '100';

            let color = '#00ff00';
            if (parseFloat(accuracy) < 60) color = '#ff0000';
            else if (parseFloat(accuracy) < 80) color = '#ffff00';

            this.accuracyText.setText(`ACCURACY\n${accuracy}%`);
            this.accuracyText.setColor(color);
        }

        // Update combo display
        if (this.comboText && this.comboMultiplierText) {
            if (this.stats.combo >= 5) {
                this.comboText.setText(`COMBO: ${this.stats.combo}`);
                this.comboMultiplierText.setText(`x${this.getComboMultiplier()}`);

                // Animate on high combo
                if (this.stats.combo % 5 === 0) {
                    this.tweens.add({
                        targets: this.comboMultiplierText,
                        scale: 1.3,
                        duration: 100,
                        yoyo: true
                    });
                }
            } else {
                this.comboText.setText('');
                this.comboMultiplierText.setText('');
            }
        }
    }

    private endGame() {
        this.gameActive = false;
        this.input.setDefaultCursor('default');

        // Calculate tokens
        const accuracy = this.stats.shots > 0
            ? (this.stats.hits / this.stats.shots) * 100
            : 0;

        this.stats.tokensEarned = 10; // Base tokens
        if (accuracy > 95) this.stats.tokensEarned += 10;
        else if (accuracy > 90) this.stats.tokensEarned += 5;
        this.stats.tokensEarned += Math.floor(this.stats.score / 100);

        // Save stats
        this.saveStats();

        // Show results
        this.showResults();
    }

    private saveStats() {
        const savedData = localStorage.getItem('aimchain_player_data');
        let data = savedData ? JSON.parse(savedData) : {
            totalScore: 0, accuracy: 0, gamesPlayed: 0,
            tokensEarned: 0, nftCount: 0
        };

        const accuracy = this.stats.shots > 0
            ? (this.stats.hits / this.stats.shots) * 100
            : 0;

        data.totalScore += this.stats.score;
        data.accuracy = ((data.accuracy * data.gamesPlayed) + accuracy) / (data.gamesPlayed + 1);
        data.gamesPlayed += 1;
        data.tokensEarned += this.stats.tokensEarned;

        localStorage.setItem('hunterless_player_data', JSON.stringify(data));
    }

    private showResults() {
        const { width, height } = this.cameras.main;

        // Darken background
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

        // Results panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 1);
        panel.lineStyle(3, 0x00ff88, 1);
        panel.fillRoundedRect(width / 2 - 300, height / 2 - 280, 600, 560, 10);
        panel.strokeRoundedRect(width / 2 - 300, height / 2 - 280, 600, 560, 10);

        // Title
        this.add.text(width / 2, height / 2 - 240, 'SESSION COMPLETE', {
            fontSize: '42px',
            color: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Stats
        const statsStartY = height / 2 - 170;
        const lineHeight = 35;

        const accuracy = this.stats.shots > 0
            ? ((this.stats.hits / this.stats.shots) * 100).toFixed(1)
            : '0';

        const avgReaction = this.stats.reactionTimes.length > 0
            ? (this.stats.reactionTimes.reduce((a, b) => a + b, 0) / this.stats.reactionTimes.length).toFixed(0)
            : '0';

        const statsData = [
            { label: 'FINAL SCORE', value: this.stats.score, color: '#ffffff' },
            { label: 'ACCURACY', value: `${accuracy}%`, color: parseFloat(accuracy) > 80 ? '#00ff00' : '#ffff00' },
            { label: 'TARGETS HIT', value: `${this.stats.hits}/${this.stats.shots}`, color: '#ffffff' },
            { label: 'PERFECT HITS', value: this.stats.perfectHits, color: '#ffff00' },
            { label: 'BEST COMBO', value: `x${this.stats.maxCombo}`, color: '#ff6600' },
            { label: 'AVG REACTION', value: `${avgReaction}ms`, color: '#4ecdc4' },
        ];

        statsData.forEach((stat, i) => {
            const y = statsStartY + (i * lineHeight);

            this.add.text(width / 2 - 200, y, stat.label, {
                fontSize: '18px',
                color: '#888888'
            });

            this.add.text(width / 2 + 200, y, String(stat.value), {
                fontSize: '20px',
                color: stat.color,
                fontStyle: 'bold'
            }).setOrigin(1, 0);
        });

        // Divider
        const divider = this.add.graphics();
        divider.lineStyle(2, 0x00ff88, 0.5);
        divider.lineBetween(width / 2 - 250, statsStartY + (statsData.length * lineHeight) + 10,
            width / 2 + 250, statsStartY + (statsData.length * lineHeight) + 10);

        // Token reward
        const tokenY = statsStartY + (statsData.length * lineHeight) + 50;

        this.add.text(width / 2, tokenY, '🪙 TOKENS EARNED', {
            fontSize: '20px',
            color: '#888888'
        }).setOrigin(0.5);

        const tokenValue = this.add.text(width / 2, tokenY + 40, `+${this.stats.tokensEarned}`, {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Animate token value
        this.tweens.add({
            targets: tokenValue,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            repeat: 2
        });

        // Buttons
        const buttonY = height / 2 + 200;

        this.createResultButton(width / 2 - 130, buttonY, 'PLAY AGAIN', () => {
            this.scene.restart({ gameMode: this.gameMode, difficulty: this.difficulty });
        });

        this.createResultButton(width / 2 + 130, buttonY, 'MAIN MENU', () => {
            this.scene.start('MainMenu');
        });
    }

    private createResultButton(x: number, y: number, text: string, callback: () => void) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 220, 55, 0x00ff88);
        bg.setInteractive({ useHandCursor: true });
        button.add(bg);

        const label = this.add.text(0, 0, text, {
            fontSize: '20px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        button.add(label);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x00dd77);
            this.tweens.add({ targets: button, scale: 1.05, duration: 100 });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x00ff88);
            this.tweens.add({ targets: button, scale: 1, duration: 100 });
        });

        bg.on('pointerdown', callback);
    }

    update() {
        // Update target hit zones for moving targets
        this.targets.forEach(target => {
            if (target.isMoving) {
                target.hitZones.center.x = target.graphics.x;
                target.hitZones.center.y = target.graphics.y;
                target.hitZones.middle.x = target.graphics.x;
                target.hitZones.middle.y = target.graphics.y;
                target.hitZones.outer.x = target.graphics.x;
                target.hitZones.outer.y = target.graphics.y;
            }
        });
    }
}
