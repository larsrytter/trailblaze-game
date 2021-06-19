// @ts-check
// @ts-ignore
import * as THREE from '/script/threejs/build/three.module.js';
// @ts-ignore
import { TileContactEffect } from '/script/game/3d/tile-contact-effect.js';
// @ts-ignore
import { EffectTypeEnum } from '/script/game/3d/tile-contact-effect.js';

export default class TrackTile3d {
    
    _geometry;
    _material;
    _mesh;
    _tileData;
    _contactEffect = null;

    constructor(width, length, height, tileData, colorDefinitions) {
        const colorData = colorDefinitions.find(def => def.colorName === tileData.colorName);
        // const tileColor = colorData.colorCode;
        const color = new THREE.Color(colorData.colorCode);
        this._geometry = new THREE.BoxGeometry(width, length, height);
        this._material = new THREE.MeshPhongMaterial({color: color});
        this._mesh = new THREE.Mesh(this._geometry, this._material);
        this._mesh.castShadow = false;
        this._mesh.receiveShadow = true;

        this._mesh.userData.isTile = true;
        this._mesh.userData.tileObject = this;
        this._tileData = tileData;

        this.setTileEffect(tileData);
    }

    setTileEffect(tileData) {
        const effect = tileData.effect ? tileData.effect : '';
        switch(effect.toUpperCase()) {
            case 'TURBO':
                this._contactEffect = new TileContactEffect(EffectTypeEnum.TURBO);
                break;
            case 'SLOW':
                this._contactEffect = new TileContactEffect(EffectTypeEnum.SLOW);
                break;
            case 'JUMP':
                this._contactEffect = new TileContactEffect(EffectTypeEnum.JUMP);
                break;
            case 'INVERTCONTROLS':
                this._contactEffect = new TileContactEffect(EffectTypeEnum.INVERTCONTROLS);
                break;
            case 'NONE':
            default:
                this._contactEffect = new TileContactEffect(EffectTypeEnum.NONE);
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