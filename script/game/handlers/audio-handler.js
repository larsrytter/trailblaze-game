export default class AudioHandler {    
    _audioCtx;

    _jumpAudioElement;
    _jumpTrack;

    constructor() {
        this._audioCtx = new AudioContext();
    }

    init() {
        this._jumpAudioElement = document.getElementById('audioJump');
        this._jumpTrack = this._audioCtx.createMediaElementSource(this._jumpAudioElement);
        this._jumpTrack.connect(this._audioCtx.destination);

    }

    playJumpEffect() {
        if (this._audioCtx.state === 'suspended') {
            this._audioCtx.resume();
        }
        this._jumpAudioElement.play();
    }
}