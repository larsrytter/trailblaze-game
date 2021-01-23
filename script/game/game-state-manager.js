import Player from '/script/game/3d/player.js';

export const GameStateEnum = {
    'READY': 'READY',
    'RUNNING': 'RUNNING',
    'PAUSED': 'PAUSED',
    'FINISHED': 'FINISHED'
}

export default class GameStateManager {
    _gameState;
    _player;
    _track;

    _gravity = -30;

    constructor() {
        this._gameState = GameStateEnum.READY;
    }

    get player() {
        return this._player;
    }

    get track(){
        return this._track;
    }

    get gravity() {
        return this._gravity;
    }

    get gameState() {
        return this._gameState;
    }

    setPlayer(player) {
        this._player = player;
    }

    setTrack(val) {
        this._track = val;
    }

    setPlayerDropping() {
        this._player.setDropping();
    }

    startGame() {
        this._gameState = GameStateEnum.RUNNING;
    }

    isPlayerAtEndOfTrack(playerPosY) {
        const trackEndY = this._track.getTrackEndCoordY();
        if(playerPosY > trackEndY) {
            this._gameState = GameStateEnum.FINISHED;           
        }
    }
}