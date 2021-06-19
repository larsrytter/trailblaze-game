// @ts-check

export default class GameService {
    _baseUrl = 'http://speedroller.larsrytter.dk';

    /**
     * 
     * @param {string} trackGuid
     * @returns {Promise<string>} gameGuid 
     */
    async startGame(trackGuid) {
        let gameGuid = null;
        const url = `${this._baseUrl}/api/?action=startgame&track=${trackGuid}`;
        const requestOptions = {
            method: "GET",
        };
        const response = await fetch(url, requestOptions);
        if (response.ok) {
            const gameInfo = await response.json();
            gameGuid = gameInfo.guid;
        }
        return gameGuid;
    }

    /**
     * 
     * @param {string} gameGuid 
     * @param {number} completedTime
     * @returns {Promise<number>} ranking 
     */
    async finishGame(gameGuid, completedTime) {
        let ranking = null;
        const url = `${this._baseUrl}/api/?action=finishgame&game=${gameGuid}&time=${completedTime}`;
        const requestOptions = {
            method: "GET",
        };
        const response = await fetch(url, requestOptions);
        if (response.ok) {
            const gameInfo = await response.json();
            ranking = gameInfo.ranking;
        }
        return ranking;
    }

    /**
     * 
     * @param {string} gameGuid
     * @param {string} playerName
     * @returns {Promise<JSON>} hiscores 
     */
    async setplayername(gameGuid, playerName) {
        let hiscores;
        const url = `${this._baseUrl}/api/?action=setplayername&game=${gameGuid}&playername=${playerName}`;
        const requestOptions = {
            method: "GET",
        };
        const response = await fetch(url, requestOptions);
        if (response.ok) {
            hiscores = await response.json();
        }
        return hiscores;
    }
}