import { GameObjectProperties } from "./MapInfo";
import { GameScene, GameObject } from "./scenes/GameScene";

export interface EntityDistance {
    source: Entity;
    target: Entity;
    distance: number;
}


export type Bounds = {
    x: number;
    y: number;
    width: number;
    height: number;
}

type EntityConstructor = new (scene: GameScene, x: number, y: number, properties: GameObjectProperties) => Entity;

const entities = new Map<string, EntityConstructor>();

export function entity(name: string): (target: EntityConstructor) => void {
    return (type: EntityConstructor) => {
        entities.set(name, type);
    };
}

export function createEntity(name: string, scene: GameScene, x: number, y: number, properties: GameObjectProperties): Entity {
    const constructor = entities.get(name);
    if (!constructor) {
        throw new Error("Entity not found: " + name);
    }
    return new constructor(scene, x, y, properties);
}

export abstract class Entity implements GameObject {
    constructor(
        public scene: GameScene,
        public x: number,
        public y: number,
        public width = 0,
        public height = 0
    ) {}

    abstract draw(ctx: CanvasRenderingContext2D): void;

    abstract update(dt: number): void;

    public distanceTo(entity: Entity) {
        const a = this.x - entity.x;
        const b = this.y - entity.y;
        return Math.sqrt(a*a + b*b);
    }

    protected getClosestEntityInRange(range: number): Entity | null {
        const sortedEntityDistances = this.getEntitiesInRange(range).sort((a, b ) => { return a.distance - b.distance; });
        if (sortedEntityDistances[0]) {
            return sortedEntityDistances[0].target;
        } else {
            return null;
        }
    }

    protected getEntitiesInRange(range: number): EntityDistance[] {
        const entitiesInRange: EntityDistance[] = []
        this.scene.gameObjects.forEach(gameObject => {
            if (gameObject instanceof Entity && gameObject !== this) {
                const distance = this.distanceTo(gameObject);
                if (distance < range) {
                    entitiesInRange.push({source: this, target: gameObject, distance});
                }
            }
        });
        return entitiesInRange;
    }

    protected getClosestEntity(entities: Entity[]): Entity {
        const entitiesInRange: EntityDistance[] = []
        this.scene.gameObjects.forEach(gameObject => {
            if (gameObject instanceof Entity && gameObject !== this) {
                const distance = this.distanceTo(gameObject);
                entitiesInRange.push({source: this, target: gameObject, distance});
            }
        });
        entitiesInRange.sort((a, b ) => { return a.distance - b.distance; })
        return entitiesInRange[0].target;
    }

    public getBounds(margin = 0): Bounds {
        const width = this.width + (margin * 2);
        const height = this.height + (margin * 2);
        const x = this.x - (this.width / 2) - margin;
        const y = this.y - -this.height + margin;
        return { x, y, width, height };
    }

    public remove(): void {
        this.scene.removeGameObject(this);
    }
}
