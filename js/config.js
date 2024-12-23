export const ENEMY_TYPES = {
    BASIC: {
        color: '#f00',
        size: 20,
        speed: 2,
        health: 1,
        damage: 1,
        points: 10
    },
    FAST: {
        color: '#ff0',
        size: 15,
        speed: 3.5,
        health: 1,
        damage: 1,
        points: 15
    },
    TANK: {
        color: '#f0f',
        size: 35,
        speed: 1,
        health: 3,
        damage: 2,
        points: 25
    }
};

export const ENEMY_SPAWN_INTERVAL = 1000;
export const MAX_PARTICLES = 100;

export const GRID_CONFIG = {
    spacing: 50,
    opacity: 0.2,
    scroll: 0
};

export const PLAYER_CONFIG = {
    size: 30,
    speed: 5,
    shootInterval: 500,
    color: '#0ff',
    initialLevel: 1,
    initialXp: 0,
    initialXpToLevel: 100
};
