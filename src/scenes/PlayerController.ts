import Phaser from 'phaser';
import StateMachine from '../utils/StateMachine';
import EventBus from '../utils/EventBus';
import ObstacleController from './ObstacleController';


export default class PlayerController {
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private obstacles!: ObstacleController;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private speed = 12;
    private jump = 8;
    private health = 100;
    private slugStomped?: Phaser.Physics.Matter.Sprite

    constructor(sprite: Phaser.Physics.Matter.Sprite, cursors: Phaser.Types.Input.Keyboard.CursorKeys, obstacles: ObstacleController, camera: Phaser.Cameras.Scene2D.Camera) {
        this.obstacles = obstacles;
        this.camera = camera;
        this.sprite = sprite;
        (this.sprite.body as MatterJS.BodyType).label = 'player';
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
            .addState('slug-hit', {
                onEnter: this.slugHitOnEnter
            })
            .addState('slug-stomp', {
                onEnter: this.slugStompOnEnter
            })
            .addState('jump', {
                onEnter: this.jumpOnEnter,
                onUpdate: this.jumpOnUpdate
            })
            .addState('dead', {
                onEnter: this.deadOnEnter
            })
            .setState('idle');

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
            const body = data.bodyB as MatterJS.BodyType;
            
            if(this.obstacles.is('pit', body)) {
                EventBus.emit('PlayerDied');
                return;
            }

            if(this.obstacles.is('slug', body)) {
                console.log(this.sprite.y, body.position.y)
                if (this.sprite.y < body.position.y) {
                    this.slugStomped = body.gameObject as Phaser.Physics.Matter.Sprite
                    this.stateMachine.setState('slug-stomp')
                } else {
                    this.stateMachine.setState('slug-hit')
                }
                
                return;
            }

            const gameObject = body.gameObject;

            if(!gameObject) {
                return;
            }

            if(gameObject instanceof Phaser.Physics.Matter.TileBody) {
                if (this.stateMachine.isCurrentState('jump')) {
                    this.stateMachine.setState('idle');
                }
            }

            
            if( gameObject instanceof Phaser.Physics.Matter.Sprite) {
                const sprite = gameObject as Phaser.Physics.Matter.Sprite;
                const type = sprite.getData('type');
                switch (type) {
                    case "coin":
                    {
                        EventBus.emit('CoinCollected', sprite);
                        sprite.destroy();
                        break;
                    }
                }
            }
        })
    }

    update (dt: number) {
        this.stateMachine.update(dt);
    }

    private deadOnEnter(){
        EventBus.emit('PlayerDied');
    }

    private slugHitOnEnter () {
        const originalScale = this.sprite.scale
        const newScale = originalScale * 0.9;
        this.speed *= 0.95;
        this.jump *= 0.99;
        this.camera.shake(100, 0.01);
        const zoomIn = this.camera.zoom + 0.1;

        this.camera.setZoom(zoomIn);
        this.sprite.setScale(newScale);
        this.health -= 10;

        if(this.health <= 0) {
            this.stateMachine.setState('dead')
        } else {
            EventBus.emit('health-changed', this.health);
            this.stateMachine.setState('idle')
        }
    }

    private slugStompOnEnter () {
        this.sprite.setVelocityY(-10)

		EventBus.emit('slug-stomped', this.slugStomped)

		this.stateMachine.setState('idle')

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