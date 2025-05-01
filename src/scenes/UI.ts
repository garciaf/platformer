import { Scene } from 'phaser';
import EventBus from '../utils/EventBus';

export class UI extends Scene {
    private coinLabel!: Phaser.GameObjects.Text
	private coinCollected = 0
    private graphics!: Phaser.GameObjects.Graphics
    private currentHealth = 100


    constructor() {
        super({
            key: 'ui'
        })
    }
    init() {
        this.coinCollected = 0
        this.currentHealth = 100
    }
    create () {
        this.coinLabel = this.add.text(36, 36, 'Coins : 0', {
            fontSize: 32
        })
        this.graphics = this.add.graphics()
        this.setHealthBar(this.currentHealth)

        EventBus.on('CoinCollected', (coin: Phaser.Physics.Matter.Sprite) => {
            this.coinCollected += 1
            this.coinLabel.setText('Coins : ' + this.coinCollected)
        });

        EventBus.on('health-changed', (health: number) => {
            this.tweens.addCounter({
                from: this.currentHealth,
                to: health,
                duration: 200,
                ease: Phaser.Math.Easing.Sine.InOut,
                onUpdate: tween => {
                    const value = tween.getValue()
                    this.setHealthBar(value)
                }
            })
    
            this.currentHealth = health
        });
    }

    private setHealthBar(value: number)
	{
		const width = 200
		const percent = Phaser.Math.Clamp(value, 0, 100) / 100

		this.graphics.clear()
		this.graphics.fillStyle(0x808080)
		this.graphics.fillRoundedRect(10, 10, width, 20, 5)
		if (percent > 0)
		{
			this.graphics.fillStyle(0x00ff00)
			this.graphics.fillRoundedRect(10, 10, width * percent, 20, 5)
		}
	}
}