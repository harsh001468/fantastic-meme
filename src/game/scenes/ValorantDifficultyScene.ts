import Phaser, { Scene } from 'phaser';
import { GameMode } from './GameModeSelectionScene';

interface DifficultyOption {
    id: string;
    name: string;
    description: string;
    targetSize: string;
    headSize: string;
    movement: string;
    health: string;
    color: number;
}

export class ValorantDifficultyScene extends Scene {
    private gameMode: GameMode | null = null;

    private difficulties: DifficultyOption[] = [
        {
            id: 'easy',
            name: 'BEGINNER',
            description: 'Large targets, no movement, one-tap kills',
            targetSize: 'Large bots',
            headSize: '30px heads',
            movement: 'Static targets',
            health: '40 HP (1 shot)',
            color: 0x4ecdc4
        },
        {
            id: 'medium',
            name: 'PRACTICE',
            description: 'Medium targets, slow strafe, realistic HP',
            targetSize: 'Normal bots',
            headSize: '25px heads',
            movement: 'Slow strafing',
            health: '80 HP (2 body / 1 head)',
            color: 0xf7dc6f
        },
        {
            id: 'hard',
            name: 'COMPETITIVE',
            description: 'Small peek targets, fast movement',
            targetSize: 'Small bots',
            headSize: '20px heads',
            movement: 'Fast peek & hide',
            health: '120 HP (3 body / 1 head)',
            color: 0xff6b6b
        },
        {
            id: 'competitive',
            name: 'RADIANT',
            description: 'Realistic hitboxes, pro-level mechanics',
            targetSize: 'Tiny hitboxes',
            headSize: '18px heads',
            movement: 'Pro movement patterns',
            health: '160 HP (4 body / 1 head)',
            color: 0xff0000
        }
    ];

    constructor() {
        super({ key: 'ValorantDifficultyScene' });
    }

    init(data: { gameMode: GameMode }) {
        this.gameMode = data.gameMode;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Valorant-style dark background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x0f1923, 0x0f1923, 0x1a2634, 0x1a2634, 1);
        graphics.fillRect(0, 0, width, height);

        // Accent lines
        graphics.lineStyle(2, 0x00d4ff, 0.3);
        graphics.beginPath();
        graphics.moveTo(0, 100);
        graphics.lineTo(width, 100);
        graphics.strokePath();

        // Title with Valorant styling
        this.add.text(width / 2, 50, 'SELECT DIFFICULTY', {
            fontSize: '42px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, 85, 'VALORANT STYLE • AIM TRAINING', {
            fontSize: '14px',
            color: '#00d4ff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Create difficulty cards
        const startY = 140;
        const cardHeight = 100;
        const gap = 15;

        this.difficulties.forEach((diff, index) => {
            const y = startY + index * (cardHeight + gap);
            this.createDifficultyCard(width / 2 - 320, y, 640, cardHeight, diff);
        });

        // Controls info
        this.createControlsInfo(width / 2, height - 90);

        // Back button
        this.createButton(width / 2, height - 35, '← Back to Mode Selection', 300, () => {
            this.scene.start('GameModeSelectionScene');
        });
    }

    private createDifficultyCard(x: number, y: number, w: number, h: number, diff: DifficultyOption) {
        const card = this.add.container(x, y);

        // Background with Valorant panel style
        const bg = this.add.rectangle(0, 0, w, h, 0x1a2634).setOrigin(0);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(1, 0x2a3a4e);
        card.add(bg);

        // Left color accent bar
        const colorBar = this.add.rectangle(0, 0, 5, h, diff.color).setOrigin(0);
        card.add(colorBar);

        // Difficulty name
        const name = this.add.text(25, 15, diff.name, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        });
        card.add(name);

        // Description
        const desc = this.add.text(25, 45, diff.description, {
            fontSize: '14px',
            color: '#888888',
            fontFamily: 'Arial'
        });
        card.add(desc);

        // Stats row
        const statsY = 70;
        const stats = [
            { icon: '🎯', text: diff.targetSize },
            { icon: '⚪', text: diff.headSize },
            { icon: '🏃', text: diff.movement },
            { icon: '❤️', text: diff.health }
        ];

        stats.forEach((stat, i) => {
            const statX = 25 + i * 150;
            const statText = this.add.text(statX, statsY, `${stat.icon} ${stat.text}`, {
                fontSize: '11px',
                color: '#666666',
                fontFamily: 'Arial'
            });
            card.add(statText);
        });

        // Play button on right
        const playBtn = this.add.container(w - 60, h / 2);
        const playBg = this.add.circle(0, 0, 25, diff.color, 0.2);
        const playIcon = this.add.text(0, 0, '▶', {
            fontSize: '24px',
            color: '#00d4ff'
        }).setOrigin(0.5);
        playBtn.add([playBg, playIcon]);
        card.add(playBtn);

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(0x2a3a4e);
            bg.setStrokeStyle(2, diff.color);
            this.tweens.add({
                targets: card,
                x: x + 8,
                duration: 150,
                ease: 'Cubic.easeOut'
            });
            this.tweens.add({
                targets: playIcon,
                scale: 1.3,
                duration: 150
            });
            playBg.setFillStyle(diff.color, 0.4);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x1a2634);
            bg.setStrokeStyle(1, 0x2a3a4e);
            this.tweens.add({
                targets: card,
                x: x,
                duration: 150,
                ease: 'Cubic.easeOut'
            });
            this.tweens.add({
                targets: playIcon,
                scale: 1,
                duration: 150
            });
            playBg.setFillStyle(diff.color, 0.2);
        });

        bg.on('pointerdown', () => {
            this.startGame(diff.id);
        });

        return card;
    }

    private createControlsInfo(x: number, y: number) {
        const container = this.add.container(x, y);

        const infoBg = this.add.rectangle(0, 0, 500, 40, 0x0f1923, 0.8);
        infoBg.setStrokeStyle(1, 0x00d4ff, 0.3);
        container.add(infoBg);

        const controlsText = this.add.text(0, 0, '🖱️ LEFT CLICK: Shoot   |   🖱️ RIGHT CLICK: ADS Zoom   |   R: Reload   |   ESC: Pause', {
            fontSize: '12px',
            color: '#00d4ff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        container.add(controlsText);
    }

    private startGame(difficulty: string) {
        // Flash effect
        this.cameras.main.flash(200, 0, 212, 255);

        this.time.delayedCall(300, () => {
            this.scene.start('ValorantTrainingScene', {
                gameMode: this.gameMode,
                difficulty: difficulty
            });
        });
    }

    private createButton(x: number, y: number, text: string, w: number, callback: () => void) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, w, 40, 0x1a2634);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(1, 0x00d4ff, 0.5);
        button.add(bg);

        const label = this.add.text(0, 0, text, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        button.add(label);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x00d4ff);
            label.setColor('#000000');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x1a2634);
            label.setColor('#ffffff');
        });

        bg.on('pointerdown', callback);

        return button;
    }
}
