import Phaser, { Scene } from 'phaser';
import { WalletService } from '../../web3/services/WalletService';
import { NFTService } from '../../web3/services/NFTService';

export class DashboardScene extends Scene {
    private walletService: WalletService;
    private nftService: NFTService;

    // UI State
    private activeTab: 'overview' | 'validators' | 'charts' | 'staking' = 'overview';
    private container: Phaser.GameObjects.Container | null = null;

    // Mock Data for GMonads features
    private validators = [
        { name: 'Monad Val 01', staked: '1.2M MON', uptime: '99.9%' },
        { name: 'Hunterless Node', staked: '950k MON', uptime: '99.8%' },
        { name: 'GMonad Prime', staked: '800k MON', uptime: '100%' },
        { name: 'DeFi Llama', staked: '600k MON', uptime: '99.5%' },
        { name: 'Community Node', staked: '450k MON', uptime: '98.0%' }
    ];

    constructor() {
        super({ key: 'DashboardScene' });
        this.walletService = new WalletService();
        this.nftService = new NFTService();
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background (GMonads Theme: Dark Purple/Black gradient)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
        bg.fillRect(0, 0, width, height);

        // Top Bar
        this.add.rectangle(0, 0, width, 80, 0x000000, 0.5).setOrigin(0);
        this.add.text(40, 25, 'GMONADS x HUNTERLESS', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        });

        // Current Connected Wallet (Top Right)
        this.createHeaderWallet(width - 40, 40);

        // Sidebar / Tabs
        this.createSidebar();

