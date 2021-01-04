import * as THREE from '/script/threejs/build/three.module.js';
import SceneManager from '/script/game/3d/scene-manager.js';
import Physics from '/script/game/physics/physics.js';
import MovementHandler from '/script/game/handlers/movement-handler.js';
import InputHandler from '/script/game/handlers/input-handler.js';

function initialize() {
    const canvas = document.querySelector('#c');
    const movementHandler = new MovementHandler();
    const inputHandler = new InputHandler(movementHandler);
    inputHandler.setupEventHandlers();

    const physics = new Physics(movementHandler);
    // physics.setupPhysicsWorld();
    physics.init();
    
    const sceneManager = new SceneManager(canvas, physics);
    sceneManager.init();
    
}

Ammo().then( initialize );
