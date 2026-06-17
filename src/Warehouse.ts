import * as PIXI from 'pixi.js';
import { CONFIG } from './config';

export class Warehouse extends PIXI.Container {
    private background: PIXI.Graphics;
    private titleText: PIXI.Text;

    constructor() {
        super();
        this.background = new PIXI.Graphics();
        this.background.context
            .setFillStyle({ color: 0x3333aa })
            .rect(-40, -40, 80, 80)
            .fill();
        this.addChild(this.background);

        this.titleText = new PIXI.Text({ text: 'Склад', style: { fontSize: 16, fill: 0xffffff } });
        this.titleText.anchor.set(0.5);
        this.addChild(this.titleText);
        
        this.x = CONFIG.WAREHOUSE_X;
        this.y = CONFIG.LINE_Y_LOGISTICS;
    }
}
