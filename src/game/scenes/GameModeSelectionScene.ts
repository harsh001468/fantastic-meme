import Phaser, { Scene } from 'phaser';

export interface GameMode {
    id: string;
    name: string;
    description: string;
    mechanics: string[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
    icon: string;
    hasDifficultySelect?: boolean;
}

export class GameModeSelectionScene extends Scene {
    private gameModes: GameMode[] = [
        {
            id: 'csgo',
            name: 'CS:GO Style',
            description: 'Precision tap-shooting with AK-47. Master bullseye targeting and combo multipliers.',
            mechanics: ['AK-47 Weapon', 'Bullseye Targets', 'Combo System', 'Flick Shots'],
            difficulty: 'Hard',
            icon: '🎯',
            hasDifficultySelect: true
        },
        {
            id: 'valorant',
            name: 'Valorant Style',
            description: 'Tactical ADS shooting with Vandal rifle. Headshots, body shots, and precision.',
            mechanics: ['Vandal Rifle', 'ADS Zoom', 'Headshots', 'Counter-Strafing'],
            difficulty: 'Medium',
            icon: '⚡',
            hasDifficultySelect: true
        },
        {
            id: 'apex',
            name: 'Apex Legends Style',
            description: 'Fast-paced tracking with high mobility. Track sliding and jumping targets.',
            mechanics: ['Fast Tracking', 'Predictive Aim', 'Hip-Fire', 'Vertical Tracking'],
            difficulty: 'Hard',
            icon: '🚀'
        },
        {
            id: 'cod',
            name: 'Call of Duty Style',
            description: 'Quick snap aiming and fast target acquisition. Perfect for close quarters.',
            mechanics: ['Snap Aiming', 'Fast Reflexes', 'Quick ADS', 'Target Switching'],
            difficulty: 'Easy',
            icon: '⚔️',
            hasDifficultySelect: true
        },
        {
            id: 'overwatch',
            name: 'Overwatch Style',
            description: 'Hero-specific aim training. Practice hitscan, projectile, and flick shots.',
            mechanics: ['Hitscan', 'Projectile', 'Flick Shots', 'Tracking'],
            difficulty: 'Medium',
            icon: '🎮'
        },
        {
            id: 'battlefield',
            name: 'Battlefield Style',
            description: 'Long-range ballistics with bullet drop. Master sniper mechanics.',
            mechanics: ['Bullet Drop', 'Leading Targets', 'Breath Control', 'Zeroing'],
            difficulty: 'Hard',
            icon: '🎖️'
        }
    ];

    private selectedMode: GameMode | null = null;

