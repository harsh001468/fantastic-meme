/**
 * SettingsApplier - Central hub for applying game settings in real-time
 * This utility connects settings changes to live game scenes without requiring restart
 */

import Phaser, { Scene } from 'phaser';

export interface GameSettings {
    gameplay: {
        mouseSensitivity: number;
        crosshairStyle: string;
        crosshairColor: number;
        fov: number;
        showHitMarkers: boolean;
        damageNumbers: boolean;
        sessionDuration: number;
    };
    graphics: {
        qualityPreset: string;
        frameRateLimit: number;
        shadows: string;
        particleQuality: string;
        showFPS: boolean;
        vsync: boolean;
    };
    audio: {
        masterVolume: number;
        gunshotVolume: number;
        hitSoundVolume: number;
        uiSoundVolume: number;
        backgroundMusic: boolean;
    };
    controls: {
        invertMouseY: boolean;
        rawMouseInput: boolean;
        keybindings: Record<string, string>;
    };
}

export class SettingsApplier {
    private static instance: SettingsApplier;
    private currentScene: Scene | null = null;
    private settings: GameSettings;

    private constructor() {
        this.settings = this.loadSettings();
    }

    public static getInstance(): SettingsApplier {
        if (!SettingsApplier.instance) {
            SettingsApplier.instance = new SettingsApplier();
        }
        return SettingsApplier.instance;
    }

    /**
     * Set the current active scene for applying settings
     */
    public setScene(scene: Scene) {
        this.currentScene = scene;
    }

