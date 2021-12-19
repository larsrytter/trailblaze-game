// @ts-check

// @ts-ignore
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

    // _gravity = -60;
    _gravity = -250;
    _jumpImpulsePower = 75;

    _uiControlHandler;
    _gameService;
    _gameId;
    _trackGuid;

    constructor(gameService) {
        this.setStateTrackPicker();
        this._gameService = gameService;
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

    get jumpImpulsePower() {
        return this._jumpImpulsePower;
    }

    get gameState() {
        return this._gameState;
    }

    reset() {
        this._track = null;
        this._trackGuid = null;
        this._gameId = null;
        this._timeElapsed = 0;
        this._player = null;
        this.setStateTrackPicker();
        
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

    setStateInitializingGame(trackGuid) {
        this._trackGuid = trackGuid;
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
        this._gameState = GameStateEnum.READY;
        // this._uiControlHandler.handleGameReady();
    }

    startGame() {
        this._gameState = GameStateEnum.RUNNING;
        this._timeElapsed = 0;
        this._gameService.startGame(this._trackGuid)
            .then(gameGuid => {
                this._gameId = gameGuid
            });
    }

    /**
     * 
     */
    handleIsPlayerAtEndOfTrack(playerPosY) {
        const trackEndY = this._track.getTrackEndCoordY();
        if (playerPosY > trackEndY) {
            this._gameState = GameStateEnum.FINISHED;

            const msgCompleted = document.getElementById('msgLevelCompleted');
            msgCompleted.classList.remove('completed-message-hidden');
            msgCompleted.classList.add('completed-message');

            this._gameService.finishGame(this._gameId, this._timeElapsed)
                .then(ranking => {
                    if(ranking <= 10) {
                        this._uiControlHandler.showNameInputForHiscoreList(this._trackGuid, this._gameId, ranking, this._timeElapsed);
                    } else {
                        this._uiControlHandler.showHiscoreListForTrack(this._trackGuid);
                        this._uiControlHandler.toggleRestartButtonsDisplay();
                    }
                });
            
            return true;
        }
        return false;
    }

    updateTimeElapsed(deltaTime) {
        if (this._gameState === GameStateEnum.RUNNING) {
            this._timeElapsed += deltaTime;
            this._uiControlHandler.updateTimerDisplay(this._timeElapsed);
        }
    }
}