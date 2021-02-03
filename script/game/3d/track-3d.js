import * as THREE from '/script/threejs/build/three.module.js';
import TrackTile3d from '/script/game/3d/track-tile-3d.js';
import { EffectTypeEnum } from './tile-contact-effect.js';

export default class Track3d {
    _track;
    _tileRows = [];
    _allTileMeshes = [];

    _trackData;

    _tileLength = 45;
    _tileWidth = 8;
    _tileHeight = 3;

    constructor() {
        // this.init(); //TODO: Call from somewhere else?
    }

    get track() {
        return this._track;
    }

    get tileLength() {
        return this._tileLength;
    }

    get allTileMeshes() {
        return this._allTileMeshes;
    }

    get tileDefaultLength() {
        return this._tileLength;
    }

    getTrackEndCoordY() {
        let endY = 0;
        if(this._tileRows) {
            let endRow = this._tileRows[this._tileRows.length -1];
            endY = endRow.position.y + (this.tileLength / 4);
        }
        return endY;
    }

    init(trackData) {
        this._trackData = trackData;
        this._track = new THREE.Object3D();
        this.buildTileRows();
    }

    buildTileRows() {
        // TODO: Build from track-setup json
        this._tileRows = [];

        this._trackData.rows.map( rowData => {
            this.addTileRow(rowData);
        });
    }

    addTileRow(rowData) {
        // console.log('rowData', rowData);
        let row = new THREE.Object3D();
        if (this._tileRows.length > 0) {
            const lastRow = this._tileRows[this._tileRows.length - 1];
            row.position.y = lastRow.position.y + this._tileLength;
        }
        
        const trackWidth = rowData.tiles.length * this._tileWidth;
        const edgePosX = -(trackWidth / 2);

        let count = 0;
        rowData.tiles.map(tileData => {
            console.log('tileData', tileData);
            if(tileData.effect.toUpperCase() === EffectTypeEnum.HOLE) {
                // No tile
            } else {
                const tile = new TrackTile3d(this._tileWidth, this._tileLength, this._tileHeight, tileData, this._trackData.colorDefinitions);
                const x = edgePosX + (count * this._tileWidth) + (this._tileWidth/2); // TODO: Why do I need to add half a tileWidth?
                tile.setPosition(x, 0);
                row.add(tile.mesh);
                this._allTileMeshes.push(tile.mesh);
            }
            
            count++;
        });

        this._track.add(row);
        this._tileRows.push(row);

    }
}