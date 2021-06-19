// @ts-check
import GameService from './../../../script/game/service/game-service.js';
import TrackService from './../../../script/game/service/track-service.js';

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

    _restartLevelCallback;
    setRestartLevelCallback(callbackFn) {
        this._restartLevelCallback = callbackFn;
    }

    setupRestartLevelClick(trackInfo) {
        const btnRestartLevel = document.getElementById('btnRestartLevel');
        btnRestartLevel.addEventListener('click', () => this._restartLevelCallback(trackInfo));
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
            
            trackStartBtn.addEventListener('click', () => {
                this.onStartGameClick();
                this.setupRestartLevelClick(trackInfo);
            });
            trackStartBtn.innerText = 'Start game';
            trackStartBtn.classList.add('preview-track-button');
            trackStartBtn.classList.add('select-track-button');
            trackStartBtn.classList.add('start-game-button');
            trackStartBtn.classList.add('hidden');
            trackListItemTrackContainer.appendChild(trackStartBtn);

            trackListElem.appendChild(trackListItemElem);
            // @ts-ignore
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

    displayHiscores(hiscores, parentElement, listLength = 10, gameScoreData = null) {        
        const hiscoreListContainer = document.getElementById('hiscoreListContainer');
        const hiscoreList = document.getElementById('hiscoreList');
        while (hiscoreList.firstChild) {
            hiscoreList.removeChild(hiscoreList.lastChild);
        }

        if((hiscores && hiscores.length > 0) || gameScoreData) {
            const headerElem = this._createHiScoreListHeaderLine();
            hiscoreList.appendChild(headerElem);

            let lineCount = 0;
            let displayLineCount = 1;
            while (lineCount < listLength) {
                
                if (gameScoreData && +(gameScoreData.ranking) === lineCount+1) {
                    const entryItem = this._createHiscoreInputLine(gameScoreData, displayLineCount);
                    hiscoreList.appendChild(entryItem);
                    displayLineCount++;
                }
                const hiscoreItem = hiscores[lineCount];
                if (hiscoreItem && displayLineCount <= listLength)
                {
                    const listItem = this._createHiScoreListLine(hiscoreItem, displayLineCount);
                    hiscoreList.appendChild(listItem);    
                }
                lineCount++;
                displayLineCount++;
            }
            hiscoreListContainer.classList.remove('hidden');
        } else {
            hiscoreListContainer.classList.add('hidden');
        }

        if (parentElement) {
            hiscoreListContainer.parentElement.removeChild(hiscoreListContainer);
            parentElement.appendChild(hiscoreListContainer);
        }

        const playerEntryInputElem = document.getElementById('hiscoreEntryNameInput');
        if (playerEntryInputElem) {
            playerEntryInputElem.focus();
        }

    }

    _createHiScoreListHeaderLine() {
        const headerElem = document.createElement('li');

        const rankingHeaderElem = document.createElement('span');
        rankingHeaderElem.innerText = '';
        rankingHeaderElem.classList.add('hiscore-header');
        rankingHeaderElem.classList.add('hiscore-ranking');
        headerElem.appendChild(rankingHeaderElem);

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

        return headerElem;
    }

    _createHiScoreListLine(hiscoreItem, lineCount) {
        const listItem = document.createElement('li');

        const rankingElem = document.createElement('span');
        rankingElem.innerText = lineCount;
        rankingElem.classList.add('hiscore-ranking');
        listItem.appendChild(rankingElem);
        const completedTimeElem = document.createElement('span');
        completedTimeElem.innerText = parseFloat(hiscoreItem.time).toFixed(1);
        completedTimeElem.classList.add('hiscoreCompletedTime');
        completedTimeElem.classList.add('hiscore-time');
        listItem.appendChild(completedTimeElem);

        const nameElem = document.createElement('span');
        nameElem.innerText = hiscoreItem.name;
        nameElem.classList.add('hiscoreName');
        nameElem.classList.add('hiscore-name');
        listItem.appendChild(nameElem);

        return listItem;
    }

    _createHiscoreInputLine(gameScoreData, lineCount) {
        const listItem = document.createElement('li');
        // listItem.classList.add('wave-animate');

        const rankingElem = document.createElement('span');
        rankingElem.innerText = lineCount;
        rankingElem.classList.add('hiscore-ranking');
        rankingElem.classList.add('wave-animate');
        listItem.appendChild(rankingElem);

        const timeElapsedDisplay = parseFloat(gameScoreData.timeElapsed).toFixed(1);
        const completedTimeElem = document.createElement('span');
        completedTimeElem.innerText = timeElapsedDisplay;
        completedTimeElem.classList.add('hiscoreCompletedTime');
        completedTimeElem.classList.add('hiscore-time');
        completedTimeElem.classList.add('wave-animate');
        listItem.appendChild(completedTimeElem);

        const hiscoreEntryInputElem = document.createElement('input');
        hiscoreEntryInputElem.setAttribute('type', 'text');
        hiscoreEntryInputElem.setAttribute('maxlength', '10');
        hiscoreEntryInputElem.setAttribute('id', 'hiscoreEntryNameInput');
        hiscoreEntryInputElem.setAttribute('placeholder', 'Enter your name');
        hiscoreEntryInputElem.classList.add('hiscore-entry-input');
        hiscoreEntryInputElem.classList.add('wave-animate');
        listItem.appendChild(hiscoreEntryInputElem);

        const enterBtn = document.createElement('button');
        enterBtn.setAttribute('type', 'button');
        enterBtn.addEventListener('click', async () => {
            enterBtn.disabled = true;
            const isSaved = await this.saveHiscoreEntry(gameScoreData.gameId, hiscoreEntryInputElem.value);
            if (isSaved) {
                hiscoreEntryInputElem.disabled = true;
                enterBtn.parentElement.removeChild(enterBtn);
                this.toggleRestartButtonsDisplay();
            } else {
                enterBtn.disabled = false;
            }
        });
        enterBtn.classList.add('hiscore-enter-button');
        enterBtn.classList.add('glow-on-hover');
        enterBtn.innerHTML = 'Enter';
        listItem.appendChild(enterBtn);

        return listItem;
    }

    /**
     * 
     * @param {string} gameId - guid 
     * @param {string} playerName
     * @returns {Promise<boolean>} isSaved 
     */
    async saveHiscoreEntry(gameId, playerName) {
        if (!playerName) {
            return false;
        }
        const gameService = new GameService();
        const hiscores = await gameService.setplayername(gameId, playerName);
        
        return true;
    }

    // Clicked start game button from tracks-list - not used - remove?
    startGameForTrack(trackInfo) {
        // const trackListSectionElem = document.getElementById('trackListSection');
        // trackListSectionElem.classList.add('hidden');

        this._startGameCallback(trackInfo);
    }

    toggleRestartButtonsDisplay() {
        const btnRestartLevel = document.getElementById('btnRestartLevel');
        btnRestartLevel.classList.toggle('hidden');
        const btnChangeLevel = document.getElementById('btnNewGame');
        btnChangeLevel.classList.toggle('hidden');
    }

    /**
     * 
     * @param {string} trackGuid 
     * @param {string} gameId 
     * @param {number} ranking 
     * @param {number} timeElapsed 
     */
    showNameInputForHiscoreList(trackGuid, gameId, ranking, timeElapsed) {
        const gameScoreData = !ranking ? null : {
            gameId: gameId,
            ranking: ranking,
            timeElapsed: timeElapsed
        };
        this.showHiscoreListForTrack(trackGuid, gameScoreData);
    }

    showHiscoreListForTrack(trackGuid, gameScoreData = null) {
        const containerElem = document.getElementById('completed-hiscorelist');
        const trackService = new TrackService();
        trackService.getHiscores(trackGuid).then(hiscores => {
            this.displayHiscores(hiscores, containerElem, 10, gameScoreData);
        });
    }

    setupAudioControls() {
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
            timerElem.innerText = `${this._currentTime}`;

            const completedTimeElem = document.getElementById('completedTime');
            if(completedTimeElem) {
                completedTimeElem.innerText = `${this._currentTime}`;
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