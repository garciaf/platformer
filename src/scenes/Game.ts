import { Scene, Input, Types } from 'phaser';
import  PlayerController from './PlayerController';

export class Game extends Scene
{   
    private cursors!: Types.Input.Keyboard.CursorKeys;
    private player?: Phaser.Physics.Matter.Sprite;
    private playerController?: PlayerController;


    constructor ()
    {
        super('Game');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        if (this.input?.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        } else {
            throw new Error('Keyboard input is not available.');
        }
    }

    create ()
    {   
        const height = this.scale.height;
        const width = this.scale.width;
        
        const map = this.make.tilemap({ key: 'map' });
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        
        this.matter.world.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

        const tileset = map.addTilesetImage('sand', 'tiles');
        
        if (!tileset) {
            throw new Error('Tileset not found in tilemap.');
        }

        const backgroundTileset = map.addTilesetImage('rock', 'tilesBackground');
        if (!backgroundTileset) {
            throw new Error('Background tileset not found in tilemap.');
        }

        const backgroundLayer = map.createLayer('background', backgroundTileset);

        if (!backgroundLayer) {
            throw new Error('Background layer not found in tilemap.');
        }

        const ground = map.createLayer('ground', tileset);
        if (!ground) {
            throw new Error('Ground layer not found in tilemap.');
        }
        
        ground.setCollisionByProperty({ collides: true });

        const objectLayer = map.getObjectLayer('objects');

        if (!objectLayer) {
            throw new Error('Object layer not found in tilemap.');
        }

        objectLayer.objects.forEach((objectData) => { 
            const { x = 0, y = 0, name, width = 0 } = objectData;

            if (name === 'spawn-player') {
                this.player = this.matter.add.sprite(x, y, 'character').setFixedRotation();
                this.player.setScale(0.3);

                this.playerController = new PlayerController(this.player, this.cursors);
                this.cameras.main.startFollow(this.player);
            } 
        });

        this.matter.world.convertTilemapLayer(ground);

    }

    update (dt: number) {
        if (this.playerController) {
            this.playerController.update(dt);
        }
        
    }
}
