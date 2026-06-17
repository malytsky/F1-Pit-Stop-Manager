export const CONFIG = {
    BOX_COUNT: 6, // N: 4-10
    PLATFORM_CAPACITY: 3, // C: 2-4
    CAR_SPAWN_INTERVAL_MIN: 4000,
    CAR_SPAWN_INTERVAL_MAX: 10000,
    PLATFORM_SPEED: 1000, // 1 box per second (ms)
    UNLOAD_TIME: 800,
    CAR_PATIENCE_TIME: 15000,
    BOX_WIDTH: 100,
    BOX_HEIGHT: 120,
    PLATFORM_WIDTH: 80,
    PLATFORM_HEIGHT: 40,
    WAREHOUSE_X: 50,
    START_X: 150,
    LINE_Y_LOGISTICS: 100,
    LINE_Y_SERVICE: 300,
    APP_WIDTH: 1200,
    APP_HEIGHT: 600
};

export enum BoxStatus {
    FREE = 'Вільний',
    OCCUPIED = 'Зайнятий',
    NEEDS_PART = 'Потрібна деталь'
}
