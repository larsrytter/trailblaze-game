export default class UiControlHandler {
    
    _inputHandler;
    _gameStateManager;
    _audioHandler;

    constructor(inputHandler, gameStateManager, audioHandler) {
        this._inputHandler = inputHandler;
        this._gameStateManager = gameStateManager;
        this._gameStateManager.setUiControlHandler(this);
        this._audioHandler = audioHandler;
    }

    listTracks(trackListData) {
        const trackListSectionElem = document.getElementById('trackListSection');
        const trackListElem = document.getElementById('trackList');

        trackListData.map(trackInfo => {
            const trackListItemElem = document.createElement('li');

            const trackNameElem = document.createElement('span');
            trackNameElem.innerText = trackInfo.name;
            trackListItemElem.appendChild(trackNameElem);

            const trackStartBtn = document.createElement('button');
            trackStartBtn.addEventListener('click', () => this.startGameForTrack(trackInfo));
            trackStartBtn.innerText = 'start';

            trackListItemElem.appendChild(trackStartBtn);

            trackListElem.appendChild(trackListItemElem);
        });

        trackListSectionElem.classList.remove('hidden');
        console.log(trackListElem);
    }

    displayHiscoresForTrack(trackInfo) {

    }

    startGameForTrack(trackInfo) {
        const trackListSectionElem = document.getElementById('trackListSection');
        trackListSectionElem.classList.add('hidden');

        this._startGameCallback(trackInfo);
    }

    _startGameCallback;
    setStartGameCallback(callback) {
        this._startGameCallback = callback;
    }


    handleGameReady() {
        const buttonElem = document.getElementById('btnStartGame');
        buttonElem.addEventListener('click', () => { this.onStartGameClick(); });

        const muteButtonElem = document.getElementById('btnMuteVolume');
        muteButtonElem.addEventListener('click', () => { this.onMuteMasterButtonClick(); });

        const muteMusicButtonElem = document.getElementById('btnMuteMusic');
        muteMusicButtonElem.addEventListener('click', () => { this.onMuteMusicButtonClick(); });
    }

    onStartGameClick() {
        this._gameStateManager.startGame();
        this._audioHandler.playMusicLoop();
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

            const completedTimeElem = document.getElementById('completedTime');
            if(completedTimeElem) {
                completedTimeElem.innerText = this._currentTime;
            }
        }
    }

    onMuteMasterButtonClick() {
        let isMuted = this._audioHandler.toggleMuted();
        // 'iconAudioOn', 'iconAudioMuted'
        this.onMuteButtonClick('iconAudioOn', 'iconAudioMuted', isMuted);
    }

    onMuteMusicButtonClick() {
        let isMuted = this._audioHandler.toggleMusicMuted();
        // 'iconMusicOn', 'iconMusicOff'
        this.onMuteButtonClick('iconMusicOn', 'iconMusicOff', isMuted);
    }

    onMuteButtonClick(onIconElemId, mutedIconElemId, isMuted) {
        // let isMuted = this._audioHandler.toggleMuted();
        
        const iconMuted = document.getElementById(mutedIconElemId);
        const iconOn = document.getElementById(onIconElemId);
        if(isMuted) {
            iconMuted.classList.remove('hidden');
            iconOn.classList.add('hidden');
        } else {
            iconMuted.classList.add('hidden');
            iconOn.classList.remove('hidden');
        }
    }

}