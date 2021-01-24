import * as THREE from '/script/threejs/build/three.module.js';
import Track3d from '/script/game/3d/track-3d.js';
import Player from '/script/game/3d/player.js';
import Physics from '/script/game/physics/physics.js';
import { GameStateEnum } from '/script/game/game-state-manager.js';

export default class SceneManager {
    _renderer;
    _scene;
    _track3dManager;
    _light;
    _player;
    _clock;
    _physics;
    _gameStateManager;

    /**
     * 
     * @param {domElement} canvasObj 
     * @param {Physics} physics 
     * @param {GameStateManager} gameStateManager 
     */
    constructor(canvasObj, physics, gameStateManager) {
        this.canvasObj = canvasObj;
        this._physics = physics;
        this._gameStateManager = gameStateManager;
    }

    init(trackData) {
        this._clock = new THREE.Clock();
        this.setupRenderer();
        this.setupSceneAndLight();

        this.createTrack(trackData);
        this.setupPlayer().then(() => {
            this.setupPhysics();

            requestAnimationFrame((t) => this.render(t));
            // this._gameStateManager.startGame();
        });

    }

    setupPhysics() {
        this._physics.setupPlayerSpherePhysicsBody(this._player.playerSphere);
        
        this._track3dManager.allTileMeshes.map((tileMesh) => {
            this._physics.createTilePhysicsBody(tileMesh);
        });

        // this._physics.setPlayerVelocity(25);
    }

    setupRenderer() {
        this._renderer = new THREE.WebGLRenderer({canvas:this.canvasObj});
        this._renderer.setClearColor(0xAAAAAA);
        this._renderer.shadowMap.enabled = true;
    }

    setupSceneAndLight() {
        this._scene = new THREE.Scene();    
        const color = 0xFFFFFF;
        const intensity = 0.8;
        // this._light = new THREE.PointLight(color, intensity);
        this._light = new THREE.AmbientLight(color, intensity);
        this._scene.add(this._light);

        const light2Color = 0xFFFFFF;
        const light2Intensity = 3;
        const light2 = new THREE.DirectionalLight(light2Color, light2Intensity);
        light2.position.set(-5, -10, 15);
        light2.castShadow = true;
        this._scene.add(light2);

            
    }

    createTrack(trackData) {
        this._track3dManager = new Track3d();
        this._track3dManager.init(trackData);
        let track = this._track3dManager.track;
        this._scene.add(track);
        this._gameStateManager.setTrack(this._track3dManager);
    }

    async setupPlayer() {
        this._player = new Player();
        await this._player.init();
        this._scene.add(this._player.playerCommon);

        this._gameStateManager.setPlayer(this._player);
    }

    render(time) {
        if (this._gameStateManager.gameState === GameStateEnum.RUNNING) {
            time *= 0.001;
        
            let deltaTime = this._clock.getDelta();
            // this._physics.setPlayerMovement(deltaTime);
            this._physics.updatePhysics(deltaTime);

            if(this.resizeRendererToDisplaySize(this._renderer)) {
                const canvas = this._renderer.domElement;
                this._player._camera.aspect = canvas.clientWidth / canvas.clientHeight;
                this._player._camera.updateProjectionMatrix();
            }
        }
        this._renderer.render(this._scene, this._player._camera);
        requestAnimationFrame((t) => this.render(t));
    }

    resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

}