    constructor() {
        super({ key: 'GameModeSelectionScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0f0f1e).setOrigin(0);

        // Title
        this.add.text(width / 2, 60, 'SELECT TRAINING MODE', {
            fontSize: '48px',
            color: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 110, 'Choose your FPS game style to practice', {
            fontSize: '18px',
            color: '#888888'
        }).setOrigin(0.5);

        // Create mode cards in grid (2 columns, 3 rows)
        const startX = 140;
        const startY = 160;
        const cardWidth = 520;
        const cardHeight = 140;
        const gapX = 40;
        const gapY = 20;

        this.gameModes.forEach((mode, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + col * (cardWidth + gapX);
            const y = startY + row * (cardHeight + gapY);

            this.createModeCard(x, y, cardWidth, cardHeight, mode);
        });

        // Back button
        this.createButton(width / 2, height - 50, '← Back to Menu', 300, () => {
            this.scene.start('MainMenu');
        });
    }

    private createModeCard(x: number, y: number, w: number, h: number, mode: GameMode) {
        const card = this.add.container(x, y);

        // Background
        const bg = this.add.rectangle(0, 0, w, h, 0x1a1a2e).setOrigin(0);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0x2a2a3e);
        card.add(bg);

        // Icon
        const icon = this.add.text(20, 20, mode.icon, {
            fontSize: '48px'
        });
        card.add(icon);

        // Game name
        const name = this.add.text(90, 25, mode.name, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        card.add(name);

        // Difficulty badge
        const difficultyColor = mode.difficulty === 'Easy' ? '#4ecdc4' :
            mode.difficulty === 'Medium' ? '#f7dc6f' : '#ff6b6b';
        const difficultyBg = this.add.rectangle(w - 90, 30, 80, 25, parseInt(difficultyColor.replace('#', '0x')), 0.3).setOrigin(0);
        card.add(difficultyBg);

        const difficulty = this.add.text(w - 50, 30, mode.difficulty, {
            fontSize: '14px',
            color: difficultyColor,
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        card.add(difficulty);

        // Description
        const desc = this.add.text(90, 55, mode.description, {
            fontSize: '14px',
            color: '#aaaaaa',
            wordWrap: { width: w - 110 }
        });
        card.add(desc);

        // Mechanics
        const mechanicsY = 95;
        mode.mechanics.slice(0, 3).forEach((mechanic, i) => {
            const mechanicText = this.add.text(90 + (i * 140), mechanicsY, `• ${mechanic}`, {
                fontSize: '12px',
                color: '#00ff88'
            });
            card.add(mechanicText);
        });

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(0x2a2a4e);
            bg.setStrokeStyle(3, 0x00ff88);
            this.tweens.add({
                targets: card,
                scale: 1.02,
                duration: 150
            });
        });

        bg.on('pointerout', () => {
            if (this.selectedMode?.id !== mode.id) {
                bg.setFillStyle(0x1a1a2e);
                bg.setStrokeStyle(2, 0x2a2a3e);
            }
            this.tweens.add({
                targets: card,
                scale: 1,
                duration: 150
            });
        });

        bg.on('pointerdown', () => {
            this.selectMode(mode);
        });

        return card;
    }

    private selectMode(mode: GameMode) {
        this.selectedMode = mode;

        // Visual feedback
        this.cameras.main.flash(200, 0, 255, 136);

        // Store selected mode in registry
        this.registry.set('selectedGameMode', mode);

        // Start appropriate training scene based on mode
        this.time.delayedCall(300, () => {
            if (mode.id === 'csgo') {
                // Go to difficulty selection for CS:GO
                this.scene.start('CSGODifficultyScene', { gameMode: mode });
            } else if (mode.id === 'valorant') {
                // Go to difficulty selection for Valorant
                this.scene.start('ValorantDifficultyScene', { gameMode: mode });
            } else if (mode.id === 'cod') {
                // Go to difficulty selection for Call of Duty
                this.scene.start('CODDifficultyScene', { gameMode: mode });
            } else {
                // Show coming soon for other modes
                this.showComingSoon(mode);
            }
        });
    }

    private showComingSoon(mode: GameMode) {
        const { width, height } = this.cameras.main;

        const overlay = this.add.container(0, 0);
        overlay.setDepth(1000);

        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        bg.setInteractive();
        overlay.add(bg);

        const panel = this.add.rectangle(width / 2, height / 2, 400, 200, 0x1a1a2e);
        panel.setStrokeStyle(2, 0x00ff88);
        overlay.add(panel);

        const icon = this.add.text(width / 2, height / 2 - 50, mode.icon, { fontSize: '48px' }).setOrigin(0.5);
        overlay.add(icon);

        const title = this.add.text(width / 2, height / 2, `${mode.name}`, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        overlay.add(title);

        const subtitle = this.add.text(width / 2, height / 2 + 35, 'Coming Soon!', {
            fontSize: '18px',
            color: '#00ff88'
        }).setOrigin(0.5);
        overlay.add(subtitle);

        bg.on('pointerdown', () => {
            overlay.destroy();
        });

        this.time.delayedCall(2000, () => {
            if (overlay.active) overlay.destroy();
        });
    }

    private createButton(x: number, y: number, text: string, width: number, callback: () => void) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, width, 50, 0x1a1a2e);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0x00ff88);
        button.add(bg);

        const label = this.add.text(0, 0, text, {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        button.add(label);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x00ff88);
            label.setColor('#000000');
            this.tweens.add({
                targets: button,
                scale: 1.05,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x1a1a2e);
            label.setColor('#ffffff');
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 100
            });
        });

        bg.on('pointerdown', callback);

        return button;
    }
}
