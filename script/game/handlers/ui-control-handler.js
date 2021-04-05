export default class UiControlHandler {
    
    _inputHandler;
    _gameStateManager;
    _audioHandler;

    _startGameCallback;
    setStartGameCallback(callback) {
        this._startGameCallback = callback;
    }

    _previewTrackCallback;
    setPreviewTrackCallback(callback) {
        this._previewTrackCallback = callback;
    }

    constructor(inputHandler, gameStateManager, audioHandler) {
        this._inputHandler = inputHandler;
        this._gameStateManager = gameStateManager;
        this._gameStateManager.setUiControlHandler(this);
        this._audioHandler = audioHandler;
    }

    listTracks(trackListData) {
        const trackListSectionElem = document.getElementById('trackListSection');
        const trackListElem = document.getElementById('trackList');

        let animationDelay = 0;
        
        trackListData.map(trackInfo => {
            const trackListItemElem = document.createElement('li');

            const trackListItemTrackContainer = document.createElement('div');
            trackListItemTrackContainer.classList.add('track-list-track-line');
            trackListItemElem.appendChild(trackListItemTrackContainer);

            const trackStartBtn = document.createElement('button');

            const trackNameElem = document.createElement('span');
            trackNameElem.addEventListener('click', () => this.previewTrackWithHiscoresClicked(trackInfo, trackListItemElem, trackStartBtn));
            trackNameElem.addEventListener('mouseover', () => this.previewTrackWithHiscoresClicked(trackInfo, trackListItemElem, trackStartBtn));
            trackNameElem.innerText = trackInfo.name;
            trackNameElem.classList.add('track-name');
            trackListItemTrackContainer.appendChild(trackNameElem);
            
            // const trackPreviewBtn = document.createElement('button');
            // trackPreviewBtn.addEventListener('click', () => this.previewTrackWithHiscoresClicked(trackInfo, trackListItemElem, trackStartBtn));
            // trackPreviewBtn.innerText = 'select';
            // trackPreviewBtn.classList.add('preview-track-button');
            // trackPreviewBtn.classList.add('select-track-button');
            // trackListItemTrackContainer.appendChild(trackPreviewBtn);

            
            trackStartBtn.addEventListener('click', () => this.onStartGameClick());
            trackStartBtn.innerText = 'Start game';
            trackStartBtn.classList.add('preview-track-button');
            trackStartBtn.classList.add('select-track-button');
            trackStartBtn.classList.add('start-game-button');
            trackStartBtn.classList.add('hidden');
            trackListItemTrackContainer.appendChild(trackStartBtn);

            // const trackStartBtn = document.createElement('button');
            // trackStartBtn.addEventListener('click', () => this.startGameForTrack(trackInfo));
            // trackStartBtn.innerText = 'start';
            // trackStartBtn.classList.add('select-track-button');
            // trackListItemTrackContainer.appendChild(trackStartBtn);

            trackListElem.appendChild(trackListItemElem);

            trackListItemElem.style = `animation-delay: ${animationDelay}s;`;
            animationDelay++;
        });

        trackListSectionElem.classList.remove('hidden');
    }

    previewTrackWithHiscoresClicked(trackInfo, trackListItemElement, trackStartBtnElem) {
        this._previewTrackCallback(trackInfo, trackListItemElement);
        [...trackListItemElement.parentElement.children].forEach(elem => {
            elem.classList.remove('selected');
        });

        trackListItemElement.classList.add('selected');

        let startButtons = document.getElementsByClassName('start-game-button');
        [...startButtons].forEach(btnElem => btnElem.classList.add('hidden'));
        trackStartBtnElem.classList.remove('hidden');
    }

    displayHiscores(hiscores, parentElement) {
        const hiscoreListContainer = document.getElementById('hiscoreListContainer');
        const hiscoreList = document.getElementById('hiscoreList');
        while (hiscoreList.firstChild) {
            hiscoreList.removeChild(hiscoreList.lastChild);
        }
        if(hiscores && hiscores.length > 0) {
            
            
            const headerElem = document.createElement('li');
            const timeHeaderElem = document.createElement('span');
            timeHeaderElem.innerText = 'Time';
            timeHeaderElem.classList.add('hiscore-header');
            timeHeaderElem.classList.add('hiscore-time');
            headerElem.appendChild(timeHeaderElem);

            const nameHeaderElem = document.createElement('span');
            nameHeaderElem.innerText = 'Player';
            nameHeaderElem.classList.add('hiscore-header');
            nameHeaderElem.classList.add('hiscore-name');
            headerElem.appendChild(nameHeaderElem);

            hiscoreList.appendChild(headerElem);

            hiscores.map(hiscoreItem => {
                const listItem = document.createElement('li');

                const completedTimeElem = document.createElement('span');
                completedTimeElem.innerText = hiscoreItem.time;
                completedTimeElem.classList.add('hiscoreCompletedTime');
                completedTimeElem.classList.add('hiscore-time');
                listItem.appendChild(completedTimeElem);

                const nameElem = document.createElement('span');
                nameElem.innerText = hiscoreItem.name;
                nameElem.classList.add('hiscoreName');
                nameElem.classList.add('hiscore-name');
                listItem.appendChild(nameElem);

                hiscoreList.appendChild(listItem);
            });
            hiscoreListContainer.classList.remove('hidden');
        } else {
            hiscoreListContainer.classList.add('hidden');
        }

        if (parentElement) {
            hiscoreListContainer.parentElement.removeChild(hiscoreListContainer);

            parentElement.appendChild(hiscoreListContainer);
        }

    }

    // Clicked start game button from tracks-list - not used - remove?
    startGameForTrack(trackInfo) {
        // const trackListSectionElem = document.getElementById('trackListSection');
        // trackListSectionElem.classList.add('hidden');

        this._startGameCallback(trackInfo);
    }

    handleGameReady() {
        // const buttonElem = document.getElementById('btnStartGame');
        // buttonElem.addEventListener('click', () => { this.onStartGameClick(); });

        const muteButtonElem = document.getElementById('btnMuteVolume');
        muteButtonElem.addEventListener('click', () => { this.onMuteMasterButtonClick(); });

        const muteMusicButtonElem = document.getElementById('btnMuteMusic');
        muteMusicButtonElem.addEventListener('click', () => { this.onMuteMusicButtonClick(); });
    }

    onStartGameClick() {
        const trackListSectionElem = document.getElementById('trackListSection');
        trackListSectionElem.classList.add('hidden');

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