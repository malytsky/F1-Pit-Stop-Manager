import * as PIXI from 'pixi.js';
import { CONFIG } from './config';
import { Car } from './Car';
import { Box } from './Box';

export class CarManager {
    public queue: Car[] = [];
    private app: PIXI.Application;
    private boxes: Box[];
    private nextSpawnTime: number = Date.now() + 2000; // ✅ Первая машина через 2 сек

    constructor(app: PIXI.Application, boxes: Box[]) {
        this.app = app;
        this.boxes = boxes;
        
        // ✅ ИСПРАВЛЯЕМ: используем Date.now() последовательно
        const now = Date.now();
        this.nextSpawnTime = now + CONFIG.CAR_SPAWN_INTERVAL_MIN;
        console.log(`🔧 CarManager initialized, first car spawn in ${(CONFIG.CAR_SPAWN_INTERVAL_MIN / 1000).toFixed(1)}s`);
        console.log(`   Current time: ${now}, Next spawn: ${this.nextSpawnTime}`);
    }

    private setNextSpawnTime(): void {
        const delay = CONFIG.CAR_SPAWN_INTERVAL_MIN + Math.random() * (CONFIG.CAR_SPAWN_INTERVAL_MAX - CONFIG.CAR_SPAWN_INTERVAL_MIN);
        this.nextSpawnTime = Date.now() + delay;
        console.log(`⏱️ Next car spawn in ${(delay / 1000).toFixed(1)}s (at ${this.nextSpawnTime})`);
    }

    public update(delta: number): void {
        const now = Date.now();

        if (now >= this.nextSpawnTime) {
            console.log(`✅ SPAWN TIME REACHED! Spawning car...`);
            this.spawnCar();
            this.setNextSpawnTime();
        }

        // ✅ Удаляем машины, которые уехали
        this.queue = this.queue.filter(car => {
            if (!car.parent || car.x > CONFIG.APP_WIDTH + 100) {
                if (car.parent) {
                    this.app.stage.removeChild(car);
                }
                return false;
            }
            return true;
        });

        // Обновляем все машины в очереди
        this.queue.forEach(car => car.update(delta));
        
        // Проверяем, можно ли переместить машину в бокс
        this.checkQueue();
    }

    private spawnCar(): void {
        const car = new Car();
        // ✅ Спавним машину слева, но видимо на экране
        car.x = 20;  // Левее START_X но видимо
        car.y = CONFIG.LINE_Y_SERVICE;
        console.log(`Before addChild: car.x=${car.x}, car.parent=${car.parent}, stage children count=${this.app.stage.children.length}`);
        
        this.app.stage.addChild(car);
        
        console.log(`After addChild: car.parent=${car.parent}, stage children count=${this.app.stage.children.length}`);
        
        this.queue.push(car);
    
    // ✅ НОВОЕ: сразу же двигаем машину на позицию в очереди
    const queuePosition = this.queue.length - 1;
    // ✅ Сразу двигаем машину в начало очереди
    const targetX = CONFIG.START_X - 80 - (queuePosition * 80);
    console.log(`🚗 Car spawned, moving from x=-100 to queue position x=${targetX}`);
    car.moveTo(targetX, 800);
        console.log(`🚗 Car spawned at x=${car.x}, queue length: ${this.queue.length}`);
    }

    private moveQueue(): void {
        // ✅ Плавно движем все машины в очереди на одну позицию вперёд
        this.queue.forEach((car, index) => {
            const targetX = CONFIG.START_X - 100 - (index * 80);
            // ✅ Только если машина не движется уже
            if (!car['animating']) {
                car.moveTo(targetX, 500); // Быстрее - 0.5 сек вместо 1 сек
                console.log(`🏎️ Car ${index} moving to queue position x=${targetX}`);
            }
        });
    }

    private checkQueue(): void {
        if (this.queue.length === 0) return;

        const freeBox = this.boxes.find(box => !box.currentCar);
        if (freeBox) {
            const car = this.queue.shift()!;
            console.log(`✅ Car moved to box ${freeBox.id}, remaining in queue: ${this.queue.length}`);
            this.moveQueue();
            this.sendCarToBox(car, freeBox);
        }
    }

    private sendCarToBox(car: Car, box: Box): void {
        const targetX = box.x;
        box.occupy(car);
        console.log(`🔧 Car entering box ${box.id} at x=${targetX}, car current x=${car.x}`);
        car.moveTo(targetX, 1000);
    }
}