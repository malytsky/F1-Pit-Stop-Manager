import { CONFIG, BoxStatus } from './config';
import { Platform } from './Platform';
import { Box } from './Box';
import * as PIXI from 'pixi.js';
import { Tween } from '@tweenjs/tween.js';
import { Car } from './Car';

export class LogisticsManager {
    private platform: Platform; // Type for the platform
    private boxes: Box[];
    private isBusy: boolean = false;

    constructor(platform: Platform, boxes: Box[]) {
        this.platform = platform;
        this.boxes = boxes;
    }

    public async update(): Promise<void> {
        if (this.isBusy || this.platform.isMoving) {
            if (this.isBusy) console.log('LogisticsManager: isBusy');
            if (this.platform.isMoving) console.log('LogisticsManager: platform isMoving');
            return;
        }

        const platformX = Math.round(this.platform.x);
        const warehouseX = Math.round(CONFIG.WAREHOUSE_X);

        console.log(`LogisticsManager update: platformX=${platformX}, partsCount=${this.platform.partsCount}`);

        // Визначаємо потреби боксів попереду
        const boxesAhead = this.boxes.filter(box => 
            box.currentCar && 
            !box.currentCar.isRepaired && 
            !box.currentCar.isLeaving &&
            box.x > this.platform.x + 1
        );

        if (platformX <= warehouseX) {
            console.log('At warehouse, checking for cars needing parts...');
            const allBoxesNeedingParts = this.boxes.filter(box => 
                box.currentCar && !box.currentCar.isRepaired && !box.currentCar.isLeaving
            );
            console.log(`Boxes needing parts: ${allBoxesNeedingParts.length}`);

            if (this.platform.partsCount > 0) {
                console.log('Has parts, checking if there are boxes to service...');
                if (allBoxesNeedingParts.length > 0) {
                    console.log('Starting to process boxes...');
                    await this.processNextBox(allBoxesNeedingParts);
                }
            } else {
                // ✅ Изменено условие: стартуем если есть хотя бы 1 машина ИЛИ если машина вот-вот уедет
                const canStart = allBoxesNeedingParts.length >= 1 || this.shouldStartWithOne(allBoxesNeedingParts);
            
                console.log(`Can start delivery: ${canStart}, boxes: ${allBoxesNeedingParts.length}`);
                if (canStart) {
                    console.log('Starting delivery...');
                    await this.startDelivery(allBoxesNeedingParts);
                    this.isBusy = false; 
                    return; 
                }
            }
        } else {
            console.log(`Not at warehouse (platformX=${platformX}), boxes ahead: ${boxesAhead.length}, parts: ${this.platform.partsCount}`);
            if (this.platform.partsCount > 0 && boxesAhead.length > 0) {
                await this.processNextBox(boxesAhead);
            } else {
                console.log('Returning to warehouse...');
                await this.returnToWarehouse();
            }
        }
    }

    private shouldStartWithOne(needing: Box[]): boolean {
        // Якщо у машини залишилося мало часу (наприклад < 5 сек), виїжджаємо навіть з 1 деталлю
        return needing.some(box => box.currentCar!.patienceTimer < 5000);
    }

    private async startDelivery(targets: Box[]): Promise<void> {
        this.isBusy = true;
        const count = Math.min(targets.length, CONFIG.PLATFORM_CAPACITY);
        console.log(`Loading ${count} parts for delivery`);
        this.platform.loadParts(count);
        // Затримка на завантаження (опціонально, але для візуалізації добре)
        await new Promise(r => setTimeout(r, CONFIG.UNLOAD_TIME));
        this.isBusy = false;
    }

    private async processNextBox(targets: Box[]): Promise<void> {
        this.isBusy = true;
        const nextBox = targets.sort((a, b) => a.x - b.x)[0];
    
        if (!nextBox) {
            this.isBusy = false;
            return;
        }

        console.log(`Processing box at x=${nextBox.x}`);
        // Рух до наступного боксу
        const distance = Math.abs(nextBox.x - this.platform.x);
        const realDistanceBetweenBoxes = CONFIG.BOX_WIDTH + 20;
        const duration = (distance / realDistanceBetweenBoxes) * CONFIG.PLATFORM_SPEED;
    
        await this.platform.moveTo(nextBox.x, duration);

        // Перевірка чи машина ще там
        if (nextBox.currentCar && !nextBox.currentCar.isLeaving && this.platform.partsCount > 0) {
            console.log(`Unloading part at box x=${nextBox.x}`);
            // Зупинка на розвантаження
            await new Promise(r => setTimeout(r, CONFIG.UNLOAD_TIME));
        
            // Повторна перевірка (машина могла поїхати за цей час)
            if (nextBox.currentCar && !nextBox.currentCar.isLeaving) {
                this.platform.unloadPart();
                nextBox.currentCar.leave(true);
            }
        }

        this.isBusy = false;
    }

    private async returnToWarehouse(): Promise<void> {
        if (Math.abs(this.platform.x - CONFIG.WAREHOUSE_X) < 1) return;
    
        this.isBusy = true;
        const distance = Math.abs(this.platform.x - CONFIG.WAREHOUSE_X);
        const realDistanceBetweenBoxes = CONFIG.BOX_WIDTH + 20;
        const duration = (distance / realDistanceBetweenBoxes) * CONFIG.PLATFORM_SPEED;
        console.log(`Returning to warehouse, distance=${distance}, duration=${duration}`);
        await this.platform.moveTo(CONFIG.WAREHOUSE_X, duration);
        this.platform.loadParts(0); 
        this.isBusy = false;
    }
}
