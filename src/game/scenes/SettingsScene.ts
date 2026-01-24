import Phaser, { Scene } from 'phaser';
import { settingsApplier, GameSettings } from '../../utils/SettingsApplier';

export class SettingsScene extends Scene {
    private currentTab: string = 'gameplay';
    private settings!: GameSettings;
    private defaultSettings!: GameSettings;
    private hasUnsavedChanges: boolean = false;

    // UI containers
    private tabButtons: Map<string, Phaser.GameObjects.Container> = new Map();
    private contentContainer!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'SettingsScene' });
    }

    init() {
        this.defaultSettings = this.getDefaultSettings();
        this.loadSettings();
    }

    private getDefaultSettings(): GameSettings {
        return {
            gameplay: {
                mouseSensitivity: 0.002,
                crosshairStyle: 'classic',
                crosshairColor: 0xffffff,
                fov: 85,
                showHitMarkers: true,
                damageNumbers: true,
                sessionDuration: 60
            },
            graphics: {
                qualityPreset: 'high',
                frameRateLimit: 60,
                shadows: 'medium',
                particleQuality: 'medium',
                showFPS: false,
                vsync: false
            },
            audio: {
                masterVolume: 80,
                gunshotVolume: 100,
                hitSoundVolume: 90,
                uiSoundVolume: 70,
                backgroundMusic: false
            },
            controls: {
                invertMouseY: false,
                rawMouseInput: true,
                keybindings: {
                    shoot: 'leftmouse',
                    ads: 'rightmouse',
                    reload: 'R',
                    pause: 'ESC',
                    lock: 'CTRL'
                }
            }
        };
    }

    private loadSettings() {
        const saved = localStorage.getItem('aimchain_settings_v1');
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load settings:', e);
                this.settings = this.defaultSettings;
            }
        } else {
            this.settings = this.defaultSettings;
        }
    }

    private saveSettings() {
        localStorage.setItem('aimchain_settings_v1', JSON.stringify(this.settings));
        this.hasUnsavedChanges = false;

        // Apply all settings to the game immediately
        settingsApplier.updateSettings(this.settings);
        settingsApplier.applyAllSettings();
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark background overlay
        const bg = this.add.rectangle(0, 0, width, height, 0x0a0a0a, 0.95).setOrigin(0);
        bg.setInteractive();

        // Main settings panel
        const panelWidth = 900;
        const panelHeight = 600;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x1a2a1a).setOrigin(0);
        panel.setStrokeStyle(4, 0xffdd00);

        // Header
        const headerBg = this.add.rectangle(panelX, panelY, panelWidth, 70, 0x2a3a1e).setOrigin(0);
        const title = this.add.text(width / 2, panelY + 35, '⚙️ SETTINGS', {
            fontSize: '36px',
            color: '#ffdd00',
            fontFamily: 'Arial Black',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Close button
        const closeBtn = this.createCloseButton(panelX + panelWidth - 50, panelY + 35);

        // Tabs sidebar
        const tabWidth = 180;
        this.createTabsSidebar(panelX + 20, panelY + 90, tabWidth, panelHeight - 160);

        // Content area
        this.contentContainer = this.add.container(panelX + tabWidth + 40, panelY + 90);
        this.renderCurrentTab();

        // Save button
        this.createSaveButton(width / 2, panelY + panelHeight - 40);

        // Reset button
        this.createResetButton(panelX + 120, panelY + panelHeight - 40);
    }

    private createTabsSidebar(x: number, y: number, width: number, height: number) {
        const tabs = [
            { id: 'gameplay', label: 'GAMEPLAY', icon: '🎮' },
            { id: 'graphics', label: 'GRAPHICS', icon: '🖥️' },
            { id: 'audio', label: 'AUDIO', icon: '🔊' },
            { id: 'controls', label: 'CONTROLS', icon: '⌨️' }
        ];

        tabs.forEach((tab, index) => {
            const tabY = y + index * 70;
            const tabContainer = this.createTabButton(x, tabY, width - 20, 60, tab);
            this.tabButtons.set(tab.id, tabContainer);
        });
    }

    private createTabButton(x: number, y: number, width: number, height: number, tab: any): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, width, height, 0x2a3a1e).setOrigin(0);
        bg.setInteractive({ useHandCursor: true });
        container.add(bg);

        const icon = this.add.text(15, height / 2, tab.icon, {
            fontSize: '24px'
        }).setOrigin(0, 0.5);
        container.add(icon);

        const label = this.add.text(55, height / 2, tab.label, {
            fontSize: '16px',
            color: '#cccccc',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        container.add(label);

        // Active indicator
        const indicator = this.add.rectangle(0, 0, 4, height, 0xffdd00).setOrigin(0);
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
            case 'gameplay':
                this.renderGameplaySettings();
                break;
            case 'graphics':
                this.renderGraphicsSettings();
                break;
            case 'audio':
                this.renderAudioSettings();
                break;
            case 'controls':
                this.renderControlsSettings();
                break;
        }
    }

    private renderGameplaySettings() {
        const contentWidth = 650;
        let yOffset = 0;

        // Mouse Sensitivity
        this.createSettingRow('Mouse Sensitivity', 0, yOffset, contentWidth, () => {
            const value = this.settings.gameplay.mouseSensitivity;
            return this.createSlider(320, yOffset + 20, 300, 0.0005, 0.01, value, 0.0001, (newValue) => {
                this.settings.gameplay.mouseSensitivity = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('gameplay.mouseSensitivity', newValue);
            }, (v) => v.toFixed(4));
        }, 'Controls how fast camera rotates with mouse');
        yOffset += 70;

        // FOV
        this.createSettingRow('Field of View', 0, yOffset, contentWidth, () => {
            const value = this.settings.gameplay.fov;
            return this.createSlider(320, yOffset + 20, 300, 70, 110, value, 1, (newValue) => {
                this.settings.gameplay.fov = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('gameplay.fov', newValue);
            }, (v) => v.toString() + '°');
        }, 'Wider = more view, but more distortion');
        yOffset += 70;

        // Crosshair Style
        this.createSettingRow('Crosshair Style', 0, yOffset, contentWidth, () => {
            const options = ['Classic', 'Dot', 'Circle', 'T-Shape'];
            return this.createDropdown(320, yOffset + 15, 300, options, this.settings.gameplay.crosshairStyle, (newValue) => {
                this.settings.gameplay.crosshairStyle = newValue.toLowerCase();
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('gameplay.crosshairStyle', newValue.toLowerCase());
            });
        });
        yOffset += 60;

        // Crosshair Color
        this.createSettingRow('Crosshair Color', 0, yOffset, contentWidth, () => {
            const colors = [
                { name: 'White', value: 0xffffff },
                { name: 'Cyan', value: 0x00ffff },
                { name: 'Green', value: 0x00ff00 },
                { name: 'Red', value: 0xff0000 },
                { name: 'Yellow', value: 0xffff00 }
            ];
            return this.createColorPicker(320, yOffset + 15, colors, this.settings.gameplay.crosshairColor, (newValue) => {
                this.settings.gameplay.crosshairColor = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('gameplay.crosshairColor', newValue);
            });
        });
        yOffset += 60;

        // Session Duration
        this.createSettingRow('Session Duration', 0, yOffset, contentWidth, () => {
            const options = ['30s', '60s', '3 min', '5 min'];
            const durations = [30, 60, 180, 300];
            const currentIndex = durations.indexOf(this.settings.gameplay.sessionDuration);
            return this.createDropdown(320, yOffset + 15, 300, options, options[currentIndex], (newValue) => {
                const index = options.indexOf(newValue);
                this.settings.gameplay.sessionDuration = durations[index];
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('gameplay.sessionDuration', durations[index]);
            });
        });
        yOffset += 60;

        // Hit Markers Toggle
        this.createSettingRow('Show Hit Markers', 0, yOffset, contentWidth, () => {
            return this.createToggle(320, yOffset + 15, this.settings.gameplay.showHitMarkers, (newValue) => {
                this.settings.gameplay.showHitMarkers = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('gameplay.showHitMarkers', newValue);
            });
        }, 'Visual confirmation on hit');
        yOffset += 60;

        // Damage Numbers Toggle
        this.createSettingRow('Damage Numbers', 0, yOffset, contentWidth, () => {
            return this.createToggle(320, yOffset + 15, this.settings.gameplay.damageNumbers, (newValue) => {
                this.settings.gameplay.damageNumbers = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('gameplay.damageNumbers', newValue);
            });
        }, 'Show floating score at hit location');
    }

    private renderGraphicsSettings() {
        const contentWidth = 650;
        let yOffset = 0;

        // Quality Preset
        this.createSettingRow('Quality Preset', 0, yOffset, contentWidth, () => {
            const options = ['Low', 'Medium', 'High', 'Ultra'];
            return this.createDropdown(320, yOffset + 15, 300, options, this.capitalizeFirst(this.settings.graphics.qualityPreset), (newValue) => {
                this.settings.graphics.qualityPreset = newValue.toLowerCase();
                this.applyQualityPreset(newValue.toLowerCase());
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('graphics.qualityPreset', newValue.toLowerCase());
            });
        }, 'Automatically adjusts all settings');
        yOffset += 70;

        // Frame Rate Limit
        this.createSettingRow('FPS Limit', 0, yOffset, contentWidth, () => {
            const options = ['30 FPS', '60 FPS', '120 FPS', '144 FPS', 'Unlimited'];
            const fps = [30, 60, 120, 144, 999];
            const currentIndex = fps.indexOf(this.settings.graphics.frameRateLimit);
            return this.createDropdown(320, yOffset + 15, 300, options, options[currentIndex], (newValue) => {
                const index = options.indexOf(newValue);
                this.settings.graphics.frameRateLimit = fps[index];
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('graphics.frameRateLimit', fps[index]);
            });
        }, 'Cap maximum frame rate');
        yOffset += 70;

        // Shadows
        this.createSettingRow('Shadows', 0, yOffset, contentWidth, () => {
            const options = ['Off', 'Low', 'Medium', 'High', 'Ultra'];
            return this.createDropdown(320, yOffset + 15, 300, options, this.capitalizeFirst(this.settings.graphics.shadows), (newValue) => {
                this.settings.graphics.shadows = newValue.toLowerCase();
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('graphics.shadows', newValue.toLowerCase());
            });
        }, 'High impact on performance');
        yOffset += 70;

        // Particle Quality
        this.createSettingRow('Particle Quality', 0, yOffset, contentWidth, () => {
            const options = ['Low', 'Medium', 'High'];
            return this.createDropdown(320, yOffset + 15, 300, options, this.capitalizeFirst(this.settings.graphics.particleQuality), (newValue) => {
                this.settings.graphics.particleQuality = newValue.toLowerCase();
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('graphics.particleQuality', newValue.toLowerCase());
            });
        }, 'Muzzle flash, shells, impacts');
        yOffset += 70;

        // Show FPS
        this.createSettingRow('Show FPS Counter', 0, yOffset, contentWidth, () => {
            return this.createToggle(320, yOffset + 15, this.settings.graphics.showFPS, (newValue) => {
                this.settings.graphics.showFPS = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('graphics.showFPS', newValue);
            });
        }, 'Display FPS in top-left');
        yOffset += 60;

        // VSync
        this.createSettingRow('VSync', 0, yOffset, contentWidth, () => {
            return this.createToggle(320, yOffset + 15, this.settings.graphics.vsync, (newValue) => {
                this.settings.graphics.vsync = newValue;
                this.hasUnsavedChanges = true;
            });
        }, 'Prevents tearing but adds input lag');
    }

    private renderAudioSettings() {
        const contentWidth = 650;
        let yOffset = 0;

        // Master Volume
        this.createSettingRow('Master Volume', 0, yOffset, contentWidth, () => {
            const value = this.settings.audio.masterVolume;
            return this.createSlider(320, yOffset + 20, 300, 0, 100, value, 1, (newValue) => {
                this.settings.audio.masterVolume = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('audio.masterVolume', newValue);
            }, (v) => v.toString() + '%');
        }, 'Overall volume control');
        yOffset += 70;

        // Gunshot Volume
        this.createSettingRow('Gunshot Volume', 0, yOffset, contentWidth, () => {
            const value = this.settings.audio.gunshotVolume;
            return this.createSlider(320, yOffset + 20, 300, 0, 100, value, 1, (newValue) => {
                this.settings.audio.gunshotVolume = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('audio.gunshotVolume', newValue);
            }, (v) => v.toString() + '%');
        }, 'Weapon firing sounds');
        yOffset += 70;

        // Hit Sound Volume
        this.createSettingRow('Hit Sound Volume', 0, yOffset, contentWidth, () => {
            const value = this.settings.audio.hitSoundVolume;
            return this.createSlider(320, yOffset + 20, 300, 0, 100, value, 1, (newValue) => {
                this.settings.audio.hitSoundVolume = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('audio.hitSoundVolume', newValue);
            }, (v) => v.toString() + '%');
        }, 'Target hit confirmation');
        yOffset += 70;

        // UI Sound Volume
        this.createSettingRow('UI Sound Volume', 0, yOffset, contentWidth, () => {
            const value = this.settings.audio.uiSoundVolume;
            return this.createSlider(320, yOffset + 20, 300, 0, 100, value, 1, (newValue) => {
                this.settings.audio.uiSoundVolume = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('audio.uiSoundVolume', newValue);
            }, (v) => v.toString() + '%');
        }, 'Menu clicks, notifications');
        yOffset += 70;

        // Background Music
        this.createSettingRow('Background Music', 0, yOffset, contentWidth, () => {
            return this.createToggle(320, yOffset + 15, this.settings.audio.backgroundMusic, (newValue) => {
                this.settings.audio.backgroundMusic = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('audio.backgroundMusic', newValue);
            });
        }, 'Ambient music during training');
    }

    private renderControlsSettings() {
        const contentWidth = 650;
        let yOffset = 0;

        // Invert Mouse Y
        this.createSettingRow('Invert Mouse Y', 0, yOffset, contentWidth, () => {
            return this.createToggle(320, yOffset + 15, this.settings.controls.invertMouseY, (newValue) => {
                this.settings.controls.invertMouseY = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('controls.invertMouseY', newValue);
            });
        }, 'Flight sim style aiming');
        yOffset += 60;

        // Raw Mouse Input
        this.createSettingRow('Raw Mouse Input', 0, yOffset, contentWidth, () => {
            return this.createToggle(320, yOffset + 15, this.settings.controls.rawMouseInput, (newValue) => {
                this.settings.controls.rawMouseInput = newValue;
                this.hasUnsavedChanges = true;
                settingsApplier.applySetting('controls.rawMouseInput', newValue);
            });
        }, 'Bypass OS settings (competitive)');
        yOffset += 70;

        // Key Bindings Section
        const keybindTitle = this.add.text(0, yOffset, 'KEY BINDINGS', {
            fontSize: '18px',
            color: '#ffdd00',
            fontStyle: 'bold'
        });
        this.contentContainer.add(keybindTitle);
        yOffset += 40;

        const bindings = [
            { action: 'Shoot', key: 'shoot', display: 'Left Mouse' },
            { action: 'ADS', key: 'ads', display: 'Right Mouse' },
            { action: 'Reload', key: 'reload', display: this.settings.controls.keybindings.reload },
            { action: 'Pause', key: 'pause', display: this.settings.controls.keybindings.pause },
            { action: 'Lock Cursor', key: 'lock', display: this.settings.controls.keybindings.lock }
        ];

        bindings.forEach(binding => {
            this.createKeybindRow(binding.action, binding.display, 0, yOffset, contentWidth);
            yOffset += 45;
        });
    }

    private createSettingRow(
        label: string,
        x: number,
        y: number,
        width: number,
        controlFactory?: () => Phaser.GameObjects.Container | null,
        description?: string
    ) {
        const labelText = this.add.text(x, y, label, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        this.contentContainer.add(labelText);

        if (description) {
            const descText = this.add.text(x, y + 22, description, {
                fontSize: '12px',
                color: '#888888'
            });
            this.contentContainer.add(descText);
        }

        if (controlFactory) {
            const control = controlFactory();
            if (control) {
                this.contentContainer.add(control);
            }
        }
    }

    private createSlider(
        x: number,
        y: number,
        width: number,
        min: number,
        max: number,
        value: number,
        step: number,
        onChange: (value: number) => void,
        formatValue: (value: number) => string
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // Track
        const track = this.add.rectangle(0, 0, width, 4, 0x3a3a3a).setOrigin(0, 0.5);
        container.add(track);

        // Progress
        const progress = this.add.rectangle(0, 0, 0, 4, 0xffdd00).setOrigin(0, 0.5);
        container.add(progress);

        // Handle
        const handle = this.add.circle(0, 0, 8, 0xffdd00);
        handle.setStrokeStyle(2, 0xffffff);
        handle.setInteractive({ draggable: true, useHandCursor: true });
        container.add(handle);

        // Value text
        const valueText = this.add.text(width + 15, 0, formatValue(value), {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        container.add(valueText);

        // Update position based on value
        const updatePosition = (val: number) => {
            const percent = (val - min) / (max - min);
            const handleX = percent * width;
            handle.x = handleX;
            progress.width = handleX;
            valueText.setText(formatValue(val));
        };

        updatePosition(value);

        let isDragging = false;

        handle.on('drag', (pointer: Phaser.Input.Pointer) => {
            isDragging = true;
            const localX = pointer.x - container.x - container.parentContainer!.x;
            const percent = Phaser.Math.Clamp(localX / width, 0, 1);
            let newValue = min + percent * (max - min);
            newValue = Math.round(newValue / step) * step;
            updatePosition(newValue);
            onChange(newValue);
        });

        track.setInteractive({ useHandCursor: true });
        track.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const localX = pointer.x - container.x - container.parentContainer!.x;
            const percent = Phaser.Math.Clamp(localX / width, 0, 1);
            let newValue = min + percent * (max - min);
            newValue = Math.round(newValue / step) * step;
            updatePosition(newValue);
            onChange(newValue);
        });

        return container;
    }

    private createToggle(x: number, y: number, value: boolean, onChange: (value: boolean) => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const width = 50;
        const height = 24;

        // Background
        const bg = this.add.rectangle(0, 0, width, height, value ? 0x4ade80 : 0x3a3a3a, 1).setOrigin(0, 0.5);
        bg.setStrokeStyle(2, 0x666666);
        bg.setInteractive({ useHandCursor: true });
        container.add(bg);

        // Handle
        const handle = this.add.circle(value ? width - 12 : 12, 0, 10, 0xffffff);
        container.add(handle);

        // Status text
        const statusText = this.add.text(width + 15, 0, value ? 'ON' : 'OFF', {
            fontSize: '14px',
            color: value ? '#4ade80' : '#888888',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        container.add(statusText);

        bg.on('pointerdown', () => {
            const newValue = !value;
            value = newValue;

            // Animate toggle
            this.tweens.add({
                targets: handle,
                x: newValue ? width - 12 : 12,
                duration: 150,
                ease: 'Cubic.easeOut'
            });

            bg.setFillStyle(newValue ? 0x4ade80 : 0x3a3a3a);
            statusText.setText(newValue ? 'ON' : 'OFF');
            statusText.setColor(newValue ? '#4ade80' : '#888888');

            onChange(newValue);
        });

        return container;
    }

    private createDropdown(
        x: number,
        y: number,
        width: number,
        options: string[],
        currentValue: string,
        onChange: (value: string) => void
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // Background
        const bg = this.add.rectangle(0, 0, width, 35, 0x2a3a1e).setOrigin(0, 0);
        bg.setStrokeStyle(2, 0x6b7c5f);
        bg.setInteractive({ useHandCursor: true });
        container.add(bg);

        // Current value text
        const valueText = this.add.text(10, 17, currentValue, {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        container.add(valueText);

        // Dropdown arrow
        const arrow = this.add.text(width - 20, 17, '▼', {
            fontSize: '12px',
            color: '#ffdd00'
        }).setOrigin(0.5);
        container.add(arrow);

        let isOpen = false;
        let dropdownMenu: Phaser.GameObjects.Container | null = null;

        bg.on('pointerdown', () => {
            if (isOpen && dropdownMenu) {
                dropdownMenu.destroy();
                dropdownMenu = null;
                isOpen = false;
                arrow.setText('▼');
            } else {
                // Create dropdown menu
                dropdownMenu = this.add.container(x, y + 40);
                dropdownMenu.setDepth(1000);
                this.contentContainer.add(dropdownMenu);

                const menuBg = this.add.rectangle(0, 0, width, options.length * 35, 0x1a2a1a).setOrigin(0, 0);
                menuBg.setStrokeStyle(2, 0xffdd00);
                dropdownMenu.add(menuBg);

                options.forEach((option, i) => {
                    const optionBg = this.add.rectangle(2, i * 35 + 2, width - 4, 31, 0x2a3a1e).setOrigin(0, 0);
                    optionBg.setInteractive({ useHandCursor: true });
                    dropdownMenu!.add(optionBg);

                    const optionText = this.add.text(10, i * 35 + 17, option, {
                        fontSize: '14px',
                        color: option === currentValue ? '#ffdd00' : '#cccccc'
                    }).setOrigin(0, 0.5);
                    dropdownMenu!.add(optionText);

                    optionBg.on('pointerover', () => {
                        optionBg.setFillStyle(0x3a4a2e);
                        optionText.setColor('#ffffff');
                    });

                    optionBg.on('pointerout', () => {
                        optionBg.setFillStyle(0x2a3a1e);
                        optionText.setColor(option === currentValue ? '#ffdd00' : '#cccccc');
                    });

                    optionBg.on('pointerdown', () => {
                        valueText.setText(option);
                        onChange(option);
                        dropdownMenu!.destroy();
                        dropdownMenu = null;
                        isOpen = false;
                        arrow.setText('▼');
                    });
                });

                isOpen = true;
                arrow.setText('▲');
            }
        });

        return container;
    }

    private createColorPicker(
        x: number,
        y: number,
        colors: Array<{ name: string; value: number }>,
        currentColor: number,
        onChange: (value: number) => void
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        colors.forEach((color, i) => {
            const colorBox = this.add.rectangle(i * 45, 0, 35, 35, color.value);
            colorBox.setStrokeStyle(currentColor === color.value ? 4 : 2, currentColor === color.value ? 0xffdd00 : 0x666666);
            colorBox.setInteractive({ useHandCursor: true });
            container.add(colorBox);

            colorBox.on('pointerdown', () => {
                // Reset all borders
                container.each((child: any) => {
                    if (child instanceof Phaser.GameObjects.Rectangle) {
                        child.setStrokeStyle(2, 0x666666);
                    }
                });
                // Highlight selected
                colorBox.setStrokeStyle(4, 0xffdd00);
                onChange(color.value);
            });
        });

        return container;
    }

    private createKeybindRow(action: string, key: string, x: number, y: number, width: number) {
        const labelText = this.add.text(x, y, action, {
            fontSize: '14px',
            color: '#cccccc'
        });
        this.contentContainer.add(labelText);

        const keyBox = this.add.rectangle(320, y, 100, 30, 0x2a3a1e).setOrigin(0, 0);
        keyBox.setStrokeStyle(2, 0x6b7c5f);
        this.contentContainer.add(keyBox);

        const keyText = this.add.text(370, y + 15, key, {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.contentContainer.add(keyText);
    }

    private createSaveButton(x: number, y: number) {
        const btn = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 280, 50, 0x4ade80);
        bg.setStrokeStyle(3, 0x2a8a50);
        bg.setInteractive({ useHandCursor: true });
        btn.add(bg);

        const label = this.add.text(0, 0, '💾 SAVE & APPLY', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial Black',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        btn.add(label);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x5aee90);
            this.tweens.add({
                targets: btn,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x4ade80);
            this.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        bg.on('pointerdown', () => {
            this.saveSettings();
            this.showSaveConfirmation();
        });
    }

    private createResetButton(x: number, y: number) {
        const btn = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 200, 45, 0x3a3a3a);
        bg.setStrokeStyle(2, 0x666666);
        bg.setInteractive({ useHandCursor: true });
        btn.add(bg);

        const label = this.add.text(0, 0, '↺ RESET', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        btn.add(label);

        bg.on('pointerover', () => {
            bg.setFillStyle(0xff6b6b);
            label.setColor('#000000');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x3a3a3a);
            label.setColor('#ffffff');
        });

        bg.on('pointerdown', () => {
            this.showResetConfirmation();
        });
    }

    private createCloseButton(x: number, y: number) {
        const btn = this.add.container(x, y);

        const bg = this.add.circle(0, 0, 20, 0xff4444);
        bg.setInteractive({ useHandCursor: true });
        btn.add(bg);

        const icon = this.add.text(0, 0, '✕', {
            fontSize: '24px',
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
            if (this.hasUnsavedChanges) {
                this.showUnsavedWarning();
            } else {
                this.scene.stop();
                this.scene.resume('MainMenu');
            }
        });

        return btn;
    }

    private showSaveConfirmation() {
        const { width, height } = this.cameras.main;

        const confirm = this.add.text(width / 2, height - 100, '✓ Settings Saved Successfully!', {
            fontSize: '18px',
            color: '#4ade80',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(2000);

        this.tweens.add({
            targets: confirm,
            alpha: 0,
            y: height - 140,
            duration: 2000,
            delay: 1000,
            onComplete: () => confirm.destroy()
        });
    }

    private showResetConfirmation() {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0).setDepth(1500);
        overlay.setInteractive();

        const panel = this.add.rectangle(width / 2, height / 2, 450, 220, 0x2a3a1e).setDepth(1501);
        panel.setStrokeStyle(3, 0xffdd00);

        const title = this.add.text(width / 2, height / 2 - 60, '⚠️ RESET ALL SETTINGS?', {
            fontSize: '22px',
            color: '#ffdd00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1501);

        const message = this.add.text(width / 2, height / 2 - 20, 'This will restore all settings\nto their default values.', {
            fontSize: '16px',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5).setDepth(1501);

        const yesBtn = this.createModalButton(width / 2 - 70, height / 2 + 50, 120, 'YES', 0xff4444, () => {
            this.settings = this.defaultSettings;
            this.saveSettings();
            this.renderCurrentTab();
            [overlay, panel, title, message, yesBtn, noBtn].forEach(obj => obj.destroy());
        });
        yesBtn.setDepth(1501);

        const noBtn = this.createModalButton(width / 2 + 70, height / 2 + 50, 120, 'NO', 0x4ade80, () => {
            [overlay, panel, title, message, yesBtn, noBtn].forEach(obj => obj.destroy());
        });
        noBtn.setDepth(1501);
    }

    private showUnsavedWarning() {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0).setDepth(1500);
        overlay.setInteractive();

        const panel = this.add.rectangle(width / 2, height / 2, 450, 220, 0x2a3a1e).setDepth(1501);
        panel.setStrokeStyle(3, 0xffdd00);

        const title = this.add.text(width / 2, height / 2 - 60, '⚠️ UNSAVED CHANGES', {
            fontSize: '22px',
            color: '#ffdd00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1501);

        const message = this.add.text(width / 2, height / 2 - 20, 'You have unsaved changes.\nSave before exiting?', {
            fontSize: '16px',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5).setDepth(1501);

        const saveBtn = this.createModalButton(width / 2 - 70, height / 2 + 50, 120, 'SAVE', 0x4ade80, () => {
            this.saveSettings();
            [overlay, panel, title, message, saveBtn, discardBtn].forEach(obj => obj.destroy());
            this.scene.stop();
            this.scene.resume('MainMenu');
        });
        saveBtn.setDepth(1501);

        const discardBtn = this.createModalButton(width / 2 + 70, height / 2 + 50, 120, 'DISCARD', 0xff4444, () => {
            this.loadSettings();
            [overlay, panel, title, message, saveBtn, discardBtn].forEach(obj => obj.destroy());
            this.scene.stop();
            this.scene.resume('MainMenu');
        });
        discardBtn.setDepth(1501);
    }

    private createModalButton(x: number, y: number, width: number, text: string, color: number, onClick: () => void): Phaser.GameObjects.Container {
        const btn = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, width, 40, color);
        bg.setInteractive({ useHandCursor: true });
        btn.add(bg);

        const label = this.add.text(0, 0, text, {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        btn.add(label);

        bg.on('pointerover', () => {
            this.tweens.add({
                targets: btn,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            this.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        bg.on('pointerdown', onClick);

        return btn;
    }

    private applyQualityPreset(preset: string) {
        switch (preset) {
            case 'low':
                this.settings.graphics.shadows = 'off';
                this.settings.graphics.particleQuality = 'low';
                this.settings.graphics.frameRateLimit = 30;
                break;
            case 'medium':
                this.settings.graphics.shadows = 'low';
                this.settings.graphics.particleQuality = 'medium';
                this.settings.graphics.frameRateLimit = 60;
                break;
            case 'high':
                this.settings.graphics.shadows = 'medium';
                this.settings.graphics.particleQuality = 'medium';
                this.settings.graphics.frameRateLimit = 60;
                break;
            case 'ultra':
                this.settings.graphics.shadows = 'ultra';
                this.settings.graphics.particleQuality = 'high';
                this.settings.graphics.frameRateLimit = 144;
                break;
        }
        this.renderCurrentTab();
    }

    private capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public getSettings(): GameSettings {
        return this.settings;
    }
}
