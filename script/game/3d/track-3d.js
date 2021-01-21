import * as THREE from '/script/threejs/build/three.module.js';
import TrackTile3d from '/script/game/3d/track-tile-3d.js';
import { EffectTypeEnum } from './tile-contact-effect.js';

export default class Track3d {
    _track;
    _tileRows;
    _allTileMeshes = [];

    _trackData;

    _numRowsTotal = 100;

    _tileLength = 40;
    _tileWidth = 8;
    _tileHeight = 3;
    _numTilesPerRow = 6;

    constructor() {
        // this.init(); //TODO: Call from somewhere else?
    }

    get track() {
        return this._track;
    }

    get allTileMeshes() {
        return this._allTileMeshes;
    }

    get tileDefaultLength() {
        return this._tileLength;
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

        // this._tileRows[0].map(rowData => {
        //     this._numTilesPerRow = rowData.tiles.length;
        // });

        // for (let i = 0; i < this._numRowsTotal; i++) {
        //     this.addTileRow();
        // }
    }

    // _tmpColors = [];

    addTileRow(rowData) {
        console.log('rowData', rowData);
        let row = new THREE.Object3D();
        if (this._tileRows.length > 0) {
            const lastRow = this._tileRows[this._tileRows.length - 1];
            row.position.y = lastRow.position.y + this._tileLength;
        }
        
        // const trackWidth = this._numTilesPerRow * this._tileWidth;
        const trackWidth = rowData.tiles.length * this._tileWidth;
        const edgePosX = -(trackWidth / 2);

        let count = 0;
        rowData.tiles.map(tileData => {
            // const colorData = this._trackData.colorDefinitions.find(def => def.colorName === tileData.colorName);
            // const color = colorData.colorCode;
            console.log('tileData', tileData);
            if(tileData.effect.toUpperCase() === EffectTypeEnum.HOLE){
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

        // for (let i = 0; i < this._numTilesPerRow; i++) {

        //     if(!this._tmpColors || this._tmpColors.length === 0) {
        //         // this._tmpColors = ['#12FE12', '#FF0033', '#DDEE00', '#3334FF', '#11FEDD', '#33EBEB', '#AA11DD', '#11BBAA'];
        //         this._tmpColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF'];
        //     }

        //     let color = this._tmpColors.pop();

        //     const tile = new TrackTile3d(this._tileWidth, this._tileLength, this._tileHeight, color);
        //     let x = edgePosX + (i * this._tileWidth) + (this._tileWidth/2); // TODO: Why do I need to add half a tileWidth?
        //     tile.setPosition(x, 0);
        //     row.add(tile.mesh);
        //     this._allTileMeshes.push(tile.mesh);
        // }

        this._track.add(row);
        this._tileRows.push(row);

    }
}