import Phaser from 'phaser';
import React from 'react';
import { createRoot } from 'react-dom/client';
import WalletConnect from './ui/components/WalletConnect';
import Gun3D from './ui/components/Gun3D';
import Dashboard from './ui/components/Dashboard';
import DeadlineLoading from './ui/components/DeadlineLoading';
import { MainMenu } from './game/scenes/MainMenu';
import { GameModeSelectionScene } from './game/scenes/GameModeSelectionScene';
import { CSGODifficultyScene } from './game/scenes/CSGODifficultyScene';
import { CSGOTrainingScene } from './game/scenes/CSGOTrainingScene';
import { ValorantDifficultyScene } from './game/scenes/ValorantDifficultyScene';
import { ValorantTrainingScene } from './game/scenes/ValorantTrainingScene';
import { CODDifficultyScene } from './game/scenes/CODDifficultyScene';
import { CODTrainingScene } from './game/scenes/CODTrainingScene';
import { LeaderboardScene } from './game/scenes/LeaderboardScene';
import { SettingsScene } from './game/scenes/SettingsScene';
import { DashboardScene } from './game/scenes/DashboardScene';
import { gameConfig } from './game/config';

// Initialize the Phaser game
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: gameConfig.width,
  height: gameConfig.height,
  parent: 'game-container',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [MainMenu, GameModeSelectionScene, CSGODifficultyScene, CSGOTrainingScene, ValorantDifficultyScene, ValorantTrainingScene, CODDifficultyScene, CODTrainingScene, LeaderboardScene, SettingsScene, DashboardScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

// Make game globally accessible for debugging
(window as any).game = game;

console.log('Hunterless game initialized!');

// Initialize React UI
const container = document.getElementById('ui-root');
if (container) {
  const root = createRoot(container);
  root.render(
    React.createElement(React.Fragment, null,
      React.createElement(Gun3D),
      React.createElement(Dashboard),
      React.createElement(DeadlineLoading)
    )
  );
}
