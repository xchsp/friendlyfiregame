import { NPC } from './NPC';
import { entity } from "./Entity";
import { Game } from "./game";
import { ScriptedDialog } from './ScriptedDialog';
import dialogData from "../assets/dummy.texts.json";

@entity("tree")
export class DummyNPC extends NPC {
    public constructor(game: Game, x: number, y:number) {
        super(game, x, y, 20, 30);
    }

    async load(): Promise<void> {
        this.scriptedDialog = new ScriptedDialog(this, dialogData);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.strokeText("NPC", this.x - (this.width / 2), -this.y - this.height);
        ctx.strokeRect(this.x - (this.width / 2), -this.y - this.height, this.width, this.height);
        ctx.restore();
        this.drawDialog(ctx);
    }

    update(dt: number): void {
        this.updateDialog(dt);
    }

}
