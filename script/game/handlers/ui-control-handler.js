export default class UiControlHandler {
    
    _inputHandler;
    _gameStateManager;

    constructor(inputHandler, gameStateManager) {
        this._inputHandler = inputHandler;
        this._gameStateManager = gameStateManager;
        this._gameStateManager.setUiControlHandler(this);
    }

    handleGameReady() {
        const buttonElem = document.getElementById('btnStartGame');
        buttonElem.addEventListener('click', () => { this.onStartGameClick(); });
    }

    onStartGameClick() {
        this._gameStateManager.startGame();
        const startControlsElem = document.getElementById('startControls');
        startControlsElem.classList.add('hidden');
        
        const gameControlsElem = document.getElementById('gameControls');
        gameControlsElem.classList.remove('hidden');

        const btnLeftElem = document.getElementById('btnLeft');
        btnLeftElem.addEventListener('mousedown', () => { this._inputHandler.moveLeft(); });
        btnLeftElem.addEventListener('mouseup', () => { this._inputHandler.endMoveLeft(); });
        btnLeftElem.addEventListener('touchstart', () => { this._inputHandler.moveLeft(); });
        btnLeftElem.addEventListener('touchend', () => { this._inputHandler.endMoveLeft(); });

        const btnRightElem = document.getElementById('btnRight');
        btnRightElem.addEventListener('mousedown', () => { this._inputHandler.moveRight(); });
        btnRightElem.addEventListener('mouseup', () => { this._inputHandler.endMoveRight(); });
        btnRightElem.addEventListener('touchstart', () => { this._inputHandler.moveRight(); });
        btnRightElem.addEventListener('touchend', () => { this._inputHandler.endMoveRight(); });
    }

    _currentTime = 0;
    updateTimerDisplay(time) {
        const displayTime = +(time).toFixed(1);
        if (displayTime != this._currentTime) {
            this._currentTime = displayTime;

            const timerElem = document.getElementById('timerDisplay');
            timerElem.innerText = this._currentTime;
        }
    }

}