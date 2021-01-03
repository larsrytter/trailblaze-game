import * as THREE from '/script/threejs/build/three.module.js';
import SceneManager from '/script/game/3d/scene-manager.js';
import Physics from '/script/game/physics/physics.js';

function initialize() {
    const canvas = document.querySelector('#c');
    const physics = new Physics();
    // physics.setupPhysicsWorld();
    physics.init();
    
    const sceneManager = new SceneManager(canvas, physics);
    sceneManager.init();
    
}

Ammo().then( initialize );
