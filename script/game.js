import * as THREE from '/script/threejs/build/three.module.js';
import SceneManager from '/script/game/3d/scene-manager.js';
import Physics from '/script/game/physics/physics.js';
import MovementHandler from '/script/game/handlers/movement-handler.js';
import InputHandler from '/script/game/handlers/input-handler.js';
import TrackDataLoader from '/script/game/handlers/track-data-loader.js';
import GameStateManager from '/script/game/3d/game-state-manager.js';

function initialize(trackData) {
    const canvas = document.querySelector('#c');
    const movementHandler = new MovementHandler();
    const inputHandler = new InputHandler(movementHandler);
    inputHandler.setupEventHandlers();

    const gameStateManager = new GameStateManager();

    const physics = new Physics(movementHandler, gameStateManager);
    // physics.setupPhysicsWorld();
    physics.init(trackData);
    
    const sceneManager = new SceneManager(canvas, physics, gameStateManager);
    sceneManager.init(trackData);
    
}

const trackDataLoader = new TrackDataLoader();

const trackDataFileName = 'level1data.json';
let trackData = null;
trackDataLoader.loadTrackData(trackDataFileName)
    .then((data) => {
        Ammo().then( () => { initialize(data); });
    });

// Ammo().then( initialize );

