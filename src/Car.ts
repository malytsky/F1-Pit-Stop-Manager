import * as PIXI from 'pixi.js';
import { Tween } from '@tweenjs/tween.js';
import { CONFIG } from './config';

export class Car extends PIXI.Container {
    public isRepaired: boolean = false;
    public patienceTimer: number = CONFIG.CAR_PATIENCE_TIME;
    public isLeaving: boolean = false;
    private body: PIXI.Graphics;
    private timerText: PIXI.Text;

    constructor() {
        super();
        this.body = new PIXI.Graphics();
        this.body.context
            .setFillStyle({ color: Math.random() * 0xFFFFFF })
            .rect(-30, -15, 60, 30)
            .fill();
        this.addChild(this.body);

        this.timerText = new PIXI.Text({ text: '', style: { fontSize: 12, fill: 0xffffff } });
        this.timerText.anchor.set(0.5);
        this.timerText.y = -25;
        this.addChild(this.timerText);
    }

    public update(delta: number): void {
        if (this.parent && !this.isRepaired && !this.isLeaving) {
            this.patienceTimer -= delta;
            this.timerText.text = Math.ceil(this.patienceTimer / 1000).toString();
            
            if (this.patienceTimer <= 0) {
                this.leave(false);
            }
        } else {
            this.timerText.text = '';
        }
    }

    public leave(repaired: boolean): void {
        if (this.isLeaving) return;
        this.isLeaving = true;
        this.isRepaired = repaired;
        
        const targetX = CONFIG.APP_WIDTH + 100;
        new Tween(this)
            .to({ x: targetX }, 2000)
            .onComplete(() => {
                if (this.parent) {
                    this.parent.removeChild(this);
                }
            })
            .start(performance.now());
    }
}