        // Initial Render
        this.renderContent();
    }

    private createHeaderWallet(x: number, y: number) {
        this.walletService.getConnectedAddress().then(address => {
            const text = address
                ? `🟢 ${address.slice(0, 6)}...${address.slice(-4)}`
                : '🔴 Address Not Connected';

            this.add.text(x, y, text, {
                fontSize: '16px',
                color: '#aaaaaa'
            }).setOrigin(1, 0.5);
        });
    }

    private createSidebar() {
        const tabs = [
            { id: 'overview', label: '🏠 Overview', y: 120 },
            { id: 'validators', label: '🛡️ Validators', y: 190 },
            { id: 'charts', label: '📈 Charts', y: 260 },
            { id: 'staking', label: '💎 Staking', y: 330 },
            { id: 'back', label: '⬅️ Back to Game', y: 600 }
        ];

        tabs.forEach(tab => {
            const btn = this.add.container(40, tab.y);

            const txt = this.add.text(0, 0, tab.label, {
                fontSize: '20px',
                color: this.activeTab === tab.id ? '#00ff88' : '#888888'
            }).setInteractive({ useHandCursor: true });

            txt.on('pointerdown', () => {
                if (tab.id === 'back') {
                    this.scene.start('MainMenu');
                } else {
                    this.activeTab = tab.id as any;
                    this.scene.restart(); // Simple way to refresh UI, though recreating scene is heavy
                }
            });

            txt.on('pointerover', () => txt.setColor('#ffffff'));
            txt.on('pointerout', () => txt.setColor(this.activeTab === tab.id ? '#00ff88' : '#888888'));

            btn.add(txt);
        });
    }

    private renderContent() {
        const { width, height } = this.cameras.main;
        const contentX = 250;
        const contentY = 100;

        if (this.container) this.container.destroy();
        this.container = this.add.container(contentX, contentY);

        switch (this.activeTab) {
            case 'overview':
                this.renderOverview();
                break;
            case 'validators':
                this.renderValidators();
                break;
            case 'charts':
                this.renderCharts();
                break;
            case 'staking':
                this.renderStaking();
                break;
        }
    }

    private renderOverview() {
        // Player Stats + Network Overview
        const title = this.add.text(0, 0, 'Monad Network Overview', { fontSize: '36px', color: '#fff' });
        this.container?.add(title);

        const cards = [
            { label: 'Block Time', val: '395ms', color: '#00d4ff' },
            { label: 'Current TPS', val: '8,450', color: '#9b59b6' },
            { label: 'Total Staked', val: '15.2B MON', color: '#2ecc71' },
            { label: 'Median Fee', val: '< 0.001$', color: '#f1c40f' }
        ];

        cards.forEach((card, i) => {
            const x = (i % 2) * 350;
            const y = Math.floor(i / 2) * 150 + 80;

            const bg = this.add.rectangle(x, y, 320, 120, 0x1a1a2e, 0.8).setOrigin(0);
            const lbl = this.add.text(x + 20, y + 20, card.label, { color: '#888' });
            const val = this.add.text(x + 20, y + 50, card.val, { fontSize: '32px', color: card.color, fontStyle: 'bold' });

            this.container?.add([bg, lbl, val]);
        });

        // Live Feed Ticker
        const tickerBg = this.add.rectangle(0, 400, 700, 40, 0x000000, 0.5).setOrigin(0);
        const ticker = this.add.text(10, 410, '🔴 LIVE: Block #14205331 Finalized • Validator #42 Proposed • Network Healthy', { color: '#00ff88', fontSize: '14px' });
        this.container?.add([tickerBg, ticker]);
    }

    private renderValidators() {
        const title = this.add.text(0, 0, 'Active Validators (171 Total)', { fontSize: '36px', color: '#fff' });
        this.container?.add(title);

        let y = 80;
        // Headers
        this.container?.add(this.add.text(20, y, 'NAME', { color: '#666' }));
        this.container?.add(this.add.text(300, y, 'STAKED', { color: '#666' }));
        this.container?.add(this.add.text(500, y, 'UPTIME', { color: '#666' }));

        y += 40;

        this.validators.forEach((val, i) => {
            const bg = this.add.rectangle(0, y, 700, 50, i % 2 === 0 ? 0x24243e : 0x1a1a2e).setOrigin(0);
            const name = this.add.text(20, y + 15, val.name, { fontSize: '18px', color: '#fff' });
            const staked = this.add.text(300, y + 15, val.staked, { fontSize: '18px', color: '#00d4ff' });
            const uptime = this.add.text(500, y + 15, val.uptime, { fontSize: '18px', color: '#2ecc71' });

            this.container?.add([bg, name, staked, uptime]);
            y += 60;
        });
    }

    private renderCharts() {
        const title = this.add.text(0, 0, 'Transaction History (7 Days)', { fontSize: '36px', color: '#fff' });
        this.container?.add(title);

        // Draw Line Chart
        const graphics = this.add.graphics();
        graphics.lineStyle(3, 0x00ff88);

        const startX = 50;
        const startY = 400;
        const points = [50, 80, 45, 90, 120, 150, 140, 180, 200, 190, 250];
        const stepX = 60;

        graphics.beginPath();
        graphics.moveTo(startX, startY - points[0]);

        points.forEach((p, i) => {
            graphics.lineTo(startX + (i * stepX), startY - p);
            // Draw Point
            this.container?.add(this.add.circle(startX + (i * stepX), startY - p, 4, 0xffffff));
        });

        graphics.strokePath();

        // Axes
        graphics.lineStyle(2, 0x666666);
        graphics.beginPath();
        graphics.moveTo(startX, startY);
        graphics.lineTo(startX + (points.length * stepX), startY); // X Axis
        graphics.moveTo(startX, startY);
        graphics.lineTo(startX, startY - 300); // Y Axis
        graphics.strokePath();

        this.container?.add(graphics);
    }

    private renderStaking() {
        const title = this.add.text(0, 0, 'Liquid Staking (12.97% APY)', { fontSize: '36px', color: '#fff' });
        this.container?.add(title);

        const panel = this.add.rectangle(0, 80, 600, 300, 0x1a1a2e).setOrigin(0);
        this.container?.add(panel);

        this.container?.add(this.add.text(40, 120, 'Stake MON tokens to earn 12.97% APY rewards.', { fontSize: '18px', color: '#aaa' }));

        // Stats within staking
        this.container?.add(this.add.text(40, 160, 'Total Pending Stake: 45.2M MON', { color: '#00d4ff' }));
        this.container?.add(this.add.text(340, 160, 'Your Stake: 0.00 MON', { color: '#f1c40f' }));

        // Input Box (Mock)
        const inputBg = this.add.rectangle(40, 180, 400, 50, 0x0f0c29).setOrigin(0);
        inputBg.setStrokeStyle(1, 0x444444);
        const placeholder = this.add.text(60, 195, 'Enter Amount...', { color: '#666' });
        this.container?.add([inputBg, placeholder]);

        // Button
        const btn = this.add.rectangle(460, 180, 120, 50, 0x9b59b6).setOrigin(0).setInteractive({ useHandCursor: true });
        const btnTxt = this.add.text(520, 205, 'STAKE', { fontSize: '18px', fontStyle: 'bold' }).setOrigin(0.5);

        btn.on('pointerdown', () => {
            btn.setFillStyle(0x8e44ad);
            btnTxt.setText('STAKING...');
            this.tweens.add({
                targets: btn,
                scale: 0.95,
                duration: 100,
                yoyo: true
            });
        });

        this.container?.add([btn, btnTxt]);
    }

    update() { }
}
