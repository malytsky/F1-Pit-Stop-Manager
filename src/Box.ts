import * as PIXI from 'pixi.js';
import { CONFIG, BoxStatus } from './config';
import { Car } from './Car';

export class Box extends PIXI.Container {
    public id: number;
    public currentCar: Car | null = null;
    private background: PIXI.Graphics;
    private statusText: PIXI.Text;

    constructor(id: number) {
        super();
        this.id = id;
        
        this.background = new PIXI.Graphics();
        this.drawBackground(0x444444);
        this.addChild(this.background);

        this.statusText = new PIXI.Text({ text: BoxStatus.FREE, style: { fontSize: 14, fill: 0xffffff } });
        this.statusText.anchor.set(0.5);
        this.statusText.y = CONFIG.BOX_HEIGHT / 2 + 20;
        this.addChild(this.statusText);
    }

    private drawBackground(color: number): void {
        this.background.clear();
        this.background.context
            .setStrokeStyle({ width: 2, color: 0x888888 })
            .setFillStyle({ color })
            .rect(-CONFIG.BOX_WIDTH / 2, -CONFIG.BOX_HEIGHT / 2, CONFIG.BOX_WIDTH, CONFIG.BOX_HEIGHT)
            .fill()
            .stroke();
    }

    public occupy(car: Car): void {
        this.currentCar = car;
        this.statusText.text = BoxStatus.NEEDS_PART;
        this.drawBackground(0x664444);
    }

    public release(): void {
        this.currentCar = null;
        this.statusText.text = BoxStatus.FREE;
        this.drawBackground(0x444444);
    }

    public update(): void {
        if (this.currentCar && (this.currentCar.isLeaving || !this.currentCar.parent)) {
            this.release();
        }
    }
}
