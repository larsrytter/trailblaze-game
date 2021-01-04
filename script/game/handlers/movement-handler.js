
export default class MovementHandler {
    _moveDirection = { 
        left: 0, 
        right: 0, 
        forward: 0, 
        back: 0 
    }

    get moveDirection() {
        return this._moveDirection;
    }
    
}