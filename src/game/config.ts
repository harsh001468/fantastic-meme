export const gameConfig = {
    width: 1280,
    height: 720,
    targetSpawnRate: 1, // targets per second
    difficultyLevels: {
        easy: {
            targetSpeed: 1, // speed of targets
            targetSize: 50, // size of targets in pixels
        },
        medium: {
            targetSpeed: 2,
            targetSize: 40,
        },
        hard: {
            targetSpeed: 3,
            targetSize: 30,
        },
    },
    audioSettings: {
        volume: 0.5, // volume level from 0 to 1
        mute: false, // mute audio
    },
    rewardSettings: {
        tokensPerHit: 10, // tokens awarded per successful hit
        bonusTokens: {
            accuracyThreshold: 0.8, // 80% accuracy for bonus
            bonusAmount: 50, // bonus tokens awarded
        },
    },
};