import * as PIXI from 'pixi.js';
import { CONFIG } from './config';

export class Platform extends PIXI.Container {
    public partsCount: number = 0;
    public isMoving: boolean = false;
    private body: PIXI.Graphics;
    private cargoText: PIXI.Text;
    private animating: boolean = false;
    private animationStart: number = 0;
    private animationDuration: number = 0;
    private animationStartX: number = 0;
    private animationTargetX: number = 0;
    private animationResolve: (() => void) | null = null;

    constructor() {
        super();
        this.body = new PIXI.Graphics();
        this.body.context
            .setFillStyle({ color: 0xaaaa33 })
            .rect(-CONFIG.PLATFORM_WIDTH / 2, -CONFIG.PLATFORM_HEIGHT / 2, CONFIG.PLATFORM_WIDTH, CONFIG.PLATFORM_HEIGHT)
            .fill();
        this.addChild(this.body);

        this.cargoText = new PIXI.Text({ text: '0', style: { fontSize: 16, fill: 0x000000 } });
        this.cargoText.anchor.set(0.5);
        this.addChild(this.cargoText);

        this.x = CONFIG.WAREHOUSE_X;
        this.y = CONFIG.LINE_Y_LOGISTICS;
    }

    public updateCargoText(): void {
        this.cargoText.text = this.partsCount.toString();
    }

    public moveTo(targetX: number, duration: number): Promise<void> {
        console.log(`Platform.moveTo called: from ${this.x.toFixed(2)} to ${targetX.toFixed(2)}, duration ${duration}ms`);
        
        if (Math.abs(this.x - targetX) < 1) {
            console.log('Already at target, skipping');
            this.x = targetX;
            return Promise.resolve();
        }

        this.isMoving = true;
        this.animating = true;
        this.animationStart = performance.now();
        this.animationDuration = duration;
        this.animationStartX = this.x;
        this.animationTargetX = targetX;

        return new Promise((resolve) => {
            this.animationResolve = resolve;
        });
    }

    public updateAnimation(): void {
        if (!this.animating) return;

        const elapsed = performance.now() - this.animationStart;
        const progress = Math.min(elapsed / this.animationDuration, 1);

        // ✅ Линейная интерполяция
        this.x = this.animationStartX + (this.animationTargetX - this.animationStartX) * progress;

        if (progress >= 1) {
            this.x = this.animationTargetX;
            this.animating = false;
            this.isMoving = false;
            console.log(`✅ Movement complete: ${this.x.toFixed(2)}`);
            if (this.animationResolve) {
                this.animationResolve();
                this.animationResolve = null;
            }
        }
    }

    public loadParts(count: number): void {
        this.partsCount = count;
        this.updateCargoText();
    }

    public unloadPart(): void {
        if (this.partsCount > 0) {
            this.partsCount--;
            this.updateCargoText();
        }
    }
}
