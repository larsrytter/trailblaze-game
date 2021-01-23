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
    }

}