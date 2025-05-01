import Phaser from 'phaser';

import { Boot } from './scenes/Boot.js';
import { Game } from './scenes/Game.js';
import { UI } from './scenes/UI.js';
import { GameOver } from './scenes/GameOver.js';
import { Preloader } from './scenes/Preloader.js';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    pixelArt: false,
    roundPixels: false,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: "matter",
        matter: {
            gravity: { y: 1 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        UI,
        Preloader,
        Game,
        GameOver
    ]
};

export default new Phaser.Game(config);
