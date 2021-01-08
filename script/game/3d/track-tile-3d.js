import * as THREE from '/script/threejs/build/three.module.js';
import { TileContactEffect } from '/script/game/3d/tile-contact-effect.js';
import { EffectTypeEnum } from '/script/game/3d/tile-contact-effect.js';

export default class TrackTile3d {
    
    _geometry;
    _material;
    _mesh;
    _contactEffect = null;

    constructor(width, length, height, tileColor) {       
        this._geometry = new THREE.BoxGeometry(width, length, height);
        this._material = new THREE.MeshPhongMaterial({color: tileColor});
        this._mesh = new THREE.Mesh(this._geometry, this._material);
        this._mesh.castShadow = false;
        this._mesh.receiveShadow = true;

        this._mesh.userData.isTile = true;
        this._mesh.userData.tileObject = this;

        this.setTileEffect(tileColor);
    }

    setTileEffect(color){
        // TODO: Real implementation
        switch(color) {
            case '#12FE12':
            case '#3334FF':
                this._contactEffect = new TileContactEffect(EffectTypeEnum.TURBO);
                break;
            case '#11FEDD':
                this._contactEffect = new TileContactEffect(EffectTypeEnum.SLOW);
                break;
            case '#FF0033':
            case '#33EBEB':
            case '#11BBAA':
                this._contactEffect = new TileContactEffect(EffectTypeEnum.JUMP);
                break;
            case '#DDEE00':
            case '#AA11DD':
                this._contactEffect = new TileContactEffect(EffectTypeEnum.INVERTCONTROL);
                break;
            default:
                break;
        }
    }

    get geometry() {
        return this._geometry;
    }

    get material() {
        return this._material;
    }

    get mesh() {
        return this._mesh;
    }

    get contactEffect() {
        return this._contactEffect;
    }

    setPosition(x, y) {
        this._mesh.position.x = x;
        this._mesh.position.y = y;
    }

}