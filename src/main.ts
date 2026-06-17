import * as PIXI from 'pixi.js';
import { update as updateTweens } from '@tweenjs/tween.js';
import { CONFIG } from './config';
import { Box } from './Box';
import { Warehouse } from './Warehouse';
import { Platform } from './Platform';
import { CarManager } from './CarManager';
import { LogisticsManager } from './LogisticsManager';

class App {
    private app: PIXI.Application;
    private boxes: Box[] = [];
    private warehouse!: Warehouse;
    private platform!: Platform;
    private carManager!: CarManager;
    private logisticsManager!: LogisticsManager;

    constructor() {
        this.app = new PIXI.Application();
        this.init();
    }

    private async init(): Promise<void> {
        await this.app.init({
            width: CONFIG.APP_WIDTH,
            height: CONFIG.APP_HEIGHT,
            backgroundColor: 0x222222,
            antialias: true
        });
        document.body.appendChild(this.app.canvas);

        this.setupWorld();

        this.carManager = new CarManager(this.app, this.boxes);
        this.logisticsManager = new LogisticsManager(this.platform, this.boxes);

        this.runLogistics();

        this.app.ticker.add(this.update.bind(this));
    }

    private setupWorld(): void {
        // Склад
        this.warehouse = new Warehouse();
        this.app.stage.addChild(this.warehouse);

        // Бокси
        for (let i = 0; i < CONFIG.BOX_COUNT; i++) {
            const box = new Box(i);
            box.x = CONFIG.START_X + i * (CONFIG.BOX_WIDTH + 20);
            box.y = CONFIG.LINE_Y_SERVICE;
            this.boxes.push(box);
            this.app.stage.addChild(box);
        }

        // Платформа (має бути вище боксів по Z)
        this.platform = new Platform();
        this.app.stage.addChild(this.platform);

        // Лінія логістики (візуальна)
        const logisticsLine = new PIXI.Graphics();
        logisticsLine.context
            .setStrokeStyle({ width: 2, color: 0x555555 })
            .moveTo(0, CONFIG.LINE_Y_LOGISTICS)
            .lineTo(CONFIG.APP_WIDTH, CONFIG.LINE_Y_LOGISTICS)
            .stroke();
        this.app.stage.addChild(logisticsLine);

        // Лінія сервісу (візуальна)
        const serviceLine = new PIXI.Graphics();
        serviceLine.context
            .setStrokeStyle({ width: 2, color: 0x555555 })
            .moveTo(0, CONFIG.LINE_Y_SERVICE)
            .lineTo(CONFIG.APP_WIDTH, CONFIG.LINE_Y_SERVICE)
            .stroke();
        this.app.stage.addChild(serviceLine);

        // Черга (напис)
        const queueLabel = new PIXI.Text({
            text: 'Черга',
            style: { fontSize: 18, fill: 0x888888 }
        });
        queueLabel.x = CONFIG.START_X - 150;
        queueLabel.y = CONFIG.LINE_Y_SERVICE + 40;
        this.app.stage.addChild(queueLabel);
    }

    private async runLogistics(): Promise<void> {
        while (true) {
            await this.logisticsManager.update();
            await new Promise(r => setTimeout(r, 50));
        }
    }

    private update(): void {
        const now = performance.now();
        updateTweens(now);

        this.platform.updateAnimation();

        this.carManager.update(this.app.ticker.elapsedMS);
        this.boxes.forEach(box => box.update()); // ✅ БЕЗ аргумента
    }
}

new App();
