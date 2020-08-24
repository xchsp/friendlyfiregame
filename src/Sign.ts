import { Aseprite } from './Aseprite';
import { asset } from './Assets';
import { Conversation } from './Conversation';
import { entity } from './Entity';
import { GameObjectProperties } from './MapInfo';
import { GameScene } from './scenes/GameScene';
import { NPC } from './NPC';
import { Point } from './geometry/Point';
import { RenderingLayer, RenderingType } from './Renderer';
import { Size } from './geometry/Size';

@entity("sign")
export class Sign extends NPC {
    @asset("sprites/sign.aseprite.json")
    private static sprite: Aseprite;
    public conversation: Conversation;

    public constructor(scene: GameScene, position: Point, properties: GameObjectProperties) {
        super(scene, position, new Size(16, 16));
        this.conversation = this.generateConversation(this.prepareContent(properties.content));
    }

    private prepareContent (content?: string ): string[] {
        if (!content) {
            return ['The sign is empty.'];
        }

        return content.split(":::");
    }

    public getInteractionText (): string {
        return "Read sign";
    }

    private generateConversation (lines: string[]): Conversation {
        const json: Record<string, string[]> = { "entry": [] };

        lines.forEach((line, index) => {
            if (index === lines.length - 1) {
                line += " @entry !end";
            }
            json.entry.push(line);
        });

        return new Conversation(json, this);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.scene.renderer.add({
            type: RenderingType.ASEPRITE,
            layer: RenderingLayer.ENTITIES,
            translation: this.position.clone().mirrorVertically(),
            position: new Point(
                -Sign.sprite.width >> 1,
                -Sign.sprite.height
            ),
            asset: Sign.sprite,
            animationTag: "idle",
            time: this.scene.gameTime * 1000
        })

        if (this.scene.showBounds) {
            this.drawBounds();
        }

        this.speechBubble.draw(ctx);
    }

    public update(): void {}
}
