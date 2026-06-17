import * as PIXI from 'pixi.js';
import { CONFIG } from './config';

export class Car extends PIXI.Container {
    public isRepaired: boolean = false;
    public isLeaving: boolean = false;
    public patienceTimer: number = CONFIG.CAR_PATIENCE_TIME;

    private body: PIXI.Graphics;
    private timerText: PIXI.Text;

    public animating: boolean = false;
    private animationStart: number = 0;
    private animationDuration: number = 0;
    private animationStartX: number = 0;
    private animationTargetX: number = 0;

    constructor() {
        super();

        // ✅ КРАСНЫЙ ПРЯМОУГОЛЬНИК - центрирован в (0, 0)
        this.body = new PIXI.Graphics();
        this.body.rect(-25, -15, 50, 30);
        this.body.fill({ color: 0xff0000 });
        this.body.stroke({ width: 2, color: 0xffffff });
        this.addChild(this.body);

        // ✅ Таймер терпения
        this.timerText = new PIXI.Text({
            text: '',
            style: { fontSize: 12, fill: 0xffffff, fontWeight: 'bold' }
        });
        this.timerText.anchor.set(0.5);
        this.addChild(this.timerText);

        console.log(`🔴 Car constructor called`);
    }

    public update(delta: number): void {
        this.updateAnimation();

        // Обновляем таймер терпения
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

    public moveTo(targetX: number, duration: number): void {
        console.log(`🎬 Car.moveTo: from ${this.x.toFixed(2)} to ${targetX.toFixed(2)}, duration ${duration}ms`);
        this.animating = true;
        this.animationStart = performance.now();
        this.animationDuration = duration;
        this.animationStartX = this.x;
        this.animationTargetX = targetX;
    }

    private updateAnimation(): void {
        if (!this.animating) return;

        const elapsed = performance.now() - this.animationStart;
        const progress = Math.min(elapsed / this.animationDuration, 1);

        this.x = this.animationStartX + (this.animationTargetX - this.animationStartX) * progress;

        if (progress >= 1) {
            this.x = this.animationTargetX;
            this.animating = false;
            console.log(`✅ Car reached x=${this.x.toFixed(2)}`);
        }
    }

    public leave(repaired: boolean): void {
        this.isLeaving = true;
        this.isRepaired = repaired;

        // ✅ ИСПРАВЛЯЕМ: очищаем и перерисовываем правильно
        this.body.clear();
        this.body.rect(-25, -15, 50, 30);  // ← Те же координаты!
        
        if (repaired) {
            this.body.fill({ color: 0x00ff00 });  // Зелёный
        } else {
            this.body.fill({ color: 0xffaa00 });  // Оранжевый
        }
        this.body.stroke({ width: 2, color: 0xffffff });

        console.log(`${repaired ? '✅' : '❌'} Car leaving as ${repaired ? 'repaired' : 'unrepaired'}`);

        // Движем машину вправо за экран
        this.moveTo(this.x + 500, 2000);
    }
}