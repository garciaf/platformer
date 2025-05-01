const createKey = (name: string, id: number) => `${name}-${id}`;
export default class ObstacleController {
    private obstacles = new Map<string, MatterJS.BodyType>();

    add(name: string, body: MatterJS.BodyType) {
        const key = createKey(name, body.id);
        if (this.obstacles.has(key)) {
            console.warn(`Obstacle ${key} already exists`);
            return;
        }
        this.obstacles.set(key, body);
    }

    is(name: string, body: MatterJS.BodyType) {
        const key = createKey(name, body.id);
        if(this.obstacles.has(key)) {
            return true;
        }
        return false;
    }



}