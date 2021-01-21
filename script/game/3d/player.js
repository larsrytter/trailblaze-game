import * as THREE from '/script/threejs/build/three.module.js';
import { EffectTypeEnum } from '/script/game/3d/tile-contact-effect.js';

export const PlayerStateEnum = {
    'DROPPING': 'DROPPING',
    'MOVING': 'MOVING'
}

export default class Player {
    _playerCommon;
    _playerSphere;

    _camera;
    _cameraDistance = 45;

    _playerState;

    _contactTile = null;
    _tileEffect = null;

    init() {
        this._playerCommon = new THREE.Object3D();

        this._playerSphere = this.createPlayerSphere();
        this._playerCommon.add(this._playerSphere);
        this._playerSphere.position.z = 15;

        this._camera = this.makeCamera();
        this._camera.position.y = -this._cameraDistance;
        this._camera.position.z = 15;
        this._camera.up.set(0, 0, 1);
        this._playerCommon.add(this._camera);

        this._camera.lookAt(this._playerSphere.position);

        this._playerState = PlayerStateEnum.DROPPING;
        this._velocityDefault = 30;
    }

    get playerState() {
        return this._playerState;
    }
    set playerState(val) {
        this._playerState = val;
    }

    get playerCommon(){
        return this._playerCommon;
    }

    get playerSphere() {
        return this._playerSphere;
    }

    get camera() {
        return this._camera;
    }

    get tileEffect() {
        return this._tileEffect;
    }

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
            return this._velocityDefault * 2;
        } else {
            // Normal speed
            return this._velocityDefault;
        }
    }

    setDropping() {
        this._playerState = PlayerStateEnum.DROPPING;
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
        playerMesh.castShadow = true;
        playerMesh.receiveShadow = false;

        playerMesh.userData.isPlayer = true;
        playerMesh.userData.playerObject = this;

        playerMesh.onAfterRender = () => {
            this._camera.position.set(
                this._camera.position.x,
                playerMesh.position.y - this._cameraDistance,
                this._camera.position.z
            );
        }
        
        return playerMesh;
    }

    makeCamera(fov = 40) {
        const aspect = 2;  // the canvas default
        const zNear = 0.1;
        const zFar = 1000;
        return new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
    }

    handleTileContact(tileObject) {
        // console.log('contact with tile', tileObject);
        if(tileObject === null) {
            this._tileEffect = null;
            this._contactTile = null;
        } else if(this._contactTile != tileObject) {
            if(this._playerState == PlayerStateEnum.DROPPING) {
                this._playerState = PlayerStateEnum.MOVING;
            }

            this._contactTile = tileObject;

            this._tileEffect = this._contactTile._contactEffect;
            if(!this._tileEffect) {
                // console.log('no effect');
            } else {
                // console.log('effect', this._tileEffect.effectType);
            }
        }
    }
}