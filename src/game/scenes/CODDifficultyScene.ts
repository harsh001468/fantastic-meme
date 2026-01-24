import Phaser, { Scene } from 'phaser';
import { GameMode } from './GameModeSelectionScene';

interface DifficultyMode {
    id: string;
    name: string;
    description: string;
    targetSize: string;
    movement: string;
    difficulty: string;
    color: number;
}

export class CODDifficultyScene extends Scene {
    private selectedDifficulty: string = '';
    private gameMode: GameMode | null = null;

    constructor() {
        super({ key: 'CODDifficultyScene' });
    }

    init(data: { gameMode?: GameMode }) {
        this.gameMode = data.gameMode || null;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Military-themed background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a2a1a, 0x1a2a1a, 0x2a3a2a, 0x2a3a2a, 1);
        graphics.fillRect(0, 0, width, height);

        // Title section
        const titleBg = this.add.rectangle(width / 2, 80, width, 120, 0x2a3a1e, 0.8);

        const title = this.add.text(width / 2, 60, 'CALL OF DUTY STYLE', {
            fontSize: '36px',
            color: '#ffdd00',
            fontFamily: 'Arial Black',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        const subtitle = this.add.text(width / 2, 100, 'SELECT DIFFICULTY', {
            fontSize: '20px',
            color: '#cccccc',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Mission briefing
        const briefing = this.add.text(width / 2, 150,
            'Objective: Engage bullseye targets with AK-47. Use CTRL to lock aim, ESC for tactical pause.',
            {
                fontSize: '14px',
                color: '#aaaaaa',
                fontFamily: 'Arial',
                align: 'center',
                wordWrap: { width: width - 100 }
            }
        ).setOrigin(0.5);

        // Difficulty modes
        const difficulties: DifficultyMode[] = [
            {
                id: 'easy',
                name: 'RECRUIT',
                description: 'Basic training for new operators',
                targetSize: '100px',
                movement: 'Static',
                difficulty: '★☆☆☆',
                color: 0x4ade80
            },
            {
                id: 'medium',
                name: 'REGULAR',
                description: 'Standard military engagement',
                targetSize: '80px',
                movement: 'Slow Strafe',
                difficulty: '★★☆☆',
                color: 0xffdd00
            },
            {
                id: 'hard',
                name: 'HARDENED',
                description: 'Combat veteran difficulty',
                targetSize: '60px',
                movement: 'Fast Movement',
                difficulty: '★★★☆',
                color: 0xff9800
            },
            {
                id: 'extreme',
                name: 'VETERAN',
                description: 'Elite special forces challenge',
                targetSize: '50px',
                movement: 'Tactical Patterns',
                difficulty: '★★★★',
                color: 0xff4444
            }
        ];

        const startY = 220;
        const cardHeight = 100;
        const spacing = 15;

        difficulties.forEach((difficulty, index) => {
            const y = startY + index * (cardHeight + spacing);
            this.createDifficultyCard(difficulty, width / 2, y, cardHeight);
        });

        // Back button
        this.createBackButton();

        // Instructions
        const instructions = this.add.text(width / 2, height - 30,
            'Left-Click to shoot • Right-Click for ADS • CTRL to lock cursor • ESC for menu',
            {
                fontSize: '12px',
                color: '#666666',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);
    }

    private createDifficultyCard(difficulty: DifficultyMode, x: number, y: number, height: number) {
        const cardWidth = 700;
        const container = this.add.container(x, y);

        // Card background
        const bg = this.add.rectangle(0, 0, cardWidth, height, 0x2a3a1e);
        bg.setStrokeStyle(3, difficulty.color);
        bg.setInteractive({ useHandCursor: true });
        container.add(bg);

        // Difficulty name
        const name = this.add.text(-cardWidth / 2 + 20, -height / 2 + 15, difficulty.name, {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial Black',
            fontStyle: 'bold'
        });
        container.add(name);

        // Description
        const desc = this.add.text(-cardWidth / 2 + 20, -height / 2 + 45, difficulty.description, {
            fontSize: '14px',
            color: '#aaaaaa',
            fontFamily: 'Arial'
        });
        container.add(desc);

        // Stats
        const stats = [
            { label: 'Target Size:', value: difficulty.targetSize },
            { label: 'Movement:', value: difficulty.movement },
            { label: 'Difficulty:', value: difficulty.difficulty }
        ];

        stats.forEach((stat, i) => {
            const statX = cardWidth / 2 - 250 + i * 85;
            const statLabel = this.add.text(statX, height / 2 - 30, stat.label, {
                fontSize: '10px',
                color: '#888888'
            });
            const statValue = this.add.text(statX, height / 2 - 15, stat.value, {
                fontSize: '12px',
                color: difficulty.color === 0x4ade80 ? '#4ade80' :
                    difficulty.color === 0xffdd00 ? '#ffdd00' :
                        difficulty.color === 0xff9800 ? '#ff9800' : '#ff4444',
                fontStyle: 'bold'
            });
            container.add([statLabel, statValue]);
        });

        // Rank icon
        const rankBadge = this.add.rectangle(cardWidth / 2 - 40, 0, 60, 60, difficulty.color, 0.2);
        rankBadge.setStrokeStyle(2, difficulty.color);
        container.add(rankBadge);

        const rankText = this.add.text(cardWidth / 2 - 40, 0, (difficulty.id === 'easy' ? 'I' :
            difficulty.id === 'medium' ? 'II' :
                difficulty.id === 'hard' ? 'III' : 'IV'), {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'Arial Black',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(rankText);

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(difficulty.color, 0.15);
            name.setColor(difficulty.color === 0x4ade80 ? '#4ade80' :
                difficulty.color === 0xffdd00 ? '#ffdd00' :
                    difficulty.color === 0xff9800 ? '#ff9800' : '#ff4444');
            this.tweens.add({
                targets: container,
                scaleX: 1.02,
                scaleY: 1.02,
                duration: 150,
                ease: 'Cubic.easeOut'
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x2a3a1e);
            name.setColor('#ffffff');
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Cubic.easeOut'
            });
        });

        bg.on('pointerdown', () => {
            this.selectedDifficulty = difficulty.id;
            this.startTraining();
        });
    }

    private createBackButton() {
        const { width, height } = this.cameras.main;

        const backBtn = this.add.container(80, height - 60);

        const bg = this.add.rectangle(0, 0, 120, 40, 0x3a3a3a);
        bg.setStrokeStyle(2, 0x666666);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(-30, 0, '← BACK', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        backBtn.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x5a5a5a);
            label.setColor('#ffdd00');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x3a3a3a);
            label.setColor('#ffffff');
        });

        bg.on('pointerdown', () => {
            this.scene.start('GameModeSelectionScene');
        });
    }

    private startTraining() {
        // Transition effect
        this.cameras.main.fadeOut(300, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('CODTrainingScene', {
                gameMode: this.gameMode,
                difficulty: this.selectedDifficulty
            });
        });
    }
}
