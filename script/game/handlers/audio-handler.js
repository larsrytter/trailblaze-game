// @ts-check
export default class AudioHandler {    
    _audioCtx;

    _jumpAudioElement;
    _jumpTrack;

    _musicLoopElement;

    _masterGainNode;
    _effectGainNode;
    _musicGainNode;

    _isMasterMuted = false;
    _isEffectMuted = false;
    _isMusicMuted = false;

    constructor() {
        //@ts-ignore - window.webkitAudioContext is not recognized by ts
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    init() {
        this._masterGainNode = this._audioCtx.createGain();
        this._masterGainNode.connect(this._audioCtx.destination);
        this._masterGainNode.gain.value = this._isMasterMuted ? 0.0 : 1.0;

        this._effectGainNode = this._audioCtx.createGain();
        this._effectGainNode.connect(this._masterGainNode);
        this._effectGainNode.gain.value = this._isEffectMuted ? 0.0 : 1.0;

        this._musicGainNode = this._audioCtx.createGain();
        this._musicGainNode.connect(this._masterGainNode);
        this._musicGainNode.gain.value = this._isMusicMuted ? 0.0 : 1.0;

        this._jumpAudioElement = document.getElementById('audioJump');
        this._jumpTrack = this._audioCtx.createMediaElementSource(this._jumpAudioElement);
        this._jumpTrack.connect(this._effectGainNode);

        this._musicLoopElement = document.getElementById('musicLoop_action001');
        this._musicLoopTrack = this._audioCtx.createMediaElementSource(this._musicLoopElement);
        this._musicLoopTrack.connect(this._musicGainNode);

    }

    /**
     * @returns {boolean} IsMuted
     */
    toggleMuted() {
        let newMutedValue = this._isMasterMuted ? false : true;
        this.setMuted(newMutedValue);
        return newMutedValue;
    }

    /**
     * 
     * @param {boolean} isMuted 
     */
    setMuted(isMuted) {
        this._isMasterMuted = isMuted;
        this._masterGainNode.gain.value = this._isMasterMuted ? 0.0 : 1.0;
    }

    /**
     * @returns {boolean} IsMusicMuted
     */
    toggleMusicMuted() {
        this._isMusicMuted = this._isMusicMuted ? false : true;
        this._musicGainNode.gain.value = this._isMusicMuted ? 0.0 : 1.0;
        return this._isMusicMuted;
    }

    /**
     * 
     */
    playJumpEffect() {
        if (this._audioCtx.state === 'suspended') {
            this._audioCtx.resume();
        }
        this._jumpAudioElement.play();
    }

    playMusicLoop() {
        if (this._audioCtx.state === 'suspended') {
            this._audioCtx.resume();
        }
        this._musicLoopElement.play();
    }
}