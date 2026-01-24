import Phaser, { Scene } from 'phaser';
import { GameMode } from './GameModeSelectionScene';

interface DifficultyOption {
    id: string;
    name: string;
    description: string;
    targetSize: string;
    spawnSpeed: string;
    movement: string;
    color: number;
}

export class CSGODifficultyScene extends Scene {
    private gameMode: GameMode | null = null;

    private difficulties: DifficultyOption[] = [
        {
            id: 'easy',
            name: 'EASY',
            description: 'Large targets, slow spawn, stationary',
            targetSize: 'Large (60px)',
            spawnSpeed: '1 second delay',
            movement: 'Static targets',
            color: 0x4ecdc4
        },
        {
            id: 'medium',
            name: 'MEDIUM',
            description: 'Medium targets, faster spawn',
            targetSize: 'Medium (45px)',
            spawnSpeed: '0.5 second delay',
            movement: 'Static targets',
            color: 0xf7dc6f
        },
        {
            id: 'hard',
            name: 'HARD',
            description: 'Small moving targets, fast spawn',
            targetSize: 'Small (30px)',
            spawnSpeed: '0.2 second delay',
            movement: 'Moving targets',
            color: 0xff6b6b
        },
        {
            id: 'competitive',
            name: 'COMPETITIVE',
            description: 'Head-sized targets, instant spawn, fast movement',
            targetSize: 'Tiny (20px)',
            spawnSpeed: '0.1 second delay',
            movement: 'Fast strafing',
            color: 0xff0000
        }
    ];

    constructor() {
        super({ key: 'CSGODifficultyScene' });
    }

    init(data: { gameMode: GameMode }) {
        this.gameMode = data.gameMode;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0f0f1e).setOrigin(0);

        // Title
        this.add.text(width / 2, 60, 'SELECT DIFFICULTY', {
            fontSize: '48px',
            color: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 110, 'CS:GO Style Training - Choose your challenge level', {
            fontSize: '18px',
            color: '#888888'
        }).setOrigin(0.5);

        // Create difficulty cards
        const startY = 160;
        const cardHeight = 110;
        const gap = 20;

        this.difficulties.forEach((diff, index) => {
            const y = startY + index * (cardHeight + gap);
            this.createDifficultyCard(width / 2 - 350, y, 700, cardHeight, diff);
        });

        // Back button
        this.createButton(width / 2, height - 50, '← Back to Mode Selection', 350, () => {
            this.scene.start('GameModeSelectionScene');
        });
    }

    private createDifficultyCard(x: number, y: number, w: number, h: number, diff: DifficultyOption) {
        const card = this.add.container(x, y);

        // Background
        const bg = this.add.rectangle(0, 0, w, h, 0x1a1a2e).setOrigin(0);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0x2a2a3e);
        card.add(bg);

        // Difficulty color bar
        const colorBar = this.add.rectangle(0, 0, 8, h, diff.color).setOrigin(0);
        card.add(colorBar);

        // Name
        const name = this.add.text(30, 15, diff.name, {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        card.add(name);

        // Description
        const desc = this.add.text(30, 50, diff.description, {
            fontSize: '16px',
            color: '#888888'
        });
        card.add(desc);

        // Stats
        const statsText = `Target: ${diff.targetSize} | Spawn: ${diff.spawnSpeed} | ${diff.movement}`;
        const stats = this.add.text(30, 75, statsText, {
            fontSize: '12px',
            color: '#666666'
        });
        card.add(stats);

        // Play arrow
        const arrow = this.add.text(w - 50, h / 2, '▶', {
            fontSize: '32px',
            color: '#00ff88'
        }).setOrigin(0.5);
        card.add(arrow);

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(0x2a2a4e);
            bg.setStrokeStyle(3, diff.color);
            this.tweens.add({
                targets: card,
                x: x + 10,
                duration: 150
            });
            this.tweens.add({
                targets: arrow,
                scale: 1.3,
                duration: 150
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x1a1a2e);
            bg.setStrokeStyle(2, 0x2a2a3e);
            this.tweens.add({
                targets: card,
                x: x,
                duration: 150
            });
            this.tweens.add({
                targets: arrow,
                scale: 1,
                duration: 150
            });
        });

        bg.on('pointerdown', () => {
            this.startGame(diff.id);
        });

        return card;
    }

    private startGame(difficulty: string) {
        this.cameras.main.flash(200, 0, 255, 136);

        this.time.delayedCall(300, () => {
            this.scene.start('CSGOTrainingScene', {
                gameMode: this.gameMode,
                difficulty: difficulty
            });
        });
    }

    private createButton(x: number, y: number, text: string, w: number, callback: () => void) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, w, 50, 0x1a1a2e);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0x00ff88);
        button.add(bg);

        const label = this.add.text(0, 0, text, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        button.add(label);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x00ff88);
            label.setColor('#000000');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x1a1a2e);
            label.setColor('#ffffff');
        });

        bg.on('pointerdown', callback);

        return button;
    }
}
