import Player from '/script/game/3d/player.js';

export const GameStateEnum = {
    'TRACK_PICKER': 'TRACK_PICKER',
    'INITIALIZING': 'INITIALIZING',
    'READY': 'READY',
    'RUNNING': 'RUNNING',
    'PAUSED': 'PAUSED',
    'FINISHED': 'FINISHED'
}

export default class GameStateManager {
    _gameState;
    _player;
    _track;

    _timeElapsed;

    _gravity = -60;

    _uiControlHandler

    constructor() {
        this.setStateTrackPicker();
        // this._gameState = GameStateEnum.INITIALIZING;
    }

    /**
     * @returns Player
     */
    get player() {
        return this._player;
    }

    get track() {
        return this._track;
    }

    get gravity() {
        return this._gravity;
    }

    get gameState() {
        return this._gameState;
    }

    /**
     * 
     * @param {Player} player 
     */
    setPlayer(player) {
        this._player = player;
        this.checkInitializedState();
    }

    setTrack(val) {
        this._track = val;
        this.checkInitializedState();
    }

    setUiControlHandler(uiControlHandler) {
        this._uiControlHandler = uiControlHandler;
    }

    setPlayerDropping() {
        this._player.setDropping();
    }

    
    setStateTrackPicker() {
        this._gameState = GameStateEnum.TRACK_PICKER;
    }

    setStateInitializingGame() {
        this._gameState = GameStateEnum.INITIALIZING;
    }

    checkInitializedState() {
        if (this._gameState === GameStateEnum.INITIALIZING 
            && this._player 
            && this._track) {
            
            this.setGameStateReady();
        }
    }

    setGameStateReady() {
        console.log('setting state ready!');
        this._gameState = GameStateEnum.READY;
        this._uiControlHandler.handleGameReady();
    }

    startGame() {
        this._gameState = GameStateEnum.RUNNING;
        this._timeElapsed = 0;
    }

    isPlayerAtEndOfTrack(playerPosY) {
        const trackEndY = this._track.getTrackEndCoordY();
        if(playerPosY > trackEndY) {
            this._gameState = GameStateEnum.FINISHED;
            const msgCompleted = document.getElementById('msgLevelCompleted');
            msgCompleted.classList.remove('completed-message-hidden');
            msgCompleted.classList.add('completed-message');

        }
    }

    updateTimeElapsed(deltaTime) {
        if (this._gameState === GameStateEnum.RUNNING) {
            this._timeElapsed += deltaTime;
            this._uiControlHandler.updateTimerDisplay(this._timeElapsed);
        }
    }
}