    /**
     * Load settings from localStorage
     */
    public loadSettings(): GameSettings {
        const saved = localStorage.getItem('aimchain_settings_v1');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load settings:', e);
                return this.getDefaultSettings();
            }
        }
        return this.getDefaultSettings();
    }

    /**
     * Get current settings
     */
    public getSettings(): GameSettings {
        return this.settings;
    }

    /**
     * Update settings (in memory and localStorage)
     */
    public updateSettings(newSettings: GameSettings) {
        this.settings = newSettings;
        localStorage.setItem('aimchain_settings_v1', JSON.stringify(newSettings));
    }

    /**
     * Get default settings
     */
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

    // ==================== GAMEPLAY SETTINGS ====================

    /**
     * Apply mouse sensitivity (0.0005 to 0.01)
     * Used in mouse movement handler in training scenes
     */
    public applyMouseSensitivity(sensitivity: number) {
        this.settings.gameplay.mouseSensitivity = sensitivity;

        // Update active training scene if present
        if (this.currentScene && 'mouseSensitivity' in this.currentScene) {
            (this.currentScene as any).mouseSensitivity = sensitivity;
        }
    }

    /**
     * Apply crosshair style
     * Styles: 'classic', 'dot', 'circle', 't-shape'
     */
    public applyCrosshairStyle(style: string) {
        this.settings.gameplay.crosshairStyle = style;

        // Update crosshair in active scene
        if (this.currentScene && 'updateCrosshair' in this.currentScene) {
            (this.currentScene as any).updateCrosshair();
        }
    }

    /**
     * Apply crosshair color
     */
    public applyCrosshairColor(color: number) {
        this.settings.gameplay.crosshairColor = color;

        // Update crosshair in active scene
        if (this.currentScene && 'updateCrosshair' in this.currentScene) {
            (this.currentScene as any).updateCrosshair();
        }
    }

    /**
     * Apply FOV (field of view) - 70 to 110 degrees
     * Note: Phaser uses orthographic camera by default, FOV is simulated via zoom
     */
    public applyFOV(fov: number) {
        this.settings.gameplay.fov = fov;

        // Calculate zoom based on FOV (higher FOV = lower zoom for wider view)
        const zoom = 1 - ((fov - 85) / 100); // 85 is baseline

        if (this.currentScene && this.currentScene.cameras.main) {
            this.currentScene.cameras.main.setZoom(zoom);
        }
    }

    /**
     * Toggle hit markers display
     */
    public applyShowHitMarkers(enabled: boolean) {
        this.settings.gameplay.showHitMarkers = enabled;
        // Applied automatically in hit detection logic
    }

    /**
     * Toggle damage numbers display
     */
    public applyDamageNumbers(enabled: boolean) {
        this.settings.gameplay.damageNumbers = enabled;
        // Applied automatically in damage calculation
    }

    /**
     * Apply session duration (30, 60, 180, 300 seconds or Infinity for endless)
     */
    public applySessionDuration(duration: number) {
        this.settings.gameplay.sessionDuration = duration;

        // Update timer in active training scene
        if (this.currentScene && 'updateSessionDuration' in this.currentScene) {
            (this.currentScene as any).updateSessionDuration(duration);
        }
    }

    // ==================== GRAPHICS SETTINGS ====================

    /**
     * Apply quality preset (batch-updates multiple graphics settings)
     */
    public applyQualityPreset(preset: string) {
        this.settings.graphics.qualityPreset = preset;

        const presets: Record<string, Partial<GameSettings['graphics']>> = {
            low: {
                frameRateLimit: 30,
                shadows: 'off',
                particleQuality: 'low',
                showFPS: false
            },
            medium: {
                frameRateLimit: 60,
                shadows: 'low',
                particleQuality: 'medium',
                showFPS: false
            },
            high: {
                frameRateLimit: 60,
                shadows: 'medium',
                particleQuality: 'high',
                showFPS: false
            },
            ultra: {
                frameRateLimit: 120,
                shadows: 'high',
                particleQuality: 'high',
                showFPS: false
            }
        };

        const config = presets[preset.toLowerCase()];
        if (config) {
            Object.assign(this.settings.graphics, config);

            // Apply individual settings
            if (config.frameRateLimit) this.applyFrameRateLimit(config.frameRateLimit);
            if (config.shadows) this.applyShadows(config.shadows);
            if (config.particleQuality) this.applyParticleQuality(config.particleQuality);
        }
    }

    /**
     * Apply frame rate limit (30, 60, 120, 144, or 0 for unlimited)
     */
    public applyFrameRateLimit(fps: number) {
        this.settings.graphics.frameRateLimit = fps;

        if (this.currentScene && this.currentScene.game) {
            const targetFPS = fps === 0 ? 240 : fps; // 0 = unlimited (use 240 as max)
            this.currentScene.game.loop.targetFps = targetFPS;
        }
    }

    /**
     * Apply shadow quality
     */
    public applyShadows(quality: string) {
        this.settings.graphics.shadows = quality;

        // Phaser doesn't have native shadows, but we can control particle/visual effects
        // This affects visual complexity in scenes
        if (this.currentScene && 'updateShadowQuality' in this.currentScene) {
            (this.currentScene as any).updateShadowQuality(quality);
        }
    }

    /**
     * Apply particle quality (affects particle count and detail)
     */
    public applyParticleQuality(quality: string) {
        this.settings.graphics.particleQuality = quality;

        // Control particle emission rates and max particles
        if (this.currentScene && 'updateParticleQuality' in this.currentScene) {
            (this.currentScene as any).updateParticleQuality(quality);
        }
    }

    /**
     * Toggle FPS counter display
     */
    public applyShowFPS(enabled: boolean) {
        this.settings.graphics.showFPS = enabled;

        // Show/hide FPS counter in all scenes
        if (this.currentScene) {
            if (enabled) {
                this.showFPSCounter();
            } else {
                this.hideFPSCounter();
            }
        }
    }

    /**
     * Toggle VSync (vertical sync)
     */
    public applyVSync(enabled: boolean) {
        this.settings.graphics.vsync = enabled;
        // Note: VSync is typically controlled by browser/OS, limited JS control
        // We can adjust frame timing but true VSync requires native support
    }

    // ==================== AUDIO SETTINGS ====================

    /**
     * Apply master volume (0-100)
     * Affects all sounds
     */
    public applyMasterVolume(volume: number) {
        this.settings.audio.masterVolume = volume;

        // Update all audio through AudioManager
        if (this.currentScene && this.currentScene.game.sound) {
            const volumePercent = volume / 100;
            // Phaser global volume
            this.currentScene.game.sound.volume = volumePercent;
        }
    }

    /**
     * Apply gunshot volume (0-100)
     */
    public applyGunshotVolume(volume: number) {
        this.settings.audio.gunshotVolume = volume;
        // Applied when gunshot sound plays (scaled by master volume)
    }

    /**
     * Apply hit sound volume (0-100)
     */
    public applyHitSoundVolume(volume: number) {
        this.settings.audio.hitSoundVolume = volume;
        // Applied when hit sound plays
    }

    /**
     * Apply UI sound volume (0-100)
     */
    public applyUISoundVolume(volume: number) {
        this.settings.audio.uiSoundVolume = volume;
        // Applied to button clicks and menu sounds
    }

    /**
     * Toggle background music
     */
    public applyBackgroundMusic(enabled: boolean) {
        this.settings.audio.backgroundMusic = enabled;

        if (this.currentScene && 'toggleBackgroundMusic' in this.currentScene) {
            (this.currentScene as any).toggleBackgroundMusic(enabled);
        }
    }

    // ==================== CONTROL SETTINGS ====================

    /**
     * Toggle invert mouse Y-axis
     */
    public applyInvertMouseY(inverted: boolean) {
        this.settings.controls.invertMouseY = inverted;
        // Applied automatically in mouse movement handler
    }

    /**
     * Toggle raw mouse input
     */
    public applyRawMouseInput(enabled: boolean) {
        this.settings.controls.rawMouseInput = enabled;
        // Affects mouse acceleration/smoothing
    }

    /**
     * Update key binding
     */
    public applyKeybinding(action: string, key: string) {
        this.settings.controls.keybindings[action] = key;

        // Update key listeners in active scene
        if (this.currentScene && 'updateKeybindings' in this.currentScene) {
            (this.currentScene as any).updateKeybindings(this.settings.controls.keybindings);
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Apply a single setting by key path
     * Example: applySetting('gameplay.mouseSensitivity', 0.005)
     */
    public applySetting(keyPath: string, value: any) {
        const keys = keyPath.split('.');
        const category = keys[0];
        const setting = keys[1];

        // Update settings object
        if (category in this.settings && setting in (this.settings as any)[category]) {
            (this.settings as any)[category][setting] = value;
            localStorage.setItem('aimchain_settings_v1', JSON.stringify(this.settings));
        }

        // Apply the setting based on category and key
        switch (keyPath) {
            // Gameplay
            case 'gameplay.mouseSensitivity':
                this.applyMouseSensitivity(value);
                break;
            case 'gameplay.crosshairStyle':
                this.applyCrosshairStyle(value);
                break;
            case 'gameplay.crosshairColor':
                this.applyCrosshairColor(value);
                break;
            case 'gameplay.fov':
                this.applyFOV(value);
                break;
            case 'gameplay.showHitMarkers':
                this.applyShowHitMarkers(value);
                break;
            case 'gameplay.damageNumbers':
                this.applyDamageNumbers(value);
                break;
            case 'gameplay.sessionDuration':
                this.applySessionDuration(value);
                break;

            // Graphics
            case 'graphics.qualityPreset':
                this.applyQualityPreset(value);
                break;
            case 'graphics.frameRateLimit':
                this.applyFrameRateLimit(value);
                break;
            case 'graphics.shadows':
                this.applyShadows(value);
                break;
            case 'graphics.particleQuality':
                this.applyParticleQuality(value);
                break;
            case 'graphics.showFPS':
                this.applyShowFPS(value);
                break;
            case 'graphics.vsync':
                this.applyVSync(value);
                break;

            // Audio
            case 'audio.masterVolume':
                this.applyMasterVolume(value);
                break;
            case 'audio.gunshotVolume':
                this.applyGunshotVolume(value);
                break;
            case 'audio.hitSoundVolume':
                this.applyHitSoundVolume(value);
                break;
            case 'audio.uiSoundVolume':
                this.applyUISoundVolume(value);
                break;
            case 'audio.backgroundMusic':
                this.applyBackgroundMusic(value);
                break;

            // Controls
            case 'controls.invertMouseY':
                this.applyInvertMouseY(value);
                break;
            case 'controls.rawMouseInput':
                this.applyRawMouseInput(value);
                break;
        }
    }

    /**
     * Apply all settings at once (on game start or scene load)
     */
    public applyAllSettings() {
        // Reload from localStorage in case changed externally
        this.settings = this.loadSettings();

        // Gameplay
        this.applyMouseSensitivity(this.settings.gameplay.mouseSensitivity);
        this.applyCrosshairStyle(this.settings.gameplay.crosshairStyle);
        this.applyCrosshairColor(this.settings.gameplay.crosshairColor);
        this.applyFOV(this.settings.gameplay.fov);
        this.applyShowHitMarkers(this.settings.gameplay.showHitMarkers);
        this.applyDamageNumbers(this.settings.gameplay.damageNumbers);
        this.applySessionDuration(this.settings.gameplay.sessionDuration);

        // Graphics
        this.applyFrameRateLimit(this.settings.graphics.frameRateLimit);
        this.applyShadows(this.settings.graphics.shadows);
        this.applyParticleQuality(this.settings.graphics.particleQuality);
        this.applyShowFPS(this.settings.graphics.showFPS);
        this.applyVSync(this.settings.graphics.vsync);

        // Audio
        this.applyMasterVolume(this.settings.audio.masterVolume);
        this.applyGunshotVolume(this.settings.audio.gunshotVolume);
        this.applyHitSoundVolume(this.settings.audio.hitSoundVolume);
        this.applyUISoundVolume(this.settings.audio.uiSoundVolume);
        this.applyBackgroundMusic(this.settings.audio.backgroundMusic);

        // Controls
        this.applyInvertMouseY(this.settings.controls.invertMouseY);
        this.applyRawMouseInput(this.settings.controls.rawMouseInput);
    }

    // ==================== FPS COUNTER ====================

    private fpsText: Phaser.GameObjects.Text | null = null;
    private fpsUpdateTimer: number = 0;
    private frameCount: number = 0;
    private lastFPSUpdate: number = 0;

    private showFPSCounter() {
        if (!this.currentScene || this.fpsText) return;

        this.fpsText = this.currentScene.add.text(10, 10, 'FPS: 60', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        this.fpsText.setScrollFactor(0);
        this.fpsText.setDepth(10000);

        // Update FPS counter
        this.lastFPSUpdate = Date.now();
        this.frameCount = 0;
    }

    private hideFPSCounter() {
        if (this.fpsText) {
            this.fpsText.destroy();
            this.fpsText = null;
        }
    }

    /**
     * Update FPS counter (call this from scene update loop)
     */
    public updateFPSCounter() {
        if (!this.fpsText || !this.settings.graphics.showFPS) return;

        this.frameCount++;
        const now = Date.now();
        const elapsed = now - this.lastFPSUpdate;

        if (elapsed >= 1000) {
            const fps = Math.round(this.frameCount / (elapsed / 1000));
            this.fpsText.setText(`FPS: ${fps}`);

            // Color based on performance
            if (fps >= 55) {
                this.fpsText.setColor('#00ff00'); // Green - good
            } else if (fps >= 30) {
                this.fpsText.setColor('#ffff00'); // Yellow - moderate
            } else {
                this.fpsText.setColor('#ff0000'); // Red - poor
            }

            this.frameCount = 0;
            this.lastFPSUpdate = now;
        }
    }

    /**
     * Calculate final volume for a sound (applies master volume scaling)
     */
    public getFinalVolume(soundType: 'gunshot' | 'hit' | 'ui'): number {
        const masterPercent = this.settings.audio.masterVolume / 100;
        let typePercent = 1;

        switch (soundType) {
            case 'gunshot':
                typePercent = this.settings.audio.gunshotVolume / 100;
                break;
            case 'hit':
                typePercent = this.settings.audio.hitSoundVolume / 100;
                break;
            case 'ui':
                typePercent = this.settings.audio.uiSoundVolume / 100;
                break;
        }

        return masterPercent * typePercent;
    }
}

// Export singleton instance
export const settingsApplier = SettingsApplier.getInstance();
