import { Aseprite } from "./Aseprite";
import { GameScene } from "./scenes/GameScene";
import { ParticleEmitter } from "./Particles";

export enum RenderingType {
    PARTICLE_EMITTER,
    BLACK_BARS,
    DRAW_IMAGE,
    ASEPRITE,
    RECT
}

export enum RenderingLayer {
    DEBUG = 10,
    FULLSCREEN_FX = 9,
    UI = 8,
    BLACK_BARS = 7,
    TILEMAP_FOREGROUND = 6,
    PLAYER = 5,
    ENTITIES = 4,
    PARTICLES = 3,
    PLATFORMS = 2,
    TILEMAP_MAP = 1,
    TILEMAP_BACKGROUND = 0
}

export const LAYER_ORDER: RenderingLayer[] = [
    RenderingLayer.DEBUG,
    RenderingLayer.FULLSCREEN_FX,
    RenderingLayer.UI,
    RenderingLayer.BLACK_BARS,
    RenderingLayer.TILEMAP_FOREGROUND,
    RenderingLayer.PLAYER,
    RenderingLayer.ENTITIES,
    RenderingLayer.PARTICLES,
    RenderingLayer.PLATFORMS,
    RenderingLayer.TILEMAP_MAP,
    RenderingLayer.TILEMAP_BACKGROUND,
];

export type Coordinates = {
    x: number;
    y: number;
};

export type Dimension = {
    width: number;
    height: number;
};

export type BaseRenderingItem = {
    type: RenderingType;
    layer: RenderingLayer;
    zIndex?: number;
    translation?: Coordinates;
    position: Coordinates;
    scale?: Coordinates;
    alpha?: number;
    globalCompositeOperation?: string;
    relativeToScreen?: boolean,
};

export type ParticleEmitterRenderingItem = {
    type: RenderingType.PARTICLE_EMITTER;
    layer: RenderingLayer;
    zIndex: number;
    emitter: ParticleEmitter;
};

export type BlackBarsRenderingItem = {
    type: RenderingType.BLACK_BARS;
    layer: RenderingLayer;
    force: number;
    height: number;
    color: string;
};

export type RectRenderingItem = BaseRenderingItem & {
    type: RenderingType.RECT;
    fillColor?: string,
    lineColor?: string,
    lineWidth?: number;
    dimension: Dimension;
};

export type DrawImageRenderingItem = BaseRenderingItem & {
    type: RenderingType.DRAW_IMAGE;
    asset: HTMLImageElement;
};

export type AsepriteRenderingItem = BaseRenderingItem & {
    type: RenderingType.ASEPRITE;
    asset: Aseprite;
    animationTag: string;
    time?: number;
};

export type RenderingItem = BlackBarsRenderingItem | DrawImageRenderingItem | AsepriteRenderingItem | RectRenderingItem
    | ParticleEmitterRenderingItem;

export class Renderer {
    private scene: GameScene;

    public constructor(scene: GameScene) {
        this.scene = scene;
    }

    public draw(ctx: CanvasRenderingContext2D, item: RenderingItem): void {
        if (item.type === RenderingType.BLACK_BARS) {
            this.scene.camera.drawBars(ctx);
        } else if (item.type === RenderingType.PARTICLE_EMITTER) {
            item.emitter.draw(ctx);
        } else {
            ctx.save();
            if (item.translation) ctx.translate(item.translation.x, item.translation.y);
            if (item.scale) ctx.scale(item.scale.x, item.scale.y);
            if (item.relativeToScreen) ctx.setTransform(1, 0, 0, 1, 0, 0);
            if (item.globalCompositeOperation) ctx.globalCompositeOperation = item.globalCompositeOperation;
            if (item.alpha !== undefined) ctx.globalAlpha = item.alpha;

            switch (item.type) {
                case RenderingType.DRAW_IMAGE:
                    ctx.drawImage(item.asset, item.position.x, item.position.y);
                    break;
                case RenderingType.ASEPRITE:
                    item.asset.drawTag(ctx, item.animationTag, item.position.x, item.position.y, item.time);
                    break;
                case RenderingType.RECT:
                    if (item.lineColor) {
                        ctx.strokeStyle = item.lineColor;
                        ctx.lineWidth = item.lineWidth || 1;
                        ctx.strokeRect(item.position.x, item.position.y, item.dimension.width, item.dimension.height);
                    } else if (item.fillColor) {
                        ctx.fillStyle = item.fillColor;
                        ctx.fillRect(item.position.x, item.position.y, item.dimension.width, item.dimension.height);
                    }
                    break;
            }
            ctx.restore();
        }
    }

    public drawAseprite (
        ctx: CanvasRenderingContext2D,
        sprite: Aseprite, animationTag: string, x: number, y: number, layer: RenderingLayer,
        direction = 1, time?: number
    ): void {
        const scale = direction < 0 ? { x: -1, y: 1 } : undefined;

        this.draw(ctx, {
            type: RenderingType.ASEPRITE,
            layer,
            translation: {
                x: x,
                y: -y
            },
            position: {
                x: -sprite.width >> 1,
                y: -sprite.height
            },
            scale,
            asset: sprite,
            animationTag,
            time: time || this.scene.gameTime * 1000
        });
    }
}
