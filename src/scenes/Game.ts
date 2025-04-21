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
        const tileset = map.addTilesetImage('sand', 'tiles');

        if (!tileset) {
            throw new Error('Tileset not found in tilemap.');
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
        // const spaceJustPressed = Input.Keyboard.JustDown(this.cursors.space);
        // if (spaceJustPressed && this.isTouchingGround) {
        //     this.isTouchingGround = false;
        //     this.player.setVelocityY(- Game.JUMP_VELOCITY);
        //     this.player.play('jump', true);
        // } else if (this.cursors.left.isDown) {
        //     this.player.flipX = true;
        //     this.player.setVelocityX(-Game.WALK_VELOCITY);
        //     this.player.play('walk', true);
        // } else if (this.cursors.right.isDown) {
        //     this.player.flipX = false;
        //     this.player.setVelocityX(Game.WALK_VELOCITY);
        //     this.player.play('walk', true);
        // } else {
        //     this.player.setVelocityX(0);
        //     this.player.play('idle', true);
        // }

        
    }
}
