import Phaser from 'phaser';
import { settingsApplier } from '../../utils/SettingsApplier';

export class AudioManager {
    private sounds: { [key: string]: HTMLAudioElement };
    private backgroundMusic: HTMLAudioElement | null = null;

    constructor() {
        this.sounds = {};
        this.loadSounds();
        this.initBackgroundMusic();
    }

    private loadSounds() {
        const soundFiles = [
            { name: 'gunshot', path: '/assets/sounds/gunshot.mp3', type: 'gunshot' },
            { name: 'targetHit', path: '/assets/sounds/targetHit.mp3', type: 'hit' },
            { name: 'uiClick', path: '/assets/sounds/click.mp3', type: 'ui' },
            { name: 'reload', path: '/assets/sounds/reload.mp3', type: 'gunshot' }
        ];

        soundFiles.forEach(sound => {
            const audio = new Audio(sound.path);
            audio.onerror = () => {
                console.warn(`Failed to load sound: ${sound.path}`);
            };
            this.sounds[sound.name] = audio;
        });
    }

    private initBackgroundMusic() {
        this.backgroundMusic = new Audio('/assets/sounds/backgroundMusic.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3; // Lower volume for music
        this.backgroundMusic.onerror = () => {
            console.warn('Failed to load background music');
        };
    }

    /**
     * Play a sound with volume based on settings
     */
    public playSound(name: string, soundType: 'gunshot' | 'hit' | 'ui' = 'ui') {
        const sound = this.sounds[name];
        if (sound) {
            sound.currentTime = 0; // Reset sound to start

            // Get final volume from settings applier (applies master + type volume)
            const finalVolume = settingsApplier.getFinalVolume(soundType);
            sound.volume = finalVolume;

            sound.play().catch(err => {
                console.warn(`Failed to play sound ${name}:`, err);
            });
        }
    }

    /**
     * Stop a specific sound
     */
    public stopSound(name: string) {
        const sound = this.sounds[name];
        if (sound) {
            sound.pause();
            sound.currentTime = 0; // Reset sound to start
        }
    }

    /**
     * Set volume for a specific sound (0-1 range)
     */
    public setVolume(name: string, volume: number) {
        const sound = this.sounds[name];
        if (sound) {
            sound.volume = Phaser.Math.Clamp(volume, 0, 1);
        }
    }

    /**
     * Play background music
     */
    public playBackgroundMusic() {
        if (this.backgroundMusic) {
            const settings = settingsApplier.getSettings();
            const masterVolume = settings.audio.masterVolume / 100;
            this.backgroundMusic.volume = 0.3 * masterVolume;

            this.backgroundMusic.play().catch(err => {
                console.warn('Failed to play background music:', err);
            });
        }
    }

    /**
     * Stop background music
     */
    public stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    /**
     * Toggle background music on/off
     */
    public toggleBackgroundMusic(enabled: boolean) {
        if (enabled) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
    }

    /**
     * Update background music volume (called from settings applier)
     */
    public updateBackgroundMusicVolume() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            const settings = settingsApplier.getSettings();
            const masterVolume = settings.audio.masterVolume / 100;
            this.backgroundMusic.volume = 0.3 * masterVolume;
        }
    }

    /**
     * Cleanup all sounds
     */
    public destroy() {
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.src = '';
        });

        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.src = '';
        }
    }
}