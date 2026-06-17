import * as PIXI from 'pixi.js';
import { Tween } from '@tweenjs/tween.js';
import { CONFIG } from './config';
import { Car } from './Car';
import { Box } from './Box';

export class CarManager {
    public queue: Car[] = [];
    private app: PIXI.Application;
    private boxes: Box[];
    private nextSpawnTime: number = 0;

    constructor(app: PIXI.Application, boxes: Box[]) {
        this.app = app;
        this.boxes = boxes;
        this.setNextSpawnTime();
    }

    private setNextSpawnTime(): void {
        this.nextSpawnTime = Date.now() + CONFIG.CAR_SPAWN_INTERVAL_MIN + Math.random() * (CONFIG.CAR_SPAWN_INTERVAL_MAX - CONFIG.CAR_SPAWN_INTERVAL_MIN);
    }

    public update(delta: number): void {
        if (Date.now() >= this.nextSpawnTime) {
            this.spawnCar();
            this.setNextSpawnTime();
        }

        this.queue.forEach(car => car.update(delta));
        this.checkQueue();
    }

    private spawnCar(): void {
        const car = new Car();
        car.x = -100;
        car.y = CONFIG.LINE_Y_SERVICE;
        this.app.stage.addChild(car);
        this.queue.push(car);
        this.moveQueue();
    }

    private moveQueue(): void {
        this.queue.forEach((car, index) => {
            const targetX = CONFIG.START_X - 100 - (index * 80);
            new Tween(car)
                .to({ x: targetX }, 1000)
                .start(performance.now());
        });
    }

    private checkQueue(): void {
        if (this.queue.length === 0) return;

        const freeBox = this.boxes.find(box => !box.currentCar);
        if (freeBox) {
            const car = this.queue.shift()!;
            this.moveQueue();
            this.sendCarToBox(car, freeBox);
        }
    }

    private sendCarToBox(car: Car, box: Box): void {
        const targetX = box.x;
        box.occupy(car);
        new Tween(car)
            .to({ x: targetX }, 1000)
            .start(performance.now());
    }
}
