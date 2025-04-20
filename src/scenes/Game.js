import { Scene, Input } from 'phaser';

let cursors = null;
let player = null;
const speed = 10;
const jump = 10;
const isTouchingGround = false;
export class Game extends Scene
{   
    constructor ()
    {
        super('Game');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        cursors = this.input.keyboard.createCursorKeys();
    }

    create ()
    {   
        this.#createPlayerAnimation();
        const height = this.scale.height;
        const width = this.scale.width;
        this.isTouchingGround = false;
        
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('sand', 'tiles');
        const ground = map.createLayer('ground', tileset);
        ground.setCollisionByProperty({ collides: true });

        const objectLayer = map.getObjectLayer('objects');

        objectLayer.objects.forEach((object) => { 
            const x = object.x + object.width / 2;
            const y = object.y - object.height / 2;

            if (object.name === 'spawn-player') {
                this.player = this.matter.add.sprite(x, y, 'character').setFixedRotation();
                this.player.setScale(0.3);
                this.cameras.main.startFollow(this.player);
                this.player.setOnCollide( data => {  this.isTouchingGround = true; });
            } 
        });

        this.matter.world.convertTilemapLayer(ground);

        
    }

    update () {

        const spaceJustPressed = Input.Keyboard.JustDown(cursors.space);
        if (spaceJustPressed && this.isTouchingGround) {
            this.isTouchingGround = false;
            this.player.setVelocityY(- jump);
            this.player.play('jump', true);
        } else if (cursors.left.isDown) {
            this.player.flipX = true;
            this.player.setVelocityX(-speed);
            this.player.play('walk', true);
        } else if (cursors.right.isDown) {
            this.player.flipX = false;
            this.player.setVelocityX(speed);
            this.player.play('walk', true);
        } else {
            this.player.setVelocityX(0);
            this.player.play('idle', true);
        }

        
    }

    #createPlayerAnimation () {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('character', {
                prefix: 'NinjaCat_walk_',
                start: 1,
                end: 8,
                zeroPad: 2,
                suffix: '.png',
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNames('character', {
                prefix: 'NinjaCat_jump_',
                start: 1,
                end: 6,
                zeroPad: 2,
                suffix: '.png',
            }),
            frameRate: 10
        });
        const frameIdle = this.anims.generateFrameNames('character', {
            prefix: 'NinjaCat_idle_',
            start: 1,
            end: 2,
            zeroPad: 2,
            suffix: '.png',
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('character', {
                prefix: 'NinjaCat_idle_',
                start: 1,
                end: 2,
                zeroPad: 2,
                suffix: '.png',
            }),
            frameRate: 1,
            repeat: -1
        })
    }
}
