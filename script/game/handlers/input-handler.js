// @ts-check
import MovementHandler from './../../../script/game/handlers/movement-handler.js';

export default class InputHandler {
    _movementHandler;

    constructor(movementHandler) {
        this._movementHandler = movementHandler;
    }

    setupEventHandlers(){
        window.addEventListener( 'keydown', (e) => this.handleKeyDown(e), false);
        window.addEventListener( 'keyup', (e) => this.handleKeyUp(e), false);
    }

    
    handleKeyDown(event) {
        let keyCode = event.keyCode;
        // let keyCode = event.code;

        switch(keyCode) {
            case 87: //W: FORWARD
                this._movementHandler.moveDirection.forward = 1;
                break;

            case 83: //S: BACK
                this._movementHandler.moveDirection.back = 1;
                break;
            
            case 37: //ArrowLEFT
            case 65: //A: LEFT
                this.moveLeft();
                break;

            case 39: //ArrowRIGHT
            case 68: //D: RIGHT
                this.moveRight();
                // this._movementHandler.moveDirection.right = 1;
                break;

        }
    }

    handleKeyUp(event) {
        let keyCode = event.keyCode;
        // let keyCode = event.code;

        switch(keyCode) {
            case 87: //FORWARD
                this._movementHandler.moveDirection.forward = 0;
                break;

            case 83: //BACK
                this._movementHandler.moveDirection.back = 0;
                break;

            case 37: //ArrowLEFT
            case 65: //LEFT
                this.endMoveLeft()
                break;

            case 39: //ArrowRIGHT
            case 68: //RIGHT
                this.endMoveRight()
                // this._movementHandler.moveDirection.right = 0;
                break;

        }

    }

    moveLeft() {
        this._movementHandler.moveDirection.left = 1;
    }

    endMoveLeft() {
        this._movementHandler.moveDirection.left = 0;
    }

    moveRight() {
        this._movementHandler.moveDirection.right = 1;
    }

    endMoveRight() {
        this._movementHandler.moveDirection.right = 0;
    }
}