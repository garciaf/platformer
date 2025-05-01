import { Scene, Input, Types } from 'phaser';
import  PlayerController from './PlayerController';
import SlugController from './SlugController';
import ObstacleController from './ObstacleController';
import EventBus from '../utils/EventBus';

export class Game extends Scene
{   
    private cursors!: Types.Input.Keyboard.CursorKeys;
    private player?: Phaser.Physics.Matter.Sprite;
    private playerController?: PlayerController;
    private slugs: SlugController[] = [];
    private obstacles!: ObstacleController;


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
        this.obstacles = new ObstacleController();
        this.slugs = [];
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

    
        // const backgroundLayer = map.createLayer('background', backgroundTileset);

        // if (!backgroundLayer) {
        //     throw new Error('Background layer not found in tilemap.');
        // }

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
            const { x = 0, y = 0, name, width = 0, height = 0 } = objectData;

            switch(name) {
                case 'spawn-player':
                    {
                        this.player = this.matter.add.sprite(x, y, 'character').setFixedRotation();
                        this.player.setScale(0.3);
                        this.player.setFrictionStatic(0);
                        this.player.setFriction(0);

                        this.playerController = new PlayerController(this.player, this.cursors, this.obstacles, this.cameras.main);
                        this.cameras.main.startFollow(this.player);
                        break;                    
                    }
                    case 'spawn-coin':
                        {
                            const coin = this.matter.add.sprite(x, y, 'coin', undefined, { 
                                isSensor: true,
                                isStatic: true,
            
                            });
                            coin.setScale(0.1);
                            coin.setData("type", 'coin');
                            break   
                        }
                    case 'slug':
                        {   
                            const slug = this.matter.add.sprite(x, y, 'slug').setFixedRotation();
                            slug.setScale(0.4);

                            this.slugs.push(new SlugController(this, slug));
                            this.obstacles.add("slug", slug.body as MatterJS.BodyType);
                            break
                        }
                    case 'pit':
                        {
                            const pit = this.matter.add.rectangle(x+(width * 0.5), y + (height * 0.5), width, height, {
                                isStatic: true,
                                label: "pit"
                            })
                            this.obstacles.add("pit", pit);
                        }
                }

        });

        EventBus.on('PlayerDied', () => {
            this.scene.start('GameOver');
        });

        this.matter.world.convertTilemapLayer(ground);  
        this.scene.launch('ui');
    }

    update (dt: number) {
        this.playerController?.update(dt);

        this.slugs.forEach((slug) => slug.update(dt));
        
    }
}
