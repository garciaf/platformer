import Phaser from 'phaser';
import StateMachine from '../utils/stateMachine';

export default class PlayerController {
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private speed = 10;
    private jump = 8;

    constructor(sprite: Phaser.Physics.Matter.Sprite, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        this.sprite = sprite;
        this.cursors = cursors;
        this.createAnimation();
        this.stateMachine = new StateMachine(this);

        this.stateMachine
            .addState('idle', {
                onEnter: this.idleOnEnter,
                onUpdate: this.idleOnUpdate
            })
            .addState('walk', {
                onEnter: this.walkOnEnter,
                onUpdate: this.walkOnUpdate
            })
            .addState('jump', {
                onEnter: this.jumpOnEnter,
                onUpdate: this.jumpOnUpdate
            })
            .setState('idle');

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
            if (this.stateMachine.isCurrentState('jump')) {
                this.stateMachine.setState('idle');
            }
        })
    }

    update (dt: number) {
        this.stateMachine.update(dt);
    }


    private idleOnEnter () {
        this.sprite.play('idle');
    }

    private idleOnUpdate (dt: number) {
        if (this.cursors.left.isDown || this.cursors.right.isDown) {
            this.stateMachine.setState('walk');
        }
        if (this.cursors.space.isDown) {
            this.stateMachine.setState('jump');
        }
    }

    private jumpOnEnter () {
        this.sprite.setVelocityY(-this.jump);
        this.sprite.play('jump');
    }

    private jumpOnUpdate (dt: number) {
        if (this.cursors.left.isDown) {
            this.sprite.flipX = true;
            this.sprite.setVelocityX(-this.speed);
        } else if (this.cursors.right.isDown) {
            this.sprite.flipX = false;
            this.sprite.setVelocityX(this.speed);
        }
    }

    private walkOnEnter () {
        this.sprite.play('walk');
    }
    
    private walkOnUpdate (dt: number) {
        if (this.cursors.left.isDown) {
            this.sprite.flipX = true;
            this.sprite.setVelocityX(-this.speed);
        } else if (this.cursors.right.isDown) {
            this.sprite.flipX = false;
            this.sprite.setVelocityX(this.speed);
        } else {
            this.sprite.setVelocityX(0);
            this.stateMachine.setState('idle');
        }

        if (this.cursors.space.isDown) {
            this.stateMachine.setState('jump');
        }
    }

    private createAnimation () {
        this.sprite.anims.create({
            key: 'walk',
            frames: this.sprite.anims.generateFrameNames('character', {
                prefix: 'NinjaCat_walk_',
                start: 1,
                end: 8,
                zeroPad: 2,
                suffix: '.png',
            }),
            frameRate: 10,
            repeat: -1
        });

        this.sprite.anims.create({
            key: 'jump',
            frames: this.sprite.anims.generateFrameNames('character', {
                prefix: 'NinjaCat_jump_',
                start: 1,
                end: 6,
                zeroPad: 2,
                suffix: '.png',
            }),
            frameRate: 10
        });
        const frameIdle = this.sprite.anims.generateFrameNames('character', {
            prefix: 'NinjaCat_idle_',
            start: 1,
            end: 2,
            zeroPad: 2,
            suffix: '.png',
        });

        this.sprite.anims.create({
            key: 'idle',
            frames: this.sprite.anims.generateFrameNames('character', {
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