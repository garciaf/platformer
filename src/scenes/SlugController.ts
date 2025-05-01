import Phaser from 'phaser';
import StateMachine from '../utils/StateMachine';
import EventBus from '../utils/EventBus';

export default class SlugController {
    private sprite: Phaser.Physics.Matter.Sprite;
    private scene: Phaser.Scene
    private stateMachine: StateMachine;
    private speed = 1;
    private moveTime = 0;
    private walkLength = 200;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.sprite = sprite;
        this.scene = scene;

        (this.sprite.body as MatterJS.BodyType).label = 'slug';

        this.createAnimation();
        this.stateMachine = new StateMachine(this);
        this.stateMachine
            .addState('idle', {
                onEnter: this.idleOnEnter,
            })
            .addState('walk-left', {
                onEnter: this.walkLeftOnEnter,
                onUpdate: this.walkLeftOnUpdate
            })
            .addState('walk-right', {
                onEnter: this.walkRightOnEnter,
                onUpdate: this.walkRightOnUpdate
            })
            .addState('dead')
            .setState('idle');

        EventBus.on("slug-stomped", (slug: Phaser.Physics.Matter.Sprite) => {
            this.handleStomped(slug);
        })
    }

    update (dt: number) {
        this.stateMachine.update(dt);
    }

    private idleOnEnter() {
        this.sprite.play('slug-idle');
        this.stateMachine.setState('walk-left');
    }

    private walkLeftOnEnter() {
        this.sprite.play('slug-walk');
        this.moveTime = 0;
        this.sprite.setFlipX(false);
        
    }

    private walkLeftOnUpdate(dt: number) {
        this.moveTime += 1;
        this.sprite.setVelocityX(-this.speed);

        if(this.moveTime > this.walkLength) {
            this.stateMachine.setState('walk-right');
        }
     
    }
    
    private walkRightOnEnter() {
        this.moveTime = 0;
        this.sprite.play('slug-walk');
        this.sprite.setFlipX(true);
    }

    private walkRightOnUpdate(dt: number) {
        this.moveTime += 1;
        this.sprite.setVelocityX(this.speed);

        if(this.moveTime > this.walkLength) {
            this.stateMachine.setState('walk-left');
        }
    }
    private handleStomped(slug: Phaser.Physics.Matter.Sprite)
	{
		if (this.sprite !== slug)
		{
			return
		}

		this.scene.tweens.add({
			targets: this.sprite,
			displayHeight: 0,
			y: this.sprite.y + (this.sprite.displayHeight * 0.5),
			duration: 200,
			onComplete: () => {
				this.sprite.destroy()
			}
		})

		this.stateMachine.setState('dead')
	}

    private createAnimation() {
        this.sprite.anims.create({
            key: 'slug-idle',
            frames: [{ key: 'slug', frame: 'slug_1.png' }],
            frameRate: 10,
            repeat: 1
        });

        this.sprite.anims.create({
            key: 'slug-walk',
            frames: this.sprite.anims.generateFrameNames('slug', {
                prefix: 'slug_',
                start: 1,
                end: 3,
                zeroPad: 0,
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        });
    }
}