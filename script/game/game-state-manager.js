import Player from '/script/game/3d/player.js';

export default class GameStateManager {
    _player;

    _gravity = -30;

    constructor() {
    }

    get player() {
        return this._player;
    }

    get gravity() {
        return this._gravity;
    }

    setPlayer(player) {
        this._player = player;
    }

    setPlayerDropping() {
        this._player.setDropping();
    }

}