// @ts-check
import * as THREE from './../script/threejs/build/three.module.js';
import SceneManager from './../script/game/3d/scene-manager.js';
import Physics from './../script/game/physics/physics.js';
import MovementHandler from './../script/game/handlers/movement-handler.js';
import InputHandler from './../script/game/handlers/input-handler.js';
import TrackService from './../script/game/service/track-service.js';
import GameService from './../script/game/service/game-service.js';
import TrackDataLoader from './../script/game/handlers/track-data-loader.js';
import GameStateManager from './../script/game/game-state-manager.js';
import UiControlHandler from './../script/game/handlers/ui-control-handler.js';
import AudioHandler from './../script/game/handlers/audio-handler.js';

function initialize(argTrackListData) {
    const canvas = document.querySelector('#c');
    const movementHandler = new MovementHandler();
    const inputHandler = new InputHandler(movementHandler);
    inputHandler.setupEventHandlers();

    const audioHandler = new AudioHandler();
    audioHandler.init();

    const gameService = new GameService();
    const gameStateManager = new GameStateManager(gameService);
    const uiControlHandler = new UiControlHandler(inputHandler, gameStateManager, audioHandler);

    uiControlHandler.setupAudioControls();
    gameStateManager.setStateTrackPicker();
    const physics = new Physics(movementHandler, gameStateManager);
    const sceneManager = new SceneManager(canvas, physics, gameStateManager, audioHandler);

    let trackListData = argTrackListData;

    uiControlHandler.setPlayAgainCallback(() => {
        // TODO: Hide replay-buttons + hiscore-list
        uiControlHandler.listTracks(trackListData);
    });
    
    uiControlHandler.setStartGameCallback(trackInfo => {
        
        trackDataLoader.loadTrackData(trackInfo.file).then(trackData => {
            // gameStateManager.setStateInitializingGame(trackInfo.guid);
            // physics.init(trackData);
    
            // const sceneManager = new SceneManager(canvas, physics, gameStateManager, audioHandler);
            // sceneManager.init(trackData);
        });
    });

    uiControlHandler.setPreviewTrackCallback((trackInfo, trackListItemElement) => {
        trackService.getHiscores(trackInfo.guid).then(hiscores => {
            uiControlHandler.displayHiscores(hiscores, trackListItemElement, 10);
        });

        trackDataLoader.loadTrackData(trackInfo.file).then(trackData => {
            physics.init();
            sceneManager.init(trackData);
            gameStateManager.setStateInitializingGame(trackInfo.guid);
        });
    });

    uiControlHandler.setRestartLevelCallback((trackInfo) => {
        trackDataLoader.loadTrackData(trackInfo.file).then(trackData => {
            physics.init();
            sceneManager.init(trackData);
            gameStateManager.setStateInitializingGame(trackInfo.guid);
            
            const msgLevelCompletedElem = document.getElementById('msgLevelCompleted');
            console.log('msgLevelCompletedElem', msgLevelCompletedElem);
            msgLevelCompletedElem.classList.add('completed-message-hidden');
            document.getElementById('btnRestartLevel').classList.add('hidden');
            document.getElementById('btnNewGame').classList.add('hidden');
            const hiscoreList = document.getElementById('hiscoreList');
            while (hiscoreList.firstChild) {
                hiscoreList.removeChild(hiscoreList.lastChild);
            }
            
            uiControlHandler.onStartGameClick();
        });
    });

    uiControlHandler.listTracks(trackListData);

}
const trackService = new TrackService();
const trackDataLoader = new TrackDataLoader(trackService);

try {
    trackDataLoader.listTracks()
        .then(trackListData => {
            // @ts-ignore // Ammo.js not imported as module
            Ammo().then( () => { initialize(trackListData); });       
        });
} catch(exception) {
    const errorMsgElem = document.getElementById('errorMsgPanel');
    errorMsgElem.innerText = exception.message;
    errorMsgElem.classList.remove('hidden');
}

// const trackDataFileName = 'level1data.json';
// let trackData = null;
// trackDataLoader.loadTrackData(trackDataFileName)
//     .then((data) => {
//         Ammo().then( () => { initialize(data); });
//     });
// Ammo().then( initialize );
