export default class AudioHandler {    
    _audioCtx;

    _jumpAudioElement;
    _jumpTrack;

    _masterGainNode;
    _isMuted = false;

    constructor() {
        this._audioCtx = new AudioContext();
    }

    init() {
        this._masterGainNode = this._audioCtx.createGain();
        this._masterGainNode.connect(this._audioCtx.destination);
        this._masterGainNode.gain.value = this._isMuted ? 0.0 : 1.0;

        this._jumpAudioElement = document.getElementById('audioJump');
        this._jumpTrack = this._audioCtx.createMediaElementSource(this._jumpAudioElement);
        this._jumpTrack.connect(this._masterGainNode);

    }

    toggleMuted() {
        let newMutedValue = this._isMuted ? false : true;
        this.setMuted(newMutedValue);
        return newMutedValue;
    }

    setMuted(isMuted) {
        this._isMuted = isMuted;
        this._masterGainNode.gain.value = this._isMuted ? 0.0 : 1.0;
    }

    playJumpEffect() {
        if (this._audioCtx.state === 'suspended') {
            this._audioCtx.resume();
        }
        this._jumpAudioElement.play();
    }
}