import * as THREE from '/script/threejs/build/three.module.js';
import Track3d from '/script/game/3d/track-3d.js';
import Player from '/script/game/3d/player.js';

export default class SceneManager {
    _renderer;
    _scene;
    _track3dManager;
    _light;
    _player;

    constructor(canvasObj) {
        this.canvasObj = canvasObj;
    }

    init() {
        this.setupRenderer();
        this.setupSceneAndLight();

        // TODO: Call from outside?
        this.createTrack();
        this.setupPlayer();

        console.log('scene', this._scene);

        requestAnimationFrame((t) => this.render(t));
    }

    setupRenderer() {
        this._renderer = new THREE.WebGLRenderer({canvas:this.canvasObj});
        this._renderer.setClearColor(0xAAAAAA);
        this._renderer.shadowMap.enabled = true;
    }

    setupSceneAndLight() {
        this._scene = new THREE.Scene();    
        const color = 0xFFFFFF;
        const intensity = 3;
        // this._light = new THREE.PointLight(color, intensity);
        this._light = new THREE.AmbientLight(color, intensity);
        this._scene.add(this._light);

        const light2Color = 0xFFFFFF;
        const light2Intensity = 2;
        const light2 = new THREE.DirectionalLight(light2Color, light2Intensity);
        light2.position.set(-5, -10, 15);
        this._scene.add(light2);

            
    }

    createTrack() {
        this._track3dManager = new Track3d();
        let track = this._track3dManager.track;
        this._scene.add(track);
        console.log('Track added', track);
    }

    setupPlayer() {
        this._player = new Player();
        this._player.init();
        this._scene.add(this._player.playerCommon);
    }

    render(time) {
        time *= 0.001;

        if(this.resizeRendererToDisplaySize(this._renderer)) {
            const canvas = this._renderer.domElement;
            this._player._camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this._player._camera.updateProjectionMatrix();
        }

        // const velocity = 3.0;
        // this._player.playerCommon.position.y = this._player.playerCommon.position.y + velocity;

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