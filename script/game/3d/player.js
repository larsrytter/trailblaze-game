// @ts-check
import * as THREE from './../../../script/threejs/build/three.module.js';
import { EffectTypeEnum, TileContactEffect } from './../../../script/game/3d/tile-contact-effect.js';
import TrackTile3d from './track-tile-3d.js';
import { Mesh, PerspectiveCamera } from './../../../script/threejs/build/three.module.js';

export const PlayerStateEnum = {
    'DROPPING': 'DROPPING',
    'MOVING': 'MOVING'
}

export default class Player {
    _audioHandler;
    _playerCommon;
    _playerSphere;

    _camera;
    _cameraDistance = 45;

    _playerState;

    _contactTile = null;
    _tileEffect = null;

    constructor(audioHandler) {
        this._audioHandler = audioHandler;
    }

    /**
     * Initialize the player 3D object and camera
     */
    async init() {

        this._playerCommon = new THREE.Object3D();

        this._playerSphere = await this.createPlayerSphere();
        this._playerCommon.add(this._playerSphere);
        this._playerSphere.position.z = 15;

        this._camera = this.makeCamera();
        this._camera.position.y = -this._cameraDistance;
        this._camera.position.z = 15;
        this._camera.up.set(0, 0, 1);
        this._playerCommon.add(this._camera);

        this._camera.lookAt(this._playerSphere.position);

        this._playerState = PlayerStateEnum.DROPPING;
        this._velocityDefault = 65;
    }

    /**
     * Get the playerState
     * @returns {PlayerStateEnum}
     */
    get playerState() {
        return this._playerState;
    }

    /**
     * Set the playerState
     * @param { PlayerStateEnum } playerState
     */
    set playerState(playerState) {
        this._playerState = playerState;
    }

    /**
     * Get the playerCommon object containing player-sphere and camera
     * @returns {THREE.Object3D}
     */
    get playerCommon(){
        return this._playerCommon;
    }

    /**
     * Get the player-sphere 3D object
     * @returns {THREE.Mesh}
     */
    get playerSphere() {
        return this._playerSphere;
    }

    /**
     * Get the camera object
     * @returns {THREE.PerspectiveCamera}
     */
    get camera() {
        return this._camera;
    }

    /**
     * Get the active tileEffect
     * @returns { TileContactEffect }
     */
    get tileEffect() {
        return this._tileEffect;
    }

    /**
     * Get the default velocity
     * @returns { number }
     */
    get velocityDefault() {
        return this._velocityDefault;
    }

    /**
     * Sets tileEffect to null
     */
    removeTileEffect() {
        this._tileEffect = null;
    }

    /**
     * Get calculated velocity based on tile-effects
     * @returns {number} velocity
     */
    getVelocity() {
        if(this._playerState === PlayerStateEnum.DROPPING) {
            return 0;
        } else if(this._playerState === PlayerStateEnum.MOVING 
                    && this._tileEffect != null 
                    && this._tileEffect.effectType === EffectTypeEnum.SLOW) {
            // slow
            return this._velocityDefault / 2;
        } else if(this._playerState === PlayerStateEnum.MOVING 
                    && this._tileEffect != null 
                    && this._tileEffect.effectType === EffectTypeEnum.TURBO) {
            // Turbo
            return this._velocityDefault * 2.2;
        } else {
            // Normal speed
            return this._velocityDefault;
        }
    }

    /**
     * Set playerState to PlayerStateEnum.DROPPING
     */
    setDropping() {
        this._playerState = PlayerStateEnum.DROPPING;
    }

    /**
     * Create and configure 3D sphere object
     * @returns { Promise<Mesh> }
     */
    async createPlayerSphere() {
        const radius = 2.2;
        const widthSegments = 16;
        const heightSegments = 16;
        const sphereGeometry = new THREE.SphereBufferGeometry(
            radius, widthSegments, heightSegments);
        
        const textureLoader = new THREE.TextureLoader();
        // const textureUrl = '/resources/images/cloudy.png';
        const textureUrl = '/resources/images/green-lines.png';
        
        let playerMaterial;

        playerMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load(textureUrl),
            shininess: 20
        });
        // const playerMaterial = new THREE.MeshPhongMaterial({emissive: '#222222'});
        
        // const hue = Math.random();
        // const saturation = 1;
        // const luminance = .5;
        // playerMaterial.color.setHSL(hue, saturation, luminance);

        const playerMesh = new THREE.Mesh(sphereGeometry, playerMaterial);
        // @ts-ignore
        playerMesh.castShadow = true;
        // @ts-ignore
        playerMesh.receiveShadow = false;

        // @ts-ignore
        playerMesh.userData.isPlayer = true;
        // @ts-ignore
        playerMesh.userData.playerObject = this;

        // @ts-ignore
        playerMesh.onAfterRender = () => {
            this.updateCameraPosition();
        }
        
        return playerMesh;
    }

    /**
     * Create 3D camera object
     * @param {number} fov 
     * @returns { PerspectiveCamera }
     */
    makeCamera(fov = 40) {
        const aspect = 2;  // the canvas default
        const zNear = 0.1;
        const zFar = 1000;
        return new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
    }

    /**
     * Update camera position relative to player-sphere
     */
    updateCameraPosition() {
        this._camera.position.set(
            this._camera.position.x,
            this._playerSphere.position.y - this._cameraDistance,
            this._camera.position.z
        );
    }

    /**
     * Apply TileEffect based on contacting tile
     * @param {TrackTile3d} tileObject 
     */
    handleTileContact(tileObject) {
        // console.log('contact with tile', tileObject);
        if(tileObject === null) {
            this._contactTile = null;
            if(this._tileEffect && this._tileEffect.effectType === EffectTypeEnum.JUMP) {
                this._tileEffect = null;
            }
        } else if(this._contactTile != tileObject) {
            if(this._playerState == PlayerStateEnum.DROPPING) {
                this._playerState = PlayerStateEnum.MOVING;
            }

            this.playEffectAudio(tileObject._contactEffect.effectType);

            this._contactTile = tileObject;

            this._tileEffect = this._contactTile._contactEffect;
            if(!this._tileEffect) {
                // console.log('no effect');
            } else {
                // console.log('effect', this._tileEffect.effectType);
            }
        }
    }

    /**
     * Play audio for tile-effect
     * @param { string } effectType from EffectTypeEnum
     */
    playEffectAudio(effectType) {
        switch (effectType) {
            case (EffectTypeEnum.JUMP): {
                this._audioHandler.playJumpEffect();
            }
        }
    }
}