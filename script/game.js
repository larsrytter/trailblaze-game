import * as THREE from '/script/threejs/build/three.module.js';
import SceneManager from '/script/game/3d/scene-manager.js';

function setupScene() {
    const canvas = document.querySelector('#c');

    const sceneManager = new SceneManager(canvas);
    sceneManager.init();



}

setupScene();

// class SceneManager {
//     #renderer;
//     constructor(canvasObj) {
//         this.canvasObj = canvasObj;
//     }

//     setRenderer() {
//         this.#renderer = new THREE.WebGLRenderer({canvas:this.canvasObj});
//         this.#renderersetClearColor(0xAAAAAA);
//         this.#renderer.shadowMap.enabled = true;
//     }


// }