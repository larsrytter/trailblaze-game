import * as THREE from '/script/threejs/build/three.module.js';

export default class TrackTile3d {
    
    _geometry;
    _material;
    _mesh;

    constructor(width, length, height, tileColor) {       
        this._geometry = new THREE.BoxGeometry(width, length, height);
        this._material = new THREE.MeshPhongMaterial({color: tileColor});
        this._mesh = new THREE.Mesh(this._geometry, this._material);
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

    setPosition(x, y) {
        this._mesh.position.x = x;
        this._mesh.position.y = y;
    }

}