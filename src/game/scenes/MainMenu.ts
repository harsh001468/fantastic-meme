import Phaser, { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        // Load assets for the main menu if needed
    }

    create() {
        // Disable 3D Gun Overlay
        window.dispatchEvent(new CustomEvent('toggle-3d-gun', { detail: { visible: false } }));

        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0f0f1e).setOrigin(0);

        // Title
        this.add.text(width / 2, 150, 'HUNTERLESS', {
            fontSize: '72px',
            color: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 210, 'FPS AIM TRAINING ON MONAD', {
            fontSize: '20px',
            color: '#888888'
        }).setOrigin(0.5);

        // Menu buttons
        this.createMenuButton(width / 2, 320, '🎮 START TRAINING', () => {
            this.scene.start('GameModeSelectionScene');
        });

        this.createMenuButton(width / 2, 400, '📊 DASHBOARD', () => {
            // Open React Dashboard Overlay
            window.dispatchEvent(new CustomEvent('open-dashboard'));
        });

        this.createMenuButton(width / 2, 480, '🏆 LEADERBOARD', () => {
            this.scene.pause();
            this.scene.launch('LeaderboardScene');
        });

        this.createMenuButton(width / 2, 560, '⚙️ SETTINGS', () => {
            this.scene.pause();
            this.scene.launch('SettingsScene');
        });

        // Footer
        this.add.text(width / 2, height - 30, 'Powered by Monad Blockchain | gmonads.com', {
            fontSize: '14px',
            color: '#444444'
        }).setOrigin(0.5);
    }

    private createMenuButton(x: number, y: number, text: string, callback: () => void) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 400, 60, 0x1a1a2e);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0x00ff88);
        button.add(bg);

        const label = this.add.text(0, 0, text, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        button.add(label);

        // Hover effects
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

    update() {
        // Update logic for the main menu if needed
    }
}
