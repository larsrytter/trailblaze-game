import * as THREE from '/script/threejs/build/three.module.js';
import Track3d from '/script/game/3d/track-3d.js';

export default class SceneManager {
    _renderer;
    _scene;
    _track3dManager;
    _playerCommon;
    _playerSphere;
    _camera;
    _light;

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
        this._playerCommon = new THREE.Object3D();
        // playerCommonObject.position.x = -100;

        this._playerSphere = this.createPlayerSphere();
        this._playerCommon.add(this._playerSphere);
        this._playerSphere.position.z = 5;
        
        this._camera = this.makeCamera();
        this._camera.position.y = -45;
        this._camera.position.z = 15;
        this._camera.up.set(0, 0, 1);
        this._playerCommon.add(this._camera);

        this._camera.lookAt(this._playerSphere.position);

        this._scene.add(this._playerCommon);
    }

    createPlayerSphere() {
        const radius = 2;
        const widthSegments = 16;
        const heightSegments = 16;
        const sphereGeometry = new THREE.SphereBufferGeometry(
            radius, widthSegments, heightSegments);
        
        // const playerMaterial = new THREE.MeshPhongMaterial({emissive: '#222222'});
        const playerMaterial = new THREE.MeshPhongMaterial();
        
        const hue = Math.random();
        const saturation = 1;
        const luminance = .5;
        playerMaterial.color.setHSL(hue, saturation, luminance);

        const playerMesh = new THREE.Mesh(sphereGeometry, playerMaterial);
        return playerMesh;
    }

    makeCamera(fov = 40) {
        const aspect = 2;  // the canvas default
        const zNear = 0.1;
        const zFar = 1000;
        return new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
    }

    render(time) {
        time *= 0.001;

        if(this.resizeRendererToDisplaySize(this._renderer)) {
            const canvas = this._renderer.domElement;
            this._camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this._camera.updateProjectionMatrix();
        }

        // const velocity = 3.0;
        // this._playerCommon.position.y = this._playerCommon.position.y + velocity;

        this._renderer.render(this._scene, this._camera);
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