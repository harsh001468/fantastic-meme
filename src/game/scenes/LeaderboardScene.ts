import Phaser, { Scene } from 'phaser';

interface LeaderboardEntry {
    rank: number;
    username: string;
    walletAddress: string;
    score: number;
    accuracy: number;
    bullseyes: number;
    tokens: number;
    sessions: number;
    timestamp: number;
}

interface PersonalStats {
    totalSessions: number;
    careerHighScore: number;
    averageAccuracy: number;
    totalBullseyes: number;
    totalShots: number;
    playTimeMinutes: number;
    tokensEarned: number;
}

export class LeaderboardScene extends Scene {
    private currentTab: string = 'global';
    private tabButtons: Map<string, Phaser.GameObjects.Container> = new Map();
    private contentContainer!: Phaser.GameObjects.Container;
    private scrollOffset: number = 0;
    private maxScroll: number = 0;

    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark background overlay
        const bg = this.add.rectangle(0, 0, width, height, 0x0a0a0a, 0.95).setOrigin(0);
        bg.setInteractive();

        // Main leaderboard panel
        const panelWidth = 1000;
        const panelHeight = 650;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x1a2a1a).setOrigin(0);
        panel.setStrokeStyle(4, 0xffdd00);

        // Header
        const headerBg = this.add.rectangle(panelX, panelY, panelWidth, 80, 0x2a3a1e).setOrigin(0);

        const title = this.add.text(width / 2, panelY + 30, '🏆 GLOBAL LEADERBOARD', {
            fontSize: '36px',
            color: '#ffdd00',
            fontFamily: 'Arial Black',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const subtitle = this.add.text(width / 2, panelY + 60, 'Compete with the best aim trainers worldwide', {
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);

        // Live indicator
        const liveIndicator = this.createLiveIndicator(width / 2 + 300, panelY + 30);

        // Close button
        const closeBtn = this.createCloseButton(panelX + panelWidth - 50, panelY + 40);

        // Tabs
        this.createTabs(panelX + 20, panelY + 100, panelWidth - 40);

        // Content area
        this.contentContainer = this.add.container(panelX + 20, panelY + 160);
        this.renderCurrentTab();

        // Scroll hint
        this.add.text(width / 2, panelY + panelHeight - 20, '🖱️ Scroll to see more entries', {
            fontSize: '12px',
            color: '#666666'
        }).setOrigin(0.5);

        // Mouse wheel scrolling
        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
            this.scrollOffset += deltaY * 0.3;
            this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset, 0, this.maxScroll);
            this.contentContainer.y = panelY + 160 - this.scrollOffset;
        });
    }

    private createLiveIndicator(x: number, y: number): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const dot = this.add.circle(0, 0, 6, 0xff0000);
        container.add(dot);

        const text = this.add.text(12, 0, 'LIVE', {
            fontSize: '12px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        container.add(text);

        // Pulsing animation
        this.tweens.add({
            targets: dot,
            alpha: 0.3,
            scale: 0.8,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        return container;
    }

    private createTabs(x: number, y: number, width: number) {
        const tabs = [
            { id: 'global', label: 'GLOBAL', icon: '🌐' },
            { id: 'daily', label: 'DAILY', icon: '📅' },
            { id: 'weekly', label: 'WEEKLY', icon: '🏅' },
            { id: 'personal', label: 'MY STATS', icon: '👤' }
        ];

        const tabWidth = width / tabs.length;

        tabs.forEach((tab, index) => {
            const tabX = x + index * tabWidth;
            const tabContainer = this.createTab(tabX, y, tabWidth, tab);
            this.tabButtons.set(tab.id, tabContainer);
        });
    }

    private createTab(x: number, y: number, width: number, tab: any): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, width - 10, 45, 0x2a3a1e).setOrigin(0, 0);
        bg.setInteractive({ useHandCursor: true });
        container.add(bg);

        const icon = this.add.text(width / 2 - 30, 22, tab.icon, {
            fontSize: '20px'
        }).setOrigin(0.5);
        container.add(icon);

        const label = this.add.text(width / 2 + 10, 22, tab.label, {
            fontSize: '14px',
            color: '#cccccc',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        container.add(label);

        // Active indicator
        const indicator = this.add.rectangle(0, 44, width - 10, 3, 0xffdd00).setOrigin(0, 0);
        indicator.setAlpha(tab.id === this.currentTab ? 1 : 0);
        container.add(indicator);
        container.setData('indicator', indicator);
        container.setData('bg', bg);
        container.setData('label', label);

        bg.on('pointerover', () => {
            if (tab.id !== this.currentTab) {
                bg.setFillStyle(0x3a4a2e);
                label.setColor('#ffffff');
            }
        });

        bg.on('pointerout', () => {
            if (tab.id !== this.currentTab) {
                bg.setFillStyle(0x2a3a1e);
                label.setColor('#cccccc');
            }
        });

        bg.on('pointerdown', () => {
            this.switchTab(tab.id);
        });

        return container;
    }

    private switchTab(tabId: string) {
        this.currentTab = tabId;
        this.scrollOffset = 0;

        // Update tab visuals
        this.tabButtons.forEach((container, id) => {
            const indicator = container.getData('indicator') as Phaser.GameObjects.Rectangle;
            const bg = container.getData('bg') as Phaser.GameObjects.Rectangle;
            const label = container.getData('label') as Phaser.GameObjects.Text;

            if (id === tabId) {
                indicator.setAlpha(1);
                bg.setFillStyle(0x3a4a2e);
                label.setColor('#ffdd00');
            } else {
                indicator.setAlpha(0);
                bg.setFillStyle(0x2a3a1e);
                label.setColor('#cccccc');
            }
        });

        // Render new content
        this.renderCurrentTab();
    }

    private renderCurrentTab() {
        this.contentContainer.removeAll(true);

        switch (this.currentTab) {
            case 'global':
                this.renderGlobalLeaderboard();
                break;
            case 'daily':
                this.renderDailyLeaderboard();
                break;
            case 'weekly':
                this.renderWeeklyLeaderboard();
                break;
            case 'personal':
                this.renderPersonalStats();
                break;
        }
    }

    private renderGlobalLeaderboard() {
        // Get data from localStorage
        const leaderboardData = this.getGlobalLeaderboardData();

        // Table header
        this.createTableHeader();

        // Table rows
        leaderboardData.forEach((entry, index) => {
            this.createLeaderboardRow(entry, index, 45 + index * 50);
        });

        this.maxScroll = Math.max(0, leaderboardData.length * 50 - 400);
    }

    private renderDailyLeaderboard() {
        // Filter for today's sessions
        const leaderboardData = this.getDailyLeaderboardData();

        this.createTableHeader();

        leaderboardData.forEach((entry, index) => {
            this.createLeaderboardRow(entry, index, 45 + index * 50);
        });

        this.maxScroll = Math.max(0, leaderboardData.length * 50 - 400);
    }

    private renderWeeklyLeaderboard() {
        // Filter for this week's sessions
        const leaderboardData = this.getWeeklyLeaderboardData();

        this.createTableHeader();

        leaderboardData.forEach((entry, index) => {
            this.createLeaderboardRow(entry, index, 45 + index * 50);
        });

        this.maxScroll = Math.max(0, leaderboardData.length * 50 - 400);
    }

    private renderPersonalStats() {
        const stats = this.getPersonalStats();

        let yOffset = 0;

        // Career high score
        this.createStatCard('🎯 Career High Score', stats.careerHighScore.toString(), 0, yOffset, 450, '#ffdd00');
        yOffset += 90;

        // Average accuracy
        this.createStatCard('🎲 Average Accuracy', stats.averageAccuracy.toFixed(1) + '%', 0, yOffset, 450, stats.averageAccuracy >= 70 ? '#4ade80' : '#ff6b6b');
        yOffset += 90;

        // Total bullseyes
        this.createStatCard('🎪 Total Bullseyes', stats.totalBullseyes.toString(), 0, yOffset, 450, '#ff9800');
        yOffset += 90;

        // Sessions played
        this.createStatCard('📊 Sessions Played', stats.totalSessions.toString(), 0, yOffset, 450, '#00bfff');
        yOffset += 90;

        // Tokens earned
        this.createStatCard('💰 Tokens Earned', stats.tokensEarned.toString(), 0, yOffset, 450, '#ffdd00');

        this.maxScroll = 0;
    }

    private createTableHeader() {
        const header = this.add.container(0, 0);

        const bg = this.add.rectangle(0, 0, 940, 40, 0x3a4a2e).setOrigin(0, 0);
        header.add(bg);

        const columns = [
            { label: 'RANK', x: 50, width: 80 },
            { label: 'PLAYER', x: 130, width: 250 },
            { label: 'SCORE', x: 380, width: 120 },
            { label: 'ACCURACY', x: 500, width: 130 },
            { label: 'BULLSEYES', x: 630, width: 130 },
            { label: 'TOKENS', x: 760, width: 120 }
        ];

        columns.forEach(col => {
            const text = this.add.text(col.x, 20, col.label, {
                fontSize: '14px',
                color: '#ffdd00',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            header.add(text);
        });

        this.contentContainer.add(header);
    }

    private createLeaderboardRow(entry: LeaderboardEntry, index: number, y: number) {
        const row = this.add.container(0, y);

        // Alternating background
        const bgColor = index % 2 === 0 ? 0x1a2a1a : 0x2a3a1e;
        const bg = this.add.rectangle(0, 0, 940, 45, bgColor).setOrigin(0, 0);
        bg.setInteractive({ useHandCursor: true });
        row.add(bg);

        // Highlight top 3
        if (entry.rank <= 3) {
            bg.setStrokeStyle(2, entry.rank === 1 ? 0xffd700 : entry.rank === 2 ? 0xc0c0c0 : 0xcd7f32);
        }

        // Rank with medal
        const rankText = entry.rank <= 3
            ? (entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉') + ' ' + entry.rank
            : entry.rank.toString();
        const rank = this.add.text(50, 22, rankText, {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        row.add(rank);

        // Player name
        const username = this.add.text(130, 22, entry.username, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        row.add(username);

        // Wallet address (truncated)
        const wallet = this.add.text(130, 35, entry.walletAddress.slice(0, 6) + '...' + entry.walletAddress.slice(-4), {
            fontSize: '11px',
            color: '#666666'
        }).setOrigin(0, 0.5);
        row.add(wallet);

        // Score
        const score = this.add.text(380, 22, entry.score.toString(), {
            fontSize: '18px',
            color: '#ffdd00',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        row.add(score);

        // Accuracy
        const accuracyColor = entry.accuracy >= 80 ? '#4ade80' : entry.accuracy >= 60 ? '#ffdd00' : '#ff6b6b';
        const accuracy = this.add.text(500, 22, entry.accuracy.toFixed(1) + '%', {
            fontSize: '16px',
            color: accuracyColor,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        row.add(accuracy);

        // Bullseyes
        const bullseyes = this.add.text(630, 22, entry.bullseyes.toString(), {
            fontSize: '16px',
            color: '#ff9800'
        }).setOrigin(0, 0.5);
        row.add(bullseyes);

        // Tokens
        const tokens = this.add.text(760, 22, entry.tokens.toString(), {
            fontSize: '16px',
            color: '#ffdd00'
        }).setOrigin(0, 0.5);
        row.add(tokens);

        // Hover effect
        bg.on('pointerover', () => {
            bg.setFillStyle(0x3a4a2e);
            this.tweens.add({
                targets: row,
                x: 5,
                duration: 150
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(bgColor);
            this.tweens.add({
                targets: row,
                x: 0,
                duration: 150
            });
        });

        bg.on('pointerdown', () => {
            this.showPlayerCard(entry);
        });

        this.contentContainer.add(row);
    }

    private createStatCard(label: string, value: string, x: number, y: number, width: number, color: string) {
        const card = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, width, 75, 0x2a3a1e).setOrigin(0, 0);
        bg.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(color).color);
        card.add(bg);

        const labelText = this.add.text(width / 2, 20, label, {
            fontSize: '14px',
            color: '#888888',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        card.add(labelText);

        const valueText = this.add.text(width / 2, 45, value, {
            fontSize: '28px',
            color: color,
            fontFamily: 'Arial Black',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        card.add(valueText);

        this.contentContainer.add(card);
    }

    private showPlayerCard(entry: LeaderboardEntry) {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0).setDepth(2000);
        overlay.setInteractive();

        const cardWidth = 500;
        const cardHeight = 450;

        const card = this.add.rectangle(width / 2, height / 2, cardWidth, cardHeight, 0x1a2a1a).setDepth(2001);
        card.setStrokeStyle(4, 0xffdd00);

        const title = this.add.text(width / 2, height / 2 - 190, '👤 PLAYER PROFILE', {
            fontSize: '24px',
            color: '#ffdd00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2001);

        const username = this.add.text(width / 2, height / 2 - 150, entry.username, {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial Black',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2001);

        const wallet = this.add.text(width / 2, height / 2 - 115, entry.walletAddress, {
            fontSize: '12px',
            color: '#888888'
        }).setOrigin(0.5).setDepth(2001);

        let yOffset = height / 2 - 80;
        const stats = [
            { label: 'Rank:', value: '#' + entry.rank },
            { label: 'High Score:', value: entry.score.toString() },
            { label: 'Accuracy:', value: entry.accuracy.toFixed(1) + '%' },
            { label: 'Bullseyes:', value: entry.bullseyes.toString() },
            { label: 'Sessions:', value: entry.sessions.toString() },
            { label: 'Tokens Earned:', value: entry.tokens.toString() }
        ];

        const statElements: Phaser.GameObjects.GameObject[] = [];
        stats.forEach(stat => {
            const statLabel = this.add.text(width / 2 - 180, yOffset, stat.label, {
                fontSize: '16px',
                color: '#888888'
            }).setOrigin(0, 0).setDepth(2001);

            const statValue = this.add.text(width / 2 + 20, yOffset, stat.value, {
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0, 0).setDepth(2001);

            statElements.push(statLabel, statValue);
            yOffset += 35;
        });

        const closeBtn = this.add.rectangle(width / 2, height / 2 + 180, 200, 45, 0x4ade80).setDepth(2001);
        closeBtn.setInteractive({ useHandCursor: true });

        const closeBtnText = this.add.text(width / 2, height / 2 + 180, 'CLOSE', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2001);

        closeBtn.on('pointerdown', () => {
            [overlay, card, title, username, wallet, closeBtn, closeBtnText, ...statElements].forEach((obj: any) => {
                if (obj && obj.destroy) obj.destroy();
            });
        });
    }

    private getGlobalLeaderboardData(): LeaderboardEntry[] {
        // Get all COD sessions from localStorage
        const history = JSON.parse(localStorage.getItem('aimchain_cod_history') || '[]');

        // Group by player and get best scores
        const playerBest: Record<string, any> = {};

        history.forEach((session: any) => {
            const wallet = session.walletAddress || '0x' + Math.random().toString(16).slice(2, 42);
            if (!playerBest[wallet] || session.score > playerBest[wallet].score) {
                playerBest[wallet] = session;
            }
        });

        // Convert to leaderboard entries
        const entries: LeaderboardEntry[] = Object.keys(playerBest).map(wallet => {
            const session = playerBest[wallet];
            return {
                rank: 0,
                username: 'Player_' + wallet.slice(2, 8),
                walletAddress: wallet,
                score: session.score,
                accuracy: session.accuracy,
                bullseyes: session.bullseyes,
                tokens: Math.floor(session.score / 10),
                sessions: history.filter((s: any) => (s.walletAddress || '0x') === wallet).length,
                timestamp: session.timestamp
            };
        });

        // Sort by score descending
        entries.sort((a, b) => b.score - a.score);

        // Assign ranks
        entries.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        return entries.slice(0, 50); // Top 50
    }

    private getDailyLeaderboardData(): LeaderboardEntry[] {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;

        const history = JSON.parse(localStorage.getItem('aimchain_cod_history') || '[]');
        const todaySessions = history.filter((s: any) => s.timestamp >= oneDayAgo);

        const playerBest: Record<string, any> = {};

        todaySessions.forEach((session: any) => {
            const wallet = session.walletAddress || '0x' + Math.random().toString(16).slice(2, 42);
            if (!playerBest[wallet] || session.score > playerBest[wallet].score) {
                playerBest[wallet] = session;
            }
        });

        const entries: LeaderboardEntry[] = Object.keys(playerBest).map(wallet => {
            const session = playerBest[wallet];
            return {
                rank: 0,
                username: 'Player_' + wallet.slice(2, 8),
                walletAddress: wallet,
                score: session.score,
                accuracy: session.accuracy,
                bullseyes: session.bullseyes,
                tokens: Math.floor(session.score / 10),
                sessions: todaySessions.filter((s: any) => (s.walletAddress || '0x') === wallet).length,
                timestamp: session.timestamp
            };
        });

        entries.sort((a, b) => b.score - a.score);
        entries.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        return entries.slice(0, 50);
    }

    private getWeeklyLeaderboardData(): LeaderboardEntry[] {
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        const history = JSON.parse(localStorage.getItem('aimchain_cod_history') || '[]');
        const weekSessions = history.filter((s: any) => s.timestamp >= oneWeekAgo);

        const playerBest: Record<string, any> = {};

        weekSessions.forEach((session: any) => {
            const wallet = session.walletAddress || '0x' + Math.random().toString(16).slice(2, 42);
            if (!playerBest[wallet] || session.score > playerBest[wallet].score) {
                playerBest[wallet] = session;
            }
        });

        const entries: LeaderboardEntry[] = Object.keys(playerBest).map(wallet => {
            const session = playerBest[wallet];
            return {
                rank: 0,
                username: 'Player_' + wallet.slice(2, 8),
                walletAddress: wallet,
                score: session.score,
                accuracy: session.accuracy,
                bullseyes: session.bullseyes,
                tokens: Math.floor(session.score / 10),
                sessions: weekSessions.filter((s: any) => (s.walletAddress || '0x') === wallet).length,
                timestamp: session.timestamp
            };
        });

        entries.sort((a, b) => b.score - a.score);
        entries.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        return entries.slice(0, 50);
    }

    private getPersonalStats(): PersonalStats {
        const history = JSON.parse(localStorage.getItem('aimchain_cod_history') || '[]');
        const best = JSON.parse(localStorage.getItem('aimchain_cod_best') || '{}');

        if (history.length === 0) {
            return {
                totalSessions: 0,
                careerHighScore: 0,
                averageAccuracy: 0,
                totalBullseyes: 0,
                totalShots: 0,
                playTimeMinutes: 0,
                tokensEarned: 0
            };
        }

        const totalAccuracy = history.reduce((sum: number, s: any) => sum + s.accuracy, 0);
        const totalBullseyes = history.reduce((sum: number, s: any) => sum + s.bullseyes, 0);
        const totalShots = history.reduce((sum: number, s: any) => sum + s.shotsFired, 0);

        return {
            totalSessions: history.length,
            careerHighScore: best.score || 0,
            averageAccuracy: totalAccuracy / history.length,
            totalBullseyes: totalBullseyes,
            totalShots: totalShots,
            playTimeMinutes: history.length * 1, // 1 min per session
            tokensEarned: history.reduce((sum: number, s: any) => sum + Math.floor(s.score / 10), 0)
        };
    }

    private createCloseButton(x: number, y: number) {
        const btn = this.add.container(x, y);

        const bg = this.add.circle(0, 0, 22, 0xff4444);
        bg.setInteractive({ useHandCursor: true });
        btn.add(bg);

        const icon = this.add.text(0, 0, '✕', {
            fontSize: '26px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        btn.add(icon);

        bg.on('pointerover', () => {
            bg.setFillStyle(0xff6666);
            this.tweens.add({
                targets: btn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0xff4444);
            this.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        bg.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('MainMenu');
        });

        return btn;
    }
}