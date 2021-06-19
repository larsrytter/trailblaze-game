// @ts-check
// @ts-ignore
import * as THREE from '/script/threejs/build/three.module.js';
// @ts-ignore
import SceneManager from '/script/game/3d/scene-manager.js';
// @ts-ignore
import Physics from '/script/game/physics/physics.js';
// @ts-ignore
import MovementHandler from '/script/game/handlers/movement-handler.js';
// @ts-ignore
import InputHandler from '/script/game/handlers/input-handler.js';
// @ts-ignore
import TrackService from '/script/game/service/track-service.js';
// @ts-ignore
import GameService from '/script/game/service/game-service.js';
// @ts-ignore
import TrackDataLoader from '/script/game/handlers/track-data-loader.js';
// @ts-ignore
import GameStateManager from '/script/game/game-state-manager.js';
// @ts-ignore
import UiControlHandler from '/script/game/handlers/ui-control-handler.js';
// @ts-ignore
import AudioHandler from '/script/game/handlers/audio-handler.js';

// function initialize(trackData) {
function initialize(trackListData) {
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
    
    uiControlHandler.setStartGameCallback(trackInfo => {
        // @ts-ignore
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
            physics.init(trackData);
            sceneManager.init(trackData);
            gameStateManager.setStateInitializingGame(trackInfo.guid);
        });
    });

    uiControlHandler.setRestartLevelCallback((trackInfo) => {
        trackDataLoader.loadTrackData(trackInfo.file).then(trackData => {
            physics.init(trackData);
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
