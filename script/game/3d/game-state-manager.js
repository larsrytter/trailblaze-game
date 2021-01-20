import Player from '/script/game/3d/player.js';

export default class GameStateManager {
    _player;

    constructor() {
    }

    get player() {
        return this._player;
    }

    setPlayer(player) {
        this._player = player;
    }

}